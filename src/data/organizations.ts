import rawOrganizations from './organizations.json';

// The published NGOs and businesses in Supabase (supabase/006-organizations.sql):
// the lists that used to be partners.csv / businesses.csv, plus the ones members
// added from /anetaresohu/shoqatat/ and /anetaresohu/bizneset/. organizations.json is written before
// dev/build by scripts/sync-organizations-supabase.mjs and not committed.
// partners.ts and businesses.ts build their lists from this.
export interface OrganizationRepresentative { name: string; username: string; title?: string; avatar?: string; }
export interface OrganizationOpportunity { id: number; kind: string; title: string; description: string; url?: string; expiresAt?: string; }

export interface Organization {
  id: number;
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
  /** Primary representative, retained for backwards compatibility. */
  username?: string;
  representatives: OrganizationRepresentative[];
  opportunities: OrganizationOpportunity[];
}

export const organizationSlug = (organization: Pick<Organization, 'id' | 'name'>) => {
  const name = organization.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'organizate';
  return `${name}-${organization.id}`;
};

export const organizations: Organization[] = (rawOrganizations as any[]).map(row => ({
  id: Number(row.id),
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
  representatives: (row.representatives ?? []).map((person: any) => ({ name: person.name, username: person.username, title: person.title || undefined, avatar: person.avatar || undefined })),
  opportunities: (row.opportunities ?? []).map((item: any) => ({ id: Number(item.id), kind: item.kind, title: item.title, description: item.description, url: item.url || undefined, expiresAt: item.expires_at || undefined })),
}));
