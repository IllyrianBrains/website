-- Minimal safety and data-ownership controls. Run after 019-admin-network-snapshot.sql.
-- Safe to re-run. No feed ranking, messaging, reactions, or email service.

create table if not exists member_blocks (
  blocker_id bigint not null references members(id) on delete cascade,
  blocked_id bigint not null references members(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
alter table member_blocks enable row level security;

create table if not exists content_reports (
  id bigint generated always as identity primary key,
  reporter_id bigint not null references members(id) on delete cascade,
  member_id bigint references members(id) on delete cascade,
  post_id bigint references member_posts(id) on delete cascade,
  reason text not null check (length(trim(reason)) between 3 and 500),
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  check ((member_id is not null)::int + (post_id is not null)::int = 1)
);
create index if not exists content_reports_status_created on content_reports(status, created_at desc);
alter table content_reports enable row level security;

create or replace function member_safety_state(p_username text) returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'member_id', m.id,
    'is_me', m.id = my_member_id(),
    'is_blocked', exists(select 1 from member_blocks where blocker_id = my_member_id() and blocked_id = m.id)
  ) from members m where m.username = p_username and m.status = 'ok'
$$;

create or replace function set_block(p_username text, p_on boolean) returns void
language plpgsql security definer set search_path = public as $$
declare v_me bigint := my_member_id(); v_them bigint;
begin
  if v_me is null then raise exception 'Duhet të jesh anëtar i aprovuar.' using errcode = '42501'; end if;
  select id into v_them from members where username = p_username and status = 'ok';
  if v_them is null or v_them = v_me then raise exception 'Anëtari nuk u gjet.'; end if;
  if p_on then
    insert into member_blocks(blocker_id, blocked_id) values (v_me, v_them) on conflict do nothing;
    delete from member_follows where (follower_id = v_me and followee_id = v_them) or (follower_id = v_them and followee_id = v_me);

create or replace function my_blocked_usernames() returns json
language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(m.username order by b.created_at desc), '[]')
  from member_blocks b join members m on m.id = b.blocked_id
  where b.blocker_id = my_member_id()
  else
    delete from member_blocks where blocker_id = v_me and blocked_id = v_them;
  end if;
end $$;

create or replace function report_content(p_kind text, p_target bigint, p_reason text) returns bigint
language plpgsql security definer set search_path = public as $$
declare v_me bigint := my_member_id(); v_id bigint;
begin
  if v_me is null then raise exception 'Duhet të jesh anëtar i aprovuar.' using errcode = '42501'; end if;
  if length(trim(coalesce(p_reason, ''))) not between 3 and 500 then raise exception 'Shkruaj një arsye të shkurtër.'; end if;
  if (select count(*) from content_reports where reporter_id = v_me and created_at > now() - interval '1 day') >= 10 then raise exception 'Ke arritur kufirin ditor të raportimeve.'; end if;
  if p_kind = 'member' then
    if not exists(select 1 from members where id = p_target and status = 'ok' and id <> v_me) then raise exception 'Anëtari nuk u gjet.'; end if;
    insert into content_reports(reporter_id, member_id, reason) values (v_me, p_target, trim(p_reason)) returning id into v_id;
  elsif p_kind = 'post' then
    if not exists(select 1 from member_posts where id = p_target and member_id <> v_me) then raise exception 'Postimi nuk u gjet.'; end if;
    insert into content_reports(reporter_id, post_id, reason) values (v_me, p_target, trim(p_reason)) returning id into v_id;
  else
    raise exception 'Lloj raportimi i panjohur.';
  end if;
  return v_id;
end $$;

create or replace function my_data_export() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'exported_at', now(),
    'profile', to_jsonb(m) - 'admin_notes',
    'experience', coalesce((select jsonb_agg(to_jsonb(e) - 'member_id') from member_experience e where e.member_id = m.id), '[]'::jsonb),
    'education', coalesce((select jsonb_agg(to_jsonb(e) - 'member_id') from member_education e where e.member_id = m.id), '[]'::jsonb),
    'posts', coalesce((select jsonb_agg(to_jsonb(p) - 'member_id') from member_posts p where p.member_id = m.id), '[]'::jsonb),
    'subscriptions', coalesce((select jsonb_agg(to_jsonb(s) - 'member_id') from member_subscriptions s where s.member_id = m.id), '[]'::jsonb)
  ) from members m where lower(m.email) = current_email() order by m.id limit 1
$$;

create or replace function deactivate_my_membership() returns void
language plpgsql security definer set search_path = public as $$
begin
  if current_email() = '' then raise exception 'Duhet të hysh në llogari.' using errcode = '42501'; end if;
  update members set status = 'inactive' where lower(email) = current_email();
  if not found then raise exception 'Profili nuk u gjet.'; end if;
end $$;

create or replace function community_health() returns jsonb
language sql stable security definer set search_path = public as $$
  select case when not is_admin() then '{}'::jsonb else jsonb_build_object(
    'active_members_30d', (select count(distinct member_id) from member_posts where created_at >= now() - interval '30 days'),
    'posts_30d', (select count(*) from member_posts where created_at >= now() - interval '30 days'),
    'follows_30d', (select count(*) from member_follows where created_at >= now() - interval '30 days'),
    'open_reports', (select count(*) from content_reports where status = 'open')
  ) end
$$;

revoke all on function member_safety_state(text), set_block(text, boolean), my_blocked_usernames(), report_content(text, bigint, text), my_data_export(), deactivate_my_membership(), community_health() from public, anon;
grant execute on function member_safety_state(text), set_block(text, boolean), my_blocked_usernames(), report_content(text, bigint, text), my_data_export(), deactivate_my_membership(), community_health() to authenticated;
