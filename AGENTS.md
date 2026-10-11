# AGENTS.md

This is the Astro site and member-network platform for **Illyrian Brains Network**
(`illyrianbrains.org`). The interface is primarily Albanian (`sq`).

Read [code-standards.md](code-standards.md) before changing code. It is the canonical
source for architecture, file size, TypeScript/Astro style, networking behavior, privacy,
Supabase, accessibility, error handling, and verification. This file only records the
repository-specific workflow and map.

## Repository map

- `src/pages/`: Astro routes. Public member profiles use the root `/<slug>/` namespace.
- `src/components/`: reusable Astro presentation.
- `src/scripts/`: shared browser and domain behavior.
- `src/data/`: typed content and generated Supabase snapshots.
- `src/styles/`: plain CSS; no CSS framework.
- `supabase/`: schema plus immutable, numbered migrations.
- `scripts/`: content sync and one-time administrative imports.
- `tests/`: Node tests for shared behavior and the built site.

Atlas, Mentoring, Global, and Heritage live in sibling repositories and are linked through
their `*.illyrianbrains.org` subdomains. Do not recreate their routes here.

## Data and secrets

Member, team, idea, organization, and supporter JSON snapshots are generated and
gitignored. The `predev` and `prebuild` hooks refresh them when their environment variables
are available. Supabase is the source of truth for platform data.

Browser code may use only `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`. Keep
`SUPABASE_SECRET_KEY`, member emails, payment state, return plans, and admin notes out of
committed files, public views, generated HTML, and client bundles. Follow the detailed data
rules in `code-standards.md`.

Forum city content is a reviewed snapshot. Refresh it manually with
`python3 scripts/sync-cities.py`; do not add it to automatic builds.

## Working agreement

- Make the smallest change that satisfies the request and preserve unrelated worktree
  changes.
- Follow `code-standards.md`; do not duplicate its rules here.
- Prefer the owning data source for content changes and a new numbered migration for
  database changes. Never edit an applied migration.
- Do not add dependencies, frameworks, tooling, or broad refactors unless requested.
- Record unrelated defects in root `bugs.csv` using its existing schema instead of fixing
  them opportunistically.
- Do not casually change `astro.config.mjs`, `public/CNAME`, or the deploy workflow. A push
  to `main` deploys the production site through GitHub Pages.
- After non-trivial work, run `npm run build` and then `npm test`.
