import rawBusinesses from './businesses.csv?raw';
import { csvRows } from './csv';
import { offers } from './offers';

export type BusinessCategory = 'technology' | 'architecture' | 'health' | 'finance' | 'other';

export const businessCategoryLabels: Record<BusinessCategory, string> = {
  technology: 'Teknologji',
  architecture: 'Arkitekturë & Dizajn',
  health: 'Shëndetësi',
  finance: 'Financa & Kontabilitet',
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
  category: BusinessCategory;
  stage: BusinessStage;
  city?: string;
  country?: string;
  description: string;
  website?: string;
  instagram?: string;
  sponsor: boolean;
  /** Network member usernames explicitly connected to this business. */
  relatedMembers: string[];
  /** Network cities this business is active in or connected to, beyond its base city. */
  relatedCities: string[];
  // Derived, not a raw CSV column: the distinct ways this business contributes to
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

const businessCategoryValues: BusinessCategory[] = ['technology', 'architecture', 'health', 'finance'];

function businessesFromCsv(text: string): Business[] {
  return csvRows(text).map(({ col }) => {
    const category = col('category').toLowerCase();
    const stage = col('stage').toLowerCase();
    const name = col('name');
    const city = col('city') || undefined;
    const sponsor = ['true', 'yes', '1'].includes(col('sponsor').toLowerCase());
    const contributionTypes = [...(sponsor ? ['Sponsor'] : []), ...(offerTypesByBusiness.get(name) ?? [])];
    return {
      name,
      category: businessCategoryValues.includes(category as BusinessCategory) ? (category as BusinessCategory) : 'other',
      stage: (stage === 'established' || stage === 'diaspora') ? stage : 'startup',
      city,
      country: col('country') || undefined,
      description: col('description'),
      website: col('website') || undefined,
      instagram: col('instagram') || undefined,
      sponsor,
      relatedMembers: col('relatedMembers').split(';').map(value => value.trim()).filter(Boolean),
      relatedCities: col('relatedCities').split(';').map(value => value.trim()).filter(Boolean),
      contributionTypes,
    };
  });
}

export const businesses: Business[] = businessesFromCsv(rawBusinesses);
