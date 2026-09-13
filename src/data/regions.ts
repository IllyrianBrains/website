export interface CityRegion {
  name: string;
  blurb: string;
  citySlugs: string[];
}

// Regional groupings include every community; cities are sorted by name on the listing page.
export const cityRegions: CityRegion[] = [
  { name: 'Amerika e Veriut', blurb: 'Komunitete që sfidojnë largësitë dhe stilin e jetës, dhe japin një mundësi për të ngadalësuar hapin dhe për të arrirë më shumë.', citySlugs: ['boston', 'chicago', 'fort-lauderdale', 'miami', 'minnesota', 'new-jersey', 'new-york', 'philadelphia', 'san-jose', 'tampa', 'toronto', 'washington'] },
  { name: 'Europa Gjermanishtfolëse', blurb: 'Komunitete që fokusohen në mirëpritjen e pjesëmarrësve të rinj dhe ndërtimit të një rrjeti kontakti për punësim dhe integrim social.', citySlugs: ['berlin', 'dusseldorf', 'frankfurt', 'freiburg', 'hamburg', 'koln', 'munich', 'nurnberg', 'stuttgart', 'zurich', 'vienna'] },
  { name: 'Europa Jugore', blurb: 'Komunitete që bashkojnë profesionistë që kanë kohë që kanë emigruar me energjitë e reja të studentëve dhe familjeve që sapo janë bashkuar.', citySlugs: ['bologna', 'firenze', 'genova', 'lugano', 'milano', 'roma', 'shkup', 'tirana', 'parma', 'malta', 'trento'] },
  { name: 'Europa Perëndimore', blurb: 'Komunitete që përqëndrohen në zhvillimin në karrierë në qytete që kanë hap të shpejtë dhe shpenzime të shumta.', citySlugs: ['amsterdam', 'barcelona', 'brussels', 'dublin', 'london', 'luxembourg', 'madrid', 'manchester', 'paris', 'south-england'] },
  { name: 'Europa Veriore', blurb: 'Komunitete që orientojnë anëtarët në një klimë të rezervuar sociale dhe adaptimin me një standard të lartë jetese.', citySlugs: ['copenhagen', 'helsinki', 'krakow', 'malmo', 'oslo', 'prague', 'stockholm'] },
  { name: 'Lindja e Mesme', blurb: 'Komunitete që lidhin profesionistët shqiptarë në Lindjen e Mesme.', citySlugs: ['dubai'] },
];
