-- Multiple representatives and richer public opportunities for organizations.
-- Run after 017-organization-assignees.sql. Safe to re-run.

create table if not exists organization_representatives (
  organization_id bigint not null references organizations(id) on delete cascade,
  member_id bigint not null references members(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (organization_id, member_id)
);
create index if not exists organization_representatives_member on organization_representatives(member_id, organization_id);

insert into organization_representatives (organization_id, member_id)
select id, member_id from organizations where member_id is not null
on conflict do nothing;

alter table organization_representatives enable row level security;
drop policy if exists "organization representatives: own, admins all" on organization_representatives;
create policy "organization representatives: own, admins all" on organization_representatives for select to authenticated
using (is_admin() or member_id = my_member_id());

create or replace function can_edit_organization(p_organization_id bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select is_admin() or exists (
    select 1 from organization_representatives r
    where r.organization_id = p_organization_id and r.member_id = my_member_id()
  ) or exists (
    select 1 from organizations o
    where o.id = p_organization_id and o.member_id = my_member_id()
  );
$$;

drop policy if exists "organizations: own, admins all" on organizations;
create policy "organizations: own, admins all" on organizations for select to authenticated
using (can_edit_organization(id));

create or replace function set_organization_representatives(p_id bigint, p_member_ids bigint[]) returns void
language plpgsql security definer set search_path = public as $$
declare v_ids bigint[] := coalesce(p_member_ids, '{}');
begin
  if not is_admin() then
    raise exception 'Vetëm bordi mund të caktojë përfaqësuesit.' using errcode = '42501';
  end if;
  if not exists (select 1 from organizations where id = p_id) then raise exception 'Subjekti nuk ekziston.'; end if;
  if exists (select 1 from unnest(v_ids) id where not exists (select 1 from members m where m.id = id)) then
    raise exception 'Një nga personat nuk ekziston.';
  end if;
  delete from organization_representatives where organization_id = p_id;
  insert into organization_representatives (organization_id, member_id)
  select p_id, id from (select distinct unnest(v_ids) id) chosen;
  update organizations set member_id = v_ids[1], updated_at = now() where id = p_id;
end $$;

alter table organization_offers drop constraint if exists organization_offers_kind_check;
alter table organization_offers add constraint organization_offers_kind_check
check (kind in ('job', 'internship', 'event', 'project', 'volunteer', 'benefit', 'collaboration'));

create or replace view public_organizations as
select o.id, o.kind, o.name, o.category, o.other_categories, o.stage, o.city, o.country, o.description,
  o.website, o.linkedin, o.instagram, o.logo, o.sponsor, o.collaborations,
  o.related_members, o.related_cities, o.related_partners,
  (select r.username from organization_representatives x join members r on r.id = x.member_id
   where x.organization_id = o.id and r.status = 'ok' order by (x.member_id = o.member_id) desc, r.name limit 1) as username,
  o.created_at,
  coalesce((select jsonb_agg(jsonb_build_object('name', r.name, 'username', r.username, 'title', r.headline, 'avatar', r.avatar) order by r.name)
    from organization_representatives x join members r on r.id = x.member_id
    where x.organization_id = o.id and r.status = 'ok'), '[]'::jsonb) as representatives,
  coalesce((select jsonb_agg(jsonb_build_object('id', f.id, 'kind', f.kind, 'title', f.title, 'description', f.description, 'url', f.url, 'expires_at', f.expires_at) order by f.created_at desc)
    from organization_offers f where f.organization_id = o.id and f.status = 'published'
      and (f.expires_at is null or f.expires_at >= current_date)), '[]'::jsonb) as opportunities
from organizations o where o.status = 'published';

revoke all on function can_edit_organization(bigint), set_organization_representatives(bigint, bigint[]) from public, anon;
grant execute on function can_edit_organization(bigint), set_organization_representatives(bigint, bigint[]) to authenticated;


-- Multiple representatives may read and publish opportunities for their organization.
drop policy if exists "offers: represented organizations" on organization_offers;
create policy "offers: represented organizations" on organization_offers for select to authenticated
using (can_edit_organization(organization_id));

create or replace function save_organization_offer(p_id bigint, p jsonb) returns bigint
language plpgsql security definer set search_path = public as $$
declare
  v_org bigint := (p ->> 'organization_id')::bigint;
  v_kind text := p ->> 'kind';
  v_url text := nullif(trim(p ->> 'url'), '');
  v_id bigint;
begin
  if my_member_id() is null or not can_edit_organization(v_org) then
    raise exception 'Nuk ke të drejtë të publikosh për këtë subjekt.' using errcode = '42501';
  end if;
  if p_id is not null and not exists (select 1 from organization_offers f where f.id = p_id and can_edit_organization(f.organization_id)) then
    raise exception 'Nuk ke të drejtë ta ndryshosh këtë mundësi.' using errcode = '42501';
  end if;
  if v_kind not in ('job', 'internship', 'event', 'project', 'volunteer', 'benefit', 'collaboration') then raise exception 'Lloj mundësie i panjohur.'; end if;
  if length(trim(coalesce(p ->> 'title', ''))) not between 3 and 160 then raise exception 'Titulli duhet të ketë 3–160 shkronja.'; end if;
  if length(trim(coalesce(p ->> 'description', ''))) not between 10 and 2000 then raise exception 'Përshkrimi duhet të ketë 10–2000 shkronja.'; end if;
  if v_url is not null and v_url !~* '^https?://[^\s<>"]+$' then raise exception 'Linku duhet të fillojë me https://.'; end if;
  if p_id is null then
    insert into organization_offers (organization_id, kind, title, description)
    values (v_org, v_kind, trim(p ->> 'title'), trim(p ->> 'description')) returning id into v_id;
  else v_id := p_id; end if;
  update organization_offers f set organization_id = v_org, kind = v_kind, title = trim(p ->> 'title'), description = trim(p ->> 'description'), url = v_url,
    expires_at = nullif(p ->> 'expires_at', '')::date,
    status = case when is_admin() then f.status when exists (select 1 from organizations o where o.id = v_org and o.status = 'published') then 'published' else 'pending' end,
    updated_at = now() where f.id = v_id;
  return v_id;
end $$;
