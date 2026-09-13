import rawBusinesses from './businesses.csv?raw';
import { csvRows } from './csv';

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
}

function businessesFromCsv(text: string): Business[] {
  return csvRows(text).map(({ col }) => {
    const category = col('category').toLowerCase();
    return {
      name: col('name'),
      category: (category === 'established' || category === 'diaspora') ? category : 'startup',
      city: col('city') || undefined,
      country: col('country') || undefined,
      description: col('description'),
      website: col('website') || undefined,
    };
  });
}

export const businesses: Business[] = businessesFromCsv(rawBusinesses);
