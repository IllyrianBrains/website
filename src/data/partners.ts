import rawPartners from './partners.csv?raw';
import { csvRows } from './csv';

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
  category: PartnerCategory;
  type: 'partner' | 'ngo';
  city?: string;
  description: string;
  website?: string;
  linkedin?: string;
  instagram?: string;
  sponsor: boolean;
  // Derived from the semicolon-separated `collaborations` CSV column, validated
  // against collaborationTypeOptions.
  collaborationTypes: string[];
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
      website: col('website') || undefined,
      linkedin: col('linkedin') || undefined,
      instagram: col('instagram') || undefined,
      sponsor: ['true', 'yes', '1'].includes(col('sponsor').toLowerCase()),
      collaborationTypes: col('collaborations').split(';').map(c => c.trim()).filter(c => collaborationTypeOptions.includes(c)),
    };
  });
}

export const partners: Partner[] = partnersFromCsv(rawPartners);
