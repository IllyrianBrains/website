import rawOrganizations from './organizations.json';

// The published NGOs and businesses in Supabase (supabase/006-organizations.sql):
// the lists that used to be partners.csv / businesses.csv, plus the ones members
// added from /anetaresohu/shoqatat/ and /anetaresohu/bizneset/. organizations.json is written before
// dev/build by scripts/sync-organizations-supabase.mjs and not committed.
// partners.ts and businesses.ts build their lists from this.
export interface Organization {
  kind: 'ngo' | 'business';
  name: string;
  category: string;
  otherCategories: string[];
  stage?: string;
  city?: string;
  country?: string;
  description: string;
  website?: string;
  linkedin?: string;
  instagram?: string;
  logo?: string;
  sponsor: boolean;
  collaborations: string[];
  relatedMembers: string[];
  relatedCities: string[];
  relatedPartners: string[];
  /** Username of the member who added it, when their profile is public. */
  username?: string;
}

export const organizations: Organization[] = (rawOrganizations as any[]).map(row => ({
  kind: row.kind,
  name: row.name,
  category: row.category,
  otherCategories: row.other_categories ?? [],
  stage: row.stage || undefined,
  city: row.city || undefined,
  country: row.country || undefined,
  description: row.description || '',
  website: row.website || undefined,
  linkedin: row.linkedin || undefined,
  instagram: row.instagram || undefined,
  logo: row.logo || undefined,
  sponsor: Boolean(row.sponsor),
  collaborations: row.collaborations ?? [],
  relatedMembers: row.related_members ?? [],
  relatedCities: row.related_cities ?? [],
  relatedPartners: row.related_partners ?? [],
  username: row.username || undefined,
}));
