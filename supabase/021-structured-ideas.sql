-- Structured metadata for the shared Postimet library. Run after 020.
-- Existing posts remain valid; the UI classifies legacy rows conservatively.

alter table ideas add column if not exists content_type text;
alter table ideas add column if not exists summary text;
alter table ideas add column if not exists location text;
alter table ideas add column if not exists audience text;
alter table ideas add column if not exists expires_at timestamptz;

alter table ideas drop constraint if exists ideas_content_type_check;
alter table ideas add constraint ideas_content_type_check check (
  content_type is null or content_type in ('guide', 'story', 'opportunity', 'event', 'request', 'notice')
);
alter table ideas drop constraint if exists ideas_summary_check;
alter table ideas add constraint ideas_summary_check check (summary is null or length(summary) between 20 and 280);

create or replace function submit_idea(p jsonb) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_member members%rowtype;
  v_title text := trim(coalesce(p ->> 'title', ''));
  v_summary text := trim(coalesce(p ->> 'summary', ''));
  v_content_type text := trim(coalesce(p ->> 'content_type', ''));
  v_tags text[] := clean_tags(array(select jsonb_array_elements_text(coalesce(p -> 'tags', '[]'))));
  v_slug text;
begin
  select * into v_member from members where current_email() <> '' and lower(email) = current_email() order by id limit 1;
  if v_member.id is null then
    raise exception 'Emaili yt nuk është i lidhur me asnjë profil anëtari.' using errcode = '42501';
  end if;
  if length(v_title) < 3 or length(v_title) > 160 then raise exception 'Titulli duhet të ketë 3–160 shkronja.'; end if;
  if v_content_type not in ('guide', 'story', 'opportunity', 'event', 'request', 'notice') then raise exception 'Zgjidh llojin e postimit.'; end if;
  if length(v_summary) < 20 or length(v_summary) > 280 then raise exception 'Përmbledhja duhet të ketë 20–280 shkronja.'; end if;
  if (select count(*) from ideas where member_id = v_member.id and created_at > now() - interval '1 day') >= 10 then
    raise exception 'Ke dërguar shumë sot — provo sërish nesër.';
  end if;
  v_slug := idea_slug(v_title);
  insert into ideas (slug, title, summary, content_type, location, description, tags, name, contact_email, member_id, wants_public, status)
  values (
    v_slug, v_title, v_summary, v_content_type, nullif(left(trim(coalesce(p ->> 'location', '')), 120), ''),
    left(trim(coalesce(p ->> 'description', '')), 20000), v_tags,
    case when coalesce((p ->> 'show_name')::boolean, false) then v_member.name end,
    case when coalesce((p ->> 'show_email')::boolean, false) then v_member.email end,
    v_member.id, coalesce((p ->> 'wants_public')::boolean, true),
    case when coalesce((p ->> 'wants_public')::boolean, true) then 'published' else 'hidden' end
  );
  return v_slug;
end $$;

create or replace view public_ideas as
select i.id, i.slug, i.title, i.description, i.tags, i.name, i.contact_email, i.resolved, i.source, i.created_at,
  m.username as author_username, m.avatar as author_avatar, m.headline as author_headline,
  i.content_type, i.summary, i.location, i.audience, i.expires_at
from ideas i
left join members m on m.id = i.member_id and i.name is not null and m.status = 'ok'
where i.status = 'published';
grant select on public_ideas to anon, authenticated;

revoke all on function submit_idea(jsonb) from public, anon;
grant execute on function submit_idea(jsonb) to authenticated;
