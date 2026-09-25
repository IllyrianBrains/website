-- Member directory schema for illyrianbrains.org. Replaces the private
-- members Google Sheet as the place member data lives.
--
-- Run once in the Supabase dashboard → SQL Editor, then 002-editing.sql.
-- Safe to re-run: it only creates what's missing.
--
-- Access model: all three tables have row-level security on and no policies,
-- so the public API keys can't read them directly. The site build reads only
-- the `public_member_profiles` view, which includes only members with
-- status = 'ok' and leaves out private columns (email, admin_notes). Edit data
-- in the dashboard's Table Editor (you're signed in as an admin there).

create table if not exists members (
  id bigint generated always as identity primary key,
  username text not null unique,
  name text not null,
  email text,                                   -- private, never published
  status text not null default 'pending',       -- 'ok' = shown on the site
  headline text,                                -- e.g. "Corporate Finance Analyst"
  company text,
  city text,
  country text,
  about text,                                   -- plain text, line breaks kept
  fields_of_expertise text[] not null default '{}',
  skills text[] not null default '{}',
  languages text[] not null default '{}',
  website text,
  linkedin_url text,
  avatar text,
  profile_url text,
  member_since int,
  groups text[] not null default '{}',
  teams text[] not null default '{}',
  admin_notes text,                             -- private, never published
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists member_experience (
  id bigint generated always as identity primary key,
  member_id bigint not null references members(id) on delete cascade,
  title text not null,
  organization text,
  location text,
  start_year int,
  end_year int,
  is_current boolean not null default false,
  description text,
  sort_order int not null default 0             -- lower first; ties go newest first
);

create table if not exists member_education (
  id bigint generated always as identity primary key,
  member_id bigint not null references members(id) on delete cascade,
  school text not null,
  degree text,                                  -- e.g. "MSc", "Bachelor"
  field text,                                   -- e.g. "Computer Engineering"
  start_year int,
  end_year int,
  sort_order int not null default 0
);

create index if not exists member_experience_member_id on member_experience(member_id);
create index if not exists member_education_member_id on member_education(member_id);

alter table members enable row level security;
alter table member_experience enable row level security;
alter table member_education enable row level security;

create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists members_updated_at on members;
create trigger members_updated_at before update on members for each row execute function set_updated_at();

-- The public_member_profiles view (the only thing the site reads) is defined
-- in 002-editing.sql, so re-running this file never changes it.
