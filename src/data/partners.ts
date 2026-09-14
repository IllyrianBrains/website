import rawPartners from './partners.csv?raw';
import { csvRows } from './csv';

export type PartnerCategory = 'advocacy' | 'education' | 'culture' | 'environment' | 'diaspora';
export const partnerCollaborationTypes = ['Rrjetezim', 'Projekt i perbashket', 'Event i perbashket', 'Donacione'] as const;
export type PartnerCollaborationType = typeof partnerCollaborationTypes[number];

export const partnerCategoryLabels: Record<PartnerCategory, string> = {
  advocacy: 'Advokaci & të drejta',
  education: 'Edukim & zhvillim',
  culture: 'Kulturë & trashëgimi',
  environment: 'Mbrojtja e mjedisit',
  diaspora: 'Angazhimi i diasporës',
};

export interface Partner {
  name: string;
  category: PartnerCategory;
  type: 'partner' | 'ngo';
  city?: string;
  description: string;
  collaborationType: PartnerCollaborationType;
  website?: string;
  linkedin?: string;
  sponsor: boolean;
}

function partnersFromCsv(text: string): Partner[] {
  return csvRows(text).map(({ col }) => {
    const category = col('category').toLowerCase();
    return {
      name: col('name'),
      category: (category === 'education' || category === 'culture' || category === 'environment' || category === 'diaspora') ? category : 'advocacy',
      type: col('type').toLowerCase() === 'ngo' ? 'ngo' : 'partner',
      city: col('city') || undefined,
      description: col('description'),
      collaborationType: partnerCollaborationTypes.includes(col('collaboration_type') as PartnerCollaborationType) ? col('collaboration_type') as PartnerCollaborationType : 'Rrjetezim',
      website: col('website') || undefined,
      linkedin: col('linkedin') || undefined,
      sponsor: ['true', 'yes', '1'].includes(col('sponsor').toLowerCase()),
    };
  });
}

export const partners: Partner[] = partnersFromCsv(rawPartners);
