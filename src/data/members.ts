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

export const members: Member[] = rawMembers;
export const directoryMembers: Member[] = members.filter(member => member.inDirectory);
