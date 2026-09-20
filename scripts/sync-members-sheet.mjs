// Builds src/data/members.json from a Google Sheet published to the web as
// CSV, instead of committing member data to git — the sheet is the only
// place that data lives; this file is regenerated fresh on every dev/build
// and is gitignored.
//
// Sheet → File → Share → Publish to web → select the members sheet → CSV → Publish,
// then set MEMBERS_SHEET_CSV_URL to that link (in .env locally, as a repo
// secret in CI — never commit the URL itself, it's not meant to be public).
//
// Expected header row (any order): name, username, city, country,
// fieldsOfExpertise, specialty, bio, title, company, website, linkedinUrl, since, groups, team,
// status, profileUrl, avatar. fieldsOfExpertise is comma-and-space-separated;
// specialty and groups are semicolon-separated; team is comma-separated. A member is
// shown on the site only once its "status" column is set to "ok" — that's
// how you review/curate who's public, rather than a checkbox. "email" is
// deliberately not read here — it stays in the sheet for your own use and
// never reaches members.json/the public build.
//
// Runs automatically before `dev`/`build` (see package.json) — re-run by hand
// with: node scripts/sync-members-sheet.mjs

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const CSV_URL = process.env.MEMBERS_SHEET_CSV_URL;
const DATA_PATH = fileURLToPath(new URL('../src/data/members.json', import.meta.url));

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c === '\r') { /* skip, \n handles the line break */ }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const splitList = (value, separator = ';') => (value || '').split(separator).map((v) => v.trim()).filter(Boolean);

function membersFromCsv(text) {
  const [header, ...records] = parseCsv(text);
  const col = (name) => header.indexOf(name);
  const idx = {
    name: col('name'), username: col('username'), city: col('city'), country: col('country'),
    fieldsOfExpertise: col('fieldsOfExpertise'), specialty: col('specialty'), bio: col('bio'), title: col('title'), company: col('company'),
    website: col('website'), linkedinUrl: col('linkedinUrl'), since: col('since'), avatar: col('avatar'),
    groups: col('groups'), team: col('team'), status: col('status'), profileUrl: col('profileUrl'),
  };
  if (idx.name === -1 || idx.username === -1) {
    throw new Error(`Sheet header must include "name" and "username" columns. Got: ${header.join(', ')}`);
  }
  const get = (r, i) => (i === -1 ? '' : (r[i] || '').trim());

  return records
    .filter((r) => get(r, idx.name))
    .map((r) => {
      const since = parseInt(get(r, idx.since), 10);
      const specialties = splitList(get(r, idx.specialty));
      return {
        name: get(r, idx.name),
        username: get(r, idx.username),
        ...(get(r, idx.city) && { city: get(r, idx.city) }),
        ...(get(r, idx.country) && { country: get(r, idx.country) }),
        fieldsOfExpertise: splitList(get(r, idx.fieldsOfExpertise), ','),
        ...(specialties.length && { specialty: specialties }),
        ...(get(r, idx.bio) && { bio: get(r, idx.bio) }),
        ...(get(r, idx.title) && { title: get(r, idx.title) }),
        ...(get(r, idx.company) && { company: get(r, idx.company) }),
        ...(get(r, idx.website) && { website: get(r, idx.website) }),
        ...(get(r, idx.linkedinUrl) && { linkedinUrl: get(r, idx.linkedinUrl) }),
        since: isNaN(since) ? new Date().getFullYear() : since,
        ...(get(r, idx.avatar) && { avatar: get(r, idx.avatar) }),
        groups: splitList(get(r, idx.groups)),
        team: splitList(get(r, idx.team), ','),
        inDirectory: get(r, idx.status).toLowerCase() === 'ok',
        ...(get(r, idx.profileUrl) && { profileUrl: get(r, idx.profileUrl) }),
      };
    });
}

async function main() {
  if (!CSV_URL) {
    console.warn('MEMBERS_SHEET_CSV_URL not set — writing an empty members.json. Set it in .env (locally) or as a repo secret (CI) to load the real directory.');
    await writeFile(DATA_PATH, '[]\n');
    return;
  }
  const response = await fetch(CSV_URL, { headers: { 'User-Agent': 'illyrianbrains.org-build' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const members = membersFromCsv(await response.text());
  await writeFile(DATA_PATH, JSON.stringify(members, null, 2) + '\n');
  console.log(`Wrote ${members.length} member(s) to src/data/members.json`);
}

main().catch((err) => { console.error(err); process.exit(1); });
