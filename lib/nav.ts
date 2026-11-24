import type { Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { HAIR, href, isPathVisible } from "@/content/registry";
import { hubs } from "@/content/hubs";
import { t, type HubId } from "@/content/types";
import { dictFor } from "@/dictionaries";
import type { NavConfig, NavGroup, NavLink } from "@/components/sections/Navigation";

const visible = <T extends NavLink | NavGroup>(item: T | null): item is T => item !== null;

export function mainNavConfig(locale: Locale): NavConfig {
  const d = dictFor(locale);
  const hubLink = (id: HubId): NavLink => ({
    label: t(hubs.find((h) => h.id === id)!.name, locale),
    href: href(locale, `/${id}`),
  });
  const col = (title: string, column: "skin" | "surgery" | "smile") => ({
    title,
    links: hubs.filter((h) => h.column === column).map((h) => hubLink(h.id)),
  });

  return {
    variant: "main",
    logo: { alt: t(site.name, locale) },
    homeHref: href(locale, ""),
    items: [
      {
        label: d.nav.specialties,
        columns: [col(d.nav.colSkin, "skin"), col(d.nav.colSurgery, "surgery"), col(d.nav.colSmile, "smile")],
        feature: { label: t(site.hairName, locale), text: d.nav.hairFeature, href: href(locale, HAIR) },
        footer: { label: d.nav.allSpecialties, href: href(locale, "/specialties") },
      },
      { label: d.nav.hair, href: href(locale, HAIR), highlight: true },
      { label: d.nav.team, href: href(locale, "/doctors") },
      isPathVisible("/results") ? { label: d.nav.results, href: href(locale, "/results") } : null,
      { label: d.nav.guide, href: href(locale, "/blog") },
      { label: d.nav.contact, href: href(locale, "/contact") },
    ].filter(visible),
    cta: { label: d.nav.cta, href: href(locale, "/book") },
    labels: {
      menu: d.nav.menu,
      close: d.nav.close,
      langToggle: d.nav.langToggle,
      langToggleAria: d.nav.langToggleAria,
      primary: d.nav.primary,
    },
  };
}

export function hairNavConfig(locale: Locale): NavConfig {
  const d = dictFor(locale);
  const h = d.hairNav;
  const link = (label: string, slug: string): NavLink | null => {
    const path = slug ? `${HAIR}/${slug}` : HAIR;
    return isPathVisible(path) ? { label, href: href(locale, path) } : null;
  };
  const group = (label: string, links: (NavLink | null)[]): NavGroup => ({
    label,
    columns: [{ links: links.filter(visible) }],
  });

  return {
    variant: "hair",
    logo: { alt: t(site.hairName, locale), text: "Prime Hair Transplant" },
    homeHref: href(locale, HAIR),
    brandLine: { label: h.partOf, href: href(locale, "") },
    items: [
      group(h.transplant, [
        link(h.overview, "what-is-hair-transplant"),
        link(h.fue, "fue"),
        link(h.dhi, "dhi"),
        link(h.fueVsDhi, "fue-vs-dhi"),
        link(h.hairline, "hairline-restoration"),
        link(h.crown, "crown-hair-transplant"),
      ]),
      group(h.journey, [
        link(h.candidacy, "am-i-a-candidate"),
        link(h.steps, "procedure-steps"),
        link(h.recovery, "recovery"),
        link(h.timeline, "growth-timeline"),
      ]),
      link(h.results, "results"),
      link(h.doctor, "specialist"),
      link(h.cost, "cost"),
      link(h.faqs, "faq"),
    ].filter(visible),
    cta: { label: h.cta, href: href(locale, `${HAIR}/book`) },
    back: { label: h.back, href: href(locale, "") },
    labels: {
      menu: d.nav.menu,
      close: d.nav.close,
      langToggle: d.nav.langToggle,
      langToggleAria: d.nav.langToggleAria,
      primary: d.nav.primary,
    },
  };
}
