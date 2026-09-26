-- Board-only snapshot for the focused network explorer.
-- Returns organization links, follower edges, and actionable notification counts
-- without exposing the private social graph to public clients.
create or replace function admin_network_snapshot() returns jsonb
language sql stable security definer set search_path = public as $$
  select case when not is_admin() then
    jsonb_build_object('organizations', '[]'::jsonb, 'follows', '[]'::jsonb, 'notifications', '[]'::jsonb)
  else jsonb_build_object(
    'organizations', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', o.id, 'name', o.name, 'kind', o.kind, 'status', o.status,
        'city', o.city, 'category', o.category,
        'representatives', coalesce((
          select jsonb_agg(m.id)
          from organization_representatives r join members m on m.id = r.member_id
          where r.organization_id = o.id
        ), '[]'::jsonb)
      ) order by o.name)
      from organizations o
    ), '[]'::jsonb),
    'follows', coalesce((
      select jsonb_agg(jsonb_build_object(
        'follower', f.follower_id, 'followee', f.followee_id, 'created_at', f.created_at
      ))
      from member_follows f
      join members a on a.id = f.follower_id and a.status = 'ok'
      join members b on b.id = f.followee_id and b.status = 'ok'
    ), '[]'::jsonb),
    'notifications', jsonb_build_array(
      jsonb_build_object('type', 'members', 'label', 'Regjistrime në pritje', 'count',
        (select count(*) from members where status <> 'ok')),
      jsonb_build_object('type', 'organizations', 'label', 'Organizata në pritje', 'count',
        (select count(*) from organizations where status = 'pending')),
      jsonb_build_object('type', 'followers', 'label', 'Ndjekje të reja këtë javë', 'count',
        (select count(*) from member_follows where created_at >= now() - interval '7 days'))
    )
  ) end;
$$;

revoke all on function admin_network_snapshot() from public, anon;
grant execute on function admin_network_snapshot() to authenticated;
