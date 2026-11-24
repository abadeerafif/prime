const env = (v?: string) => (v && v.trim() ? v.trim() : null);

/**
 * Clinic facts and contact details. Unconfirmed details come from env vars;
 * a null value means the row, link or button is not rendered at all.
 */
export const site = {
  url: env(process.env.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:3000",
  name: { ar: "برايم لعيادات التجميل", en: "Prime Aesthetic Clinics" },
  hairName: { ar: "برايم لزراعة الشعر", en: "Prime Hair Transplant" },
  address: {
    ar: "٥٦ شارع سوريا، المهندسين، الدور الثاني، عمارة بنك مصر، الجيزة",
    en: "56 Syria Street, Mohandessin, 2nd Floor, Banque Misr Building, Giza, Egypt",
  },
  whatsapp: env(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER),
  phone: env(process.env.NEXT_PUBLIC_PHONE),
  email: env(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  hoursAr: env(process.env.NEXT_PUBLIC_HOURS_AR),
  hoursEn: env(process.env.NEXT_PUBLIC_HOURS_EN),
  mapEmbed: env(process.env.NEXT_PUBLIC_MAP_EMBED_URL),
  instagram: env(process.env.NEXT_PUBLIC_INSTAGRAM_URL),
  facebook: env(process.env.NEXT_PUBLIC_FACEBOOK_URL),
  tiktok: env(process.env.NEXT_PUBLIC_TIKTOK_URL),
  showUnverified: process.env.NEXT_PUBLIC_SHOW_UNVERIFIED !== "false",
};

export const whatsappUrl = (text?: string) =>
  site.whatsapp
    ? `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`
    : null;

export const mapsLink =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("56 Syria Street, Mohandessin, Giza, Egypt");

export const hoursFor = (locale: "ar" | "en") => (locale === "ar" ? site.hoursAr : site.hoursEn);
