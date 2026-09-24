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
  /** Main category — the first one listed in the CSV. */
  category: PartnerCategory;
  /** All categories, from the semicolon-separated `category` CSV column (e.g. "advocacy;diaspora"). */
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
  // Derived from the semicolon-separated `collaborations` CSV column, validated
  // against collaborationTypeOptions.
  collaborationTypes: string[];
}

function partnersFromCsv(text: string): Partner[] {
  return csvRows(text).map(({ col }) => {
    const categories = col('category').toLowerCase().split(';').map(value => value.trim()).filter((value): value is PartnerCategory => value in partnerCategoryLabels);
    if (categories.length === 0) categories.push('advocacy');
    return {
      name: col('name'),
      category: categories[0],
      categories,
      type: col('type').toLowerCase() === 'ngo' ? 'ngo' : 'partner',
      city: col('city') || undefined,
      description: col('description'),
      website: col('website') || undefined,
      linkedin: col('linkedin') || undefined,
      instagram: col('instagram') || undefined,
      logo: col('logo') || undefined,
      sponsor: ['true', 'yes', '1'].includes(col('sponsor').toLowerCase()),
      relatedMembers: col('relatedMembers').split(';').map(value => value.trim()).filter(Boolean),
      relatedCities: col('relatedCities').split(';').map(value => value.trim()).filter(Boolean),
      relatedPartners: col('relatedPartners').split(';').map(value => value.trim()).filter(Boolean),
      collaborationTypes: col('collaborations').split(';').map(c => c.trim()).filter(c => collaborationTypeOptions.includes(c)),
    };
  });
}

export const partners: Partner[] = partnersFromCsv(rawPartners).sort((a, b) => a.name.localeCompare(b.name, 'sq'));
