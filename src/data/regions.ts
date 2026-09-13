export interface CityRegion {
  name: string;
  blurb: string;
  color: string;
  citySlugs: string[];
}

// Regional groupings include every community; cities are sorted by name on the listing page.
// `color` is the region's key color on the community map and its legend — chosen from the
// site's categorical map palette (see src/components/CommunityMap.astro), validated for
// colorblind-safety with the dataviz skill's palette validator.
export const cityRegions: CityRegion[] = [
  { name: 'Amerika e Veriut', blurb: 'Komunitete që sfidojnë largësitë dhe stilin e jetës, dhe japin një mundësi për të ngadalësuar hapin dhe për të arrirë më shumë.', color: '#2a78d6', citySlugs: ['boston', 'chicago', 'fort-lauderdale', 'miami', 'minnesota', 'new-jersey', 'new-york', 'philadelphia', 'san-jose', 'tampa', 'toronto', 'washington'] },
  { name: 'Europa Gjermanishtfolëse', blurb: 'Komunitete që fokusohen në mirëpritjen e pjesëmarrësve të rinj dhe ndërtimit të një rrjeti kontakti për punësim dhe integrim social.', color: '#4a3aa7', citySlugs: ['berlin', 'dusseldorf', 'frankfurt', 'freiburg', 'hamburg', 'koln', 'munich', 'nurnberg', 'stuttgart', 'zurich', 'vienna'] },
  { name: 'Europa Jugore', blurb: 'Komunitete që bashkojnë profesionistë që kanë kohë që kanë emigruar me energjitë e reja të studentëve dhe familjeve që sapo janë bashkuar.', color: '#1baf7a', citySlugs: ['bologna', 'firenze', 'genova', 'lugano', 'milano', 'roma', 'shkup', 'tirana', 'parma', 'malta', 'trento'] },
  { name: 'Europa Perëndimore', blurb: 'Komunitete që përqëndrohen në zhvillimin në karrierë në qytete që kanë hap të shpejtë dhe shpenzime të shumta.', color: '#e34948', citySlugs: ['amsterdam', 'barcelona', 'brussels', 'dublin', 'london', 'luxembourg', 'madrid', 'manchester', 'paris', 'south-england'] },
  { name: 'Europa Veriore', blurb: 'Komunitete që orientojnë anëtarët në një klimë të rezervuar sociale dhe adaptimin me një standard të lartë jetese.', color: '#eda100', citySlugs: ['copenhagen', 'helsinki', 'krakow', 'malmo', 'oslo', 'prague', 'stockholm'] },
  { name: 'Lindja e Mesme', blurb: 'Komunitete që lidhin profesionistët shqiptarë në Lindjen e Mesme.', color: '#008300', citySlugs: ['dubai'] },
];
