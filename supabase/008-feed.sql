-- Author details on public ideas, for the LinkedIn-style "Mundësitë" feed
-- (/projektet/ide/, formerly "Ndaj Ide") and the network feed on /rrjeti/.
-- Run once in the Supabase SQL Editor, after 007-social.sql. Safe to re-run.
--
-- Only when the author chose to show their name (ideas.name is set by
-- submit_idea() only then) and is an approved member: their username (for the
-- link to /anetaret/<slug>/), photo and headline, the same fields
-- public_member_profiles already publishes. Otherwise the three are null.
-- Forum-era ideas have no member_id, so they keep just the name.
--
-- Columns can only be appended to an existing view, hence 005's list first.
create or replace view public_ideas as
select i.id, i.slug, i.title, i.description, i.area, i.name, i.contact_email, i.resolved, i.source, i.created_at,
  m.username as author_username, m.avatar as author_avatar, m.headline as author_headline
from ideas i
left join members m on m.id = i.member_id and i.name is not null and m.status = 'ok'
where i.status = 'published';
grant select on public_ideas to anon, authenticated;
