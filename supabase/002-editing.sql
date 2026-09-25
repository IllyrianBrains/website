-- Profile editing + live directory. Run once in the Supabase SQL Editor, after
-- schema.sql. Safe to re-run.
--
-- Who can edit: a signed-in user (magic-link login) can edit the member whose
-- `email` matches their login email; anyone listed in `admins` can edit every
-- member. All writes go through save_member_profile() — there are no direct
-- write policies on the tables — so the function decides which columns are
-- editable (members can't touch status, username, email, groups, teams,
-- member_since, admin_notes) and validates links and categories.
--
-- After running, add yourself as admin:
--   insert into admins (email) values ('you@example.com');

-- ── Categories (fields of expertise) as a fixed list ─────────────────────────
create table if not exists categories (
  name text primary key,
  sort_order int not null default 0
);
alter table categories enable row level security;
drop policy if exists "categories: public read" on categories;
create policy "categories: public read" on categories for select to anon, authenticated using (true);

-- A few rows came from the sheet as one "Akademi;Teknologji" entry — split them.
update members
set fields_of_expertise = array(
  select distinct trim(part) from unnest(fields_of_expertise) f, unnest(string_to_array(f, ';')) part where trim(part) <> ''
)
where exists (select 1 from unnest(fields_of_expertise) f where f like '%;%');

insert into categories (name) select distinct unnest(fields_of_expertise) from members on conflict do nothing;

-- ── Admins ────────────────────────────────────────────────────────────────────
create table if not exists admins (email text primary key);
alter table admins enable row level security;   -- no policies: dashboard only

-- ── Who-can-edit helpers ─────────────────────────────────────────────────────
create or replace function current_email() returns text
language sql stable as $$ select lower(coalesce(auth.jwt() ->> 'email', '')) $$;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select current_email() <> '' and exists (select 1 from admins where lower(email) = current_email())
$$;

create or replace function can_edit_member(p_member_id bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select is_admin() or (current_email() <> '' and exists (
    select 1 from members where id = p_member_id and lower(email) = current_email()
  ))
$$;

create or replace function has_member_profile() returns boolean
language sql stable security definer set search_path = public as $$
  select is_admin() or (current_email() <> '' and exists (select 1 from members where lower(email) = current_email()))
$$;

-- Signed-in users can read their own row (admins: all rows) to fill the form.
drop policy if exists "members: read own, admins all" on members;
create policy "members: read own, admins all" on members for select to authenticated
  using (is_admin() or (current_email() <> '' and lower(email) = current_email()));
drop policy if exists "experience: read editable" on member_experience;
create policy "experience: read editable" on member_experience for select to authenticated using (can_edit_member(member_id));
drop policy if exists "education: read editable" on member_education;
create policy "education: read editable" on member_education for select to authenticated using (can_edit_member(member_id));

-- ── The one write path ───────────────────────────────────────────────────────
-- Trims, drops blanks and duplicates (ignoring case, first spelling wins),
-- keeps the order given.
create or replace function clean_list(p jsonb) returns text[]
language sql immutable as $$
  select coalesce(array_agg(item order by first_seen), '{}') from (
    select (array_agg(trim(x) order by ord))[1] as item, min(ord) as first_seen
    from jsonb_array_elements_text(coalesce(p, '[]')) with ordinality as a(x, ord)
    where trim(x) <> '' group by lower(trim(x))
  ) s
$$;

create or replace function save_member_profile(
  p_member_id bigint, p_profile jsonb, p_experience jsonb default '[]', p_education jsonb default '[]'
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_fields text[] := clean_list(p_profile -> 'fields_of_expertise');
  v_link text;
begin
  if not can_edit_member(p_member_id) then
    raise exception 'Nuk ke të drejtë ta ndryshosh këtë profil.' using errcode = '42501';
  end if;
  if exists (select 1 from unnest(v_fields) f where f not in (select name from categories)) then
    raise exception 'Kategori e panjohur në fushat e ekspertizës.';
  end if;
  foreach v_link in array array[p_profile ->> 'website', p_profile ->> 'linkedin_url'] loop
    if coalesce(v_link, '') <> '' and v_link !~* '^https?://[^\s<>"]+$' then
      raise exception 'Linku duhet të fillojë me https:// (%).', v_link;
    end if;
  end loop;
  if coalesce(p_profile ->> 'avatar', '') <> '' and p_profile ->> 'avatar' !~ '^https://[^\s<>"]+/storage/v1/object/public/avatars/' and not is_admin() then
    raise exception 'Fotoja duhet të ngarkohet nga faqja e editimit.';
  end if;
  if length(coalesce(p_profile ->> 'about', '')) > 5000 then
    raise exception 'Teksti "Rreth" është shumë i gjatë (maks. 5000 shkronja).';
  end if;
  if jsonb_array_length(coalesce(p_experience, '[]')) > 30 or jsonb_array_length(coalesce(p_education, '[]')) > 30 then
    raise exception 'Shumë rreshta eksperience/arsimimi (maks. 30).';
  end if;

  update members set
    name = coalesce(nullif(trim(p_profile ->> 'name'), ''), name),
    headline = nullif(trim(p_profile ->> 'headline'), ''),
    company = nullif(trim(p_profile ->> 'company'), ''),
    city = nullif(trim(p_profile ->> 'city'), ''),
    country = nullif(trim(p_profile ->> 'country'), ''),
    about = nullif(trim(p_profile ->> 'about'), ''),
    fields_of_expertise = v_fields,
    skills = clean_list(p_profile -> 'skills'),
    languages = clean_list(p_profile -> 'languages'),
    website = nullif(trim(p_profile ->> 'website'), ''),
    linkedin_url = nullif(trim(p_profile ->> 'linkedin_url'), ''),
    avatar = nullif(p_profile ->> 'avatar', ''),
    status = case when is_admin() and p_profile ? 'status' then p_profile ->> 'status' else status end
  where id = p_member_id;

  delete from member_experience where member_id = p_member_id;
  insert into member_experience (member_id, title, organization, location, start_year, end_year, is_current, description, sort_order)
  select p_member_id, trim(e ->> 'title'), nullif(trim(e ->> 'organization'), ''), nullif(trim(e ->> 'location'), ''),
    nullif(e ->> 'start_year', '')::int,
    case when coalesce((e ->> 'is_current')::boolean, false) then null else nullif(e ->> 'end_year', '')::int end,
    coalesce((e ->> 'is_current')::boolean, false), nullif(trim(e ->> 'description'), ''), (ord - 1)::int
  from jsonb_array_elements(coalesce(p_experience, '[]')) with ordinality as a(e, ord)
  where nullif(trim(e ->> 'title'), '') is not null;

  delete from member_education where member_id = p_member_id;
  insert into member_education (member_id, school, degree, field, start_year, end_year, sort_order)
  select p_member_id, trim(e ->> 'school'), nullif(trim(e ->> 'degree'), ''), nullif(trim(e ->> 'field'), ''),
    nullif(e ->> 'start_year', '')::int, nullif(e ->> 'end_year', '')::int, (ord - 1)::int
  from jsonb_array_elements(coalesce(p_education, '[]')) with ordinality as a(e, ord)
  where nullif(trim(e ->> 'school'), '') is not null;
end $$;

revoke all on function save_member_profile(bigint, jsonb, jsonb, jsonb) from public, anon;
grant execute on function save_member_profile(bigint, jsonb, jsonb, jsonb) to authenticated;

-- ── Photos ───────────────────────────────────────────────────────────────────
-- The avatars bucket was created by scripts/import-avatars-to-supabase.mjs;
-- create it here too in case that script wasn't run.
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;
update storage.buckets
set file_size_limit = 2097152, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'avatars';

-- Members with a profile (and admins) can upload into a folder named after
-- their own user id; the edit page always uploads a new file name.
drop policy if exists "avatars: members upload to own folder" on storage.objects;
create policy "avatars: members upload to own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text and has_member_profile());

-- ── Public view ──────────────────────────────────────────────────────────────
-- Runs with the owner's rights (not the caller's), so it can read past RLS —
-- intended: it's the one published slice of the data (status = 'ok' only, no
-- email/admin_notes).
-- `profile` has exactly the shape of src/data/members.json, so the build sync
-- and the live /anetaret/ page both use it as-is. Columns can only be appended
-- to an existing view, hence the first version's column list, then profile.
create or replace view public_member_profiles as
select
  m.username, m.name, m.headline, m.company, m.city, m.country, m.about,
  m.fields_of_expertise, m.skills, m.languages, m.website, m.linkedin_url,
  m.avatar, m.profile_url, m.member_since, m.groups, m.teams,
  x.experience, ed.education,
  json_strip_nulls(json_build_object(
    'name', m.name, 'username', m.username, 'city', m.city, 'country', m.country,
    'fieldsOfExpertise', m.fields_of_expertise, 'specialty', nullif(m.skills, '{}'),
    'bio', m.about, 'title', m.headline, 'company', m.company, 'website', m.website,
    'linkedinUrl', m.linkedin_url, 'since', coalesce(m.member_since, extract(year from current_date)::int),
    'avatar', m.avatar, 'groups', m.groups, 'team', m.teams, 'inDirectory', true,
    'profileUrl', m.profile_url, 'languages', nullif(m.languages, '{}'),
    'experience', case when json_array_length(x.experience) > 0 then x.experience end,
    'education', case when json_array_length(ed.education) > 0 then ed.education end
  )) as profile
from members m
cross join lateral (
  select coalesce(json_agg(json_build_object(
    'title', e.title, 'organization', e.organization, 'location', e.location,
    'startYear', e.start_year, 'endYear', e.end_year, 'current', e.is_current,
    'description', e.description
  ) order by e.sort_order, e.is_current desc, coalesce(e.end_year, 9999) desc, e.start_year desc nulls last), '[]') as experience
  from member_experience e where e.member_id = m.id
) x
cross join lateral (
  select coalesce(json_agg(json_build_object(
    'school', e.school, 'degree', e.degree, 'field', e.field,
    'startYear', e.start_year, 'endYear', e.end_year
  ) order by e.sort_order, coalesce(e.end_year, 9999) desc, e.start_year desc nulls last), '[]') as education
  from member_education e where e.member_id = m.id
) ed
where m.status = 'ok';

-- The publishable key is now in the public /anetaret/ page; this view is the
-- only thing it can read (plus `categories`).
grant select on public_member_profiles to anon, authenticated;

-- Policies call these as the signed-in user, so they need execute rights.
grant execute on function current_email(), is_admin(), can_edit_member(bigint), has_member_profile(), clean_list(jsonb) to anon, authenticated;
