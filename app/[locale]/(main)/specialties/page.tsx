import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { metaFor } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { corporate } from "@/content/about";
import { hubs } from "@/content/hubs";
import { home } from "@/content/home";
import { HAIR, href } from "@/content/registry";
import { t } from "@/content/types";
import { dictFor } from "@/dictionaries";
import { PageHero } from "@/components/ui/PageHero";
import { CtaBand } from "@/components/ui/CtaBand";
import { LinkCard, firstSentence } from "@/components/ui/LinkCard";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";

const PATH = "/specialties";

export async function generateMetadata({ params }: PageProps<"/[locale]/specialties">) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return metaFor(locale, PATH, corporate.specialties.seo);
}

export default async function SpecialtiesPage({ params }: PageProps<"/[locale]/specialties">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = dictFor(locale);
  const columns = [
    { id: "skin", title: d.nav.colSkin },
    { id: "surgery", title: d.nav.colSurgery },
    { id: "smile", title: d.nav.colSmile },
  ] as const;

  return (
    <main id="main">
      <JsonLd data={breadcrumbSchema(locale, PATH)} />
      <PageHero
        locale={locale}
        path={PATH}
        h1={t(corporate.specialties.h1, locale)}
        intro={t(corporate.specialties.intro, locale)}
        tone="dark"
      />
      <section data-theme-section="paper" className="section-y relative z-10">
        <div className="container-prime space-y-20">
          {columns.map((col) => (
            <div key={col.id}>
              <h2 className="text-label mb-stack flex items-center gap-4 text-accent">
                <span className="hairline-gold inline-block w-10" />
                {col.title}
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="list">
                {hubs
                  .filter((h) => h.column === col.id)
                  .map((h, i) => (
                    <Reveal as="li" key={h.id} delay={i * 0.06} y={24}>
                      <LinkCard href={href(locale, `/${h.id}`)} title={t(h.name, locale)} text={firstSentence(t(h.intro, locale))} />
                    </Reveal>
                  ))}
              </ul>
            </div>
          ))}
          <Reveal className="max-w-xl">
            <LinkCard
              href={href(locale, HAIR)}
              title={t(site.hairName, locale)}
              text={t(home.hairBand.body, locale)}
              tag={d.nav.hair}
              dark
            />
          </Reveal>
        </div>
      </section>
      <CtaBand locale={locale} text={t(home.finalCta, locale)} />
    </main>
  );
}
