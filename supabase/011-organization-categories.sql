-- Several categories per NGO or business. Run once in the Supabase SQL Editor,
-- after 006-organizations.sql. Safe to re-run.
--
-- /anetaresohu/shoqatat/ and /anetaresohu/bizneset/ (which replace the combined
-- /anetaresohu/organizatat/) let the author tick one or more categories. The
-- first one sent (first in the list on the page) is stored in `category` (the main one), the rest in
-- `other_categories`, which until now only admins filled in the Table Editor.
-- partners.ts and businesses.ts already read both.

-- Add (p_id null) or edit. Members edit their own; admins any, keeping its status.
create or replace function save_organization(p_id bigint, p jsonb) returns bigint
language plpgsql security definer set search_path = public as $$
declare
  v_member members%rowtype;
  v_kind text := p ->> 'kind';
  -- Every category ticked, in order, without repeats; an older client sends just `category`.
  v_categories text[] := case when jsonb_typeof(p -> 'categories') = 'array'
    then array(select c from jsonb_array_elements_text(p -> 'categories') with ordinality as t(c, n) group by c order by min(n))
    else array[coalesce(p ->> 'category', '')] end;
  v_category text;
  v_link text;
  v_id bigint;
begin
  select * into v_member from members where current_email() <> '' and lower(email) = current_email() order by id limit 1;
  if v_member.id is null and not is_admin() then
    raise exception 'Emaili yt nuk është i lidhur me asnjë profil anëtari.' using errcode = '42501';
  end if;
  if p_id is not null and not exists (select 1 from organizations where id = p_id and can_edit_member(member_id)) then
    raise exception 'Vetëm autori ose një admin mund ta ndryshojë këtë.' using errcode = '42501';
  end if;
  if v_kind is null or v_kind not in ('ngo', 'business') then
    raise exception 'Zgjidh OJF ose biznes.';
  end if;
  if length(trim(coalesce(p ->> 'name', ''))) not between 2 and 120 then
    raise exception 'Emri duhet të ketë 2–120 shkronja.';
  end if;
  if coalesce(array_length(v_categories, 1), 0) = 0 then
    raise exception 'Zgjidh të paktën një kategori.';
  end if;
  if exists (select 1 from unnest(v_categories) c where
    (v_kind = 'ngo' and c not in ('advocacy', 'education', 'culture', 'environment', 'diaspora'))
    or (v_kind = 'business' and c not in ('technology', 'architecture', 'health', 'finance', 'business-development', 'other'))) then
    raise exception 'Kategori e panjohur.';
  end if;
  v_category := v_categories[1];
  if v_kind = 'business' and coalesce(p ->> 'stage', '') not in ('startup', 'established', 'diaspora') then
    raise exception 'Zgjidh fazën e biznesit.';
  end if;
  if length(coalesce(p ->> 'description', '')) > 1000 then
    raise exception 'Përshkrimi është shumë i gjatë (maks. 1000 shkronja).';
  end if;
  foreach v_link in array array[p ->> 'website', p ->> 'linkedin', p ->> 'instagram'] loop
    if coalesce(v_link, '') <> '' and v_link !~* '^https?://[^\s<>"]+$' then
      raise exception 'Linku duhet të fillojë me https:// (%).', v_link;
    end if;
  end loop;
  if coalesce(p ->> 'logo', '') <> '' and p ->> 'logo' !~ '^https://[^\s<>"]+/storage/v1/object/public/avatars/' and not is_admin() then
    raise exception 'Logoja duhet të ngarkohet nga kjo faqe.';
  end if;

  if p_id is null then
    if (select count(*) from organizations where member_id = v_member.id and created_at > now() - interval '1 day') >= 10 then
      raise exception 'Ke dërguar shumë sot — provo sërish nesër.';
    end if;
    insert into organizations (kind, name, category, member_id) values (v_kind, trim(p ->> 'name'), v_category, v_member.id)
    returning id into v_id;
  else
    v_id := p_id;
  end if;

  update organizations set
    kind = v_kind,
    name = trim(p ->> 'name'),
    category = v_category,
    other_categories = v_categories[2:],
    stage = case when v_kind = 'business' then p ->> 'stage' end,
    city = nullif(trim(p ->> 'city'), ''),
    country = nullif(trim(p ->> 'country'), ''),
    description = trim(coalesce(p ->> 'description', '')),
    website = nullif(trim(p ->> 'website'), ''),
    linkedin = nullif(trim(p ->> 'linkedin'), ''),
    instagram = nullif(trim(p ->> 'instagram'), ''),
    logo = nullif(p ->> 'logo', ''),
    status = case when is_admin() then status else 'pending' end,
    updated_at = now()
  where id = v_id;
  return v_id;
end $$;
