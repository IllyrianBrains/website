// Pre-filled emails for the site's mailto: links, so what arrives in the inbox has a
// predictable structure. Same format as the "Shto idenë tënde" email on ide.astro:
// a greeting, then one "Label:" line per field for the sender to fill in.
export const ORG_EMAIL = 'illyrianbrains@gmail.com';

export interface EmailTemplate {
  subject: string;
  body: string;
}

export const mailto = ({ subject, body }: EmailTemplate) =>
  `mailto:${ORG_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export const emailTemplates = {
  donationOnce: {
    subject: 'Donacion për Illyrian Brains',
    body: 'Përshëndetje,\n\nDua të bëj një donacion një herë për Illyrian Brains.\n\nEmri:\nShuma (€):\nPër çfarë (aty ku nevojitet më shumë / një projekt i caktuar, p.sh. Atlas):\nMënyra e pagesës (transfertë bankare / tjetër):\nA dëshiron që emri yt të përmendet në raportin vjetor? (po/jo):\n\nFaleminderit!',
  },
  donationMonthly: {
    subject: 'Donacion mujor për Illyrian Brains',
    body: 'Përshëndetje,\n\nDua të bëhem pjesë e Mbështetësve të Rrjetit me një donacion mujor.\n\nEmri:\nShuma mujore (€):\nMuaji i fillimit:\nQyteti ku jetoj (për ftesat në evente):\nA dëshiron që emri yt të përmendet në listën e Mbështetësve të Rrjetit në raportin vjetor? (po/jo):\n\nFaleminderit!',
  },
  membershipApply: {
    subject: 'Kërkesë për anëtarësim',
    body: 'Përshëndetje,\n\nDua të bëhem anëtar/e i/e Illyrian Brains Network.\n\n— TË DHËNAT —\nEmri dhe mbiemri:\nQyteti dhe shteti ku jetoj:\nProfili në LinkedIn (i detyrueshëm):\n\n— RRUGA PROFESIONALE —\nProfesioni / fusha:\nPozicioni dhe organizata aktuale:\nNjë histori e shkurtër e rrugës sime profesionale (3–5 fjali):\n\n— PËRVOJA ME RRJETE TË NGJASHME —\nShoqata, rrjete profesionale, organizata të diasporës apo grupe vullnetare ku kam qenë aktiv/e, dhe roli im (nëse ka):\n\n— KONTRIBUTI —\nSi dua të kontribuoj (organizator në qytet / ekip / projekt):\nJam student/e ose prind i ri dhe kërkoj kuotë të reduktuar (po/jo):\nPranoj kuotën vjetore prej €30 dhe të veproj në përputhje me Statutin (po/jo):\n\nFaleminderit!',
  },
  organizeCity: {
    subject: 'Organizim i qytetit',
    body: 'Përshëndetje,\n\nDua të organizoj Illyrian Brains në qytetin tim.\n\nQyteti dhe shteti:\nEmri im:\nEkipi fillestar (emrat dhe rolet):\nSa profesionistë shqiptarë njohim atje (përafërsisht):\nIdeja për takimin e parë:\nKontakti (email / telefon):',
  },
  partnerNgo: {
    subject: 'Bashkëpunim si OJF',
    body: 'Përshëndetje,\n\nDuam të bashkëpunojmë me Illyrian Brains si OJF.\n\nEmri i organizatës:\nVendi:\nFaqja e internetit:\nLinkedIn:\nPersoni i kontaktit:\nEmail-i i kontaktit:\nÇfarë bën organizata (shkurt):\nLloji i bashkëpunimit (rrjetëzim / event i përbashkët / projekt i përbashkët / Atlas, Mentorimi ose Heritage / donacion):\nIdeja për bashkëpunim:\nAfati i dëshiruar:',
  },
  partnerBusiness: {
    subject: 'Bashkëpunim si biznes',
    body: 'Përshëndetje,\n\nDuam të bashkëpunojmë me Illyrian Brains si biznes.\n\nEmri i biznesit:\nVendi:\nFaqja e internetit:\nLinkedIn:\nPersoni i kontaktit:\nEmail-i i kontaktit:\nLloji i bashkëpunimit (ofertë ose kupon për anëtarët / sponsorizim / donacion / mundësi pune / ekspertizë):\nPërshkrim i shkurtër:',
  },
  eventIdea: {
    subject: 'Ide për një event',
    body: 'Përshëndetje,\n\nKam një ide për një event me Illyrian Brains.\n\nEmri:\nQyteti:\nÇfarë dua të bëj (event në qytet / webinar / lidhje me dikë / tjetër):\nPërshkrimi i shkurtër:\nKontakti (email / telefon):',
  },
  joinQuestion: {
    subject: 'Pyetje rreth përfshirjes në rrjet',
    body: 'Përshëndetje,\n\nEmri:\nQyteti:\nSi dëshiroj të përfshihem:\nPyetja ime:',
  },
} satisfies Record<string, EmailTemplate>;
