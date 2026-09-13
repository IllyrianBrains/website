// Pulls Anëtarët from the forum's trust_level_0 group and supplements those
// records with the staff groups used on Ekipet. The site reads the committed
// snapshot at build time — nothing fetches the forum on every page request.
//
// Re-run this whenever the forum group membership should be refreshed:
//   node scripts/sync-members.mjs

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const FORUM_URL = 'https://forum.illyrianbrains.org';
const API_KEY = process.env.DISCOURSE_API_KEY;
const API_USERNAME = process.env.DISCOURSE_API_USERNAME;

const DIRECTORY_GROUP = 'trust_level_0';
// Forum group slug -> label used only for team affiliations and filters.
const TEAM_GROUPS = {
  Bordi: 'Bordi',
  'Staff-Ekipet': 'Ekipet',
  'Staff-Nismat': 'Nismat',
  'Staff-Qytetet': 'Qytetet',
};
const EXPERTISE_GROUPS = {
  'C-Akademix': 'Akademi',
  'C-Legal': 'Ligj',
  'C-Tech': 'Teknologji',
};

async function fetchGroupMembers(slug) {
  const members = [];
  const limit = 100;
  let offset = 0;
  for (;;) {
    const headers = { 'User-Agent': 'illyrianbrains.org-build' };
    if (API_KEY) headers['Api-Key'] = API_KEY;
    if (API_USERNAME) headers['Api-Username'] = API_USERNAME;
    const response = await fetch(`${FORUM_URL}/g/${slug}/members.json?limit=${limit}&offset=${offset}`, {
      headers,
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

function parseFieldOfExpertise(customFields) {
  const value = customFields?.field_of_expertise ?? customFields?.expertise ?? customFields?.profession;
  return typeof value === 'string' ? value.split(/[,;|]/).map(item => item.trim()).filter(Boolean) : [];
}

async function main() {
  const slugs = [DIRECTORY_GROUP, ...Object.keys(TEAM_GROUPS), ...Object.keys(EXPERTISE_GROUPS)];
  const groupResults = await Promise.all(
    slugs.map(async (slug) => {
      try {
        return await fetchGroupMembers(slug);
      } catch (error) {
        console.warn(`[sync-members] could not fetch forum group "${slug}":`, error.message);
        return null;
      }
    })
  );
  if (groupResults.slice(1).some(result => result === null)) {
    throw new Error('Forum refresh incomplete; the existing members.json snapshot was preserved.');
  }

  const merged = new Map();

  slugs.forEach((slug, i) => {
    const label = TEAM_GROUPS[slug];
    const expertiseLabel = EXPERTISE_GROUPS[slug];
    const inDirectory = slug === DIRECTORY_GROUP;
    for (const member of groupResults[i] ?? []) {
      const addedTs = new Date(member.added_at).getTime();
      const existing = merged.get(member.id);
      if (existing) {
        if (label && !existing.groups.includes(label)) existing.groups.push(label);
        if (expertiseLabel && !existing.fieldsOfExpertise.includes(expertiseLabel)) existing.fieldsOfExpertise.push(expertiseLabel);
        if (inDirectory) existing.inDirectory = true;
        if (!Number.isNaN(addedTs)) existing.addedTimestamps.push(addedTs);
        continue;
      }
      const { city, country } = parseGeoLocation(member.custom_fields);
      merged.set(member.id, {
        name: member.name || member.username,
        username: member.username,
        city,
        country,
        fieldsOfExpertise: [...new Set([...parseFieldOfExpertise(member.custom_fields), ...(expertiseLabel ? [expertiseLabel] : [])])],
        avatar: member.avatar_template ? `${FORUM_URL}${member.avatar_template.replace('{size}', '120')}` : undefined,
        groups: label ? [label] : [],
        inDirectory,
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
