export const CONTENT_KEY = "home";

export type Program = { title: string; desc: string };
export type Plan = { name: string; price: string; per: string; feats: string[]; popular?: boolean };

export type SiteContent = {
  brandName: string;
  tagline: string;
  locationBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroDescription: string;
  aboutP1: string;
  aboutP2: string;
  programs: Program[];
  plans: Plan[];
  address: string;
  addressSub: string;
  phone: string;
  phone2: string;
  hours: string;
  mapQuery: string;
  instagram: string;
  instagramUrl: string;
  facebook: string;
  facebookUrl: string;
};

export const DEFAULT_CONTENT: SiteContent = {
  brandName: "OMEGA FITNESS",
  tagline: "HEALTH IS WEALTH",
  locationBadge: "BENI KHIAR · TUNISIA",
  heroTitle: "FORGE THE {HL} VERSION OF YOU.",
  heroHighlight: "STRONGEST",
  heroDescription:
    "At Omega Fitness we don't just train bodies — we build discipline, confidence and a community that pushes you beyond your limits. State-of-the-art equipment. Expert coaches. Real results.",
  aboutP1:
    "Located in the heart of Beni Khiar, Omega Fitness is the destination for serious athletes and beginners alike. Our space combines elite equipment, motivating energy, and coaches who care about your progress.",
  aboutP2:
    "Whether you're chasing strength, fat loss, or just a healthier life — we've built the environment to make it happen.",
  programs: [
    { title: "Strength", desc: "Build raw power with free weights, racks and Hammer Strength machines." },
    { title: "HIIT & Cardio", desc: "Burn fat and elevate endurance with high-intensity circuits." },
    { title: "Personal Training", desc: "1-on-1 coaching tailored to your goals, level and lifestyle." },
    { title: "Bodybuilding", desc: "Sculpt and shred with structured hypertrophy programs." },
  ],
  plans: [
    { name: "Monthly", price: "80", per: "DT / month", feats: ["Full gym access", "Locker room", "Free WiFi"] },
    { name: "Quarterly", price: "210", per: "DT / 3 months", feats: ["Full gym access", "1 PT session/month", "Nutrition guide", "Group classes"], popular: true },
    { name: "Annual", price: "720", per: "DT / year", feats: ["Full gym access", "4 PT sessions", "Nutrition plan", "All classes", "Priority booking"] },
  ],
  address: "Avenue Habib Bourguiba",
  addressSub: "Beni Khiar 8060, Tunisia",
  phone: "+216 20 084 304",
  phone2: "+216 50 084 304",
  hours: "Open Daily · Closes 11 PM",
  mapQuery: "Avenue Habib Bourguiba, Beni Khiar, Tunisia",
  instagram: "Omegafitness.club",
  instagramUrl: "https://instagram.com/omegafitness.club",
  facebook: "club.omegafit",
  facebookUrl: "https://facebook.com/club.omegafit",
};
