# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Astro static site for **Illyrian Brains Network** (the main org site, `illyrianbrains.org`),
deployed via GitHub Pages (`.github/workflows/deploy.yml`, triggered on push to `main`).
Content is in Albanian (`sq`). This repo used to be the separate "IB Global III" conference
site (`global.illyrianbrains.org`) — that content has been removed; if you see stray
references to it, it's leftover and should be cleaned up.

- `src/pages/` — routes: `index.astro` (homepage), `rrjeti.astro` (Qytetet + Anëtarët
  directory), `eventet.astro`, `misioni.astro`, `ekipet.astro`, `statuti.astro`,
  `anetaresohu.astro` (jobs/join), `qytetet/[slug].astro` (per-city pages), `projektet/`
  (Atlas/Mentoring/Heritage/Ide/Playground, each with its own subpages where relevant)
- `src/components/` — `.astro` components (`Header`, `Hero`, `Footer`, `SectionTitle`,
  `CommunityMap`, `JoinCTA`, `Guidelines`, `NetworkGraphic`, `WhatWeDo`, `EventCards`)
- `src/layouts/BaseLayout.astro` — shared `<head>`/shell, wraps every page
- `src/data/` — typed content: `cities.ts` (`CommunityCity`), `regions.ts`, `team.ts`,
  `jobs.ts`, `members.ts` + `members.json`, `statuti.ts`, `atlas.ts`, `events.ts`
- `src/data/atlas/*.html`, `src/data/cities-content/*.html` — HTML fragments migrated
  from the community forum (see Content sync below), injected via `set:html`
- `src/styles/global.css` + `src/styles/accents.css` — plain CSS, no framework
- `public/assets/` — static images; `public/CNAME` is the Pages custom domain, don't touch
  casually; `public/assets/atlas/`, `public/assets/cities-content/` are forum-sourced images

No test suite, linter, or formatter is configured. `npm run build` (Astro build) is the
closest thing to a correctness check — run it after non-trivial changes.

## Content sync

Some content is pulled from `forum.illyrianbrains.org` rather than hand-authored, and is
committed as a snapshot rather than fetched live at build time:

- `npm run members:sync` — re-fetches the Anëtarët directory from the forum's public
  groups (Bordi, Staff-Ekipet, Staff-Nismat, Staff-Qytetet, C-Tech) into `src/data/members.json`.
- `npm run atlas:sync` (Python + `beautifulsoup4`) — re-fetches the Atlas country guides
  from the forum's IB Atlas category into `src/data/atlas/*.html`, downloading images to
  `public/assets/atlas/`.
- `python3 scripts/sync-cities.py` (same dependency) — re-fetches per-city posts from the
  forum's Qytete category into `src/data/cities-content/*.html`.

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
