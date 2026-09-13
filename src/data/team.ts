export interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  linkedin?: string;
}

export const board: TeamMember[] = [
  { name: 'Doren Çalliku', role: 'Anëtar i Bordit, Digjitalizimi, Kryetar', bio: 'Inxhinier i gjeoshkencave me eksperiencë në teknologji dhe transformim digjital. Kontribues i hershëm i rrjetit dhe pjesë aktive e zhvillimit të infrastrukturës teknike dhe iniciativave të rrjetit. Pjesë e IB-Berlin.', linkedin: 'https://linkedin.com/in/pomodoren' },
  { name: 'Endri Basha', role: 'Anëtar i Bordit, Komunikimi, Themelues', bio: 'Sociolog dhe analist tregu me interes të veçantë për komunitetet, rrjetet profesionale dhe zhvillimin organizativ. Ndër themeluesit e rrjetit dhe kontribues i vazhdueshëm në rritjen dhe orientimin e tij ndër vite. Pjesë e IB-Milano.', linkedin: 'https://www.linkedin.com/in/endribasha/' },
  { name: 'Erda Hoxha', role: 'Anëtare e Bordit, Financat', bio: 'Profesioniste e financës dhe asistente pedagoge me përvojë në menaxhim dhe organizim. E angazhuar në zhvillimin institucional të rrjetit dhe në krijimin e praktikave të qëndrueshme për organizatën. Pjesë e IB-Tiranë.', linkedin: 'https://linkedin.com/in/erda-hoxha' },
  { name: 'Joni Pjetri', role: 'Anëtar i Bordit, Nismat', bio: 'Solution Architect dhe sipërmarrës me eksperiencë në teknologji, strategji dhe komunikim. Organizator aktiv i komunitetit dhe mbështetës i nismave që lidhin profesionistët shqiptarë brenda dhe jashtë vendit. Pjesë e IB-Tiranë.', linkedin: 'https://linkedin.com/in/jonipjetri' },
  { name: 'Klaudia Meta', role: 'Anëtare e Bordit, Grupet Tematike', bio: 'Inxhiniere ndërtimi me mbi dhjetë vite eksperiencë profesionale në projekte dhe koordinim. E përfshirë në mbështetjen e nismave që forcojnë bashkëpunimin mes anëtarëve të rrjetit. Pjesë e IB-London.', linkedin: 'https://linkedin.com/in/klaudiameta' },
  { name: 'Lirijeta Rexhepi', role: 'Anëtare e Bordit, Bashkëpunimet', bio: 'Property Manager me përvojë ndërkombëtare dhe angazhim të vazhdueshëm. Ka kontribuar në organizimin e aktiviteteve, krijimin e partneriteteve dhe forcimin e lidhjeve mes profesionistëve shqiptarë. Pjesë e IB-New York.', linkedin: 'https://linkedin.com/in/lirijeta-rexhepi-leci' },
  { name: 'Sindi Ramaliu', role: 'Anëtare e Bordit, Ekipet', bio: 'Finance Analyst dhe menaxhere komunitetesh me interes në zhvillimin e rrjeteve profesionale dhe nismave bashkëpunuese. Kontribuon në disa prej ekipeve të punës. Pjesë e IB-Milano.', linkedin: 'https://linkedin.com/in/sindi-ramaliu' },
];

export const contributors: TeamMember[] = [
  { name: 'Alban Kora', role: 'Tech', bio: 'Software Architect, me eksperiencë si devops dhe zhvillim programesh kompjuterike. Jep kontribut për zhvillimin e shërbimeve të rrjetit dhe mirëmbajtjen e infrastrukturës teknologjike. Pjesë e IB-London.', linkedin: 'https://linkedin.com/in/albankora' },
  { name: 'Olta Bici', role: 'Eventet', bio: 'IT Project Manager, me mbi 15 vite eksperiencë në fushën e teknologjisë. Jep kontributin që eventet e IB të standardizohen dhe komunikimi rreth tyre të përmirësohet me anë të platformës. Pjesë e IB-Firenze.', linkedin: 'https://it.linkedin.com/in/oltabici' },
  // bio not yet written on the source site
  { name: 'Silvi Bici', role: 'Social Media', linkedin: 'https://it.linkedin.com/in/silvi-bici-9012b3117' },
  // bio not yet written on the source site; LinkedIn omitted — the live page links this
  // profile to Sindi Ramaliu's LinkedIn by mistake (logged in bugs.csv)
  { name: 'Vullnet Veliaj', role: 'Social Media' },
];
