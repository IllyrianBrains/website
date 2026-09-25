-- Subscribing to a city or a field of expertise. Run once in the Supabase SQL
-- Editor, after 007-social.sql. Safe to re-run.
--
-- Like following a member (007-social.sql), but for a city (the "Ndiq qytetin"
-- button on /qytetet/<slug>/) or a field from `categories` (managed on
-- /anetaresohu/rrjeti/, which also shows recent posts by members there).
-- Subscriber counts are public; who is subscribed to what is seen only by the
-- member themself. A later email digest can read this table.
--
-- Cities aren't a table here (they live in the site's cities.csv), so a city
-- is stored by its name as the site spells it.

create table if not exists member_subscriptions (
  member_id bigint not null references members(id) on delete cascade,
  kind text not null check (kind in ('city', 'field')),
  value text not null check (length(trim(value)) between 1 and 80),
  created_at timestamptz not null default now(),
  primary key (member_id, kind, value)
);
create index if not exists member_subscriptions_topic on member_subscriptions (kind, value);
alter table member_subscriptions enable row level security;   -- no policies: functions below only


-- One read cursor per member keeps notification state small: notifications are
-- derived from matching public posts rather than copied into a fan-out table.
create table if not exists member_subscription_reads (
  member_id bigint primary key references members(id) on delete cascade,
  last_read_at timestamptz not null default now()
);
alter table member_subscription_reads enable row level security; -- functions only
-- Existing subscribers start clean when this migration is upgraded.
insert into member_subscription_reads (member_id)
select distinct member_id from member_subscriptions on conflict do nothing;

create or replace function set_subscription(p_kind text, p_value text, p_on boolean) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_me bigint := my_member_id();
  v_value text := trim(coalesce(p_value, ''));
begin
  if v_me is null then
    raise exception 'Vetëm anëtarët e aprovuar mund të ndjekin qytete dhe fusha.' using errcode = '42501';
  end if;
  if p_kind not in ('city', 'field') or v_value = '' or length(v_value) > 80 then
    raise exception 'Zgjedhje e pavlefshme.';
  end if;
  if p_kind = 'field' and v_value not in (select name from categories) then
    raise exception 'Kjo fushë nuk ekziston.';
  end if;
  if p_on then
    if (select count(*) from member_subscriptions where member_id = v_me) >= 50 then
      raise exception 'Mund të ndjekësh deri në 50 qytete dhe fusha.';
    end if;
    insert into member_subscription_reads (member_id) values (v_me) on conflict do nothing;
    insert into member_subscriptions (member_id, kind, value) values (v_me, p_kind, v_value) on conflict do nothing;
  else
    delete from member_subscriptions where member_id = v_me and kind = p_kind and value = v_value;
  end if;
end $$;

-- Public count for a city/field page, plus whether the caller is subscribed.
create or replace function subscription_stats(p_kind text, p_value text) returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'subscribers', (select count(*) from member_subscriptions s join members m on m.id = s.member_id and m.status = 'ok' where s.kind = p_kind and s.value = p_value),
    'is_subscribed', exists (select 1 from member_subscriptions where member_id = my_member_id() and kind = p_kind and value = p_value)
  )
$$;

-- The caller's own subscriptions, newest first.
create or replace function my_subscriptions() returns json
language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(json_build_object('kind', kind, 'value', value) order by created_at desc), '[]')
  from member_subscriptions where member_id = my_member_id()
$$;


-- Read cursor used by Rrjeti im to mark matching posts as new across devices.
create or replace function my_subscription_read_state() returns timestamptz
language sql stable security definer set search_path = public as $$
  select last_read_at from member_subscription_reads where member_id = my_member_id()
$$;

create or replace function mark_subscription_notifications_read() returns timestamptz
language plpgsql security definer set search_path = public as $$
declare
  v_me bigint := my_member_id();
  v_now timestamptz := now();
begin
  if v_me is null then
    raise exception 'Vetëm anëtarët e aprovuar mund të shënojnë njoftimet.' using errcode = '42501';
  end if;
  insert into member_subscription_reads (member_id, last_read_at) values (v_me, v_now)
  on conflict (member_id) do update set last_read_at = excluded.last_read_at;
  return v_now;
end $$;

revoke all on function set_subscription(text, text, boolean), my_subscriptions(), my_subscription_read_state(), mark_subscription_notifications_read() from public, anon;
grant execute on function set_subscription(text, text, boolean), my_subscriptions(), my_subscription_read_state(), mark_subscription_notifications_read() to authenticated;
grant execute on function subscription_stats(text, text) to anon, authenticated;
