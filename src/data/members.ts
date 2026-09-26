// Fetched fresh from Supabase (scripts/sync-members-supabase.mjs), or from the
// private Google Sheet (scripts/sync-members-sheet.mjs) until Supabase is set
// up, at dev/build time. members.json is gitignored, not committed.

import rawMembers from './members.json';

export interface MemberExperience {
  title: string;
  organization?: string | null;
  location?: string | null;
  startYear?: number | null;
  endYear?: number | null;
  current?: boolean;
  description?: string | null;
}

export interface MemberEducation {
  school: string;
  degree?: string | null;
  field?: string | null;
  startYear?: number | null;
  endYear?: number | null;
}

export interface MemberTeam {
  slug: string;
  name: string;
  role: 'Drejtues' | 'Anëtar';
}

// Public half of the career aspirations (supabase/013-aspirations.sql); the
// return-to-Albania/Kosovo answer is private and never reaches members.json.
export interface MemberAspirations {
  field?: string;
  subfield?: string;
  mentoring?: string[];
  business?: string[];
  note?: string;
}

export type MembershipType = 'Pjesëmarrës' | 'Mbështetës' | 'Organizator' | 'Kontribues';
export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'expert';
export const experienceLevelLabels: Record<ExperienceLevel, string> = {
  junior: 'Junior (0–2 vite)',
  mid: 'Mid level (3–5 vite)',
  senior: 'Senior (5–9 vite)',
  expert: 'Expert (10+ vite)',
};

export interface Member {
  name: string;
  username: string;
  city?: string;
  country?: string;
  fieldsOfExpertise?: string[];
  specialty?: string[];
  bio?: string;
  title?: string;
  company?: string;
  website?: string;
  linkedinUrl?: string;
  since: number;
  avatar?: string;
  groups?: string[];          // forum groups — only from the old sheet sync
  team?: string[];            // team names
  teams?: MemberTeam[];
  membershipType?: MembershipType;
  experienceLevel?: ExperienceLevel;
  inDirectory: boolean;
  profileUrl?: string;
  languages?: string[];
  experience?: MemberExperience[];
  education?: MemberEducation[];
  aspirations?: MemberAspirations;
}

// The members sheet is typed by hand and doesn't always match the city names
// in cities.csv (accents, English vs. local spelling, etc.) — e.g. "Rome" vs.
// "Roma", "Dusseldorf" vs. "Düsseldorf". This aliases known variants to the
// cities.csv spelling so city filters/groupings treat them as the same city.
// See bugs.csv for the discrepancy this was found from.
export const cityAliases: Record<string, string> = {
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
