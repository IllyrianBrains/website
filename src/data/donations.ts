import rawDonations from './donations.csv?raw';
import { csvRows } from './csv';

// The three places a donation can go — mirrors S4 "Strategjia Financiare" on
// misioni.astro (Financimi i Programeve, Fondi i Nismave) plus S3's running costs.
// A donation "për OJF-në" (unrestricted) is split across these by the Board.
export type DonationFund = 'operative' | 'projekte' | 'ide';

export interface Fund {
  id: DonationFund;
  title: string;
  description: string;
}

export const funds: Fund[] = [
  { id: 'operative', title: 'Kostot operative', description: 'Mban gjallë infrastrukturën dhe mjetet që përdorin ekipet për ta bërë rrjetin të funksionojë çdo ditë.' },
  { id: 'projekte', title: 'Projekte të reja', description: 'Investohet në projektet e rrjetit — mund të zgjedhësh edhe një projekt të caktuar.' },
  { id: 'ide', title: 'Fondi i Nismave', description: 'Mbështet idetë e komunitetit që propozohen te Mundësitë dhe miratohen për realizim.' },
];

export interface FundingLine {
  id: string;
  title: string;
  /** Which misioni.astro strategy lines this serves. */
  strategy: string;
  /** Target share of the annual budget, in percent; omitted on the open-ended last tier. */
  share?: number;
  description: string;
}

export interface FundingTier {
  title: string;
  lines: FundingLine[];
}

// How unrestricted ("për OJF-në") donations are spent: step 1's annual budget is split by
// these target shares; once it's covered, anything on top goes to step 2 (Fondi i Nismave). Targets, not commitments.
export const fundingTiers: FundingTier[] = [
  { title: 'OJF-ja dhe qytetet', lines: [
    { id: 'operative', title: 'Kostot e OJF-së', strategy: 'S2 · S3', share: 30, description: 'OJF-ja si mbështetje për rrjetin: infrastruktura, mirëmbajtja dhe mjetet që përdorin ekipet.' },
    { id: 'qytete', title: 'Qytetet ekzistuese', strategy: 'S1', share: 50, description: 'Prioriteti ynë: mbështetje për qytetet aktive që të rriten dhe të bashkëpunojnë me njëri-tjetrin.' },
    { id: 'qytete-reja', title: 'Qytetet e reja', strategy: 'S1', share: 20, description: 'Ndihmë për qytetet e reja që të nisin komunitetin dhe eventet e para.' },
  ] },
  { title: 'Projektet', lines: [
    { id: 'atlas', title: 'Atlas', strategy: 'S4', share: 20, description: 'Udhëzuesit e vendeve për profesionistët shqiptarë kudo në botë.' },
    { id: 'mentorimi', title: 'Mentorimi', strategy: 'S4', share: 20, description: 'Programi i mentorimit të rrjetit.' },
    { id: 'heritage', title: 'Heritage', strategy: 'S4', share: 20, description: 'Projekti i trashëgimisë së rrjetit.' },
    { id: 'hapur', title: 'E hapur', strategy: 'S4', share: 40, description: 'Për nisma të reja nga Mundësitë që miratohen për realizim.' },
  ] },
];

export interface DonationItem {
  id: string;
  title: string;
  text: string;
  /** Standard price in EUR. */
  amount: number;
}

// DRAFT — standard prices for things a donor can pay for directly; confirm against real costs before publishing.
export const donationItems: DonationItem[] = [
  { id: 'faqja', title: 'Faqja e rrjetit', text: 'Domenet, mirëmbajtja dhe mjetet online që mbajnë gjallë illyrianbrains.org dhe projektet.', amount: 250 },
  { id: 'ambienti', title: 'Ambienti për një takim', text: 'Qiraja e një salle për një takim qyteti.', amount: 250 },
  { id: 'social-media', title: 'Mjete për ekipin e Social Media', text: 'Programet dhe mjetet që ekipi përdor për të ndarë lajmet dhe eventet e rrjetit.', amount: 250 },
  { id: 'event-me-te-ftuar', title: 'Event me të ftuar', text: 'Udhëtimi dhe logjistika për të sjellë një të ftuar në një event qyteti.', amount: 250 },
];

export interface LedgerEntry {
  date: string;
  direction: 'hyrje' | 'dalje';
  fund: DonationFund;
  project?: string;
  /** In EUR. */
  amount: number;
  description: string;
}

// Public ledger, maintained by hand in donations.csv: one row per donation received
// (`hyrje`) or expense paid from a fund (`dalje`). Donor names only with their consent,
// otherwise "Anonim".
function ledgerFromCsv(text: string): LedgerEntry[] {
  return csvRows(text).map(({ col }) => {
    const fund = col('fund').toLowerCase();
    return {
      date: col('date'),
      direction: col('direction').toLowerCase() === 'dalje' ? 'dalje' : 'hyrje',
      fund: (fund === 'projekte' || fund === 'ide') ? fund : 'operative',
      project: col('project') || undefined,
      amount: Number(col('amount')) || 0,
      description: col('description'),
    };
  });
}

export const ledger: LedgerEntry[] = ledgerFromCsv(rawDonations).sort((a, b) => b.date.localeCompare(a.date));
