import "server-only";
import type { Locale } from "@/lib/i18n";
import en from "./en.json";
import ar from "./ar.json";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { en, ar: ar as Dictionary };

export const getDictionary = async (locale: Locale) => dictionaries[locale];

/** Synchronous access for server components that render inside a page. */
export const dictFor = (locale: Locale) => dictionaries[locale];
