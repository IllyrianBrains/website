# Plan: illyrianbrains.org rebuild

Working plan for turning this repo (currently the IB Global III conference site,
`global.illyrianbrains.org`) into the main Illyrian Brains site, `illyrianbrains.org`.
Source plan and copy came from Doren; this merges it with this repo's existing Astro
setup and conventions (see `CLAUDE.md`).

## Sitemap

```
/                 Home
/qytetet/         Qytetet (cities index)
/qytetet/[slug]/  Per-city page
/eventet/         Eventet
/projektet/       Projektet
/rreth-nesh/      Rreth Nesh
```

`Anëtarësohu` is not its own route — it's the CTA pattern (Hero button, closing
section, footer), linking out to wherever joining actually happens.

## Content approach

No `src/content/` collections, no CMS — same convention as the existing
`CommunityCity` interface + typed array in `src/data/cities.ts`:

- `src/data/cities.ts` — extended with optional `slug`, `lumaUrl`, `activities` on
  `CommunityCity`, so the same array drives both the map and `/qytetet/[slug]/`.
  Cities without `lumaUrl`/`activities` yet just render name + country + a generic
  join CTA — nothing fabricated.
- `src/data/projects.ts` — new, typed array, one line per record like `workshops`.
- Events — a Luma embed/link component, no data file needed.

## Components

Reused as-is: `Header`, `Footer`, `Hero`, `SectionTitle`, `CommunityMap`.

New (plain `.astro`, no framework islands):
- `EventetPreview.astro` — Luma embed/link
- `Projektet.astro` — maps `projects.ts`
- `WhatWeDo.astro` — the 3 fixed cards (Lidhu / Zhvillohu / Kontribuo), hardcoded
  markup, not data-driven (fixed copy, doesn't need a data file)
- `JoinCTA.astro` — reused inline on homepage, city pages, and footer

Homepage:
```astro
<Hero /> <EventetPreview /> <CommunityMap teaser + link to /qytetet/ />
<WhatWeDo /> <Projektet teaser /> <RrethNesh teaser /> <JoinCTA />
```

## Open questions (placeholders used until answered)

- **Luma URL** — what's the actual Illyrian Brains Luma calendar/org link?
- **Anëtarësohu destination** — external form, Discord/forum invite, or email?

Real links already in the repo and reused as-is: LinkedIn
(`https://www.linkedin.com/company/illyrian-brains/`), Instagram
(`https://www.instagram.com/illyrianbrains/`), the existing `illyrianbrains.org`
site/statuti links in `Footer.astro`, and the `illyrianbrains@gmail.com` contact
address used for mailto CTAs.

## Migration / "flip" — done as a separate, explicit step

The current `index.astro`, `Header`/`Footer` nav, and `.github` deploy target are all
built around the conference (Stripe checkout, Asambleja, venue, program schedule).
Rather than touch them in the same pass as the new pages, the plan is:

1. Build all new data/components/pages first — additive, doesn't touch anything live.
2. Once content (Luma URL, join destination, per-city details) is filled in, do the
   flip as one deliberate step:
   - `astro.config.mjs`: `site` → `https://illyrianbrains.org`
   - `public/CNAME` → `illyrianbrains.org`
   - Rewrite `index.astro`, `Header.astro`, `Footer.astro` nav to the new sitemap
   - Remove/archive `src/pages/asambleja.astro`, `visit-tirana.astro`,
     `src/data/conference.ts`, `src/styles/visit-tirana.css`

This is the point where the live `global.illyrianbrains.org` conference site would
effectively go away, so it happens only with explicit go-ahead, per `CLAUDE.md`'s
"be extra conservative" note on `astro.config.mjs`/`CNAME`/the deploy workflow.
