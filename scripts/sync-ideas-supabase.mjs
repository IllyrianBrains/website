// Builds src/data/ideas.json from Supabase (see supabase/005-ideas.sql), so
// /projektet/ide/ and each idea's own page are built from it. Reads only the
// public_ideas view — published ideas, public columns — with the publishable key.
// The ideas page also reloads the list live in the browser,
// so ideas published after the last deploy show up there too.
//
// If SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY aren't set, or the table doesn't
// exist yet (005-ideas.sql not run), it leaves ideas.json as it is.
//
// Runs automatically before `dev`/`build` (see package.json) — re-run by hand
// with: npm run ideas:sync

import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = process.env;
const DATA_PATH = fileURLToPath(new URL('../src/data/ideas.json', import.meta.url));

// Legacy anon keys are JWTs and go in Authorization too; new sb_publishable_ keys must not.
const authHeaders = (key) => ({ apikey: key, ...(key.startsWith('eyJ') && { Authorization: `Bearer ${key}` }) });

async function main() {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    console.warn('SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY not set — skipping Supabase ideas sync.');
    if (!existsSync(DATA_PATH)) await writeFile(DATA_PATH, '[]\n');
    return;
  }
  const response = await fetch(`${SUPABASE_URL}/rest/v1/public_ideas?select=*&order=created_at.desc`, { headers: authHeaders(SUPABASE_PUBLISHABLE_KEY) });
  if (response.status === 404) {
    console.warn('Supabase has no `public_ideas` view yet (run supabase/005-ideas.sql) — keeping src/data/ideas.json as it is.');
    if (!existsSync(DATA_PATH)) await writeFile(DATA_PATH, '[]\n');
    return;
  }
  if (!response.ok) throw new Error(`Supabase ideas HTTP ${response.status}: ${await response.text()}`);
  const ideas = (await response.json()).map(({ contact_email, created_at, ...idea }) => ({ ...idea, email: contact_email || '', date: created_at }));
  await writeFile(DATA_PATH, JSON.stringify(ideas, null, 2) + '\n');
  console.log(`Wrote ${ideas.length} idea(s) from Supabase to src/data/ideas.json`);
}

main().catch((err) => { console.error(err); process.exit(1); });
