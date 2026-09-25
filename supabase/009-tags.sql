-- Free-form tags on posts and ideas. They replace the fixed idea categories:
-- each idea's ideas.area becomes its first tag and the column is dropped.
-- Run once in the Supabase SQL Editor, after 008-feed.sql. Safe to re-run.
--
-- Tags are whatever the author types: trimmed, a leading "#" dropped, at most
-- 5 per item and 30 characters each, duplicates (ignoring case) removed.

alter table ideas add column if not exists tags text[] not null default '{}';
alter table member_posts add column if not exists tags text[] not null default '{}';

do $$ begin
  if exists (select 1 from information_schema.columns where table_name = 'ideas' and column_name = 'area') then
    execute $q$update ideas set tags = array[area] where area is not null and tags = '{}'$q$;
  end if;
end $$;
drop view if exists public_ideas;
alter table ideas drop column if exists area;

create or replace function clean_tags(p_tags text[]) returns text[]
language sql immutable set search_path = public as $$
  select coalesce(array_agg(tag order by first), '{}')
  from (
    select min(tag) as tag, min(n) as first
    from (
      select left(trim(regexp_replace(trim(t), '^#+', '')), 30) as tag, n
      from unnest(coalesce(p_tags, '{}')) with ordinality as u(t, n)
    ) raw
    where tag <> ''
    group by lower(tag)
    order by min(n)
    limit 5
  ) tags
$$;

create or replace function submit_idea(p jsonb) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_member members%rowtype;
  v_title text := trim(coalesce(p ->> 'title', ''));
  v_tags text[] := clean_tags(array(select jsonb_array_elements_text(coalesce(p -> 'tags', '[]'))));
  v_slug text;
begin
  select * into v_member from members where current_email() <> '' and lower(email) = current_email() order by id limit 1;
  if v_member.id is null then
    raise exception 'Emaili yt nuk është i lidhur me asnjë profil anëtari.' using errcode = '42501';
  end if;
  if length(v_title) < 3 or length(v_title) > 160 then
    raise exception 'Titulli duhet të ketë 3–160 shkronja.';
  end if;
  if (select count(*) from ideas where member_id = v_member.id and created_at > now() - interval '1 day') >= 10 then
    raise exception 'Ke dërguar shumë sot — provo sërish nesër.';
  end if;
  v_slug := idea_slug(v_title);
  insert into ideas (slug, title, description, tags, name, contact_email, member_id, wants_public, status)
  values (
    v_slug, v_title, left(trim(coalesce(p ->> 'description', '')), 20000), v_tags,
    case when coalesce((p ->> 'show_name')::boolean, false) then v_member.name end,
    case when coalesce((p ->> 'show_email')::boolean, false) then v_member.email end,
    v_member.id, coalesce((p ->> 'wants_public')::boolean, true),
    case when coalesce((p ->> 'wants_public')::boolean, true) then 'published' else 'hidden' end
  );
  return v_slug;
end $$;

drop function if exists create_post(text);
create or replace function create_post(p_body text, p_tags text[] default '{}') returns bigint
language plpgsql security definer set search_path = public as $$
declare
  v_me bigint := my_member_id();
  v_id bigint;
begin
  if v_me is null then
    raise exception 'Vetëm anëtarët e aprovuar mund të postojnë.' using errcode = '42501';
  end if;
  if length(trim(coalesce(p_body, ''))) = 0 then raise exception 'Postimi është bosh.'; end if;
  if length(trim(p_body)) > 3000 then raise exception 'Postimi është shumë i gjatë (maks. 3000 shkronja).'; end if;
  if (select count(*) from member_posts where member_id = v_me and created_at > now() - interval '1 day') >= 20 then
    raise exception 'Ke arritur kufirin prej 20 postimesh në ditë.';
  end if;
  insert into member_posts (member_id, body, tags) values (v_me, trim(p_body), clean_tags(p_tags)) returning id into v_id;
  return v_id;
end $$;
revoke all on function create_post(text, text[]) from public, anon;
grant execute on function create_post(text, text[]) to authenticated;

create view public_ideas as
select i.id, i.slug, i.title, i.description, i.tags, i.name, i.contact_email, i.resolved, i.source, i.created_at,
  m.username as author_username, m.avatar as author_avatar, m.headline as author_headline
from ideas i
left join members m on m.id = i.member_id and i.name is not null and m.status = 'ok'
where i.status = 'published';
grant select on public_ideas to anon, authenticated;

create or replace view public_member_posts as
select p.id, p.body, p.created_at, m.username, m.name, m.headline, m.avatar, p.tags
from member_posts p join members m on m.id = p.member_id
where m.status = 'ok';
grant select on public_member_posts to anon, authenticated;
