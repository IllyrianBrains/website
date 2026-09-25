// One-time migration: copies src/data/partners.csv (NGOs) and businesses.csv
// into the Supabase `organizations` table (see supabase/006-organizations.sql)
// as published, source = 'csv'. After this, Supabase is the one list and the
// CSVs can be deleted.
//
// Needs SUPABASE_URL and SUPABASE_SECRET_KEY (it bypasses RLS to write). Keep
// the secret key in .env only; it must never go into CI or the repo.
//
// Skips any organization already in Supabase with the same kind and name, so
// re-running it never duplicates or overwrites edits made there. Run with:
//   node --env-file=.env scripts/import-organizations-to-supabase.mjs

import { readFile } from 'node:fs/promises';

const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;
const headers = { apikey: SUPABASE_SECRET_KEY, Authorization: `Bearer ${SUPABASE_SECRET_KEY}`, 'Content-Type': 'application/json' };

// Same parsing as src/data/csv.ts (quoted fields with commas/newlines/""),
// which Node can't import here as TypeScript.
function csvRows(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') inQuotes = false;
      else field += char;
    } else if (char === '"') inQuotes = true;
    else if (char === ',') { row.push(field); field = ''; }
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += char;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  const [header, ...data] = rows;
  return data.map((cells) => (name) => (cells[header.indexOf(name)] ?? '').trim());
}

const list = (value) => value.split(';').map((item) => item.trim()).filter(Boolean);
const truthy = (value) => ['true', 'yes', '1'].includes(value.toLowerCase());
const read = async (file) => csvRows(await readFile(new URL(`../src/data/${file}`, import.meta.url), 'utf8'));

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) throw new Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env first.');
  const common = (col) => ({
    name: col('name'),
    city: col('city') || null,
    description: col('description'),
    website: col('website') || null,
    linkedin: col('linkedin') || null,
    instagram: col('instagram') || null,
    logo: col('logo') || null,
    sponsor: truthy(col('sponsor')),
    related_members: list(col('relatedMembers')),
    related_cities: list(col('relatedCities')),
    status: 'published',
    source: 'csv',
  });
  const rows = [
    ...(await read('partners.csv')).map((col) => {
      const [category = 'advocacy', ...others] = list(col('category').toLowerCase());
      return { kind: 'ngo', ...common(col), category, other_categories: others, collaborations: list(col('collaborations')), related_partners: list(col('relatedPartners')) };
    }),
    ...(await read('businesses.csv')).map((col) => ({ kind: 'business', ...common(col), category: col('category').toLowerCase() || 'other', stage: col('stage').toLowerCase() || 'startup', country: col('country') || null })),
  ];

  const response = await fetch(`${SUPABASE_URL}/rest/v1/organizations?select=kind,name`, { headers });
  if (!response.ok) throw new Error(`Supabase HTTP ${response.status}: ${await response.text()}`);
  const existing = new Set((await response.json()).map((org) => `${org.kind}:${org.name.toLowerCase()}`));
  const fresh = rows.filter((row) => !existing.has(`${row.kind}:${row.name.toLowerCase()}`));
  // One insert per kind: a bulk insert needs every row to have the same keys.
  for (const kind of ['ngo', 'business']) {
    const batch = fresh.filter((row) => row.kind === kind);
    if (!batch.length) continue;
    const insert = await fetch(`${SUPABASE_URL}/rest/v1/organizations`, { method: 'POST', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify(batch) });
    if (!insert.ok) throw new Error(`Supabase HTTP ${insert.status}: ${await insert.text()}`);
  }
  console.log(`Imported ${fresh.length} organization(s) into Supabase (${rows.length - fresh.length} already there).`);
}

main().catch((err) => { console.error(err); process.exit(1); });
