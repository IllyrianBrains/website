// Builds src/data/organizations.json from Supabase (see supabase/006-organizations.sql):
// every published NGO and business. partners.ts and businesses.ts build the
// /shoqatat/ and /bizneset/ lists from it.
// Reads only the public_organizations view, with the publishable key.
//
// If SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY aren't set, or the table doesn't
// exist yet (006-organizations.sql not run), it leaves organizations.json as it is.
//
// Runs automatically before `dev`/`build` (see package.json) — re-run by hand
// with: npm run organizations:sync

import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = process.env;
const DATA_PATH = fileURLToPath(new URL('../src/data/organizations.json', import.meta.url));

// Legacy anon keys are JWTs and go in Authorization too; new sb_publishable_ keys must not.
const authHeaders = (key) => ({ apikey: key, ...(key.startsWith('eyJ') && { Authorization: `Bearer ${key}` }) });

async function main() {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    console.warn('SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY not set — skipping Supabase organizations sync.');
    if (!existsSync(DATA_PATH)) await writeFile(DATA_PATH, '[]\n');
    return;
  }
  const response = await fetch(`${SUPABASE_URL}/rest/v1/public_organizations?select=*&order=created_at`, { headers: authHeaders(SUPABASE_PUBLISHABLE_KEY) });
  if (response.status === 404) {
    console.warn('Supabase has no `public_organizations` view yet (run supabase/006-organizations.sql) — keeping src/data/organizations.json as it is.');
    if (!existsSync(DATA_PATH)) await writeFile(DATA_PATH, '[]\n');
    return;
  }
  if (!response.ok) throw new Error(`Supabase organizations HTTP ${response.status}: ${await response.text()}`);
  const organizations = await response.json();
  await writeFile(DATA_PATH, JSON.stringify(organizations, null, 2) + '\n');
  console.log(`Wrote ${organizations.length} organization(s) from Supabase to src/data/organizations.json`);
}

main().catch((err) => { console.error(err); process.exit(1); });
