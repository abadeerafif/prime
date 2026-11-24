import type { Locale } from "@/lib/i18n";
import { t } from "./types";
import { hubs } from "./hubs";
import { doctors } from "./doctors";

export const HAIR_SPECIALTY = { ar: "زراعة الشعر", en: "Hair Transplantation" };

/** Localised select options for the consultation forms. */
export function formOptions(locale: Locale) {
  return {
    specialties: [...hubs.map((h) => t(h.name, locale)), t(HAIR_SPECIALTY, locale)],
    hairSpecialty: t(HAIR_SPECIALTY, locale),
    doctors: doctors.map((d) => t(d.name, locale)),
  };
}
