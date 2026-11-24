import "server-only";
import type { Locale } from "@/lib/i18n";
import en from "./en.json";
import ar from "./ar.json";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { en, ar: ar as Dictionary };

export const getDictionary = async (locale: Locale) => dictionaries[locale];

/** Synchronous access for server components that render inside a page. */
export const dictFor = (locale: Locale) => dictionaries[locale];

/** The few strings client components read; the rest never leaves the server. */
export type ClientDictionary = {
  form: Dictionary["form"];
  hairNav: Pick<Dictionary["hairNav"], "cta">;
  common: Pick<Dictionary["common"], "openMap">;
};

export const clientDictFor = (locale: Locale): ClientDictionary => {
  const d = dictionaries[locale];
  return { form: d.form, hairNav: { cta: d.hairNav.cta }, common: { openMap: d.common.openMap } };
};
