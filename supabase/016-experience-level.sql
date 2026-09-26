-- Structured professional experience level for each member.
-- Run after 013-aspirations.sql. Safe to re-run.

alter table members add column if not exists experience_level text;
alter table members drop constraint if exists members_experience_level_check;
alter table members add constraint members_experience_level_check
  check (experience_level is null or experience_level in ('junior', 'mid', 'senior', 'expert'));

create or replace function save_member_experience_level(p_member_id bigint, p_level text) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_level text := nullif(trim(coalesce(p_level, '')), '');
begin
  if not can_edit_member(p_member_id) then
    raise exception 'Nuk ke të drejtë ta ndryshosh këtë profil.' using errcode = '42501';
  end if;
  if v_level is not null and v_level not in ('junior', 'mid', 'senior', 'expert') then
    raise exception 'Nivel eksperience i panjohur.';
  end if;
  update members set experience_level = v_level where id = p_member_id;
end $$;

revoke all on function save_member_experience_level(bigint, text) from public, anon;
grant execute on function save_member_experience_level(bigint, text) to authenticated;

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
    'experienceLevel', m.experience_level,
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
  )) as profile,
  m.experience_level
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

