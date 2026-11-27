const env = (v?: string) => (v && v.trim() ? v.trim() : null);

export type PhoneNumber = {
  /** Dialable E.164 value for tel: links and structured data. */
  dial: string;
  /** Human-readable display format. */
  display: string;
};

const DEFAULT_PHONES: PhoneNumber[] = [
  { dial: "+201016895099", display: "+20 101 689 5099" },
  { dial: "+201092079155", display: "+20 109 207 9155" },
];

const parsePhones = (raw: string | null): PhoneNumber[] => {
  if (!raw) return DEFAULT_PHONES;
  const list = raw
    .split(/[,|]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((display) => ({ dial: display.replace(/\s+/g, ""), display }));
  return list.length ? list : DEFAULT_PHONES;
};

const phones = parsePhones(env(process.env.NEXT_PUBLIC_PHONE));

export const clinicGeo = {
  lat: 30.052241,
  lng: 31.192319,
} as const;

export const mapsLink = "https://maps.app.goo.gl/9JQdLvr3eKKCqABJA";

/**
 * Clinic facts and contact details. Confirmed numbers and map location have
 * built-in defaults; optional details come from env vars and are omitted when unset.
 */
export const site = {
  url: env(process.env.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:3000",
  name: { ar: "برايم لعيادات التجميل", en: "Prime Aesthetic Clinics" },
  hairName: { ar: "برايم لزراعة الشعر", en: "Prime Hair Transplant" },
  address: {
    ar: "٥٦ شارع سوريا، المهندسين، الدور الثاني، عمارة بنك مصر، الجيزة",
    en: "56 Syria Street, 2nd Floor, Banque Misr Building, Mohandessin, Giza, Egypt",
  },
  whatsapp: env(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) ?? "201016895099",
  phones,
  phone: phones[0]?.dial ?? null,
  email: env(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  hoursAr: env(process.env.NEXT_PUBLIC_HOURS_AR),
  hoursEn: env(process.env.NEXT_PUBLIC_HOURS_EN),
  mapEmbed:
    env(process.env.NEXT_PUBLIC_MAP_EMBED_URL) ??
    `https://www.google.com/maps?q=${clinicGeo.lat},${clinicGeo.lng}&z=17&output=embed`,
  instagram: env(process.env.NEXT_PUBLIC_INSTAGRAM_URL),
  facebook: env(process.env.NEXT_PUBLIC_FACEBOOK_URL),
  tiktok: env(process.env.NEXT_PUBLIC_TIKTOK_URL),
  showUnverified: process.env.NEXT_PUBLIC_SHOW_UNVERIFIED !== "false",
};

export const whatsappUrl = (text?: string) =>
  site.whatsapp
    ? `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`
    : null;

export const hoursFor = (locale: "ar" | "en") => (locale === "ar" ? site.hoursAr : site.hoursEn);
