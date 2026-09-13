import rawPartners from './partners.csv?raw';
import { csvRows } from './csv';

export type PartnerCategory = 'advocacy' | 'education' | 'culture';

export const partnerCategoryLabels: Record<PartnerCategory, string> = {
  advocacy: 'Advokaci & të drejta',
  education: 'Edukim & zhvillim',
  culture: 'Kulturë & trashëgimi',
};

export interface Partner {
  name: string;
  category: PartnerCategory;
  type: 'partner' | 'ngo';
  city?: string;
  description: string;
  website?: string;
  linkedin?: string;
}

function partnersFromCsv(text: string): Partner[] {
  return csvRows(text).map(({ col }) => {
    const category = col('category').toLowerCase();
    return {
      name: col('name'),
      category: (category === 'education' || category === 'culture') ? category : 'advocacy',
      type: col('type').toLowerCase() === 'ngo' ? 'ngo' : 'partner',
      city: col('city') || undefined,
      description: col('description'),
      website: col('website') || undefined,
      linkedin: col('linkedin') || undefined,
    };
  });
}

export const partners: Partner[] = partnersFromCsv(rawPartners);
