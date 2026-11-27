import type { Locale } from "@/lib/i18n";
import { clinicGeo, hoursFor, mapsLink, site } from "@/lib/site";
import { trail } from "@/content/registry";
import { t, type Block, type ContentPage, type Doctor, type Faq } from "@/content/types";

const abs = (locale: Locale, path: string) => `${site.url}/${locale}${path}`;

const address = (locale: Locale) => ({
  "@type": "PostalAddress",
  streetAddress: locale === "ar" ? "٥٦ شارع سوريا، الدور الثاني، عمارة بنك مصر" : "56 Syria Street, 2nd Floor, Banque Misr Building",
  addressLocality: locale === "ar" ? "المهندسين، الجيزة" : "Mohandessin, Giza",
  addressCountry: "EG",
});

export function clinicSchema(locale: Locale, opts: { hair?: boolean } = {}) {
  const clinic: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: t(site.name, locale),
    url: abs(locale, ""),
    address: address(locale),
    geo: {
      "@type": "GeoCoordinates",
      latitude: clinicGeo.lat,
      longitude: clinicGeo.lng,
    },
    hasMap: mapsLink,
  };
  if (site.phones.length === 1) clinic.telephone = site.phones[0].dial;
  else if (site.phones.length > 1) clinic.telephone = site.phones.map((p) => p.dial);
  const hours = hoursFor(locale);
  if (hours) clinic.openingHours = hours;
  if (opts.hair) {
    clinic.department = {
      "@type": "MedicalClinic",
      name: t(site.hairName, locale),
      url: abs(locale, "/hair-transplant"),
      address: address(locale),
    };
  }
  return clinic;
}

export function physicianSchema(doctor: Doctor, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: t(doctor.name, locale),
    medicalSpecialty: t(doctor.title, locale),
    url: abs(locale, `/doctors/${doctor.id}`),
    worksFor: { "@type": "MedicalClinic", name: t(site.name, locale), url: abs(locale, "") },
  };
}

export function procedureSchema(page: ContentPage, locale: Locale, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: t(page.h1, locale),
    description: t(page.seo.description, locale),
    url: abs(locale, path),
  };
}

export function breadcrumbSchema(locale: Locale, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail(path).map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t(r.title, locale),
      item: abs(locale, r.path),
    })),
  };
}

export function faqSchema(faqs: Faq[], locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: t(f.q, locale),
      acceptedAnswer: { "@type": "Answer", text: t(f.a, locale) },
    })),
  };
}

/** Every FAQ inside a list of blocks, flattened. */
export function blockFaqs(blocks: Block[]): Faq[] {
  return blocks.flatMap((b) => (b.type === "faq" ? b.groups.flatMap((g) => g.items) : []));
}
