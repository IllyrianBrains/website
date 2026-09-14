import rawBusinesses from './businesses.csv?raw';
import { csvRows } from './csv';
import { offers } from './offers';

export type BusinessCategory = 'startup' | 'established' | 'diaspora';

export const businessCategoryLabels: Record<BusinessCategory, string> = {
  startup: 'Startup',
  established: 'I themeluar',
  diaspora: 'Biznes i diasporës',
};

export interface Business {
  name: string;
  category: BusinessCategory;
  city?: string;
  country?: string;
  description: string;
  website?: string;
  sponsor: boolean;
  // Derived, not a raw CSV column: a business counts as contributing to IB if it
  // sponsors the network, has published an offer for the community, or has a
  // local presence (city) in one of the network's areas.
  contributesToIB: boolean;
}

const businessesWithOffers = new Set(offers.map(offer => offer.business));

function businessesFromCsv(text: string): Business[] {
  return csvRows(text).map(({ col }) => {
    const category = col('category').toLowerCase();
    const name = col('name');
    const city = col('city') || undefined;
    const sponsor = ['true', 'yes', '1'].includes(col('sponsor').toLowerCase());
    return {
      name,
      category: (category === 'established' || category === 'diaspora') ? category : 'startup',
      city,
      country: col('country') || undefined,
      description: col('description'),
      website: col('website') || undefined,
      sponsor,
      contributesToIB: sponsor || businessesWithOffers.has(name) || Boolean(city),
    };
  });
}

export const businesses: Business[] = businessesFromCsv(rawBusinesses);
