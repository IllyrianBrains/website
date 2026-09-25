# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Astro static site for **Illyrian Brains Network** (the main org site, `illyrianbrains.org`),
deployed via GitHub Pages (`.github/workflows/deploy.yml`, triggered on push to `main`).
Content is in Albanian (`sq`). This repo used to be the separate "IB Global III" conference
site (`global.illyrianbrains.org`) — that content has been removed from here; if you see
stray references to it, it's leftover and should be cleaned up.

Several sub-projects are deliberately **not** in this repo, each deployed as its own
subdomain from its own sibling repo, and linked from `Header`/`Footer` as an absolute
external URL rather than an internal route:

- `../atlas/` → `atlas.illyrianbrains.org` (country guides) — split out of this repo on
  2026-09-13, see its `CLAUDE.md` for history
- `../mentoring/` → `mentoring.illyrianbrains.org` (mentoring program) — pre-existing repo,
  linked from here on 2026-09-13
- `../global/` → `global.illyrianbrains.org` (IB Global conference) — pre-existing repo
  (this repo's own predecessor, see above), linked from here on 2026-09-13
- `../heritage/` → `heritage.illyrianbrains.org` (Heritage project) — split out of this
  repo on 2026-09-13, same way Atlas was, though there was no real content to move (just
  the "coming soon" placeholder) — see its `CLAUDE.md`

If you see stray `atlas`/`mentoring`/`global`/`heritage` references in *this* repo,
they're leftover — check the relevant sibling repo instead.

- `src/pages/` — routes: `index.astro` (homepage), `rrjeti.astro` (redirects to
  `/qytetet/`; old `/rrjeti/#…` tab links go to their page), `rrjeti/postimet.astro` (Postimet). The Rrjeti
  pages (`qytetet/index`, `anetaret`, `shoqatat`, `bizneset`, `rrjeti/postimet`) are linked from the header's Rrjeti dropdown
  and share the `RrjetiSection` layout; each page's content lives in its `Rrjeti*` component, `qytetet/index.astro` (Qytetet directory),
  `anetaret.astro` (Anëtarët directory) + `anetaret/[slug].astro` (per-member profile), `shoqatat.astro` (`partneret.astro` redirects to it) and `bizneset.astro`
  (placeholders — no real content/data yet, added 2026-09-13),
  `eventet.astro`, `misioni.astro`, `ekipet.astro`, `statuti.astro`, `anetaresohu.astro`
  (jobs/join), `qytetet/[slug].astro` (per-city pages), `projektet/` (Ide/Playground —
  Atlas, Mentoring, Heritage and Global are separate sibling repos on their own
  subdomains, linked externally from the nav, see below)
- `src/components/` — `.astro` components (`Header`, `Hero`, `Footer`, `SectionTitle`,
  `CommunityMap`, `JoinCTA`, `Guidelines`, `NetworkGraphic`, `WhatWeDo`, `EventCards`)
- `src/layouts/BaseLayout.astro` — shared `<head>`/shell, wraps every page
- `src/data/` — typed content: `cities.ts` (`CommunityCity`), `regions.ts`, `team.ts`,
  `jobs.ts`, `members.ts` + `members.json` (gitignored, see Content sync below),
  `statuti.ts`, `events.ts`
- `src/data/cities-content/*.html` — HTML fragments migrated from the community forum
  (see Content sync below), injected via `set:html`
- `src/styles/global.css` + `src/styles/accents.css` — plain CSS, no framework
- `public/assets/` — static images; `public/CNAME` is the Pages custom domain, don't touch
  casually; `public/assets/cities-content/` are forum-sourced images

No linter or formatter is configured. `npm run build` then `npm test` is the correctness
check — run both after non-trivial changes. `npm test` is Node's built-in test runner (no
dependencies): `tests/helpers.test.mjs` unit-tests `src/scripts/` and `src/data/csv.ts`,
`tests/build.test.mjs` checks `dist/` (key pages built, internal links resolve, no secret
keys, writing on Postimet still hidden). CI runs it after the build and doesn't deploy if it fails.

## Content sync

- `src/data/members.json` is **not committed** — it's fetched fresh from a private Google
  Sheet on every `dev`/`build` (via the `predev`/`prebuild` npm hooks, see
  `scripts/sync-members-sheet.mjs`), so member names/bios/cities never sit in git history
  or a public repo. The sheet is manually maintained (no longer synced from the forum);
  its published-CSV link goes in `MEMBERS_SHEET_CSV_URL` — a `.env` entry locally
  (gitignored), a repo secret in CI (`.github/workflows/deploy.yml`). Without that var set,
  the script writes an empty `members.json` rather than failing the build. Run
  `npm run members:sync` to refresh it by hand.
- Member data is moving from that sheet to **Supabase** (schema in `supabase/schema.sql`:
  `members` + `member_experience` + `member_education`, published only through the
  `public_member_profiles` view, which covers members with `status = 'ok'`).
  `scripts/sync-members-supabase.mjs` runs after the sheet sync and overwrites
  `members.json` when `SUPABASE_URL` + `SUPABASE_PUBLISHABLE_KEY` are set (`.env` / repo
  secrets). Otherwise it does nothing, so the sheet keeps working until the switch.
  `scripts/import-members-to-supabase.mjs` is the one-time sheet → Supabase copy. It needs
  `SUPABASE_SECRET_KEY`, which goes in local `.env` only and never in CI. The extra profile
  fields (`experience`, `education`, `languages`) render as LinkedIn-style sections in the
  `/anetaret/` drawer.
- `supabase/002-editing.sql` adds self-editing. Members sign in by magic link on
  `/anetaresohu/profili/` (the only page using `@supabase/supabase-js`) and edit the member row
  whose `email` matches their login. Emails in the `admins` table can edit anyone. All writes
  go through the `save_member_profile()` function. Categories (fields of expertise) are a
  fixed list in the `categories` table; skills and languages are free-form. `/anetaret/`
  also re-fetches `public_member_profiles.profile` in the browser so edits show without a
  redeploy, and `/ekipet/` does the same plus the `teams` table (team membership lives in
  `member_teams`, see `supabase/004-membership-teams.sql`). Other pages that list members
  still use the build-time `members.json`.
- `supabase/003-registration.sql` backs the public form at `/anetaresohu/regjistrohu/`
  (the hero's "Regjistrohu" button). The form calls `register_member()`, which adds the person
  to `members` as `pending`. An admin approves them by setting `status` to `ok`, and then they
  can sign in via "Hyr" (`/anetaresohu/profili/`). `supabase/010-light-registration.sql` adds
  the Pjesëmarrës and Mbështetës roles to the form. People who pick one of those only give
  their name, email, city and country, with no LinkedIn or professional fields.
- `004-membership-teams.sql` also adds each member's `membership_type` (a public badge:
  Pjesëmarrës / Mbështetës / Organizator / Kontribues) and `fee_paid_year` (admin-only, never
  published). Admins set these, plus teams and team roles (Anëtar / Drejtues), on
  `/anetaresohu/roli/` (Roli në rrjet, where members see their own read-only) through
  `save_member_admin()`. The forum `groups` and free-text `teams` columns are
  kept but no longer used. The sync writes `src/data/teams.json` (gitignored) for the
  build-time `/ekipet/`. The homepage `MemberSlider` shows approved members who have a photo.
- `supabase/005-ideas.sql`: ideas and requests are one thing, the `ideas` table. Signed-in
  members send them from the composer on `/rrjeti/postimet/` ("Mundësi / kërkesë"), choosing
  public or "team only". No review step: public ones are `published` straight away, team-only
  ones are `hidden`. The members' page for following their own and the admin tools (hide,
  reply via `admin_note`) was `/anetaresohu/kerkesat/`, dropped on 2026-09-25 — admins now
  moderate in the Supabase Table Editor. Writes go through
  `submit_idea()`, `update_idea_admin()`, `set_idea_resolved()`, `delete_idea()`. The public
  "Ndaj Ide" board (`/projektet/ide/` + `ide/[slug]`) reads only the `public_ideas` view:
  `scripts/sync-ideas-supabase.mjs` writes `src/data/ideas.json` before dev/build, and the
  list also reloads live in the browser (ideas published since the last deploy open inline).
  Shared rendering (Markdown with HTML escaped and unsafe links dropped, row HTML, mailto) is
  in `src/scripts/ideas.ts`. `scripts/import-ideas-to-supabase.mjs` is the one-time copy of
  the forum-era `ideas.json`. The "#" number is the Supabase id.
- `supabase/006-organizations.sql`: the `organizations` table is the one list of NGOs
  (`/shoqatat/`) and businesses (`/bizneset/`) — `partners.csv` / `businesses.csv` were copied
  in once by `scripts/import-organizations-to-supabase.mjs` (needs `SUPABASE_SECRET_KEY`).
  Curated columns (sponsor, collaborations, related members/cities/partners)
  are admin-only, edited in the Supabase Table Editor. Signed-in members add an NGO on
  `/anetaresohu/shoqatat/` and a business on `/anetaresohu/bizneset/`. Both pages are built from
  `src/pages/anetaresohu/[lloji].astro`, and the old `/anetaresohu/organizatat/` redirects to the
  first. Members upload a logo to the `avatars` bucket and can tick several categories
  (`supabase/011-organization-categories.sql`): the first goes in `category`, the rest in
  `other_categories`.
  It starts `pending`; an admin publishes or hides it there and can reply (`admin_note`). An
  author's edit sends it back to `pending`. Writes go through `save_organization()`,
  `update_organization_admin()`, `delete_organization()`. `scripts/sync-organizations-supabase.mjs`
  writes `src/data/organizations.json` (gitignored) from the `public_organizations` view before
  dev/build, and `partners.ts` / `businesses.ts` build their lists from it, so changes show on
  `/shoqatat/`, `/bizneset/` and the maps at the next build.
- `supabase/007-social.sql` adds the LinkedIn-like part: one-way following (`member_follows`,
  through `set_follow()`; counts are public via `follow_stats()`, who-follows-whom only via the
  member's own `my_network()`) and short public posts (`member_posts`, through `create_post()` /
  `delete_post()`, read from the `public_member_posts` view). Only `status = 'ok'` members can
  follow or post. Each member has a full profile page at `/anetaret/<slug>/`
  (`src/pages/anetaret/[slug].astro`, built from `members.json`; slug from `memberSlug()` in
  `src/scripts/members.ts`, since some usernames have spaces) with a follow button, their recent
  posts, and "people also in this city or field" (`relatedMembers()`). The `/anetaret/` drawer
  links to it. Posts are written and read on `/rrjeti/postimet/` (the Postimet page), next to
  the ideas: its composer writes a post or an idea/request, and the board reloads live from
  `public_ideas` + `public_member_posts`. `/anetaresohu/rrjeti/` (Rrjeti im, the members' main
  page since 2026-09-25 — it used to be a post feed) puts the member in the middle of their
  network: a cytoscape graph of them, their city and fields, and the other members grouped by
  exactly what they share ("Berlin · Shëndeti", "Berlin", …), following and followers, and
  under "Sipas qytetit dhe fushës" the recommended connections (`relatedMembers()` with its
  score) as a grid of cards tinted by similarity, best match first, all with Follow.
- `supabase/009-tags.sql`: posts and ideas carry free-form `tags` (max 5, cleaned by
  `clean_tags()`); the old fixed idea categories (`ideas.area`) became tags and the column is
  gone. `/projektet/ide/` filters by any number of tags (an item shows if it has any of them)
  with the shared `tagFilter()` chips in `src/scripts/ideas.ts`. `/rrjeti/postimet/` is laid
  out like WhatsApp instead: each tag is a channel on the left ("Të gjitha" = everything,
  "Të përgjithshme" = untagged), and the open channel's messages show as chat bubbles with the
  composer under them, pre-filled with the channel's tag.
  `supabase/012-idea-tags.sql` (run after 009) gives the forum-era ideas topic tags, so they
  fill real channels (Tech, AI, Gjuha shqipe, Evente, …).
- `supabase/013-aspirations.sql`: career aspirations, edited under "Aspiratat e karrierës" on
  `/anetaresohu/profili/` through `save_member_aspirations()`. The target field (from
  `categories`) and subfield, mentoring and business wishes and a short note are public
  (`profile.aspirations`, shown on `/anetaret/<slug>/` and in the drawer, and used by
  `relatedMembers()`). The answer about moving back to Albania / Kosovo (`return_plan`,
  `return_countries`) is private: only the member and admins can read it.
- `/anetaresohu/rrjeti/`, `/anetaresohu/shoqatat/`, `/anetaresohu/bizneset/`, `/anetaresohu/profili/` and `/anetaresohu/roli/` use
  `@supabase/supabase-js`; the profile pages `/anetaret/<slug>/` and the `/rrjeti/postimet/`
  composer import it lazily, only for signed-in visitors. When someone is signed
  in, `Header` turns the "Bashkohu" button into "Llogaria" (links to Rrjeti im, `/anetaresohu/rrjeti/`) and, on those member pages only,
  shows a member sub navbar (Rrjeti im · Roli në rrjet · Shoqatat · Bizneset, then Profili im next to Dil).
  It is a sticky workspace bar
  (a page dropdown on mobile), styled in `global.css`. Sign-in is detected from the
  `sb-*-auth-token` localStorage key without loading supabase-js.
The rest of this content is still pulled from `forum.illyrianbrains.org` and committed as
a snapshot rather than fetched live at build time:

- `python3 scripts/sync-cities.py` (Python + `beautifulsoup4`) — re-fetches per-city posts
  from the forum's Qytete category into `src/data/cities-content/*.html`.
- `src/data/ideas.json` was the hand-maintained ideas list (seeded from
  `scripts/forum-ideas-migration.csv`); it now comes from Supabase, see `005-ideas.sql` above.
- `python3 scripts/migrate-ideas-forum.py` (Python + `beautifulsoup4` + `markdownify`) —
  one-time re-migration that replaced the backfill's flattened plain-text descriptions with
  real Markdown converted from each forum post's HTML. Only re-run if a migrated idea's
  forum post is edited and needs to resync.

(Atlas has its own `atlas:sync` in the `../atlas/` repo now.)

None of these run automatically in CI or at build time — re-run them by hand when the
forum content changes, review the diff, then commit.

## Working style — read this first

**Make the smallest change that satisfies the request.** This is a small, mostly
content-driven site maintained by one person. Prefer editing data in
`src/data/conference.ts` / `cities.ts` over touching component or layout code when the
request is about content (copy, dates, speakers, program, etc.).

- Change one thing at a time. Don't bundle an unrelated fix, refactor, or style pass
  into the same edit — call it out separately and let the user decide if they want it.
- Don't restructure files, rename things, extract components, or introduce new
  abstractions unless asked. If you notice something worth cleaning up, mention it
  instead of doing it inline.
- Don't add dependencies, build tooling, a CSS framework, TypeScript strictness, tests,
  or a linter unless explicitly requested — the project is deliberately minimal
  (single `astro` dependency).
- Match the surrounding code exactly rather than your own default style (see
  Conventions below). Local consistency wins over "better" formatting.
- After editing, run `npm run build` to confirm the site still builds before calling a
  change done.

## Conventions observed in this codebase

Follow these — don't reformat existing code to a different style:

- 2-space indentation, single quotes in `.ts`/`.astro` frontmatter, semicolons used.
- Data objects in `conference.ts` mix multi-line and single-line array/object literals
  depending on size — short records (e.g. `workshops`, `cities`) stay on one line;
  keep that pattern rather than always expanding.
- Curly apostrophe `’` and proper Albanian diacritics (ë, ç) are used throughout
  Albanian copy — don't substitute straight quotes `'` or drop diacritics.
- Components are plain `.astro` files: frontmatter script (`---`) + markup + optional
  `<script>`. No React/Vue/framework islands are used — keep it that way.
- Styling is hand-written CSS in the two stylesheet files, no CSS-in-JS, no Tailwind.
- `CommunityCity` in `cities.ts` is the one place a TypeScript interface is defined for
  data; follow that pattern (interface + typed const) if a new data file needs typing.

## Bug tracking

Don't fix bugs you weren't asked about as a drive-by (see Working style above). If you
notice a bug that's out of scope for the current task, log it to `bugs.csv` at the repo
root instead of fixing it, so it can be triaged later. Append a row (don't rewrite
existing rows) with columns:

```
date,area,page_url,description,steps_to_reproduce,expected,actual,severity,status,found_by
```

- `date` — ISO date you found it (`YYYY-MM-DD`)
- `area` — file it's in (e.g. `src/pages/visit-tirana.astro`)
- `page_url` — route where it's visible (e.g. `/visit-tirana/`), or blank if not
  applicable (build-time/data-only issue)
- `description` — one line, specific enough to act on later without re-investigating
- `steps_to_reproduce` — how to trigger it (viewport size, browser, click path, etc.);
  `n/a` if it's not user-triggered (e.g. a data inconsistency)
- `expected` — what should happen
- `actual` — what happens instead
- `severity` — `low` / `medium` / `high`
- `status` — always `open` when logging a new bug; only whoever fixes it changes this
  to `fixed`
- `found_by` — `claude` or the person's name, so it's clear where it came from

Quote any field containing a comma with double quotes, per standard CSV escaping.
Create the file with that header row if it doesn't exist yet.

## Deployment

Pushing to `main` deploys automatically via GitHub Actions. Be extra conservative with
changes there — `astro.config.mjs` (site URL, output mode), `public/CNAME`, and the
workflow file are effectively production config, not content.
