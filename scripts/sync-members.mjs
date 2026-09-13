// Pulls the current membership of the public forum groups that make up the
// Anëtarët directory and writes it to src/data/members.json. The site reads that
// committed file at build time — nothing fetches the forum live on every build.
//
// Re-run this whenever the forum group membership should be refreshed:
//   node scripts/sync-members.mjs

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const FORUM_URL = 'https://forum.illyrianbrains.org';

// Forum group slug -> label shown on member cards and in the group filter.
const DIRECTORY_GROUPS = {
  Bordi: 'Bordi',
  'Staff-Ekipet': 'Ekipet',
  'Staff-Nismat': 'Nismat',
  'Staff-Qytetet': 'Qytetet',
  'C-Tech': 'Teknologji',
};

async function fetchGroupMembers(slug) {
  const members = [];
  const limit = 100;
  let offset = 0;
  for (;;) {
    const response = await fetch(`${FORUM_URL}/g/${slug}/members.json?limit=${limit}&offset=${offset}`, {
      headers: { 'User-Agent': 'illyrianbrains.org-build' },
    });
    if (!response.ok) throw new Error(`${slug}: HTTP ${response.status}`);
    const data = await response.json();
    members.push(...(data.members ?? []));
    offset += limit;
    if (!data.meta || offset >= data.meta.total) break;
  }
  return members;
}

function parseGeoLocation(customFields) {
  const raw = customFields?.geo_location;
  if (!raw) return {};
  try {
    const geo = JSON.parse(raw);
    return { city: geo.city || undefined, country: geo.country || undefined };
  } catch {
    return {};
  }
}

async function main() {
  const slugs = Object.keys(DIRECTORY_GROUPS);
  const groupResults = await Promise.all(
    slugs.map(async (slug) => {
      try {
        return await fetchGroupMembers(slug);
      } catch (error) {
        console.warn(`[sync-members] could not fetch forum group "${slug}":`, error.message);
        return [];
      }
    })
  );

  const merged = new Map();

  slugs.forEach((slug, i) => {
    const label = DIRECTORY_GROUPS[slug];
    for (const member of groupResults[i]) {
      const addedTs = new Date(member.added_at).getTime();
      const existing = merged.get(member.id);
      if (existing) {
        if (!existing.groups.includes(label)) existing.groups.push(label);
        if (!Number.isNaN(addedTs)) existing.addedTimestamps.push(addedTs);
        continue;
      }
      const { city, country } = parseGeoLocation(member.custom_fields);
      merged.set(member.id, {
        name: member.name || member.username,
        username: member.username,
        city,
        country,
        avatar: member.avatar_template ? `${FORUM_URL}${member.avatar_template.replace('{size}', '120')}` : undefined,
        groups: [label],
        profileUrl: `${FORUM_URL}/u/${member.username}`,
        addedTimestamps: Number.isNaN(addedTs) ? [] : [addedTs],
      });
    }
  });

  const members = [...merged.values()]
    .map(({ addedTimestamps, ...member }) => ({
      ...member,
      since: addedTimestamps.length > 0 ? new Date(Math.min(...addedTimestamps)).getFullYear() : new Date().getFullYear(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'sq'));

  const outPath = fileURLToPath(new URL('../src/data/members.json', import.meta.url));
  await writeFile(outPath, JSON.stringify(members, null, 2) + '\n', 'utf-8');
  console.log(`[sync-members] wrote ${members.length} members from ${slugs.length} forum groups to src/data/members.json`);
}

main().catch((error) => {
  console.error('[sync-members] failed:', error);
  process.exitCode = 1;
});
