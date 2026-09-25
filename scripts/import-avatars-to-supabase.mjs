// One-time migration: copies members' real forum profile photos into a public
// Supabase Storage bucket ("avatars") and points members.avatar at them, so
// the site no longer hotlinks forum.illyrianbrains.org for pictures.
//
// The photo URLs come from the last committed members.json from the forum era
// (git history, before bcd6a96 switched to the sheet — the sheet has no
// avatars). Forum "letter" avatars are skipped: they're just initials, which
// the site already draws itself. Members that already have an avatar set in
// Supabase are left alone, so this won't overwrite photos you added by hand.
//
// Needs SUPABASE_URL and SUPABASE_SECRET_KEY (.env only, never CI). Run with:
//   node --env-file=.env scripts/import-avatars-to-supabase.mjs
//
// For new photos later: dashboard → Storage → avatars → upload, copy the
// file's public URL into that member's avatar column.

import { execSync } from 'node:child_process';

const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;
const BUCKET = 'avatars';
const FORUM_ERA_COMMIT = 'bcd6a96^';

const headers = (extra = {}) => ({
  apikey: SUPABASE_SECRET_KEY,
  ...(SUPABASE_SECRET_KEY.startsWith('eyJ') && { Authorization: `Bearer ${SUPABASE_SECRET_KEY}` }),
  ...extra,
});

async function request(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  if (!response.ok) throw new Error(`${options?.method || 'GET'} ${url} → HTTP ${response.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function ensureBucket() {
  const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });
  if (response.ok) return console.log(`Created public bucket "${BUCKET}".`);
  const text = await response.text();
  if (!/already exists|Duplicate/i.test(text)) throw new Error(`Creating bucket → HTTP ${response.status}: ${text}`);
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) throw new Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env first.');

  const oldMembers = JSON.parse(execSync(`git show ${FORUM_ERA_COMMIT}:src/data/members.json`, { encoding: 'utf8', maxBuffer: 50e6 }));
  const forumPhotos = new Map(oldMembers
    .filter((m) => m.avatar && !m.avatar.includes('letter_avatar'))
    .map((m) => [m.username, m.avatar.replace('/120/', '/360/')]));

  const members = await request(`${SUPABASE_URL}/rest/v1/members?select=username,avatar`, { headers: headers() });
  const todo = members.filter((m) => !m.avatar && forumPhotos.has(m.username));
  console.log(`${todo.length} member(s) to copy a forum photo for.`);
  if (!todo.length) return;
  await ensureBucket();

  let copied = 0;
  for (const { username } of todo) {
    try {
      const photo = await fetch(forumPhotos.get(username));
      if (!photo.ok) throw new Error(`forum HTTP ${photo.status}`);
      const type = photo.headers.get('content-type') || 'image/png';
      const file = `${username.replace(/[^a-z0-9_.-]/gi, '_')}.${type.split('/')[1]?.replace('jpeg', 'jpg') || 'png'}`;
      await request(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${file}`, {
        method: 'POST',
        headers: headers({ 'Content-Type': type, 'x-upsert': 'true' }),
        body: Buffer.from(await photo.arrayBuffer()),
      });
      await request(`${SUPABASE_URL}/rest/v1/members?username=eq.${encodeURIComponent(username)}`, {
        method: 'PATCH',
        headers: headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ avatar: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${file}` }),
      });
      copied++;
    } catch (err) {
      console.warn(`Skipped ${username}: ${err.message}`);
    }
  }
  console.log(`Copied ${copied} photo(s) into Supabase Storage.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
