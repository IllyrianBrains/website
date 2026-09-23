// Builds src/data/supporters.json — the public "Miqtë e Rrjetit" list on /dhuro/ —
// from a Google Sheet published to the web as CSV, same approach as
// sync-members-sheet.mjs: the sheet is the only place donor data lives, this file
// is regenerated on every dev/build and is gitignored.
//
// Sheet → File → Share → Publish to web → select the donors sheet → CSV → Publish,
// then set SUPPORTERS_SHEET_CSV_URL to that link (in .env locally, as a repo
// secret in CI — never commit the URL itself).
//
// Expected header row (any order): name, city, type, since, public. One row per
// donor, added once their first donation has actually arrived. Only rows with
// type "mujor" (monthly donors — the Miqtë e Rrjetit) AND public "po" (they agreed
// to be named) are written out; everyone else is filtered here, so their names
// never reach the public build. Any other columns (email, amount, notes…) are
// deliberately not read and stay in the sheet.
//
// Runs automatically before `dev`/`build` (see package.json) — re-run by hand
// with: node scripts/sync-supporters-sheet.mjs

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const CSV_URL = process.env.SUPPORTERS_SHEET_CSV_URL;
const DATA_PATH = fileURLToPath(new URL('../src/data/supporters.json', import.meta.url));

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

function supportersFromCsv(text) {
  const [header, ...records] = parseCsv(text);
  const col = (name) => header.indexOf(name);
  const idx = { name: col('name'), city: col('city'), type: col('type'), since: col('since'), public: col('public') };
  if (idx.name === -1 || idx.type === -1 || idx.public === -1) {
    throw new Error(`Sheet header must include "name", "type" and "public" columns. Got: ${header.join(', ')}`);
  }
  const get = (r, i) => (i === -1 ? '' : (r[i] || '').trim());

  return records
    .filter((r) => get(r, idx.name) && get(r, idx.type).toLowerCase() === 'mujor' && get(r, idx.public).toLowerCase() === 'po')
    .map((r) => {
      const since = parseInt(get(r, idx.since), 10);
      return {
        name: get(r, idx.name),
        ...(get(r, idx.city) && { city: get(r, idx.city) }),
        ...(!isNaN(since) && { since }),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'sq'));
}

async function main() {
  if (!CSV_URL) {
    console.warn('SUPPORTERS_SHEET_CSV_URL not set — writing an empty supporters.json. Set it in .env (locally) or as a repo secret (CI) to load the Miqtë e Rrjetit list.');
    await writeFile(DATA_PATH, '[]\n');
    return;
  }
  const response = await fetch(CSV_URL, { headers: { 'User-Agent': 'illyrianbrains.org-build' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const supporters = supportersFromCsv(await response.text());
  await writeFile(DATA_PATH, JSON.stringify(supporters, null, 2) + '\n');
  console.log(`Wrote ${supporters.length} supporter(s) to src/data/supporters.json`);
}

main().catch((err) => { console.error(err); process.exit(1); });
