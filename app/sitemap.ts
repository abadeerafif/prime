import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { routes } from "@/content/registry";

/** Confirmed routes only; unverified and hidden pages stay out until approved. */
export default function sitemap(): MetadataRoute.Sitemap {
  return routes
    .filter((r) => r.status === "confirmed")
    .map((r) => ({
      url: `${site.url}/ar${r.path}`,
      alternates: {
        languages: {
          "ar-EG": `${site.url}/ar${r.path}`,
          en: `${site.url}/en${r.path}`,
        },
      },
    }));
}
