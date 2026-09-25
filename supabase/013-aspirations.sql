-- Career aspirations. Run once in the Supabase SQL Editor, after
-- 004-membership-teams.sql. Safe to re-run.
--
-- Members say on /anetaresohu/profili/ ("Aspiratat e karrierës") which field
-- (one of `categories`) and subfield they want to move into, what they look
-- for in mentoring and in business, and whether they are thinking of moving
-- back to Albania / Kosovo. Saved through save_member_aspirations(), next to
-- save_member_profile().
--
-- Field, subfield, mentoring, business and the note are public (in the
-- `profile` json of public_member_profiles, as `aspirations`). The return plan
-- (return_plan, return_countries) is NOT published: only the member (own row)
-- and admins can read it, through the existing members RLS policy.

alter table members add column if not exists aspiration_field text;
alter table members add column if not exists aspiration_subfield text;
alter table members add column if not exists mentoring_interests text[] not null default '{}';
alter table members add column if not exists business_interests text[] not null default '{}';
alter table members add column if not exists aspirations_note text;
alter table members add column if not exists return_plan text;
alter table members add column if not exists return_countries text[] not null default '{}';

create or replace function save_member_aspirations(p_member_id bigint, p jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_field text := nullif(trim(p ->> 'aspiration_field'), '');
  v_mentoring text[] := clean_list(p -> 'mentoring_interests');
  v_business text[] := clean_list(p -> 'business_interests');
  v_return text := nullif(p ->> 'return_plan', '');
  v_countries text[] := clean_list(p -> 'return_countries');
begin
  if not can_edit_member(p_member_id) then
    raise exception 'Nuk ke të drejtë ta ndryshosh këtë profil.' using errcode = '42501';
  end if;
  if v_field is not null and v_field not in (select name from categories) then
    raise exception 'Kategori e panjohur te fusha ku synon.';
  end if;
  if not v_mentoring <@ array['Kërkoj mentor', 'Dua të jem mentor', 'Këshilla për karrierën', 'Lidhje me një mentor', 'Këshillim për karrierën', 'Mundësi për të mentoruar'] then
    raise exception 'Zgjedhje e panjohur te mentorimi.';
  end if;
  if not v_business <@ array['Kërkoj bashkëthemelues', 'Kërkoj investim', 'Kërkoj klientë / partnerë', 'Kërkoj punë', 'Punësoj', 'Dua të investoj', 'Prezantim me bashkëthemelues', 'Prezantim me klientë / partnerë', 'Mundësi pune', 'Kandidatë për punësim', 'Financim për projekt / biznes', 'Mundësi investimi'] then
    raise exception 'Zgjedhje e panjohur te biznesi.';
  end if;
  if v_return is not null and v_return not in ('po', 'ndoshta', 'jo', 'atje') then
    raise exception 'Zgjedhje e panjohur te kthimi.';
  end if;
  if not v_countries <@ array['Shqipëri', 'Kosovë'] then
    raise exception 'Vend i panjohur te kthimi.';
  end if;
  if length(coalesce(p ->> 'aspiration_subfield', '')) > 120 or length(coalesce(p ->> 'aspirations_note', '')) > 1000 then
    raise exception 'Teksti i aspiratave është shumë i gjatë.';
  end if;

  update members set
    aspiration_field = v_field,
    aspiration_subfield = nullif(trim(p ->> 'aspiration_subfield'), ''),
    mentoring_interests = v_mentoring,
    business_interests = v_business,
    aspirations_note = nullif(trim(p ->> 'aspirations_note'), ''),
    return_plan = v_return,
    return_countries = case when v_return in ('po', 'ndoshta', 'atje') then v_countries else '{}' end
  where id = p_member_id;
end $$;

revoke all on function save_member_aspirations(bigint, jsonb) from public, anon;
grant execute on function save_member_aspirations(bigint, jsonb) to authenticated;

-- Same view as in 004-membership-teams.sql, plus `aspirations` in `profile`
-- (without the return plan, see above).
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
    'education', case when json_array_length(ed.education) > 0 then ed.education end,
    'aspirations', case when m.aspiration_field is not null or m.aspiration_subfield is not null
      or m.mentoring_interests <> '{}' or m.business_interests <> '{}' or m.aspirations_note is not null
      then json_build_object(
        'field', m.aspiration_field, 'subfield', m.aspiration_subfield,
        'mentoring', nullif(m.mentoring_interests, '{}'), 'business', nullif(m.business_interests, '{}'),
        'note', m.aspirations_note
      ) end
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
