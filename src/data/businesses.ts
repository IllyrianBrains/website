import { offers } from './offers';
import { organizations } from './organizations';

export type BusinessCategory = 'technology' | 'architecture' | 'health' | 'finance' | 'business-development' | 'other';

export const businessCategoryLabels: Record<BusinessCategory, string> = {
  technology: 'Teknologji',
  architecture: 'Arkitekturë & Dizajn',
  health: 'Shëndetësi',
  finance: 'Financa & Kontabilitet',
  'business-development': 'Zhvillim biznesi',
  other: 'Tjetër',
};

export type BusinessStage = 'startup' | 'established' | 'diaspora';

export const businessStageLabels: Record<BusinessStage, string> = {
  startup: 'Startup',
  established: 'I themeluar',
  diaspora: 'Biznes i diasporës',
};

// The standard forms a contribution can take, shown in the directory filter even
// when no business currently has one, so the option is visible/selectable before
// any real data of that type exists. Order here is preserved in the filter.
export const contributionTypeOptions = ['Sponsor', 'Donacion', 'Ofertë', 'Kupon'];

export interface Business {
  name: string;
  /** Main category (`category` in Supabase). */
  category: BusinessCategory;
  /** All categories: the main one, then `other_categories`. */
  categories: BusinessCategory[];
  stage: BusinessStage;
  city?: string;
  country?: string;
  description: string;
  website?: string;
  linkedin?: string;
  instagram?: string;
  /** Logo image path (e.g. /assets/businesses/bliss.png) or URL. */
  logo?: string;
  sponsor: boolean;
  /** Network member usernames explicitly connected to this business. */
  relatedMembers: string[];
  /** Network cities this business is active in or connected to, beyond its base city. */
  relatedCities: string[];
  // Derived, not a Supabase column: the distinct ways this business contributes to
  // IB — "Sponsor" if it sponsors the network, plus the type of each offer/coupon/
  // donation it has published (see offers.csv, whose `type` column is free text).
  contributionTypes: string[];
}

const offerTypesByBusiness = new Map<string, Set<string>>();
for (const offer of offers) {
  const types = offerTypesByBusiness.get(offer.business) ?? new Set<string>();
  if (offer.type) types.add(offer.type);
  offerTypesByBusiness.set(offer.business, types);
}

// The published businesses in Supabase (see organizations.ts). The member who
// added one counts as a related member.
export const businesses: Business[] = organizations
  .filter(org => org.kind === 'business')
  .map(org => {
    const categories = [...new Set([org.category, ...org.otherCategories])].filter((value): value is BusinessCategory => value in businessCategoryLabels);
    if (categories.length === 0) categories.push('other');
    return {
      name: org.name,
      category: categories[0],
      categories,
      stage: (org.stage === 'established' || org.stage === 'diaspora') ? org.stage : 'startup',
      city: org.city,
      country: org.country,
      description: org.description,
      website: org.website,
      linkedin: org.linkedin,
      instagram: org.instagram,
      logo: org.logo,
      sponsor: org.sponsor,
      relatedMembers: [...new Set([...(org.username ? [org.username] : []), ...org.relatedMembers])],
      relatedCities: org.relatedCities,
      contributionTypes: [...(org.sponsor ? ['Sponsor'] : []), ...(offerTypesByBusiness.get(org.name) ?? [])],
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name, 'sq'));
