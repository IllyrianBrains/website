import { organizations } from './organizations';

export type PartnerCategory = 'advocacy' | 'education' | 'culture' | 'environment' | 'diaspora';

export const partnerCategoryLabels: Record<PartnerCategory, string> = {
  advocacy: 'Advokaci & të drejta',
  education: 'Edukim & zhvillim',
  culture: 'Kulturë & trashëgimi',
  environment: 'Mbrojtja e mjedisit',
  diaspora: 'Angazhimi i diasporës',
};

// The forms a partner's collaboration with IB can take — general forms (networking,
// joint projects/events, donations) plus the specific IB sibling project (each its
// own site, see the repo's CLAUDE.md) it collaborates with, if any. Shown in the
// directory filter even when no NGO has a given one yet, same as
// contributionTypeOptions in businesses.ts. A partner can have more than one.
export const collaborationTypeOptions = ['Rrjetezim', 'Projekt i perbashket', 'Event i perbashket', 'Donacione', 'Atlas', 'Mentorimi', 'Heritage'];

export interface Partner {
  name: string;
  /** Main category (`category` in Supabase). */
  category: PartnerCategory;
  /** All categories: the main one, then `other_categories`. */
  categories: PartnerCategory[];
  type: 'partner' | 'ngo';
  city?: string;
  description: string;
  website?: string;
  linkedin?: string;
  instagram?: string;
  /** Logo image path (e.g. /assets/partners/lumi.png) or URL. */
  logo?: string;
  sponsor: boolean;
  /** Network member usernames explicitly connected to this organization. */
  relatedMembers: string[];
  /** Network cities this organization is active in or connected to, beyond its base city. */
  relatedCities: string[];
  /** Other partner NGOs (by name) this one collaborates with. Listing it on one side is enough. */
  relatedPartners: string[];
  // The `collaborations` column, validated against collaborationTypeOptions.
  collaborationTypes: string[];
}

// The published NGOs in Supabase (see organizations.ts). The member who added one
// counts as a related member.
export const partners: Partner[] = organizations
  .filter(org => org.kind === 'ngo')
  .map(org => {
    const categories = [...new Set([org.category, ...org.otherCategories])].filter((value): value is PartnerCategory => value in partnerCategoryLabels);
    if (categories.length === 0) categories.push('advocacy');
    return {
      name: org.name,
      category: categories[0],
      categories,
      type: 'ngo' as const,
      city: org.city,
      description: org.description,
      website: org.website,
      linkedin: org.linkedin,
      instagram: org.instagram,
      logo: org.logo,
      sponsor: org.sponsor,
      relatedMembers: [...new Set([...(org.username ? [org.username] : []), ...org.relatedMembers])],
      relatedCities: org.relatedCities,
      relatedPartners: org.relatedPartners,
      collaborationTypes: org.collaborations.filter(c => collaborationTypeOptions.includes(c)),
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name, 'sq'));
