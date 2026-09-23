// Fetched fresh from a private Google Sheet at dev/build time — see
// scripts/sync-supporters-sheet.mjs. supporters.json is gitignored, not committed,
// and only ever holds monthly donors who agreed to be named.

import rawSupporters from './supporters.json';

export interface Supporter {
  name: string;
  city?: string;
  since?: number;
}

export const supporters: Supporter[] = rawSupporters;
