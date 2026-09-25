// One-time migration: copies src/data/ideas.json (the forum-era archive) into
// the Supabase `ideas` table (see supabase/005-ideas.sql) as published ideas.
// Oldest first, so the forum ideas get ids — the public "#" numbers — 1, 2, 3…
//
// Needs SUPABASE_URL and SUPABASE_SECRET_KEY (it bypasses RLS to write). Keep
// the secret key in .env only; it must never go into CI or the repo.
//
// Upserts by slug, so re-running updates those ideas rather than duplicating
// them — but it overwrites edits made to them in Supabase since. Run it before
// the first `npm run dev`/`build` after 005-ideas.sql, since the ideas sync
// then overwrites ideas.json from Supabase. Run with:
//   node --env-file=.env scripts/import-ideas-to-supabase.mjs

import { readFile } from 'node:fs/promises';

const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;
const DATA_PATH = new URL('../src/data/ideas.json', import.meta.url);

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) throw new Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env first.');
  const ideas = JSON.parse(await readFile(DATA_PATH, 'utf8'));
  if (ideas.some((idea) => idea.id)) throw new Error('ideas.json already comes from Supabase (it has ids) — nothing to import.');
  const rows = [...ideas]
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
    .map((idea) => ({
      slug: idea.slug,
      title: idea.title,
      description: idea.description || '',
      tags: idea.tags || [],
      name: idea.name || null,
      contact_email: idea.email || null,
      resolved: Boolean(idea.resolved),
      status: 'published',
      source: idea.source || 'forum',
      created_at: idea.date || new Date().toISOString(),
    }));
  // One row at a time keeps the ids in date order.
  for (const row of rows) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/ideas?on_conflict=slug`, {
      method: 'POST',
      headers: { apikey: SUPABASE_SECRET_KEY, Authorization: `Bearer ${SUPABASE_SECRET_KEY}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(row),
    });
    if (!response.ok) throw new Error(`Supabase HTTP ${response.status} on "${row.slug}": ${await response.text()}`);
  }
  console.log(`Imported ${rows.length} idea(s) into Supabase.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
