import type { Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import type { Bi, Status } from "./types";
import { hubs } from "./hubs";
import { services } from "./services";
import { doctors } from "./doctors";
import { hairPages } from "./hair/pages";
import { hairBook } from "./hair/book";
import { articles } from "./articles";
import { about, corporate } from "./about";
import { privacy, terms } from "./legal";

export type RouteEntry = {
  path: string;
  status: Status;
  title: Bi;
  parent?: string;
  group: "main" | "hub" | "service" | "doctor" | "hair" | "article" | "legal";
};

export const HAIR = "/hair-transplant";

const main = (path: string, title: Bi, status: Status = "confirmed"): RouteEntry => ({
  path,
  status,
  title,
  parent: "",
  group: "main",
});

export const routes: RouteEntry[] = [
  { path: "", status: "confirmed", title: { ar: "الرئيسية", en: "Home" }, group: "main" },
  main("/about", about.h1),
  main("/doctors", corporate.doctors.h1),
  main("/specialties", corporate.specialties.h1),
  main("/blog", corporate.blog.h1),
  main("/faq", corporate.faq.h1),
  main("/contact", corporate.contact.h1),
  main("/book", corporate.book.h1),
  main("/results", corporate.results.h1, "hidden"),
  { path: "/privacy", status: privacy.status, title: privacy.h1, parent: "", group: "legal" },
  { path: "/terms", status: terms.status, title: terms.h1, parent: "", group: "legal" },
  ...doctors.map<RouteEntry>((d) => ({
    path: `/doctors/${d.id}`,
    status: "confirmed",
    title: d.name,
    parent: "/doctors",
    group: "doctor",
  })),
  ...hubs.map<RouteEntry>((h) => ({ path: `/${h.id}`, status: "confirmed", title: h.name, parent: "", group: "hub" })),
  ...services.map<RouteEntry>((s) => ({
    path: `/${s.hub}/${s.slug}`,
    status: s.status,
    title: s.h1,
    parent: `/${s.hub}`,
    group: "service",
  })),
  { path: HAIR, status: "confirmed", title: { ar: "زراعة الشعر", en: "Hair Transplant" }, parent: "", group: "hair" },
  ...hairPages.map<RouteEntry>((p) => ({
    path: `${HAIR}/${p.slug}`,
    status: p.status,
    title: p.h1,
    parent: HAIR,
    group: "hair",
  })),
  { path: `${HAIR}/book`, status: "confirmed", title: hairBook.h1, parent: HAIR, group: "hair" },
  ...articles.map<RouteEntry>((a) => ({
    path: `${HAIR}/articles/${a.slug}`,
    status: a.status,
    title: a.h1,
    parent: HAIR,
    group: "article",
  })),
];

const byPath = new Map(routes.map((r) => [r.path, r]));

export const getRoute = (path: string) => byPath.get(path);

export const isVisible = (r?: RouteEntry) =>
  !!r && (r.status === "confirmed" || (r.status === "unverified" && site.showUnverified));

export const isPathVisible = (path: string) => isVisible(getRoute(path));

export const href = (locale: Locale, path: string) => `/${locale}${path}`;

export const visibleLinks = (paths: string[] = []) =>
  paths.map(getRoute).filter((r): r is RouteEntry => isVisible(r));

/** Ancestors from home to the given path, inclusive. */
export function trail(path: string): RouteEntry[] {
  const out: RouteEntry[] = [];
  let cur = getRoute(path);
  while (cur) {
    out.unshift(cur);
    cur = cur.parent === undefined ? undefined : getRoute(cur.parent);
  }
  return out;
}
