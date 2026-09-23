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
    body: 'Përshëndetje,\n\nDua të bëhem pjesë e Miqve të Rrjetit me një donacion mujor.\n\nEmri:\nShuma mujore (€):\nMuaji i fillimit:\nQyteti ku jetoj (për ftesat në evente):\nA dëshiron që emri yt të përmendet në listën e Miqve të Rrjetit në raportin vjetor? (po/jo):\n\nFaleminderit!',
  },
  organizeCity: {
    subject: 'Organizim i qytetit',
    body: 'Përshëndetje,\n\nDua të organizoj Illyrian Brains në qytetin tim.\n\nQyteti dhe shteti:\nEmri im:\nEkipi fillestar (emrat dhe rolet):\nSa profesionistë shqiptarë njohim atje (përafërsisht):\nIdeja për takimin e parë:\nKontakti (email / telefon):',
  },
  partnerNgo: {
    subject: 'Bashkëpunim si OJF',
    body: 'Përshëndetje,\n\nDuam të bashkëpunojmë me Illyrian Brains si OJF.\n\nEmri i organizatës:\nVendi dhe faqja e internetit:\nPersoni i kontaktit:\nÇfarë bën organizata (shkurt):\nIdeja për bashkëpunim (event / projekt / shkëmbim ekspertize):\nAfati i dëshiruar:',
  },
  partnerBusiness: {
    subject: 'Bashkëpunim si biznes',
    body: 'Përshëndetje,\n\nDuam të bashkëpunojmë me Illyrian Brains si biznes.\n\nEmri i biznesit:\nVendi dhe faqja e internetit:\nPersoni i kontaktit:\nLloji i bashkëpunimit (ofertë për anëtarët / mundësi pune / sponsorizim):\nPërshkrim i shkurtër:',
  },
  joinQuestion: {
    subject: 'Pyetje rreth përfshirjes në rrjet',
    body: 'Përshëndetje,\n\nEmri:\nQyteti:\nSi dëshiroj të përfshihem:\nPyetja ime:',
  },
} satisfies Record<string, EmailTemplate>;
