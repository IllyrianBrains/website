// Anëtarët directory data — a local snapshot of the public groups on
// forum.illyrianbrains.org (Bordi, Staff-Ekipet, Staff-Nismat, Staff-Qytetet,
// C-Tech). Nothing here is hand-maintained or fetched live at build time; this file
// is generated. Re-run `node scripts/sync-members.mjs` to refresh it from the forum.

import rawMembers from './members.json';

export interface Member {
  name: string;
  username: string;
  city?: string;
  country?: string;
  since: number;
  avatar?: string;
  groups: string[];
  profileUrl: string;
}

export const members: Member[] = rawMembers;
