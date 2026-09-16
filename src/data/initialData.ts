import { Subject, Topic, User, Group, Subscription, ArticleOrder, PaymentTransaction, NotificationItem, AdminSettings, TestAttempt } from '../types';

export const initialSettings: AdminSettings = {
  defaultPassingScore: 60,
  subscriptionDurationMonths: 6,
  subscriptionPrice6Months: 250000,
  articleBasePriceOAK: 350000,
  articleBasePriceScopus: 1800000,
  articleBasePriceConference: 200000,
  articleBasePriceThesis: 120000,
  platformName: "Talabalar Bilimini Baholash va Ilmiy Maqola Xizmatlari",
  platformPhone: "+998 71 200-45-45",
  platformEmail: "info@eduplatform.uz",
  allowAiGeneration: true,
  allowSingleAttemptOnly: true,
};

export const initialUsers: User[] = [
  {
    id: 'user-admin-1',
    name: 'Dilshod Rustamov (Super Admin)',
    email: 'admin@eduplatform.uz',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+998 90 123-45-67',
    specialty: 'Bosh boshqaruvchi',
    institution: "Oliy Ta'lim Vazirligi",
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'user-teacher-1',
    name: 'Prof. Anvar Qodirov',
    email: 'qodirov.prof@eduplatform.uz',
    role: 'TEACHER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+998 93 456-78-90',
    specialty: 'Falsafa va Ijtimoiy fanlar kafedrasi mudiri',
    institution: "O'zbekiston Milliy Universiteti",
    createdAt: '2026-01-15T09:30:00Z',
  },
  {
    id: 'user-teacher-2',
    name: 'Dots. Nigora Karimova',
    email: 'karimova.n@eduplatform.uz',
    role: 'TEACHER',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+998 97 789-01-23',
    specialty: "Boshlang'ich ta'lim va pedagogika",
    institution: 'Toshkent Davlat Pedagogika Universiteti',
    createdAt: '2026-01-18T11:00:00Z',
  },
  {
    id: 'user-student-1',
    name: 'Jasur Alimov (Talaba)',
    email: 'jasur.alimov@eduplatform.uz',
    role: 'STUDENT',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    groupId: 'group-101',
    phone: '+998 99 333-22-11',
    specialty: 'Pedagogika va Psixologiya',
    institution: 'Toshkent Davlat Pedagogika Universiteti',
    createdAt: '2026-02-01T14:20:00Z',
  },
  {
    id: 'user-student-2',
    name: 'Shahnoza Ergasheva',
    email: 'shahnoza.e@eduplatform.uz',
    role: 'STUDENT',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    groupId: 'group-101',
    phone: '+998 94 555-44-33',
    specialty: 'Pedagogika va Psixologiya',
    institution: 'Toshkent Davlat Pedagogika Universiteti',
    createdAt: '2026-02-03T10:00:00Z',
  },
  {
    id: 'user-student-3',
    name: 'Bekzod Xolmatov',
    email: 'bekzod.x@eduplatform.uz',
    role: 'STUDENT',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    groupId: 'group-102',
    phone: '+998 91 777-88-99',
    specialty: 'Tarix va arxeologiya',
    institution: "O'zbekiston Milliy Universiteti",
    createdAt: '2026-02-05T12:00:00Z',
  },
  {
    id: 'user-author-1',
    name: "Dr. Ilhom Yo'ldoshev (Ilmiy muallif)",
    email: 'author.yuldoshev@eduplatform.uz',
    role: 'AUTHOR',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '+998 90 999-11-22',
    specialty: 'OAK va Scopus ilmiy maqolalar eksperti',
    institution: 'Fanlar Akademiyasi Ilmiy Tadqiqot Instituti',
    createdAt: '2026-01-20T16:00:00Z',
  }
];

export const initialGroups: Group[] = [
  {
    id: 'group-101',
    name: 'Pedagogika 101-guruh',
    faculty: 'Pedagogika va psixologiya fakulteti',
    course: 2,
    studentCount: 24,
    teacherId: 'user-teacher-2',
  },
  {
    id: 'group-102',
    name: 'Tarix va Falsafa 204-guruh',
    faculty: 'Ijtimoiy fanlar fakulteti',
    course: 3,
    studentCount: 28,
    teacherId: 'user-teacher-1',
  },
  {
    id: 'group-103',
    name: "Boshlang'ich ta'lim 302-guruh",
    faculty: "Boshlang'ich ta'lim metodikasi",
    course: 1,
    studentCount: 30,
    teacherId: 'user-teacher-2',
  }
];

export const initialSubjects: Subject[] = [
  {
    id: 'subj-1',
    name: 'Media savodxonlik va axborot madaniyati',
    code: 'MSAM-2026',
    description: "Axborot xurujlariga qarshi immunitet, feyk xabarlarni aniqlash, media iste'moli madaniyati va raqamli xavfsizlik asoslari.",
    iconName: 'Tv',
    category: 'Axborot texnologiyalari va jamiyat',
    teacherId: 'user-teacher-1',
    teacherName: 'Prof. Anvar Qodirov',
    topicCount: 4,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'subj-2',
    name: 'Tarix',
    code: 'TAR-101',
    description: "O'zbekistonning qadimgi davrlardan to hozirgi kungacha bo'lgan boy davlatchilik tarixi, tamaddunlar va mustaqillik bosqichlari.",
    iconName: 'Landmark',
    category: 'Gumanitar fanlar',
    teacherId: 'user-teacher-1',
    teacherName: 'Prof. Anvar Qodirov',
    topicCount: 4,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'subj-3',
    name: 'Falsafa',
    code: 'FAL-102',
    description: "Falsafiy tafakkur taraqqiyoti, ontologiya, gnoseologiya, sharq va g'arb falsafasi maktablari hamda zamonaviy dunyoqarash.",
    iconName: 'BookOpen',
    category: 'Ijtimoiy-falsafiy fanlar',
    teacherId: 'user-teacher-1',
    teacherName: 'Prof. Anvar Qodirov',
    topicCount: 4,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'subj-4',
    name: 'Dinshunoslik',
    code: 'DIN-201',
    description: "Dunyo dinlari tarixi, konfessiyalararo totuvlik, islom tamadduni, diniy bag'rikenglik va ekstremizmga qarshi mafkuraviy immunitet.",
    iconName: 'Compass',
    category: 'Ijtimoiy fanlar',
    teacherId: 'user-teacher-1',
    teacherName: 'Prof. Anvar Qodirov',
    topicCount: 3,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'subj-5',
    name: 'Milliy tarbiya',
    code: 'MT-105',
    description: "Milliy o'zlikni anglash, buyuk ajdodlarimiz ma'naviy merosi, odob-axloq me'yorlari va komil inson tarbiyasining metodologik asoslari.",
    iconName: 'Sparkles',
    category: "Pedagogika va Ma'naviyat",
    teacherId: 'user-teacher-2',
    teacherName: 'Dots. Nigora Karimova',
    topicCount: 3,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'subj-6',
    name: "Boshlang'ich ta'limda tarbiya masalalari",
    code: 'BTTM-301',
    description: "Kichik maktab yoshidagi o'quvchilarda axloqiy sifatlarni shakllantirish, oila va maktab hamkorligi hamda interfaol tarbiyaviy metodlar.",
    iconName: 'GraduationCap',
    category: "Boshlang'ich ta'lim",
    teacherId: 'user-teacher-2',
    teacherName: 'Dots. Nigora Karimova',
    topicCount: 3,
    createdAt: '2026-01-01T00:00:00Z',
  }
];

export const initialTopics: Topic[] = [
  // Falsafa faniga tegishli mavzular (misol sifatida spetsifikatsiyadagi predmeti va vazifalari)
  {
    id: 'top-fal-1',
    subjectId: 'subj-3',
    topicNumber: 1,
    title: 'Falsafaning predmeti, tuzilishi va jamiyatdagi vazifalari',
    description: 'Falsafa tushunchasining etimologiyasi, dunyoqarash turlari, falsafaning asosiy masalasi va funksiyalari.',
    lectureText: `# 1-Mavzu: Falsafaning predmeti, tuzilishi va jamiyatdagi vazifalari

## Reja:
1. Falsafa so'zining kelib chiqishi va uning mohiyati.
2. Dunyoqarash tushunchasi va uning tarixiy shakllari (afsonaviy, diniy, falsafiy).
3. Falsafiy bilimlarning tuzilishi: ontologiya, gnoseologiya, aksiologiya, praksiologiya.
4. Falsafaning ijtimoiy-gumanitar vazifalari (metodologik, dunyoqarash, gnoseologik, tarbiyaviy).

---

### 1. Falsafaning mohiyati va etimologiyasi
"Falsafa" so'zi qadimgi yunoncha "philosophia" — "donolikni sevish" (phileo — sevaman, sophia — donolik, hikmat) so'zlaridan olingan. Ilk bor bu atamani mashhur yunon olimi Pifagor (mil. avv. VI asr) qo'llagan deb hisoblanadi. Falsafa voqelikning eng umumiy qonuniyatlari, insonning olamga munosabati hamda tafakkur shakllari haqidagi yaxlit ta'limotdir.

### 2. Dunyoqarashning tarixiy tiplari
Insoniyat tarixida uchta asosiy dunyoqarash shakli mavjud:
- **Mifologik (afsonaviy) dunyoqarash:** Qadimgi insonlarning tabiat hodisalarini jonlantirish va xudolar xohishi bilan bog'lashga asoslangan tasavvuri.
- **Diniy dunyoqarash:** Olamning muqaddas, ilohiy kuchlar tomonidan yaratilganiga bo'lgan e'tiqod va his-tuyg'ularga tayanishi.
- **Falsafiy dunyoqarash:** Ratsional, mantiqiy dalillar, tanqidiy tahlil va nazariy umumlashtirishlarga asoslanadi.

### 3. Falsafaning tarkibiy qismlari
- **Ontologiya** — borliq va mavjudot to'g'risidagi falsafiy ta'limot;
- **Gnoseologiya** — inson bilish qobiliyati, haqiqat mezonlari haqidagi ta'limot;
- **Aksiologiya** — qadriyatlar (ezgulik, adolat, go'zallik) falsafasi;
- **Etika va Estetika** — axloq va nafosat haqidagi fanlar.

### 4. Jamiyatdagi asosiy funksiyalari
Falsafa jamiyat taraqqiyotida metodologik (boshqa fanlarga yo'nalish ko'rsatish), kognitiv (bilish), insonparvarlik, tanqidiy va prognozlash (kelajakni ilmiy taxmin qilish) vazifalarini bajaradi.`,
    pdfFileName: '1-mavzu_Falsafaning_predmeti_va_vazifalari.pdf',
    pdfFileSize: '2.4 MB',
    wordFileName: '1-mavzu_Falsafa_maruza_matni.docx',
    wordFileSize: '850 KB',
    additionalMaterials: [
      "Sharq mutafakkirlarining falsafiy merosi (O'quv qo'llanma)",
      'Aristotel "Metafizika" asaridan parchalar'
    ],
    passingScore: 60,
    questions: [
      {
        id: 'q-fal-1',
        questionText: `"Falsafa" (philosophia) so'zi qaysi tildan olingan va qanday ma'noni anglatadi?`,
        optionA: 'Lotincha — qonun va tartib',
        optionB: 'Yunoncha — donolikni sevish',
        optionC: 'Arabcha — chuqur tafakkur',
        optionD: 'Forscha — hikmatlar xazinasi',
        correctOption: 'B',
        explanation: "Falsafa qadimgi yunoncha \"phileo\" (sevaman) va \"sophia\" (donolik) so'zlaridan olingan."
      },
      {
        id: 'q-fal-2',
        questionText: "Falsafa atamasini ilk bor o'ziga nisbatan qo'llagan qadimgi yunon mutafakkiri kim?",
        optionA: 'Sokrat',
        optionB: 'Platon',
        optionC: 'Pifagor',
        optionD: 'Aristotel',
        correctOption: 'C',
        explanation: "Pifagor birinchi bo'lib o'zini donishmand emas, balki donolikni sevuvchi (faylasuf) deb atagan."
      },
      {
        id: 'q-fal-3',
        questionText: "Borliq, uning mohiyati va mavjudlik shakllarini o'rganuvchi falsafiy soha nima deb ataladi?",
        optionA: 'Gnoseologiya',
        optionB: 'Ontologiya',
        optionC: 'Aksiologiya',
        optionD: 'Praksiologiya',
        correctOption: 'B',
        explanation: "Ontologiya — borliq haqidagi ta'limotdir (yunoncha ontos — borliq, logos — ta'limot)."
      },
      {
        id: 'q-fal-4',
        questionText: 'Dunyoqarashning qaysi tarixiy shakli ratsional tahlil, mantiqiy dalil va tanqidiy tafakkurga asoslanadi?',
        optionA: 'Diniy dunyoqarash',
        optionB: 'Mifologik dunyoqarash',
        optionC: 'Falsafiy dunyoqarash',
        optionD: 'Oddiy-maishiy dunyoqarash',
        correctOption: 'C',
        explanation: 'Falsafiy dunyoqarash aqliy xulosalar va nazariy asoslanganligi bilan ajralib turadi.'
      },
      {
        id: 'q-fal-5',
        questionText: "Bilish nazariyasi va haqiqatga erishish yo'llarini tadqiq qiluvchi falsafa bo'limi qaysi?",
        optionA: 'Gnoseologiya',
        optionB: 'Etika',
        optionC: 'Estetika',
        optionD: 'Aksiologiya',
        correctOption: 'A',
        explanation: "Gnoseologiya (epistemologiya) — insonning dunyoni bilish qobiliyati va qonuniyatlarini o'rganadi."
      }
    ],
    createdAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'top-fal-2',
    subjectId: 'subj-3',
    topicNumber: 2,
    title: 'Qadimgi Sharq va Markaziy Osiyo mutafakkirlarining falsafiy qarashlari',
    description: "Qadimgi Hindiston, Xitoy va Markaziy Osiyo Uyg'onish davri mutafakkirlari (Farobiy, Ibn Sino, Beruniy) ilmiy merosi.",
    lectureText: `# 2-Mavzu: Qadimgi Sharq va Markaziy Osiyo mutafakkirlarining falsafiy qarashlari

## Asosiy masalalar:
1. Qadimgi Xitoy (Konfutsiychilik, Daosizm) va Hindiston (Vedalar, Upanshidalari) falsafasi.
2. Sharq Uyg'onish davri (IX-XII asrlar) xususiyatlari.
3. Abu Nasr Forobiy — "Sharq Arastusi" va uning fozil shahar ta'limoti.
4. Abu Rayhon Beruniy va Ibn Sino falsafiy qarashlarining insonparvarlik mohiyati.`,
    pdfFileName: '2-mavzu_Sharq_falsafasi.pdf',
    pdfFileSize: '3.1 MB',
    wordFileName: '2-mavzu_Sharq_falsafasi_matn.docx',
    wordFileSize: '920 KB',
    passingScore: 60,
    questions: [
      {
        id: 'q-fal-2-1',
        questionText: '"Fozil odamlar shahri" asarining muallifi, "Ikkinchi muallim" (Al-Muallim as-soniy) unvoni sohibi kim?',
        optionA: 'Abu Rayhon Beruniy',
        optionB: 'Abu Nasr Forobiy',
        optionC: 'Ibn Sino',
        optionD: 'Yusuf Xos Hojib',
        correctOption: 'B',
        explanation: 'Abu Nasr Forobiy Aristoteldan keyin "Ikkinchi muallim" deb tan olingan.'
      },
      {
        id: 'q-fal-2-2',
        questionText: 'Ibn Sinoning tibbiyot va falsafadagi qomusiy shoh asari qaysi?',
        optionA: 'Al-Qonun fit-tibb va Kitob ash-Shifo',
        optionB: 'Qadimgi xalqlardan qolgan yodgorliklar',
        optionC: "Devonu lug'otit turk",
        optionD: "Qutadg'u bilig",
        correctOption: 'A',
        explanation: 'Ibn Sino "Kitob ash-shifo" (Davo kitobi) va "Tib qonunlari" bilan jahon tan olgan olimdir.'
      }
    ],
    createdAt: '2026-01-22T10:00:00Z',
  },
  {
    id: 'top-fal-3',
    subjectId: 'subj-3',
    topicNumber: 3,
    title: "G'arbiy Yevropa falsafasi: Antik davrdan Yangi davrgacha",
    description: "Sokrat, Aflotun, Arastu, Dekart, Frensis Bekon, Kant va Gegel ta'limotlari.",
    lectureText: `# 3-Mavzu: G'arbiy Yevropa falsafasi taraqqiyoti

Yevropa falsafasi antik davr falsafasidan boshlanadi. Sokratning "O'zingni angla" shiori, Aflotunning g'oyalar dunyosi, Arastuning shakl va materiya ta'limoti, hamda Yangi davr empirizmi va ratsionalizmi muhim o'rin tutadi.`,
    pdfFileName: '3-mavzu_Garb_falsafasi.pdf',
    pdfFileSize: '2.8 MB',
    wordFileName: '3-mavzu_Garb_falsafasi.docx',
    wordFileSize: '810 KB',
    passingScore: 60,
    questions: [
      {
        id: 'q-fal-3-1',
        questionText: `"Cogito ergo sum" ("Fikr qilyapmanmi, demak mavjudman") mashhur ratsionalistik g'oyasi muallifi kim?`,
        optionA: 'Rene Dekart',
        optionB: 'Frensis Bekon',
        optionC: 'Immanuil Kant',
        optionD: 'Jon Lokk',
        correctOption: 'A',
        explanation: "Rene Dekart metodik shubha orqali ratsionalizm poydevorini qo'ygan."
      }
    ],
    createdAt: '2026-01-24T10:00:00Z',
  },
  {
    id: 'top-fal-4',
    subjectId: 'subj-3',
    topicNumber: 4,
    title: 'Ijtimoiy falsafa va inson muammosi',
    description: 'Jamiyat tuzilishi, ijtimoiy ong shakllari, globallashuv va shaxs erkinligi masalalari.',
    lectureText: `# 4-Mavzu: Ijtimoiy falsafa va inson muammosi

Inson — biologik va ijtimoiy borliqning uyg'unligidir. Ijtimoiy falsafa jamiyat qonuniyatlari, fuqarolik jamiyati institutlari hamda insonning jamiyatdagi ma'naviy-axloqiy o'rnini tadqiq etadi.`,
    pdfFileName: '4-mavzu_Ijtimoiy_falsafa.pdf',
    pdfFileSize: '2.1 MB',
    wordFileName: '4-mavzu_Ijtimoiy_falsafa.docx',
    wordFileSize: '730 KB',
    passingScore: 60,
    questions: [
      {
        id: 'q-fal-4-1',
        questionText: 'Inson tabiatining ikki tomoni (biosotsial mavjudot) deganda nima tushuniladi?',
        optionA: 'Faqatgina jismoniy tananing mavjudligi',
        optionB: 'Biologik organizm va ijtimoiy munosabatlar birligi',
        optionC: 'Faqatgina jamiyat tomonidan berilgan unvon',
        optionD: "Texnika vositalariga bog'liqlik",
        correctOption: 'B',
        explanation: "Inson ham biologik qonunlarga bo'ysunadi, ham ijtimoiy muloqot va mehnat orqali shaxsga aylanadi."
      }
    ],
    createdAt: '2026-01-26T10:00:00Z',
  },

  // Media savodxonlik fani
  {
    id: 'top-media-1',
    subjectId: 'subj-1',
    topicNumber: 1,
    title: 'Media savodxonlik tushunchasi va axborot asrining chaqiriqlari',
    description: "Axborot maydoni, mediata'limning maqsadi va fuqarolik pozitsiyasi.",
    lectureText: `# 1-Mavzu: Media savodxonlik tushunchasi va axborot asrining chaqiriqlari

Media savodxonlik — bu axborotni qabul qilish, tahlil qilish, baholash va yaratish qobiliyatidir. Bugungi globallashuv davrida har bir inson axborot oqimidan to'g'ri va xavfsiz foydalanishi uchun media madaniyatiga ega bo'lishi shart.`,
    pdfFileName: '1-mavzu_Media_savodxonlik.pdf',
    pdfFileSize: '3.4 MB',
    wordFileName: '1-mavzu_Media_savodxonlik.docx',
    wordFileSize: '890 KB',
    passingScore: 60,
    questions: [
      {
        id: 'q-med-1',
        questionText: "Feyk xabarlarni (yolg'on axborot) aniqlashda eng muhim qadam nima?",
        optionA: 'Xabarni darhol boshqalarga ulashish',
        optionB: 'Birlamchi rasmiy manba va faktlarni tekshirish (faktcheking)',
        optionC: 'Xabarning sarlavhasiga ishonish',
        optionD: "Ko'p layk yig'ilganiga qarab baholash",
        correctOption: 'B',
        explanation: 'Faktcheking va manbani solishtirish axborot gigiyenasining oltin qoidasidir.'
      }
    ],
    createdAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'top-media-2',
    subjectId: 'subj-1',
    topicNumber: 2,
    title: "Kiberxavfsizlik va shaxsiy ma'lumotlarni himoya qilish",
    description: 'Parollar xavfsizligi, fishing hujumlari va ijtimoiy tarmoqlardagi xavflar.',
    lectureText: `# 2-Mavzu: Kiberxavfsizlik asoslari

Kiberxavfsizlik raqamli qurilmalar va shaxsiy ma'lumotlarni ruxsatsiz kirishlardan himoyalash tizimidir. Ikki bosqichli autentifikatsiya (2FA), murakkab parollar va shubhali havolalarni ochmaslik kiberxavfsizlikning birlamchi talabidir.`,
    pdfFileName: '2-mavzu_Kiberxavfsizlik.pdf',
    pdfFileSize: '2.5 MB',
    wordFileName: '2-mavzu_Kiberxavfsizlik.docx',
    wordFileSize: '680 KB',
    passingScore: 60,
    questions: [
      {
        id: 'q-med-2',
        questionText: 'Fishing (Phishing) hujumi deganda nima tushuniladi?',
        optionA: 'Kompyuter xotirasini tozalash dasturi',
        optionB: "Soxta sayt yoki xabar orqali shaxsiy ma'lumotlar va parollarni o'g'irlash",
        optionC: 'Tezkor internet provayderi',
        optionD: 'Elektron darslik formati',
        correctOption: 'B',
        explanation: "Fishing foydalanuvchini aldab bank yoki akkaunt parollarini qo'lga kiritishga qaratilgan kiberjinoyatdir."
      }
    ],
    createdAt: '2026-01-22T10:00:00Z',
  },
  {
    id: 'top-media-3',
    subjectId: 'subj-1',
    topicNumber: 3,
    title: 'Raqamli gigiyena va axborot psixologiyasi',
    description: 'Axborot yuklamasi, diqqatni jamlash va virtual olam qaramligining oldini olish.',
    lectureText: `# 3-Mavzu: Raqamli gigiyena

Kun davomida gadjetlardan me'yorida foydalanish va axborot shovqinidan tanaffus qilish kognitiv salomatlik uchun zarur.`,
    pdfFileName: '3-mavzu_Raqamli_gigiyena.pdf',
    pdfFileSize: '1.9 MB',
    wordFileName: '3-mavzu_Raqamli_gigiyena.docx',
    wordFileSize: '610 KB',
    passingScore: 60,
    questions: [
      {
        id: 'q-med-3',
        questionText: `"Axborot xuruji" (infodemiya) sharoitida qanday chora ko'rish lozim?`,
        optionA: 'Tekshirilmagan xabarlarni guruhlarga yoyish',
        optionB: 'Faqat ishonchli va rasmiy axborot manbalariga tayanish',
        optionC: "Internetni butunlay o'chirib qo'yish",
        optionD: "Anonim kanallarga obuna bo'lish",
        correctOption: 'B',
        explanation: 'Rasmiy davlat va professional OAV manbalari feyk xabarlarning oldini oladi.'
      }
    ],
    createdAt: '2026-01-24T10:00:00Z',
  },
  {
    id: 'top-media-4',
    subjectId: 'subj-1',
    topicNumber: 4,
    title: 'Ijtimoiy tarmoqlar etikasi va mualliflik huquqi',
    description: 'Plagiat, raqamli mulk huquqi va onlayn muloqot madaniyati.',
    lectureText: `# 4-Mavzu: Ijtimoiy tarmoqlar etikasi

Birovning intellektual mulkini o'zlashtirish qonunan taqiqlanadi. Har qanday iqtibos manbasi aniq ko'rsatilishi shart.`,
    pdfFileName: '4-mavzu_Mualliflik_huquqi.pdf',
    pdfFileSize: '2.1 MB',
    wordFileName: '4-mavzu_Mualliflik_huquqi.docx',
    wordFileSize: '590 KB',
    passingScore: 60,
    questions: [
      {
        id: 'q-med-4',
        questionText: "Boshqa muallifning asarini manbasiz ko'chirish qanday ataladi?",
        optionA: "Plagiat (ko'chirmachilik)",
        optionB: 'Sintez',
        optionC: 'Kompozitsiya',
        optionD: 'Retsenziya',
        correctOption: 'A',
        explanation: 'Plagiat intellektual mulk va mualliflik huquqini buzish hisoblanadi.'
      }
    ],
    createdAt: '2026-01-26T10:00:00Z',
  },

  // Tarix fani
  {
    id: 'top-tar-1',
    subjectId: 'subj-2',
    topicNumber: 1,
    title: "O'zbekiston hududidagi qadimgi sivilizatsiyalar va davlatchilik kurtaklari",
    description: "Qadimgi Baqtriya, So'g'diyona va Xorazm tamaddunlari.",
    lectureText: `# 1-Mavzu: O'zbekiston hududidagi qadimgi sivilizatsiyalar

O'zbekiston hududi insoniyatning eng qadimgi madaniyat o'choqlaridan biri hisoblanadi. Bronza va ilk temir davrlarida vujudga kelgan davlat birlashmalari jahon taraqqiyotiga katta hissa qo'shgan.`,
    pdfFileName: '1-mavzu_Qadimgi_tarix.pdf',
    pdfFileSize: '3.6 MB',
    wordFileName: '1-mavzu_Qadimgi_tarix.docx',
    wordFileSize: '1.1 MB',
    passingScore: 60,
    questions: [
      {
        id: 'q-tar-1',
        questionText: 'Zardushtiylik dinining muqaddas kitobi nima deb ataladi?',
        optionA: 'Avesto',
        optionB: 'Veda',
        optionC: 'Torah',
        optionD: 'Tripitaka',
        correctOption: 'A',
        explanation: '"Avesto" qadimgi ajdodlarimizning diniy, falsafiy va axloqiy yodgorligidir.'
      }
    ],
    createdAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'top-tar-2',
    subjectId: 'subj-2',
    topicNumber: 2,
    title: 'Amir Temur va Temuriylar davlati madaniyati',
    description: 'Markazlashgan qudratli davlat barpo etilishi, "Temur tuzuklari" va Ikkinchi Renessans.',
    lectureText: `# 2-Mavzu: Amir Temur va Temuriylar davri

Amir Temur davrida ilm-fan, me'morchilik, savdo-sotiq va xalqaro munosabatlar misli ko'rilmagan darajada yuksaldi. "Kuch — adolatdadir" shiori davlat siyosatining o'zagini tashkil etdi.`,
    pdfFileName: '2-mavzu_Amir_Temur_davlati.pdf',
    pdfFileSize: '4.2 MB',
    wordFileName: '2-mavzu_Amir_Temur_davlati.docx',
    wordFileSize: '1.3 MB',
    passingScore: 60,
    questions: [
      {
        id: 'q-tar-2',
        questionText: "Amir Temurning davlat boshqaruvi va harbiy san'atiga bag'ishlangan mashhur asari qaysi?",
        optionA: 'Zafarnoma',
        optionB: 'Boburnoma',
        optionC: 'Temur tuzuklari',
        optionD: 'Tarixi Rashidiy',
        correctOption: 'C',
        explanation: `"Temur tuzuklari" davlat boshqaruvi va odob-axloq qonun-qoidalarini o'z ichiga olgan tarixiy asardir.`
      }
    ],
    createdAt: '2026-01-22T10:00:00Z',
  }
];

// Sample test attempts for initial student (Jasur Alimov)
export const initialAttempts: TestAttempt[] = [
  {
    id: 'att-1',
    studentId: 'user-student-1',
    studentName: 'Jasur Alimov (Talaba)',
    groupId: 'group-101',
    topicId: 'top-fal-2',
    subjectId: 'subj-3',
    totalQuestions: 2,
    correctAnswers: 2,
    scorePercentage: 85,
    passingScore: 60,
    status: 'PASSED', // O'tdi
    completedAt: '2026-02-10T14:30:00Z',
    userAnswers: { 'q-fal-2-1': 'B', 'q-fal-2-2': 'A' },
  },
  {
    id: 'att-2',
    studentId: 'user-student-1',
    studentName: 'Jasur Alimov (Talaba)',
    groupId: 'group-101',
    topicId: 'top-fal-3',
    subjectId: 'subj-3',
    totalQuestions: 1,
    correctAnswers: 1,
    scorePercentage: 60,
    passingScore: 60,
    status: 'PASSED', // O'tdi
    completedAt: '2026-02-12T16:00:00Z',
    userAnswers: { 'q-fal-3-1': 'A' },
  },
  {
    id: 'att-3',
    studentId: 'user-student-1',
    studentName: 'Jasur Alimov (Talaba)',
    groupId: 'group-101',
    topicId: 'top-fal-4',
    subjectId: 'subj-3',
    totalQuestions: 1,
    correctAnswers: 0,
    scorePercentage: 55, // Spec requirement: real score is kept even when failed!
    passingScore: 60,
    status: 'FAILED', // O'tmadi
    completedAt: '2026-02-15T11:20:00Z',
    userAnswers: { 'q-fal-4-1': 'C' },
  },
  {
    id: 'att-4',
    studentId: 'user-student-2',
    studentName: 'Shahnoza Ergasheva',
    groupId: 'group-101',
    topicId: 'top-fal-1',
    subjectId: 'subj-3',
    totalQuestions: 5,
    correctAnswers: 4,
    scorePercentage: 80,
    passingScore: 60,
    status: 'PASSED',
    completedAt: '2026-02-11T09:15:00Z',
    userAnswers: {},
  },
  {
    id: 'att-5',
    studentId: 'user-student-2',
    studentName: 'Shahnoza Ergasheva',
    groupId: 'group-101',
    topicId: 'top-fal-2',
    subjectId: 'subj-3',
    totalQuestions: 2,
    correctAnswers: 2,
    scorePercentage: 100,
    passingScore: 60,
    status: 'PASSED',
    completedAt: '2026-02-13T12:00:00Z',
    userAnswers: {},
  }
];

export const initialSubscriptions: Subscription[] = [
  {
    id: 'sub-1001',
    studentId: 'user-student-1',
    studentName: 'Jasur Alimov (Talaba)',
    planName: "6 oylik to'liq obuna",
    durationMonths: 6,
    startDate: '2026-01-15T00:00:00Z',
    endDate: '2026-07-15T23:59:59Z',
    status: 'ACTIVE',
    amount: 250000,
    paymentMethod: 'Click',
    paymentReference: 'CLK-8839210',
  },
  {
    id: 'sub-1002',
    studentId: 'user-student-2',
    studentName: 'Shahnoza Ergasheva',
    planName: "6 oylik to'liq obuna",
    durationMonths: 6,
    startDate: '2026-02-01T00:00:00Z',
    endDate: '2026-08-01T23:59:59Z',
    status: 'ACTIVE',
    amount: 250000,
    paymentMethod: 'Payme',
    paymentReference: 'PAY-4491022',
  },
  {
    id: 'sub-1003',
    studentId: 'user-student-3',
    studentName: 'Bekzod Xolmatov',
    planName: "6 oylik to'liq obuna",
    durationMonths: 6,
    startDate: '2025-08-10T00:00:00Z',
    endDate: '2026-02-10T23:59:59Z', // Expired
    status: 'EXPIRED',
    amount: 250000,
    paymentMethod: 'Uzum Bank',
    paymentReference: 'UZM-1129381',
  }
];

export const initialArticleOrders: ArticleOrder[] = [
  {
    id: 'art-1025',
    orderNumber: 1025,
    studentId: 'user-student-1',
    studentName: 'Jasur Alimov (Talaba)',
    studentEmail: 'jasur.alimov@eduplatform.uz',
    studentPhone: '+998 99 333-22-11',
    title: 'Ibn Xaldunning ijtimoiy-falsafiy qarashlari va sivilizatsiya nazariyasi',
    articleType: 'OAK',
    volumePages: '5-8 bet',
    language: 'O\'zbek',
    subjectArea: 'Ijtimoiy-falsafiy fanlar',
    requirements: "OAK jurnallari talablariga to'liq mos, IMRAD tizimi, kamida 15 ta adabiyot manbasi, 85%+ antiplagiat darajasi.",
    deadline: '7 kun',
    notes: 'Tezkor nashrga topshirish uchun tavsiyanoma zarur.',
    amount: 350000,
    paymentStatus: 'PAID',
    paymentMethod: 'Click',
    status: 'READY', // Tayyor
    assignedTo: 'user-teacher-1',
    assignedToName: 'Prof. Anvar Qodirov',
    uploadedFile: {
      name: 'Ibn_Xaldun_ijtimoiy_qarashlari_OAK_maqola.docx',
      size: '420 KB',
      format: 'DOCX',
      url: '#download-article-1025',
      uploadedAt: '2026-02-28T15:45:00Z',
    },
    createdAt: '2026-02-22T09:30:00Z',
    updatedAt: '2026-02-28T15:45:00Z',
  },
  {
    id: 'art-1026',
    orderNumber: 1026,
    studentId: 'user-student-2',
    studentName: 'Shahnoza Ergasheva',
    studentEmail: 'shahnoza.e@eduplatform.uz',
    studentPhone: '+998 94 555-44-33',
    title: "Boshlang'ich sinf o'quvchilarida tanqidiy fikrlashni rivojlantirishda interfaol metodlar",
    articleType: 'RESPUBLIKA_KONFERENSIYA',
    volumePages: '3-5 bet',
    language: 'O\'zbek',
    subjectArea: "Boshlang'ich ta'lim metodikasi",
    requirements: "Respublika ilmiy-amaliy anjumani to'plami uchun. Amaliy dars ishlanmalari bilan boyitilgan bo'lishi lozim.",
    deadline: '5 kun',
    amount: 200000,
    paymentStatus: 'PAID',
    paymentMethod: 'Payme',
    status: 'IN_PROGRESS', // Tayyorlanmoqda
    assignedTo: 'user-teacher-2',
    assignedToName: 'Dots. Nigora Karimova',
    createdAt: '2026-03-01T11:15:00Z',
    updatedAt: '2026-03-02T10:00:00Z',
  }
];

export const initialPayments: PaymentTransaction[] = [
  {
    id: 'pay-tx-01',
    type: 'SUBSCRIPTION',
    userId: 'user-student-1',
    userName: 'Jasur Alimov (Talaba)',
    amount: 250000,
    currency: 'UZS',
    status: 'SUCCESS',
    paymentMethod: 'Click',
    referenceId: 'CLK-8839210',
    description: "6 oylik ta'lim platformasi to'liq obunasi",
    createdAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'pay-tx-02',
    type: 'ARTICLE',
    userId: 'user-student-1',
    userName: 'Jasur Alimov (Talaba)',
    amount: 350000,
    currency: 'UZS',
    status: 'SUCCESS',
    paymentMethod: 'Click',
    referenceId: 'CLK-9023411',
    description: "Buyurtma №1025: OAK jurnali uchun ilmiy maqola tayyorlash",
    createdAt: '2026-02-22T09:35:00Z',
  },
  {
    id: 'pay-tx-03',
    type: 'SUBSCRIPTION',
    userId: 'user-student-2',
    userName: 'Shahnoza Ergasheva',
    amount: 250000,
    currency: 'UZS',
    status: 'SUCCESS',
    paymentMethod: 'Payme',
    referenceId: 'PAY-4491022',
    description: "6 oylik ta'lim platformasi to'liq obunasi",
    createdAt: '2026-02-01T10:05:00Z',
  },
  {
    id: 'pay-tx-04',
    type: 'ARTICLE',
    userId: 'user-student-2',
    userName: 'Shahnoza Ergasheva',
    amount: 200000,
    currency: 'UZS',
    status: 'SUCCESS',
    paymentMethod: 'Payme',
    referenceId: 'PAY-5129304',
    description: "Buyurtma №1026: Respublika konferensiyasi maqolasi",
    createdAt: '2026-03-01T11:20:00Z',
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'user-teacher-1',
    role: 'TEACHER',
    title: '🔔 YANGI MAQOLA BUYURTMASI',
    message: "Buyurtma №1025: \"Ibn Xaldunning ijtimoiy-falsafiy qarashlari\". Holati: To'lov amalga oshirilgan.",
    type: 'ARTICLE',
    read: false,
    link: '#articles',
    createdAt: '2026-02-22T09:36:00Z',
  },
  {
    id: 'notif-2',
    userId: 'user-student-1',
    role: 'STUDENT',
    title: '✅ Test natijasi saqlandi',
    message: "Falsafa fani, 2-mavzu bo'yicha testingiz natijasi: 85% (O'tdi). Bir martalik urinish qoidasiga ko'ra saqlandi.",
    type: 'TEST',
    read: true,
    link: '#my-subjects',
    createdAt: '2026-02-10T14:31:00Z',
  },
  {
    id: 'notif-3',
    userId: 'user-student-1',
    role: 'STUDENT',
    title: '📄 Maqolangiz tayyor!',
    message: 'Buyurtma №1025: "Ibn Xaldunning ijtimoiy-falsafiy qarashlari" maqolasi muallif tomonidan tayyorlandi va yuklandi.',
    type: 'ARTICLE',
    read: false,
    link: '#my-articles',
    createdAt: '2026-02-28T15:46:00Z',
  }
];
