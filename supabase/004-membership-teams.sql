-- Membership types + teams. Run once in the Supabase SQL Editor, after
-- 003-registration.sql. Safe to re-run.
--
-- • members.membership_type — public badge, matching the Bashkohu page:
--   Pjesëmarrës, Mbështetës, Organizator (of their city), Kontribues (in a team).
-- • members.fee_paid_year — last year the €30 fee was paid. Admin-only on the
--   site; never published.
-- • teams + member_teams — the fixed list of teams (edit names, descriptions and
--   order in the Table Editor) and who is in which, with an optional lead
--   ("Drejtues"). Only admins assign people, from /anetaresohu/profili/.
--
-- This replaces the forum groups (members.groups) and the free-text
-- members.teams for the site; both columns are kept, unused, as a record of
-- where the data came from. The one-time seed below fills the new tables from
-- them.

alter table members add column if not exists applied_role text;   -- also created by 003
alter table members add column if not exists membership_type text;
alter table members add column if not exists fee_paid_year int;
alter table members drop constraint if exists members_membership_type_check;
alter table members add constraint members_membership_type_check
  check (membership_type is null or membership_type in ('Pjesëmarrës', 'Mbështetës', 'Organizator', 'Kontribues'));

create table if not exists teams (
  slug text primary key,                        -- used in links: /ekipet/#tech
  name text not null unique,
  description text,
  sort_order int not null default 0
);
create table if not exists member_teams (
  member_id bigint not null references members(id) on delete cascade,
  team_slug text not null references teams(slug) on update cascade on delete cascade,
  role text not null default 'Anëtar' check (role in ('Drejtues', 'Anëtar')),
  primary key (member_id, team_slug)
);
alter table teams enable row level security;
alter table member_teams enable row level security;
drop policy if exists "teams: public read" on teams;
create policy "teams: public read" on teams for select to anon, authenticated using (true);
drop policy if exists "member_teams: read editable" on member_teams;
create policy "member_teams: read editable" on member_teams for select to authenticated using (can_edit_member(member_id));

-- ── One-time seed from the forum-era data ────────────────────────────────────
-- Team descriptions are a starting point — rewrite them in the Table Editor.
insert into teams (slug, name, description, sort_order) values
  ('bordi', 'Bordi', 'Anëtarët që mbajnë përgjegjësinë për drejtimin dhe vendimmarrjen e organizatës.', 0),
  ('tech', 'Tech', 'Ndërton dhe mirëmban faqen, mjetet dhe infrastrukturën teknike të rrjetit.', 10),
  ('social-media', 'Social Media', 'Kujdeset për komunikimin e rrjetit dhe praninë në rrjetet sociale.', 20),
  ('atlas', 'Atlas', 'Udhëzuesit për qytetet dhe vendet ku jetojnë shqiptarët — atlas.illyrianbrains.org.', 30),
  ('mentoring', 'Mentoring', 'Programi i mentorimit të rrjetit — mentoring.illyrianbrains.org.', 40)
on conflict (slug) do nothing;

insert into member_teams (member_id, team_slug)
select m.id, t.slug
from members m
cross join lateral unnest(m.teams || case when 'Bordi' = any(m.groups) then array['Bordi'] else '{}'::text[] end) as source(name)
join teams t on lower(t.name) = lower(source.name)
on conflict do nothing;

update members m set membership_type = case
    when 'Qytetet' = any(m.groups) then 'Organizator'
    when m.groups && array['Ekipet', 'Nismat', 'Bordi'] or exists (select 1 from member_teams mt where mt.member_id = m.id) then 'Kontribues'
  end
where m.membership_type is null;

-- New registrations: pre-fill the type from the role they applied for.
create or replace function members_default_membership() returns trigger language plpgsql as $$
begin
  if new.membership_type is null and new.applied_role in ('Organizator', 'Kontribues') then
    new.membership_type := new.applied_role;
  end if;
  return new;
end $$;
drop trigger if exists members_default_membership on members;
create trigger members_default_membership before insert on members for each row execute function members_default_membership();

-- ── Admin-only write path for membership + teams ────────────────────────────
create or replace function save_member_admin(p_member_id bigint, p jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then
    raise exception 'Vetëm adminët mund të ndryshojnë anëtarësinë dhe ekipet.' using errcode = '42501';
  end if;
  if coalesce(p ->> 'membership_type', '') not in ('', 'Pjesëmarrës', 'Mbështetës', 'Organizator', 'Kontribues') then
    raise exception 'Lloj anëtarësie i panjohur.';
  end if;
  if coalesce(p ->> 'fee_paid_year', '') <> '' and (p ->> 'fee_paid_year')::int not between 2015 and extract(year from now())::int + 1 then
    raise exception 'Viti i kuotës nuk duket i saktë.';
  end if;
  if exists (select 1 from jsonb_array_elements(coalesce(p -> 'teams', '[]')) t where not exists (select 1 from teams where slug = t ->> 'slug')) then
    raise exception 'Ekip i panjohur.';
  end if;

  update members set
    membership_type = nullif(p ->> 'membership_type', ''),
    fee_paid_year = nullif(p ->> 'fee_paid_year', '')::int
  where id = p_member_id;

  delete from member_teams where member_id = p_member_id;
  insert into member_teams (member_id, team_slug, role)
  select p_member_id, t ->> 'slug', case when t ->> 'role' = 'Drejtues' then 'Drejtues' else 'Anëtar' end
  from jsonb_array_elements(coalesce(p -> 'teams', '[]')) t
  on conflict do nothing;
end $$;
revoke all on function save_member_admin(bigint, jsonb) from public, anon;
grant execute on function save_member_admin(bigint, jsonb) to authenticated;

-- ── Public view: membership type + teams in the profile JSON ────────────────
-- Same columns as in 002; only `profile` changes: `groups` (forum) is gone,
-- `team` now lists team names from member_teams, `teams` adds slug + role.
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
    'avatar', m.avatar, 'team', tm.team_names, 'teams', tm.teams, 'membershipType', m.membership_type,
    'inDirectory', true, 'profileUrl', m.profile_url, 'languages', nullif(m.languages, '{}'),
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
cross join lateral (
  select coalesce(json_agg(t.name order by t.sort_order, t.name), '[]') as team_names,
    json_agg(json_build_object('slug', t.slug, 'name', t.name, 'role', mt.role) order by t.sort_order, t.name) as teams
  from member_teams mt join teams t on t.slug = mt.team_slug where mt.member_id = m.id
) tm
where m.status = 'ok';

grant select on public_member_profiles to anon, authenticated;
