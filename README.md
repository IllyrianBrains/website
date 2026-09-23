# Illyrian Brains — website

Static [Astro](https://astro.build) site for [illyrianbrains.org](https://illyrianbrains.org), the main site of the Illyrian Brains Network. Content is in Albanian.

Atlas, Mentoring, Heritage and Global are separate sites (sibling repos) on their own subdomains, linked from the nav.

## Development

```sh
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # serve the build locally
```

`dev` and `build` first sync `src/data/members.json` from a private Google Sheet. Put its published-CSV link in `MEMBERS_SHEET_CSV_URL` in a local `.env` (gitignored). Without it, the member directory is just empty. Run `npm run members:sync` to refresh it by hand.

## Deployment

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`. `MEMBERS_SHEET_CSV_URL` is a repo secret there.

## Content

Most content lives in `src/data/`. Edit the data, not the components:

| What | Where |
| --- | --- |
| Cities | `cities.csv`, per-city posts in `cities-content/*.html` |
| NGO partners / businesses | `partners.csv`, `businesses.csv` |
| Ideas (Ndaj Ide) | `ideas.json` (descriptions are Markdown) |
| Volunteer roles | `jobs.ts` |
| Statute | `statuti.ts` |
| Donations ledger | `donations.csv` (see below) |

City posts are a snapshot from the community forum, refreshed by hand with `python3 scripts/sync-cities.py` (needs `beautifulsoup4`). Review the diff before committing.

### Donations (`/dhuro/`)

The Donate page shows three funds (running costs, new projects, the ideas fund), a general donate button and the transparency principles. Funds are defined in `src/data/donations.ts`.

Every donation received and every expense paid from a fund goes in `src/data/donations.csv` as one row. The page's per-fund totals and public ledger are built from it:

```csv
date,direction,fund,project,amount,description
2026-09-01,hyrje,projekte,Atlas,50,Anonim
2026-09-10,dalje,operative,,12,Domain renewal
```

- `direction`: `hyrje` (donation in) or `dalje` (expense out)
- `fund`: `operative`, `projekte` or `ide`
- `project`: optional, e.g. `Atlas`, for project-earmarked money
- `amount`: in EUR
- `description`: use the donor's name only with their consent, otherwise `Anonim`
