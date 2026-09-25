// Builds src/data/members.json from the Supabase member directory (see
// supabase/schema.sql) — the successor to scripts/sync-members-sheet.mjs.
// Reads only the public_member_profiles view, which already filters to
// status = 'ok' and drops private columns, so everything here is publishable.
// Its `profile` column is already shaped like members.json (see
// supabase/002-editing.sql) — the live /anetaret/ page reads the same column.
//
// Needs SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY (the anon/publishable key —
// never the secret key) in .env locally and as repo secrets in CI. If they
// aren't set it does nothing, leaving whatever the sheet sync wrote, so the
// sheet keeps working until Supabase is set up.
//
// Runs automatically before `dev`/`build` (see package.json), after the sheet
// sync — re-run by hand with: npm run members:sync

import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = process.env;
const DATA_PATH = fileURLToPath(new URL('../src/data/members.json', import.meta.url));
const TEAMS_PATH = fileURLToPath(new URL('../src/data/teams.json', import.meta.url));

// Legacy anon keys are JWTs and go in Authorization too; new sb_publishable_ keys must not.
const authHeaders = (key) => ({ apikey: key, ...(key.startsWith('eyJ') && { Authorization: `Bearer ${key}` }) });

async function main() {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    console.warn('SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY not set — skipping Supabase member sync.');
    // src/data/teams.ts imports teams.json, so it has to exist even without Supabase.
    if (!existsSync(TEAMS_PATH)) await writeFile(TEAMS_PATH, '[]\n');
    return;
  }
  const response = await fetch(`${SUPABASE_URL}/rest/v1/public_member_profiles?select=profile&order=name`, { headers: authHeaders(SUPABASE_PUBLISHABLE_KEY) });
  if (!response.ok) throw new Error(`Supabase HTTP ${response.status}: ${await response.text()}`);
  const members = (await response.json()).map((row) => row.profile);
  await writeFile(DATA_PATH, JSON.stringify(members, null, 2) + '\n');
  console.log(`Wrote ${members.length} member(s) from Supabase to src/data/members.json`);

  const teamsResponse = await fetch(`${SUPABASE_URL}/rest/v1/teams?select=slug,name,description&order=sort_order,name`, { headers: authHeaders(SUPABASE_PUBLISHABLE_KEY) });
  if (!teamsResponse.ok) throw new Error(`Supabase teams HTTP ${teamsResponse.status} — has supabase/004-membership-teams.sql been run? ${await teamsResponse.text()}`);
  const teams = await teamsResponse.json();
  await writeFile(TEAMS_PATH, JSON.stringify(teams, null, 2) + '\n');
  console.log(`Wrote ${teams.length} team(s) to src/data/teams.json`);
}

main().catch((err) => { console.error(err); process.exit(1); });
