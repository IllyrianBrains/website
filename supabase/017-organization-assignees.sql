-- Board admins can assign an organization/business to a member.
-- Run after 006-organizations.sql. Safe to re-run.
--
-- Assignment changes the representative/owner used by existing RLS policies:
-- the assigned member can then see and manage the subject in Përfaqësimi.

create or replace function assign_organization_member(p_id bigint, p_member_id bigint) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then
    raise exception 'Vetëm bordi mund të caktojë një përfaqësues.' using errcode = '42501';
  end if;
  if not exists (select 1 from organizations where id = p_id) then
    raise exception 'Subjekti nuk ekziston.';
  end if;
  if p_member_id is not null and not exists (select 1 from members where id = p_member_id) then
    raise exception 'Personi nuk ekziston.';
  end if;

  update organizations
  set member_id = p_member_id, updated_at = now()
  where id = p_id;
end $$;

revoke all on function assign_organization_member(bigint, bigint) from public, anon;
grant execute on function assign_organization_member(bigint, bigint) to authenticated;

