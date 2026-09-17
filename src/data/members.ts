// Fetched fresh from a private Google Sheet at dev/build time — see
// scripts/sync-members-sheet.mjs. members.json is gitignored, not committed.

import rawMembers from './members.json';

export interface Member {
  name: string;
  username: string;
  city?: string;
  country?: string;
  fieldsOfExpertise?: string[];
  bio?: string;
  title?: string;
  website?: string;
  linkedin?: string;
  since: number;
  avatar?: string;
  groups: string[];
  team?: string[];
  inDirectory: boolean;
  profileUrl?: string;
}

// The members sheet is typed by hand and doesn't always match the city names
// in cities.csv (accents, English vs. local spelling, etc.) — e.g. "Rome" vs.
// "Roma", "Dusseldorf" vs. "Düsseldorf". This aliases known variants to the
// cities.csv spelling so city filters/groupings treat them as the same city.
// See bugs.csv for the discrepancy this was found from.
const cityAliases: Record<string, string> = {
  'dusseldorf': 'Düsseldorf',
  'cologne': 'Köln / Cologne',
  'nuremberg': 'Nürnberg',
  'malmö': 'Malmo',
  'florence': 'Firenze',
  'genoa': 'Genova',
  'malte': 'Malta',
  'milan': 'Milano',
  'rome': 'Roma',
  'vjena': 'Vienna',
  'bruksel': 'Brussels',
  'tampa bay': 'Tampa',
};
const normalizeCity = (city?: string) => (city && cityAliases[city.toLowerCase()]) || city;

export const members: Member[] = (rawMembers as Member[]).map(member => ({ ...member, city: normalizeCity(member.city) }));
export const directoryMembers: Member[] = members.filter(member => member.inDirectory);
