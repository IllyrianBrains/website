export interface JobOpening {
  title: string;
  department: string;
  type: string;
  description: string;
}

export const jobs: JobOpening[] = [
  { title: 'Organizator / Qytet ekzistues!', department: 'Bordi / Qytetet', type: 'Volunteering', description: 'Bashkohuni ekipit organizator për një qytet ekzistues të Illyrian Brains. Menaxhoni rrjetin lokal, dhe organizoni takime profesionale.' },
  { title: 'Organizator / Qytet i ri!', department: 'Bordi / Qytetet', type: 'Volunteering', description: 'Nisni një qytet të ri për Illyrian Brains, menaxhoni rrjetin lokal, dhe organizoni takime profesionale.' },
  { title: 'Devops', department: 'Bordi / Tech', type: 'Volunteering', description: 'Jemi në kërkim personash me njohuri teknike dhe pasion për teknologjinë për të mbështetur dhe zhvilluar infrastrukturën digjitale të organizatës. Ky rol është i përshtatshëm për dikë që ka eksperiencë me serverë, cloud, automatizim dhe sisteme open-source, dhe dëshiron të kontribuojë në funksionimin e qëndrueshëm të platformave dhe shërbimeve të komunitetit. Si pjesë e ekipit, do të punoni me sistemet tona digjitale, faqet e internetit, platformat e komunitetit dhe mjetet e bashkëpunimit për të siguruar performancë, siguri dhe vazhdimësi operacionale.' },
  { title: 'Menaxher/e e Rrjeteve Sociale', department: 'Bordi / Social Media & Eventet', type: 'Part-time', description: 'Jemi në kërkim të një personi kreativ, të organizuar dhe me iniciativë për t’iu bashkuar ekipit tonë. Ky rol është ideal për dikë që dëshiron të kontribuojë në rritjen e një komuniteti profesional dhe të ndihmojë në promovimin e aktiviteteve, nismave dhe historive të anëtarëve tanë. Si pjesë e ekipit, do të bashkëpunoni me organizatorët lokalë, grupet e punës dhe ekipin e komunikimit për të krijuar përmbajtje tërheqëse dhe për të forcuar praninë e rrjetit në platformat digjitale.' },
];
