import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Plan, Program, SiteContent } from "./site-content";

export type Lang = "en" | "fr" | "ar";

const STORAGE_KEY = "omega.lang";

type Dict = {
  // nav
  navAbout: string;
  navPrograms: string;
  navFacility: string;
  navPricing: string;
  navContact: string;
  signIn: string;
  myAccount: string;
  adminPanel: string;
  joinNow: string;
  // hero
  startTraining: string;
  tourTheGym: string;
  ratedLine: string;
  noExcusesBadge: string;
  // about
  aboutKicker: string; // "ABOUT"
  aboutHeadline1: string;
  aboutHeadline2: string;
  est: string;
  newEra: string;
  featPremiumT: string;
  featPremiumD: string;
  featCoachesT: string;
  featCoachesD: string;
  featOpenT: string;
  featOpenD: string;
  featCommT: string;
  featCommD: string;
  statActive: string;
  statCoaches: string;
  statSessions: string;
  statDays: string;
  // programs
  programsKicker: string;
  programsHeadline: string;
  programsSub: string;
  // facility
  facilityKicker: string;
  facilityHeadline1: string;
  facilityHeadline2: string;
  facilitySub: string;
  facilityCTA: string;
  visitUsShort: string;
  // pricing
  pricingKicker: string;
  pricingHeadline: string;
  pricingSub1: string; // "Choose your plan ·"
  insuranceFee: string; // "+ 20 DT insurance fee"
  insuranceFootnote: string;
  mostPopular: string;
  getStarted: string;
  // reviews
  reviewsKicker: string;
  reviewsHeadline: string;
  verifiedMember: string;
  // contact
  visitUs: string;
  readyToStart1: string;
  readyToStart2: string;
  visitSub: string;
  location: string;
  call: string;
  callSub: string;
  hoursLbl: string;
  instagramLbl: string;
  facebookLbl: string;
  // footer
  footerTagline: string;
  // content overrides
  content: Partial<SiteContent> & { programs?: Program[]; plans?: Plan[] };
  // reviews content
  reviews: { q: string; n: string }[];
};

const en: Dict = {
  navAbout: "About",
  navPrograms: "Programs",
  navFacility: "Facility",
  navPricing: "Pricing",
  navContact: "Contact",
  signIn: "Sign In",
  myAccount: "My Account",
  adminPanel: "Admin Panel",
  joinNow: "Join Now",
  startTraining: "Start Training",
  tourTheGym: "Tour the Gym",
  ratedLine: "5.0 rated · loved by our community",
  noExcusesBadge: "NO EXCUSES",
  aboutKicker: "ABOUT",
  aboutHeadline1: "MORE THAN A GYM.",
  aboutHeadline2: "A LIFESTYLE.",
  est: "EST. 2024",
  newEra: "A new era of training",
  featPremiumT: "Premium Equipment",
  featPremiumD: "Hammer Strength & more",
  featCoachesT: "Certified Coaches",
  featCoachesD: "Personalized programs",
  featOpenT: "Open Late",
  featOpenD: "Until 11 PM daily",
  featCommT: "Community",
  featCommD: "Train with the best",
  statActive: "Active Members",
  statCoaches: "Expert Coaches",
  statSessions: "Weekly Sessions",
  statDays: "Days a Week",
  programsKicker: "WHAT WE OFFER",
  programsHeadline: "TRAIN YOUR WAY",
  programsSub: "Four core paths. One mission — make you stronger every single session.",
  facilityKicker: "THE FACILITY",
  facilityHeadline1: "BUILT FOR",
  facilityHeadline2: "RESULTS",
  facilitySub: "From premium dumbbells to a full functional zone — every square meter is designed to push you further.",
  facilityCTA: "COME SEE IT FOR YOURSELF.",
  visitUsShort: "Visit us",
  pricingKicker: "MEMBERSHIPS",
  pricingHeadline: "FITNESS + CARDIO",
  pricingSub1: "Choose your plan ·",
  insuranceFee: "+ 20 DT insurance fee",
  insuranceFootnote: "* A one-time 20 DT insurance fee applies to all memberships.",
  mostPopular: "MOST POPULAR",
  getStarted: "Get Started",
  reviewsKicker: "REVIEWS",
  reviewsHeadline: "RATED 5.0",
  verifiedMember: "Verified member",
  visitUs: "VISIT US",
  readyToStart1: "READY TO",
  readyToStart2: "START?",
  visitSub: "Drop by for a tour or call us — your transformation begins the moment you walk in.",
  location: "LOCATION",
  call: "CALL",
  callSub: "Call or WhatsApp to book your visit",
  hoursLbl: "HOURS",
  instagramLbl: "INSTAGRAM",
  facebookLbl: "FACEBOOK",
  footerTagline: "DON'T GIVE UP.",
  content: {},
  reviews: [
    { q: "Best gym in the region. Equipment is top tier and the vibe pushes you to give your best every session.", n: "Ahmed Chtioui" },
    { q: "Friendly coaches, clean space, and real results. Omega Fitness truly changed my routine and my confidence.", n: "Soumaya Zardoum" },
    { q: "I love training here. The energy is unmatched and the team genuinely cares about your progress.", n: "Eslem Chtioui" },
  ],
};

const fr: Dict = {
  navAbout: "À propos",
  navPrograms: "Programmes",
  navFacility: "Salle",
  navPricing: "Tarifs",
  navContact: "Contact",
  signIn: "Connexion",
  myAccount: "Mon compte",
  adminPanel: "Administration",
  joinNow: "Rejoindre",
  startTraining: "Commencer",
  tourTheGym: "Visiter la salle",
  ratedLine: "Noté 5.0 · adoré par notre communauté",
  noExcusesBadge: "PAS D'EXCUSES",
  aboutKicker: "À PROPOS DE",
  aboutHeadline1: "PLUS QU'UNE SALLE.",
  aboutHeadline2: "UN MODE DE VIE.",
  est: "DEPUIS 2024",
  newEra: "Une nouvelle ère de l'entraînement",
  featPremiumT: "Équipement premium",
  featPremiumD: "Hammer Strength et plus",
  featCoachesT: "Coachs certifiés",
  featCoachesD: "Programmes personnalisés",
  featOpenT: "Ouvert tard",
  featOpenD: "Jusqu'à 23h tous les jours",
  featCommT: "Communauté",
  featCommD: "Entraîne-toi avec les meilleurs",
  statActive: "Membres actifs",
  statCoaches: "Coachs experts",
  statSessions: "Séances / semaine",
  statDays: "Jours / semaine",
  programsKicker: "CE QUE NOUS OFFRONS",
  programsHeadline: "ENTRAÎNE-TOI À TA FAÇON",
  programsSub: "Quatre approches. Une mission — te rendre plus fort à chaque séance.",
  facilityKicker: "LA SALLE",
  facilityHeadline1: "CONÇUE POUR",
  facilityHeadline2: "DES RÉSULTATS",
  facilitySub: "Des haltères premium à une zone fonctionnelle complète — chaque mètre carré est pensé pour te pousser plus loin.",
  facilityCTA: "VIENS LA DÉCOUVRIR.",
  visitUsShort: "Nous rendre visite",
  pricingKicker: "ABONNEMENTS",
  pricingHeadline: "FITNESS + CARDIO",
  pricingSub1: "Choisis ta formule ·",
  insuranceFee: "+ 20 DT de frais d'assurance",
  insuranceFootnote: "* Des frais d'assurance uniques de 20 DT s'appliquent à tous les abonnements.",
  mostPopular: "LE PLUS POPULAIRE",
  getStarted: "Commencer",
  reviewsKicker: "AVIS",
  reviewsHeadline: "NOTÉ 5.0",
  verifiedMember: "Membre vérifié",
  visitUs: "VIENS NOUS VOIR",
  readyToStart1: "PRÊT À",
  readyToStart2: "COMMENCER ?",
  visitSub: "Passe pour une visite ou appelle-nous — ta transformation commence dès que tu franchis la porte.",
  location: "ADRESSE",
  call: "APPELER",
  callSub: "Appelle ou envoie un WhatsApp pour réserver ta visite",
  hoursLbl: "HORAIRES",
  instagramLbl: "INSTAGRAM",
  facebookLbl: "FACEBOOK",
  footerTagline: "N'ABANDONNE JAMAIS.",
  content: {
    tagline: "LA SANTÉ EST UNE RICHESSE",
    locationBadge: "BENI KHIAR · TUNISIE",
    heroTitle: "FORGE LA {HL} VERSION DE TOI.",
    heroHighlight: "MEILLEURE",
    heroDescription:
      "Chez Omega Fitness, nous ne formons pas seulement des corps — nous construisons la discipline, la confiance et une communauté qui te pousse au-delà de tes limites. Équipements de pointe. Coachs experts. De vrais résultats.",
    aboutP1:
      "Situé au cœur de Beni Khiar, Omega Fitness est la destination des athlètes confirmés comme des débutants. Notre espace combine des équipements d'élite, une énergie motivante et des coachs qui se soucient de ta progression.",
    aboutP2:
      "Que tu cherches la force, la perte de poids ou simplement une vie plus saine — nous avons créé l'environnement pour que ça arrive.",
    hours: "Ouvert tous les jours · Ferme à 23h",
    programs: [
      { title: "Force", desc: "Développe une puissance brute avec les poids libres, racks et machines Hammer Strength." },
      { title: "HIIT & Cardio", desc: "Brûle des graisses et améliore ton endurance avec des circuits à haute intensité." },
      { title: "Coaching Personnel", desc: "Suivi individuel adapté à tes objectifs, ton niveau et ton mode de vie." },
      { title: "Musculation", desc: "Sculpte et affine avec des programmes structurés d'hypertrophie." },
    ],
    plans: [
      { name: "1 Mois", price: "60", per: "DT / mois", feats: ["Accès Fitness + Cardio", "Vestiaire"] },
      { name: "3 Mois", price: "160", per: "DT / 3 mois", feats: ["Accès Fitness + Cardio", "Vestiaire"] },
      { name: "6 Mois", price: "300", per: "DT / 6 mois", feats: ["Accès Fitness + Cardio", "Vestiaire"] },
      { name: "12 Mois", price: "570", per: "DT / an", feats: ["Accès Fitness + Cardio", "Vestiaire", "Meilleure offre"] },
    ],
  },
  reviews: [
    { q: "Meilleure salle de la région. Équipements de très haut niveau et une ambiance qui te pousse à donner le meilleur à chaque séance.", n: "Ahmed Chtioui" },
    { q: "Coachs sympas, espace propre et de vrais résultats. Omega Fitness a vraiment changé ma routine et ma confiance.", n: "Soumaya Zardoum" },
    { q: "J'adore m'entraîner ici. L'énergie est incomparable et l'équipe se soucie réellement de ta progression.", n: "Eslem Chtioui" },
  ],
};

const ar: Dict = {
  navAbout: "من نحن",
  navPrograms: "البرامج",
  navFacility: "المرافق",
  navPricing: "الأسعار",
  navContact: "اتصل بنا",
  signIn: "تسجيل الدخول",
  myAccount: "حسابي",
  adminPanel: "لوحة الإدارة",
  joinNow: "انضم الآن",
  startTraining: "ابدأ التمرين",
  tourTheGym: "زُر النادي",
  ratedLine: "تقييم 5.0 · محبوب من مجتمعنا",
  noExcusesBadge: "لا أعذار",
  aboutKicker: "عن",
  aboutHeadline1: "أكثر من مجرد نادٍ.",
  aboutHeadline2: "أسلوب حياة.",
  est: "تأسس 2024",
  newEra: "عصر جديد من التدريب",
  featPremiumT: "معدات متميزة",
  featPremiumD: "Hammer Strength وأكثر",
  featCoachesT: "مدربون معتمدون",
  featCoachesD: "برامج مخصصة",
  featOpenT: "مفتوح حتى وقت متأخر",
  featOpenD: "حتى 11 مساءً يوميًا",
  featCommT: "مجتمع",
  featCommD: "تدرّب مع الأفضل",
  statActive: "الأعضاء النشطون",
  statCoaches: "مدربون خبراء",
  statSessions: "حصص أسبوعية",
  statDays: "أيام في الأسبوع",
  programsKicker: "ما نقدمه",
  programsHeadline: "تدرّب بطريقتك",
  programsSub: "أربعة مسارات رئيسية. مهمة واحدة — أن نجعلك أقوى في كل حصة.",
  facilityKicker: "المرافق",
  facilityHeadline1: "مصمم لتحقيق",
  facilityHeadline2: "النتائج",
  facilitySub: "من الدمبلز الفاخرة إلى منطقة تدريب وظيفي كاملة — كل متر مربع مصمم ليدفعك أبعد.",
  facilityCTA: "تعال وشاهد بنفسك.",
  visitUsShort: "قم بزيارتنا",
  pricingKicker: "الاشتراكات",
  pricingHeadline: "لياقة + كارديو",
  pricingSub1: "اختر خطتك ·",
  insuranceFee: "+ 20 د.ت رسوم تأمين",
  insuranceFootnote: "* تُطبَّق رسوم تأمين لمرة واحدة قدرها 20 د.ت على جميع الاشتراكات.",
  mostPopular: "الأكثر شعبية",
  getStarted: "ابدأ الآن",
  reviewsKicker: "الآراء",
  reviewsHeadline: "تقييم 5.0",
  verifiedMember: "عضو موثّق",
  visitUs: "زُرنا",
  readyToStart1: "جاهز",
  readyToStart2: "للبدء؟",
  visitSub: "مرّ علينا لجولة أو اتصل بنا — تحوّلك يبدأ لحظة دخولك.",
  location: "الموقع",
  call: "اتصل",
  callSub: "اتصل أو راسلنا على واتساب لحجز زيارتك",
  hoursLbl: "أوقات العمل",
  instagramLbl: "إنستغرام",
  facebookLbl: "فيسبوك",
  footerTagline: "لا تستسلم.",
  content: {
    tagline: "الصحة ثروة",
    locationBadge: "بني خيار · تونس",
    heroTitle: "اصنع النسخة {HL} منك.",
    heroHighlight: "الأقوى",
    heroDescription:
      "في Omega Fitness لا ندرّب الأجساد فقط — بل نبني الانضباط والثقة ومجتمعًا يدفعك إلى ما وراء حدودك. معدات حديثة. مدربون خبراء. نتائج حقيقية.",
    aboutP1:
      "يقع Omega Fitness في قلب بني خيار، وهو الوجهة المفضلة للرياضيين المحترفين والمبتدئين على حد سواء. يجمع فضاؤنا بين معدات النخبة والطاقة المحفزة ومدربين يهتمون بتقدمك.",
    aboutP2:
      "سواء كنت تسعى للقوة أو إنقاص الوزن أو حياة أكثر صحة — لقد بنينا البيئة التي تجعل ذلك ممكنًا.",
    hours: "مفتوح يوميًا · يُغلق الساعة 11 مساءً",
    programs: [
      { title: "القوة", desc: "طوّر قوة خام مع الأوزان الحرة والراكات وأجهزة Hammer Strength." },
      { title: "HIIT والكارديو", desc: "احرق الدهون وارفع قدرة التحمّل مع تمارين عالية الشدة." },
      { title: "تدريب شخصي", desc: "تدريب فردي مصمم لأهدافك ومستواك ونمط حياتك." },
      { title: "كمال الأجسام", desc: "انحت جسمك مع برامج تضخيم عضلي منظّمة." },
    ],
    plans: [
      { name: "شهر واحد", price: "60", per: "د.ت / شهر", feats: ["الوصول إلى اللياقة + الكارديو", "غرفة تبديل الملابس"] },
      { name: "3 أشهر", price: "160", per: "د.ت / 3 أشهر", feats: ["الوصول إلى اللياقة + الكارديو", "غرفة تبديل الملابس"] },
      { name: "6 أشهر", price: "300", per: "د.ت / 6 أشهر", feats: ["الوصول إلى اللياقة + الكارديو", "غرفة تبديل الملابس"] },
      { name: "12 شهر", price: "570", per: "د.ت / سنة", feats: ["الوصول إلى اللياقة + الكارديو", "غرفة تبديل الملابس", "أفضل قيمة"] },
    ],
  },
  reviews: [
    { q: "أفضل نادٍ في المنطقة. المعدات من الطراز الأول والأجواء تدفعك لتقديم أفضل ما لديك في كل حصة.", n: "أحمد الشتيوي" },
    { q: "مدربون ودودون ومكان نظيف ونتائج حقيقية. غيّر Omega Fitness روتيني وثقتي بنفسي.", n: "سمية زردوم" },
    { q: "أحب التدريب هنا. الطاقة لا تُضاهى والفريق يهتم فعلاً بتقدمك.", n: "إسلام الشتيوي" },
  ],
};

const DICTS: Record<Lang, Dict> = { en, fr, ar };

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  dir: "ltr" | "rtl";
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (stored === "en" || stored === "fr" || stored === "ar") setLangState(stored);
    } catch {}
  }, []);

  const dir: "ltr" | "rtl" = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = dir;
    }
  }, [lang, dir]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
  };

  const value = useMemo<Ctx>(() => ({ lang, setLang, t: DICTS[lang], dir }), [lang, dir]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

/** Merge translated content overrides on top of the base SiteContent (from DB / defaults). */
export function applyTranslations(base: SiteContent, t: Dict): SiteContent {
  return { ...base, ...t.content } as SiteContent;
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  const langs: Lang[] = ["en", "fr", "ar"];
  return (
    <div className={`inline-flex items-center rounded-md border border-border overflow-hidden text-xs font-semibold ${className}`}>
      {langs.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className={`px-2 py-1.5 uppercase tracking-wider transition ${lang === l ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:text-primary"}`}
          aria-pressed={lang === l}
          aria-label={`Switch language to ${l.toUpperCase()}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
