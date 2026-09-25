// Written from the Supabase `teams` table at dev/build time by
// scripts/sync-members-supabase.mjs (teams.json is gitignored). Who is in
// which team comes with each member's profile (Member.teams).

import rawTeams from './teams.json';

export interface Team {
  slug: string;
  name: string;
  description?: string | null;
}

export const teams: Team[] = rawTeams as Team[];
