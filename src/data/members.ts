// Local forum snapshot. Anëtarët comes from trust_level_0; staff affiliations
// come from Bordi, Staff-Ekipet, Staff-Nismat and Staff-Qytetet.

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
  profileSynced?: boolean;
  since: number;
  avatar?: string;
  groups: string[];
  inDirectory: boolean;
  profileUrl: string;
}

export const members: Member[] = rawMembers;
const trustLevelMembers = members.filter(member => member.inDirectory);
// Keep the last usable directory visible if an authenticated trust_level_0
// refresh has not been completed yet.
export const directoryMembers: Member[] = trustLevelMembers.length ? trustLevelMembers : members;
