export interface StatutiArticle {
  number: number;
  title: string;
  clauses: string[];
}

// Full text of the registered NGO statute (Neni 1-25), reproduced verbatim from
// illyrianbrains.org/statuti. Edit only to correct a transcription error — this is a
// legal document, not marketing copy.
export const statutiIntro: string[] = [
  'Statuti',
  'Proçesi i regjistrimit:',
  'Dorëzuar kërkesa për regjistrim',
  'Në mbështetje të legjislacionit civil shqiptar dhe kryesisht në ligjin nr. 8788, datë 07/05/2001 “Për organizatat Jofitimprurëse” dhe ligjin nr. 80/2021 “Për Regjistrimin e Organizatave Jofitimprurëse” të ndryshuar, anëtarët themelues hartojnë dhe miratojnë Statutin e shoqatës Jofitimprurëse të emërtuar “Illyrian Brains Network”.',
  'Shoqata fiton personalitetin e saj juridik në momentin e rregjistrimit të saj në gjykatë sipas parashikimeve të ligjit nr. 80/2021 “Për Regjistrimin e Organizatave Jofitimprurëse” të ndryshuar.',
];

export const statutiArticles: StatutiArticle[] = [
  {
    number: 1,
    title: 'Emërtimi i shoqatës',
    clauses: [
      '1.1. Emërtimi i shoqatës në gjuhën shqipe është “Illyrian Brains Network”.',
      '1.2. Emërtimi i shoqatës në marrëdhëniet e saj me persona fizikë apo juridikë apo shtete të huaja do të jetë në gjuhën angleze: Illyrian Brains Network.',
      '1.3. Më poshtë, në tekstin e këtij Akti Themelimi, shkurtimisht do të referohet si “Shoqata” .',
    ],
  },
  {
    number: 2,
    title: 'FORMA E ORGANIZIMIT',
    clauses: [
      '2.1. Individët e renditur në nenin 7 të këtij Statuti, referuar si “anëtarët”, të cilët në bazë të Ligjit Nr. 7850, datë 27.09.1994 “Për Kodin Civil të Republikës së Shqipërisë”, i ndryshuar, Ligji Nr. 8788, datë 7.5.2001 “Për organizatat jofitimprurëse” i ndryshuar, dhe Ligjin Nr. 80/2021 “Për Regjistrimin e Organizatave Jofitimprurëse”, të ndryshuar, shprehin vullnetin e tyre të lirë dhe të plotë për të themeluar organizatën jofitimprurëse me anëtarësi me emërtimin “Illyrian Brains Network” dhe nënshkruan Aktin e Themelimit si dhe këtë Statut, me kushtet e mëposhtme.',
    ],
  },
  {
    number: 3,
    title: 'VULA DHE EMBLEMA E SHOQATËS',
    clauses: [
      '3.1. Shoqata ka simbolin e vet. Vula e “Illyrian Brains Network” do të përmbajë të shkruar “Illyrian Brains Network”.',
      '3.2. Shoqata do të ketë edhe logon e saj, e cilat do të shoqërojë të gjithë dokumentacionin dhe publikimet e shoqatës.',
    ],
  },
  {
    number: 4,
    title: 'SELIA DHE DEGËT',
    clauses: [
      '4.1. “Illyrian Brains Network” e ka selinë në Tiranë, Shqipëri, në adresën: Gener 2, Rruga "Jordan Misja" ("Mihal Hanxhari"), apartamenti C-02-02, Tiranë, Shqipëri;',
      '4.2. Veprimtaria e saj do të shtrihet në të gjithë territorin e Republikës së Shqipërisë. Me propozim të Bordit Drejtues dhe me vendim të Asamblesë së saj, Shoqata mund të ndryshojë adresën e selisë së saj. Shoqata gjithashtu mund të hapë degë të saj në Shqipëri, apo të themelojë shoqata të huaja apo të anëtarësohet në shoqata të huaja dhe jashtë Shqipërisë.',
    ],
  },
  {
    number: 5,
    title: 'KOHËZGJATJA E SHOQATËS',
    clauses: [
      '5.1. Kohëzgjatja e Shoqatës është e pa përcaktuar. Kohëzgjatja mund të përcktohet vetëm me vendim të Asamblesë së shoqatës.',
    ],
  },
  {
    number: 6,
    title: 'QËLLIMI DHE FUSHA E VEPRIMTARISË',
    clauses: [
      '6.1. “Illyrian Brains Network” është një Shoqatë joqeveritare, jo politike, jo fetare, jofitimprurëse me anëtarësi.',
      '6.1.1. Qëllimi i shoqatës do të jetë: ​a. Promovimi i arsimit, kërkimit dhe kuptimit profesional të shkencës, teknologjisë, inxhinierisë, kulturës dhe inovacionit social, veçanërisht midis komunitetit shqiptar dhe atyre ndërkombëtarë; ​b. Nxitja e rrjetit kulturor dhe profesional përmes aktiviteteve gjithëpërfshirëse dhe aktiviteteve të përbashkëta që festojnë dhe i përkushtohen diversitetit, kreativitetit dhe komunitetin të profesionistëve, studentëve dhe bizneseve; ​c. Veprimtari që synon lehtësimin e integrimit dhe pjesëmarrjen aktive të profesionistëve dhe komuniteteve të diasporës në shoqëritë e tyre lokale përkatëse, duke promovuar mirëkuptimin e ndërsjelltë, shkëmbimin e ideve dhe eksperiencave profesionale dhe bashkëpunimin mes tyre; ​d. Promovimi dhe mbështetja me cdo formë e transferimit të njohurive, aftësive dhe burimeve drejt komuniteteve dhe vendeve të rezidencës të anëtarëve të shoqatës në ​diasporë, duke forcuar kështu zhvillim kulturor të qëndrueshëm, vazhdimësinë kulturore dhe inovacionin gjithëpërfshirës në ato vende; dhe ​e. Zhvillimi i aktiviteteve për të mbështetur njohjen, ruajtjen dhe shprehjen bashkëkohore të kulturës brenda komuniteteve lokale dhe ndërkombëtare për të inkurajuar shkëmbimin kulturor. ​f. Ndërmarrja e çdo aktiviteti tjetër që Bordi Drejtues e konsideron të favorshëm për arritjen e objektivave të mësipërme, në përputhje me legjislacionin që rregullon veprimtarinë e organizatave jofitimprurëse. ​g. Shoqata për përmbushjen e qëllimeve të saj, ka të drejtë të ushtrojë veprimtari në të gjithë territorin e Shqipërisë. Shoqata për këtë arsye, mund të hapë degë apo zyra anëtare e organizatave të tjera jofitimprurëse vendase apo të huaja, si brenda ashtupërfaqësimi dhe në adresa të tjera, brenda apo jashtë vendit si dhe mund të jetë ​dhe jashtë vendit.',
    ],
  },
  {
    number: 7,
    title: 'THEMELUESIT',
    clauses: [
      '7.1. Themeluesit e shoqatës të emërtuar “Illyrian Brains Network”, që do të përbëjnë Asamblenë e parë të shoqatës, janë: 7.1.1. SINDI RAMALIU, .... 7.1.2. JONI PETRI, .... 7.1.3. KLAUDIA META, ... 7.1.4. ERDA HOXHA, .... 7.1.5. ENDRI BASHA, .... 7.1.6. DOREN ÇALLIKU ...',
    ],
  },
  {
    number: 8,
    title: 'ANËTARËSIA – ANËTARËSIMI, PROCEDURA DHE KRITERET – KUOTA E ANËTARËSIMIT',
    clauses: [
      '8.1. Anëtarësia e shoqatës, përbëhet nga themeluesit e saj si dhe nga anëtarë të rinj.',
      '8.2. Antarësimi në Shoqatë është vullnetar.',
      '8.3. Anëtar i shoqatës mund të jetë çdo individ apo person fizik apo sipërmarrje, që vlerësohet se ndan dhe ndjek qëllimet e shoqatës. Në rastin e anëtarit/sipërmarrje, ky i fundit përfaqësohet në asamblenë e shoqatës nga përfaqësuesi i saj ligjor.',
      '8.4. Çdo anëtar themelues apo/dhe i hyrë rishtazi në shoqatë ka detyrim të paguajë një kuotë vjetore për anëtarësim (Kuota e Anëtarësimit). Kuota vjetore do të përcaktohet me vendim të Bordit Drejtues të shoqatës. Mos pagesa e kuotës së anëtarësimit në shoqatë, është arsye për përjashtimin e anëtarit debitor.',
      '8.5. Kërkesa për anëtarësim i drejtohet Bordit Drejtues të shoqatës sipas formatit të miratuar nga Bordi Drejtues i shoqatës.',
      '8.6. Në kërkesën për anëtarësim në shoqatë përcaktohet kuota, si dhe një deklaratë ku kërkuesi bie dakort të veprojë në përputhje me ligjin, statutin dhe rregullat e tjera të shoqatës.',
      '8.7. Bordi Drejtues pasi ushtron kontrollin paraprak të kërkesës për anëtarësim, miraton kërkesën dhe ja përcjell Asamblesë së shoqatës për informim.',
      '8.8. Anëtari i ri i shoqatës e fiton cilësinë e anëtarit pas miratimit të kërkesës së tij për anëtarësim nga Bordi i shoqatës apo prej grupeve të punës të deleguara prej tij.',
      '8.9. E drejta e anëtarësisë në shoqatë nuk mund të tjetërsohet dhe as nuk mund të kalohet me trashëgimi.',
      '8.10. Shoqata promovon një mjedis gjithëpërfshirës, të hapur dhe mbështetës për të gjithë anëtarët dhe kontribuesit e saj. Shoqata angazhohet: - të sigurojë pjesëmarrje të barabartë dhe pa diskriminim, pavarësisht gjinisë, origjinës, profesionit, vendndodhjes gjeografike apo çdo karakteristike tjetër; - të inkurajojë diversitetin profesional, kulturor dhe ndërkombëtar në aktivitetet dhe strukturat e saj; - të krijojë një mjedis bashkëpunues dhe respektues ndërmjet anëtarëve dhe kontribuesve; - të mbështesë zhvillimin profesional dhe personal të anëtarëve dhe kontribuesve përmes aktiviteteve, programeve dhe iniciativave të saj; - Bordi Drejtues mund të miratojë rregulla dhe udhëzime të mëtejshme për garantimin e këtyre parimeve.',
      '8.11. Shoqata nuk toleron sjellje diskriminuese, përjashtuese apo abuzive dhe mund të marrë masa në përputhje me rregullat e saj të brendshme.',
    ],
  },
  {
    number: 9,
    title: 'E DREJTA E VOTËS E ANËTARIT',
    clauses: [
      '9.1. Kategoritë e anëtarësisë: Shoqata përbëhet nga këto kategori anëtarësh: - Anëtarë pa të drejtë vote, të cilët marrin pjesë në veprimtarinë e shoqatës dhe përfitojnë nga aktivitetet e saj, por nuk kanë të drejtë vote në Asamble; - Anëtarë me të drejtë vote, të cilët marrin pjesë në vendimmarrjen e Asamblesë dhe ushtrojnë të drejtën e votës; 9.2. E drejta e votës: Çdo anëtar me të drejtë vote ka të drejtën e një vote të barabartë për çështjet e shtruara për votim në Asamble. 9.3. Fitimi i të drejtës së votës: Kalimi nga anëtar pa të drejtë vote, në anëtar me të drejtë vote bëhet mbi bazën e: - pjesëmarrjes aktive në veprimtarinë e shoqatës për të paktën 1 (një) vit; - përmbushjes së detyrimeve financiare (kuota e anëtarësimit); - kontributit të vazhdueshëm në zhvillimin e veprimtarisë së shoqatës, përfshirë pjesëmarrjen në projekte, grupe pune ose iniciativa të tjera; Statusi i anëtarit me të drejtë vote propozohet nga Bordi Drejtues dhe miratohet nga Asambleja. Në dhënien e statusit të anëtarit me të drejtë vote, Bordi Drejtues merr në konsideratë nevojën për të siguruar një përfaqësim të balancuar dhe proporcional të kontributit të komunitetit në veprimtarinë e shoqatës. 9.4. Rishikimi i statusit të anëtarëve: Bordi Drejtues shqyrton dhe propozon rishikimin e statusit të anëtarëve të paktën një herë në vit, me qëllim ruajtjen e një përfaqësimi të balancuar dhe aktiv të komunitetit. Çdo ndryshim i statusit të anëtarësisë miratohet nga Asambleja.',
      '9.5. Anëtarët themelues, janë anëtarë me të drejtë vote.',
    ],
  },
  {
    number: 10,
    title: 'DORËHEQJA E ANËTARIT',
    clauses: [
      '10.1. E drejta e çdo anëtari të shoqatës për të dhënë dorëheqjen është e garantuar.',
      '10.2. Dorëheqja kërkohet me kërkesë drejtuar Bordit Drejtues dhe ka efekt të menjëhershëm, nga dita e dorëzimit te Bordi Drejtues ose në adresën e email apo adresën e selisë të shoqatës.',
      '10.3. Kërkesa për dorëheqje, i përcillet Asamblesë në mbledhjen pasardhëse, e cila në vendim të saj, konfirmon vërtetësinë e kërkesës për dorëheqje dhe pasi e miraton, urdhëron çregjistrimin e anëtarit nga shoqata.',
      '10.4. Anëtari i shoqatës që jep dorëheqjen nuk shkarkohet nga detyrimet e tij ndaj shoqatës në lidhje me pagesën e kuotës së papaguar.',
    ],
  },
  {
    number: 11,
    title: 'PËRFUNDIMI I ANËTARËSISË',
    clauses: [
      '11.1. Anëtarësia e një anëtari të shoqatës, përfundon me vendim të Asamblesë të shoqatës, në rastet kur, ​i. Jep dorëheqjen, ​ii. Ka ndërruar jetë, ​iii. Ka humbur zotësinë juridike, ​iv. Përjashtohet nga shoqata me vendim të Asamblesë për çdo shkak tjetër të ligjshëm. ​v. E ka të pamundur të mbajë cilësinë e anëtarit të shoqatës për cdo shkak tjetër të ligjshëm.',
      '11.2. Bordi Drejtues, pas vlerësimit nga ana e tij të shkaqeve të përfundimit të anëtarësisë apo të përjashtimit, i drejton Asamblesë kërkesë për përfundim të anëtarësisë të një anëtari për arsyet e përmendura në këtë nen apo çdo arsye tjetër sipas këtij statuti. Kërkesa shoqërohet me relacionin përkatës.',
      '11.3. Shkaqe të ligjshme mbi bazën e të cilave mund të kërkohet nga Bordi Drejtues, përjashtimi nga shoqata i një anëtari të saj, renditen në mënyrë jo shteruese si më poshtë vijon: i. Shkelje te dispozitave të statutit ose rregullave të tjera të shoqatës ii. Mospagimi i detyrimeve nga kuota e anëtarësimit iii. Kryerja e veprimeve që bien në kundërshtim të hapur me normat etike të shoqatës iv. Kryerja e veprimeve që dëmtojne interesat e shoqatës, v. Një dënim gjykate të formës së prerë për kryerjen e veprave penale.',
      '11.4. Shkaqet e ligjshme për përjashtim të anëtarit mund të bëhen të ditura te shoqata ose Bordi i Drejtues i shoqatës në çdo mënyrë dhe nga cdo kush, anëtar apo jo anëtar i shoqatës.',
      '11.5. Kërkesa për përjashtim e Bordit Drejtues, shqyrtohet nga Asambleja e shoqatës në mbledhjen e saj të radhës. Asambleja ka të drejtë të miratojë apo të mos miratojë kërkesën e Bordit për përjashtim të anëtarit.',
    ],
  },
  {
    number: 12,
    title: 'ORGANET DREJTUESE DHE KOMPETENCAT E TYRE. NDRYSHIMI I ORGANEVE DREJTUESEPËRBËRJA E TYRE, RREGULLAT PËR MBAJTJEN E MBLEDHJES, PJESËMARRJA, PROCEDURAT DHE NDRYSHIMI I ORGANEVE DREJTUESE',
    clauses: [
      '12.1. Organet drejtuese të shoqatës janë i. Mbledhja e Përgjithshme e anëtarësisë (Asambleja). ii. Bordi Drejtues. iii. Drejtori Ekzekutiv.',
    ],
  },
  {
    number: 13,
    title: 'ASAMBLEJA, KOMPETENCAT E SAJ',
    clauses: [
      '13.1. Mbledhja e Përgjithshme e anëtarësisë (Asambleja) është organi më i lartë vendimmarrës i shoqatës.',
      '13.2. Në mbledhjen e asamblesë së përgjithshme të shoqatës marrin pjesë të gjithë anëtarët e saj.',
      '13.3. Pjesëmarrja në mbledhjen e asamblesë së përgjithshme të anëtarëve të shoqatës nuk mund të ndalohet për asnjë anëtar të shoqatës. Pjesëmarrja në mbledhje mund të ndalohet vetëm në rastin kur anëtari në ditën e mbledhjes është debitor kundrejt shoqatës për kuotën e anëtarësisë. Nëse kuota paguhet me ditën dhe orën e mbledhjes, atëherë anëtari lejohet të marrë pjesë.',
      '13.4. Asambleja e shoqatës, përfaqëson universalitetin e anëtarëve dhe vendimet e saj konform ligjeve në fuqi dhe të këtij statuti, janë të detyrueshme për të gjithë anëtarët dhe organet e tjera të shoqatës.',
      '13.5. Asambleja e shoqatës vendos në përputhje me nenin 20 të ligjit 8788 datë 7.5.2001 Për organizatat jofitimprurëse, të ndryshuar, përveç çështjeve të tjera që çmon se duhet të shqyrtohen prej tij, vendos për: 1) ndryshimin e statutit, emërtimit dhe selisë së shoqatës; 2) shpërbërjen dhe likuidimin e shoqatës; 3) miratimin e raporteve vjetore të veprimtarisë dhe financiare; 4) pranimin dhe përjashtimin e anëtarëve, mbi propozimin e Bordit Drejtues; 5) nxjerr norma për rregullimin e veprimtarisë, të organizimit dhe të strukturës së organizatës; 6) emëron anëtarët e Bordit Drejtues të shoqatës dhe përcakton kompetencat e tij; 7) vendos edhe për çështje të tjera të parashikuara shprehimisht në ligj ose në statut.',
    ],
  },
  {
    number: 14,
    title: 'PROCEDURAT, THIRRJA, KUORUMI DHE VENDIMET E MBLEDHJES SË ASAMBLESË',
    clauses: [
      '14.1. Thirrja: Mbledhja e Asamblesë mbahet si rregull cdo vit, në kohën dhe vendin e caktuar nga organi që e thërret. Mbledhja e Asamblesë mund të thirret edhe në çdo kohë: me kërkesë të të paktën 20% të anëtarëve të shoqatës ose 20 (njëzet) anëtarëve, cilido që është më i vogël, në përputhje me këtë statut; me vendim të Bordit Drejtues, për çështje që kërkojnë trajtim urgjent ose kur vlerësohet e nevojshme marrja e një vendimi nga Asambleja. Në rast të paraqitjes së kërkesës nga anëtarët, mbledhja e Asamblesë thirret brenda 30 (tridhjetë) ditëve nga data e paraqitjes së saj. 14.2. Njoftimi i thirrjes: Thirrja e asamblesë u njoftohet anëtarëve të saj, të paktën 30 (tridhjetë) ditë përpara datës së caktuar. Ky njoftim përmban, ditën e javës, datën, orën dhe vendin e mbledhjes si dhe çështjet e rendit të ditës të mbledhjes së njoftuar. 14.3. Çështje të rendit të ditës: Cështjet e rendit të ditës për cdo mbledhje të asamblesë u njoftohen anëtarëve të shoqatës në përmbajtje të njoftimit të thirrjes. Në këtë njoftim, u bëhet e ditur të gjithë anëtarëve e drejta për të shtuar çështje të rendit të ditës që të diskutohen në mbledhje. Çdo anëtar ka detyrimin të njoftojë një çështje të re deri 10 ditë para datës së zhvillimit të mbledhjes. Komunikimet mes shoqatës dhe anëtarëve për këtë arsye, bëhen nëpërmjet adresave të email të deklaruara nga çdo anëtar i shoqatës apo mjeteve të përcaktuara të një funksioni të ngjashëm. Komunikimet sipas këtij parashikimi bëhen gjithmonë në grup, ku shoqata e njofton thirrjen dhe çështjet e rendit të ditës si dhe çdo komunikim tjetër, të gjithë anëtarëve të saj njëherësh. Për çështjet e reja të shtuara nga cdo anëtar (në rast se ka) konsiderohet se janë njoftuar anëtarët e tjerë dhe nuk nevojitet njoftim tjetër që të merren në diskutim në mbledhje. 14.4. Procedura e mbledhjes: Mbledhja e Asamblesë drejtohet nga Kryetari i Bordit Drejtues. Kryetari i mbledhjes kryeson mbledhjen e asamblesë dhe cakton për çdo mbledhje, sekretarin e saj. Sekretari i mbledhjes, mban procesverbalin e mbledhjes. 14.5. Kuorumi i pjesëmarrjes në mbledhje të Asamblesë: Që Asambleja të marrë çdo vendim të saj, në mbledhje të saj duhet të marrin pjesë të paktën 1/2 e të gjithë anëtarëve të saj +1 me të drejtë vote. 14.6. Votimi në Asamble: Asambleja merr vendime me votim jo të fshehtë. Vendimet janë të vlefshme kur miratohen me shumicën e votave të anëtarëve të pranishëm, në përmbushje të kuorumit sipas pikës 14.5 të këtij neni. 14.7. Vendimet me shumicë të cilësuar: Për çështje me rëndësi të veçantë, Asambleja merr vendime me shumicë të cilësuar prej të paktën 3/4 (tre të katërtat) e votave të anëtarëve të pranishëm me të drejtë vote. Vendimet me shumicë të cilësuar kërkohen për: - ndryshimin e statutit; - ndryshimin e emërtimit dhe selisë së shoqatës; - shpërbërjen dhe likuidimin e shoqatës; Asambleja mund të përcaktojë edhe çështje të tjera që kërkojnë shumicë të cilësuar, në përputhje me këtë statut. 14.8. Votimi i zgjatur (me pjesëmarrje elektronike): Në rastet kur votimi nuk përfundon gjatë mbledhjes, Asambleja mund të vendosë që votimi të mbetet i hapur për një periudhë deri në 3 (tre) ditë nga momenti i hapjes së votimit. Në këtë rast, votat mund të jepen edhe nëpërmjet mjeteve elektronike të komunikimit. Rezultati i votimit përcaktohet mbi bazën e votave të anëtarëve me të drejtë vote që kanë votuar brenda këtij afati. 14.9. Përfaqësimi në mbledhjen e Asamblesë. Anëtari i shoqatës mund të përfaqësohet në mbledhje të asamblesë dhe nga një anëtar tjetër i shoqatës apo një person tjetër. Përfaqësimi në asamble lejohet vetëm me prokurë noteriale e cila vlen vetëm për një mbledhje asambleje e cila përcaktohet në prokurë.',
    ],
  },
  {
    number: 15,
    title: 'BORDI DREJTUES, ZGJEDHJA – MANDATI - KOMPETENCAT E BORDIT DREJTUES',
    clauses: [
      '15.1. Përbërja: Bordi Drejtues përbëhet nga 5 (pesë) anëtarë të zgjedhur nga Asambleja. Bordi mund të ftojë deri në 2 (dy) anëtarë shtesë për të kontribuar në punën e tij, në funksion të diversitetit profesional dhe përfaqësimit ndërkombëtar. 15.2. Emërimi: Anëtarët e Bordit Drejtues të zgjedhur nga Asambleja emërohen me vendim të saj, në përputhje me kuorumin dhe rregullat e votimit të parashikuara në nenin 14 të këtij statuti. Anëtarët shtesë të Bordit Drejtues emërohen me vendim të vetë Bordit Drejtues, të marrë me shumicë votash të anëtarëve të tij. 15.3. Mandati: Mandati i anëtarëve të Bordit Drejtues është 2 vjeçar me të drejtë rizgjedhje. Mandati i anëtarit të Bordit Drejtues mund të mbarojë përpara afatit për shkak të dorëheqjes, vdekjes, përjashtimit për çdo arsye, apo për çdo arsye tjetër të ligjshme. 15.4. Kompetencat e Bordit Drejtues të shoqatës: Bordi Drejtues ka këto kompetenca: ​i. zgjedh kryetarin dhe zv.kryetarin e tij; ​ii. përcakton strategjinë, drejtimin dhe programet e veprimtarisë së shoqatës; ​iii. miraton programin vjetor dhe buxhetin; ​iv. miraton marrëveshje, kontrata dhe angazhime financiare; ​v. emëron dhe shkarkon Drejtorin Ekzekutiv, si dhe përcakton kompetencat dhe kufijtë e përfaqësimit të tij; ​vi. mbikëqyr veprimtarinë financiare, administrative dhe zbatimin e programeve; ​vii. përfaqëson shoqatën në marrëdhënie strategjike dhe bashkëpunime; ​viii. krijon komitete dhe grupe pune, si dhe përcakton përgjegjësitë e tyre; ​ix. mbështet dhe mbikëqyr veprimtarinë e grupeve të punës; ​x. përgatit raportin vjetor të veprimtarisë dhe e paraqet për miratim në Asamble; ​xi. përcakton mënyrën e administrimit të të ardhurave dhe burimeve të shoqatës; ​xii. miraton hapjen e degëve, zyrave të përfaqësimit dhe bashkëpunimet me organizata të tjera; ​xiii. miraton punësimin e personelit dhe marrëdhëniet juridike me palë të treta; ​xiv. propozon pranimin dhe përjashtimin e anëtarëve për miratim nga Asambleja; ​xv. siguron funksionimin e hapur, transparent dhe gjithëpërfshirës të shoqatës; ​xvi. ushtron çdo kompetencë tjetër që nuk i përket Asamblesë. 15.5. Përfaqësues të Bordit pranë strukturave të shoqatës: Bordi Drejtues mund të caktojë, sipas nevojës, anëtarë të tij si përfaqësues të Bordit pranë grupeve të punës, Qyteteve të rrjetit ose strukturave të tjera të shoqatës, për të mbështetur komunikimin dhe koordinimin e veprimtarisë së tyre me drejtimin strategjik të shoqatës. Këta përfaqësues ndjekin zhvillimin e veprimtarisë së strukturave përkatëse, lehtësojnë komunikimin me Bordin Drejtues dhe kontribuojnë në përafrimin e veprimtarisë së tyre me qëllimet e shoqatës. Bordi Drejtues përcakton fushën e angazhimit dhe kohëzgjatjen e këtyre përgjegjësive. Përfaqësuesit veprojnë në funksion mbështetës dhe nuk ushtrojnë kompetenca vendimmarrëse të pavarura mbi strukturat përkatëse. 15.6. Mbledhjet e Bordit Drejtues: Bordi Drejtues mund të mblidhet me kërkesë të Drejtorit Ekzekutiv apo dhe të gjysmës së anëtarëve të tij. Mbledhjet e Bordit Drejtues janë të rregullta kur marrin pjesë më shumë se gjysma e anëtarëve të tij. 15.7. Vendi i mbledhjes: Bordi mund të mblidhet: - në selinë e saj qendrore në Tiranë, - jashtë kësaj selie në çdo vend të caktuar në thirrje, kur këtë e miratojnë më shumë se gjysma e anëtarëve të Bordit, - nëpërmjet mjeteve elektronike të komunikimit, duke siguruar identifikimin e pjesëmarrësve dhe mundësinë e tyre për të marrë pjesë në diskutim dhe vendimmarrje në kohë reale. Vendimet e marra në këto mbledhje kanë të njëjtën vlefshmëri si ato të marra në mbledhje fizike. 15.8. Kuorumi: Të gjitha Vendimet e Bordit Drejtues janë të ligjshme kur në mbledhje marrin pjesë më shumë se 1/2 e anëtarëve të tij. 15.9. Votimi: Bordi Drejtues merr vendime të vlefshme në cdo rast, me shumicë të thjeshtë të numrit të anëtarëve pjesëmarrës në mbledhje të Bordit. Në rast se votat janë të barabarta, vota e kryetarit të Bordit Drejtues të shoqatës konsiderohet vendimtare në marrjen e vendimit përkatës. 15.10. Vendimmarrja me qarkullim: Bordi Drejtues mund të marrë vendime edhe pa zhvilluar mbledhje fizike ose elektronike, përmes komunikimit me shkrim (përfshirë email ose mjete të tjera elektronike). Propozimi për vendim u dërgohet të gjithë anëtarëve të Bordit dhe konsiderohet i miratuar nëse merr shumicën e votave të anëtarëve, brenda një afati të arsyeshëm të përcaktuar në komunikim. Vendimet e marra në këtë mënyrë kanë të njëjtën vlefshmëri si vendimet e marra në mbledhje. 15.11. Përfaqësimi në mbledhjen e Bordit. Anëtari i Bordit mund të përfaqësohet në mbledhje të Bordit dhe nga një anëtar tjetër i bordit. Përfaqësimi në mbledhje të bordit drejtues lejohet vetëm me prokurë noteriale e cila vlen vetëm për një mbledhje bordi e cila përcaktohet në prokurë. 15.12. Konflikti i interesit. Anëtarët e Bordit Drejtues veprojnë në interesin më të mirë të shoqatës dhe shmangin konfliktet e interesit. Ata deklarojnë çdo angazhim profesional, politik apo institucional që mund të ndikojë në paanshmërinë e tyre. Në rast konflikti interesi, anëtari përkatës përjashtohet nga diskutimi dhe vendimmarrja për çështjen përkatëse. Në rast shkeljesh të rënda, Bordi Drejtues mund të propozojë shkarkimin e anëtarit, ndërsa vendimi merret nga Asambleja. 15.13. Raportimi. Një grup prej të paktën 10% të anëtarëve të shoqatës ose 10 (dhjetë) anëtarë, cilido që është më i vogël, mund të paraqesë me shkrim kërkesë për raportim zyrtar nga Bordi Drejtues mbi çështje të veçanta të veprimtarisë së tij. Bordi Drejtues është i detyruar të japë përgjigje brenda 60 (gjashtëdhjetë) ditëve nga marrja e kërkesës dhe, kur është e nevojshme, ta paraqesë çështjen për shqyrtim në Asamble. 15.14. PËRBËRJA E BORDIT TË PARË DREJTUES: Në përputhje me gërmën (ë) të nenit 17 të ligjit 8788 datë 7.5.2001 Për organizatat jofitimprurëse, përbërja e Bordit të parë Drejtues të shoqatës Illyrian Brains Network do të jetë. 1) SINDI RAMALIU, .... 2) JONI PETRI, .... 3) KLAUDIA META, ... 4) ERDA HOXHA, .... 5) ENDRI BASHA, .... 6) DOREN ÇALLIKU ...',
    ],
  },
  {
    number: 16,
    title: 'KRYETARI I BORDIT DREJTUES',
    clauses: [
      '16.1. Zgjedhja dhe mandati: Kryetari zgjidhet nga Bordi Drejtues në mbledhjen e tij të parë për një mandat 2 (tre) vjeçar dhe mund të rizgjidhet, por jo më tepër se 2 (dy) mandate. Mandati i Kryetarit nuk mund të jetë më i gjatë se mandati i vetë Bordit Drejtues. 16.2. Kompetencat e Kryetarit: Kryetari: - drejton dhe koordinon veprimtarinë e Bordit Drejtues; - thërret dhe kryeson mbledhjet e Bordit dhe propozon rendin e ditës; - siguron zbatimin e vendimeve të Bordit Drejtues; - mund të marrë masa të përkohshme në raste urgjente, të cilat i paraqiten për miratim Bordit Drejtues në mbledhjen më të afërt; - siguron funksionimin e rregullt, transparent dhe gjithëpërfshirës të procesit vendimmarrës të Bordit. - Në rast të barazimit të votave, vota e Kryetarit është vendimtare. 16.3. Dorëheqja dhe zëvendësimi: Kryetari mund të japë dorëheqjen përpara Bordit Drejtues, duke ruajtur cilësinë e anëtarit të tij. Në këtë rast, si dhe në çdo rast tjetër të përfundimit të mandatit përpara kohe, Bordi Drejtues mblidhet pa vonesë dhe zgjedh Kryetarin e ri. 16.4. Dhe në rastin e kryetarit të Bordit Drejtues, zbatohen dispozitat e këtij statuti në lidhje me anëtarësimin, humbjen e cilësisë së anëtarit, përjashtimin, dorëheqjen e anëtarit, Etj. 16.5. KRYETARI I BORDIT TË PARË DREJTUES: Në përputhje me gërmën (ë) të nenit 17 të ligjit 8788 datë 7.5.2001 Për organizatat jofitimprurëse, Kryetari i Bordit të parë Drejtues të shoqatës do të jetë: DOREN ÇALLIKU, .... Mandati: Mandati i kryetarit të Bordit zgjat cdo herë sa mandati i vetë bordit drejtues.',
    ],
  },
  {
    number: 17,
    title: 'DREJTORI EKZEKUTIV',
    clauses: [
      '17.1. Drejtori Ekzekutiv është përfaqësuesi ligjor i shoqatës.',
      '17.2. Drejtori Ekzekutiv zgjidhet nga Bordi Drejtues, për një mandat 3 vjeçar, me të drejtë ri-zgjedhje.',
      '17.3. Ai/Ajo e ushtron veprimtarinë në përputhje me Statutin e shoqatës, legjislacionin shqiptar, dhe udhëzimet e Bordit Drejtues.',
      '17.4. DREJTORËT E PARË EKZEKUTIVË I SHOQATËS. Në përputhje me gërmën (ë) të nenit 17 të ligjit 8788 datë 7.5.2001 Për organizatat jofitimprurëse, shoqata do të ketë dy Drejtorë Ekzekutivë. Drejtorët e parë ekzekutiv të shoqatës do të jenë: ERDA HOXHA .... Mandati: Mandati i Drejtorit ekzekutiv do të jetë nga themelimi deri në datën 31/12/2029. JONI PJETRI,.... Mandati: Mandati i Drejtorit ekzekutiv do të jetë nga themelimi deri në datën 31/12/2029.',
    ],
  },
  {
    number: 18,
    title: 'KOMPETENCAT & PËRGJEGJËSITË E DREJTORIT EKZEKUTIV',
    clauses: [
      '18.1. Drejtori ekzekutiv ka këto kompetenca: i. mbështet zbatimin e vendimeve të Bordit Drejtues dhe Asamblesë; ii. koordinon aspektet administrative dhe organizative të veprimtarisë; iii. administron fondet dhe pasuritë sipas buxhetit të miratuar; iv. siguron komunikimin dhe koordinimin ndërmjet strukturave të shoqatës; v. përfaqëson shoqatën kundrejt palëve të treta, personave juridikë dhe fizikë, privat apo qëndrore.publikë, bankave, gjykatave, autoriteteve shtetërore, autoriteteve të qeversijes vendore dhe',
      '18.2. Drejtori ekzekutiv ka përgjegjësinë e plotë ligjore për administrimin e cështjeve të shoqatës të kompetencës së tij.',
      '18.3. Drejtorët ekzekutivë të shoqatës, nëse janë më shumë se (një) e përfaqësojnë shoqatën secili vecmas, me vetëm nënshkrimin e tij secili.',
    ],
  },
  {
    number: 19,
    title: 'BURIMET E FINANCIMIT TË SHOQATËS',
    clauses: [
      '19.1. Për shpenzimet e Shoqatës do të përdoren burimet e financimit që do të sigurohen nga: Kontributi i themeluesëve, Kuotizacionet e anëtarëve, Donacione të anëtarëve apo të personave të tjerë fizikë, Të ardhura dhe financime nga donatorë vendas dhe të huaj, Të ardhura nga shërbimet, Grante nga organizma brenda dhe jashtë Shqipërisë si dhe institucione qëndrore e vendore, Financime të organizatave apo agjencive të njohura nga ligji. Dhuratat, ndihmat, programet e financuara nga organizmat shtetërore, individë, organizata ndërkombëtare, fondacionet e huaja e kombëtare, bordet lokale rajonale, kombëtare e ndërkombëtare. Shoqata ka të drejtë të ketë në pronesi pasuri të luajtshme apo të paluajtshme, të realizojë të ardhura nëpërmjet administrimit të këtyre pasurive, si dhe ushtrimit të veprimtarive të tjera në përputhje me ligjin dhe qëllimet e shoqatës të parashikuara në statut.',
      '19.2. Të ardhurat e realizuara nga shoqata duhet të perdoren vetëm për realizimin e veprimtarisë që parashikohen në qëllimet dhe objektivat e shoqatës të parashikuara në aktin e themelimit dhe statutin e shoqatës.',
      '19.3. Në çdo rast do të bëhet evidentimi i këtyre mjeteve financiare dhe do të hartohet dokumentacioni përkatës sipas ligjeve në fuqi.',
    ],
  },
  {
    number: 20,
    title: 'RREGULLAT PËR BASHKIMIN DHE NDARJEN E SHOQATËS',
    clauses: [
      '20.1. Asambleja e shoqatës është organi kompetent që vendos bashkimin ose ndarjen e shoqatës “Illyrian Brains Network”, për arsye te lehtësirave qe mund te krijohen nga bashkëpunimi gjithmonë ne te mire te arritjes se objektivit të shoqatës.',
      '20.2. Bordi Drejtues më parë harton projektin e bashkimit, ndarjes përthithjes apo në çdo rast tjetër, dhe e dërgon për miratim te Asambleja e shoqatës.',
    ],
  },
  {
    number: 21,
    title: 'PËRFAQËSIMI LIGJOR I SHOQATËS',
    clauses: [
      '21.1. Drejtori Ekzekutiv përfaqëson ligjërisht Shoqatën në lidhje me te tretët apo në konflikte gjyqësore.',
    ],
  },
  {
    number: 22,
    title: 'NDALIMI I SHPËRNDARJES SE FITIMEVE',
    clauses: [
      '22.1. Të ardhurat e realizuara nga veprimtaria e shoqatës “Illyrian Brains Network” do te përdoren për mbështetjen dhe zhvillimin e infrastrukturës së Shoqatës, pajisje dhe zgjerim të shërbimeve, veprimtarisë promovuese, kërkimore shkencore. Çdo veprim i kundërt është plotësisht i pa vlefshëm dhe organet përgjegjëse mbajnë përgjegjësi sipas ligjit.',
    ],
  },
  {
    number: 23,
    title: 'RREGULLAT PËR LIKUIDIMIN DHE DESTINIMIN E PASURISË PAS MBARIMIT TE ORGANIZATËS',
    clauses: [
      '23.1. Shoqata “Illyrian Brains Network” shperndahet me iniciativën e saj kur këtë e kërkojnë më shume se 3⁄4 e anëtareve të Asamblesë së Pergjithshme të anëtarëve.',
      '23.2. Ne kete rast mbledhja cakton një ose disa likuidatorë të cilët realizojnë likujdimin e shoqatës.',
      '23.3. Me emërimin e likuidatorit ose te likuidatorëve pushojnë funksionet e Drejtorit Ekzekutiv.',
    ],
  },
  {
    number: 24,
    title: 'DETYRAT E LIKUIDATORIT',
    clauses: [
      '24.1. Likuiduesi ose likuiduesit, brenda dy muajve nga data e emërimit te tij thërret mbledhjen e Bordit Drejtues, të cilit i paraqet raportin mbi gjendjen financiare te Shoqatës, aktivin dhe pasivin e Shoqatës, para se të fillojë operacioni i likuidimit.',
      '24.2. Likuiduesi përfaqëson Shoqatën dhe ka të gjitha kompetencat e nevojshme për likuidimin e pasivit të saj.',
      '24.3. Likuiduesi është i autorizuar të paguajë të gjithë kreditorët dhe më pas vlerëson pasurinë e mbetur dhe kujdeset që kjo pasuri te shkojë në destinacionin e përcaktuar nga Statuti.',
    ],
  },
  {
    number: 25,
    title: 'SHPËRNDARJA E PASURISË',
    clauses: [
      '25.1. Pasuria e Shoqatës pas shpërndarjes së saj do tu kaloje ne mënyrë proporcionale të gjitha organizatave jo qeveritare homologe, te cilat veprojnë ne territorin e Republikës së Shqipërisë dhe kanë objekt te ngjashëm, ose fusha veprimtarie të përbashkëta.',
    ],
  },
];
