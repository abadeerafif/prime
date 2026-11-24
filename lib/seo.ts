import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import { getRoute } from "@/content/registry";
import { t, type Seo } from "@/content/types";

type Options = { locale: Locale; path: string; title: string; description: string; noindex?: boolean };

export function buildMetadata(o: Options): Metadata {
  return {
    title: o.title,
    description: o.description,
    alternates: {
      canonical: `/${o.locale}${o.path}`,
      languages: { "ar-EG": `/ar${o.path}`, en: `/en${o.path}`, "x-default": `/ar${o.path}` },
    },
    openGraph: {
      title: o.title,
      description: o.description,
      locale: o.locale === "ar" ? "ar_EG" : "en_US",
      type: "website",
      url: `/${o.locale}${o.path}`,
    },
    robots: o.noindex ? { index: false, follow: true } : undefined,
  };
}

/** Metadata from a content SEO block; unverified routes are kept out of the index. */
export function metaFor(locale: Locale, path: string, seo: Seo): Metadata {
  return buildMetadata({
    locale,
    path,
    title: t(seo.title, locale),
    description: t(seo.description, locale),
    noindex: getRoute(path)?.status !== "confirmed",
  });
}
