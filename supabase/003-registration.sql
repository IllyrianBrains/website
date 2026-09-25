-- Public registration form (/anetaresohu/regjistrohu/). Run once in the
-- Supabase SQL Editor, after 002-editing.sql (it reuses categories and
-- clean_list from there). Safe to re-run.
--
-- New people are added to `members` with status 'pending' — they don't show on
-- the site until an admin sets status to 'ok' (Table Editor, or the admin
-- picker on /anetaresohu/profili/). Once approved they can sign in with the
-- same email and fill in the rest of their profile.
--
-- To see new registrations: Table Editor → members → filter status = pending.

alter table members add column if not exists applied_role text;   -- Organizator / Kontribues / …
alter table members add column if not exists motivation text;     -- "Pse dëshiron të bashkohesh?"
alter table members add column if not exists consent_at timestamptz;

create or replace function register_member(p jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_email text := lower(trim(coalesce(p ->> 'email', '')));
  v_name text := trim(coalesce(p ->> 'name', ''));
  v_linkedin text := trim(coalesce(p ->> 'linkedin_url', ''));
  v_role text := coalesce(p ->> 'applied_role', '');
  v_fields text[] := clean_list(p -> 'fields_of_expertise');
  v_base text;
  v_username text;
  v_n int := 1;
begin
  -- Honeypot: a field hidden from people; bots fill it. Pretend it worked.
  if coalesce(p ->> 'company_website', '') <> '' then return; end if;

  if coalesce((p ->> 'consent')::boolean, false) is not true then
    raise exception 'Duhet të pranosh ruajtjen e të dhënave për t’u regjistruar.';
  end if;
  if length(v_name) < 3 or length(v_name) > 120 then
    raise exception 'Shkruaj emrin dhe mbiemrin.';
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(v_email) > 200 then
    raise exception 'Emaili nuk duket i saktë.';
  end if;
  if v_linkedin !~* '^https?://([a-z0-9-]+\.)*linkedin\.com/[^\s<>"]+$' then
    raise exception 'Linku i LinkedIn duhet të jetë si https://linkedin.com/in/emri-yt.';
  end if;
  if v_role not in ('Organizator', 'Kontribues', 'Ende nuk e di') then
    raise exception 'Zgjidh si dëshiron të përfshihesh.';
  end if;
  if coalesce(trim(p ->> 'city'), '') = '' or coalesce(trim(p ->> 'country'), '') = '' then
    raise exception 'Shkruaj qytetin dhe shtetin ku jeton.';
  end if;
  if exists (select 1 from unnest(v_fields) f where f not in (select name from categories)) then
    raise exception 'Kategori e panjohur në fushat e ekspertizës.';
  end if;
  if length(coalesce(p ->> 'about', '')) > 3000 or length(coalesce(p ->> 'motivation', '')) > 3000 then
    raise exception 'Teksti është shumë i gjatë (maks. 3000 shkronja).';
  end if;
  if exists (select 1 from members where lower(email) = v_email) then
    raise exception 'Ky email është tashmë i regjistruar. Përdor “Hyr” për të përditësuar profilin.' using errcode = '23505';
  end if;
  -- Crude flood guard: the form is public, so cap new registrations per hour.
  if (select count(*) from members where status = 'pending' and created_at > now() - interval '1 hour') >= 30 then
    raise exception 'Shumë regjistrime këtë orë — provo përsëri pak më vonë.';
  end if;

  -- username: name without accents/spaces, numbered if taken ("dorencalliku2").
  v_base := regexp_replace(translate(lower(v_name), 'ëçéèêáàâäöóòüúùšžćčđ', 'eceeeaaaaooouuuszccd'), '[^a-z0-9]+', '', 'g');
  if v_base = '' then v_base := 'anetar'; end if;
  v_username := v_base;
  while exists (select 1 from members where lower(username) = v_username) loop
    v_n := v_n + 1;
    v_username := v_base || v_n;
  end loop;

  insert into members (
    username, name, email, status, headline, company, city, country, about,
    fields_of_expertise, skills, languages, linkedin_url, member_since,
    applied_role, motivation, consent_at
  ) values (
    v_username, v_name, v_email, 'pending',
    nullif(trim(p ->> 'headline'), ''), nullif(trim(p ->> 'company'), ''),
    trim(p ->> 'city'), trim(p ->> 'country'), nullif(trim(p ->> 'about'), ''),
    v_fields, clean_list(p -> 'skills'), clean_list(p -> 'languages'), v_linkedin,
    extract(year from now())::int, v_role, nullif(trim(p ->> 'motivation'), ''), now()
  );
end $$;

revoke all on function register_member(jsonb) from public;
grant execute on function register_member(jsonb) to anon, authenticated;
