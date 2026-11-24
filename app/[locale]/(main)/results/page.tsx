import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { metaFor } from "@/lib/seo";
import { corporate } from "@/content/about";
import { hairPages } from "@/content/hair/pages";
import { home } from "@/content/home";
import { isPathVisible } from "@/content/registry";
import { t } from "@/content/types";
import { PageHero } from "@/components/ui/PageHero";
import { CtaBand } from "@/components/ui/CtaBand";
import { Disclaimer } from "@/components/ui/Disclaimer";

const PATH = "/results";

export async function generateMetadata({ params }: PageProps<"/[locale]/results">) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return metaFor(locale, PATH, corporate.results.seo);
}

/** Gallery shell; stays hidden (404) until consented case images exist. */
export default async function ResultsPage({ params }: PageProps<"/[locale]/results">) {
  const { locale } = await params;
  if (!isLocale(locale) || !isPathVisible(PATH)) notFound();
  const hairResults = hairPages.find((p) => p.slug === "results")!;
  const empty = hairResults.blocks.find((b) => b.id === "coming-soon");
  return (
    <main>
      <PageHero locale={locale} path={PATH} h1={t(corporate.results.h1, locale)} intro={t(corporate.results.intro, locale)} tone="dark" />
      <section data-theme-section="paper" className="section-y relative z-10">
        <div className="container-prime">
          <ul className="flex flex-wrap gap-2" role="list">
            {corporate.resultsFilters.map((f) => (
              <li key={f.en} className="rounded-full border border-theme px-4 py-2 text-sm text-theme">
                {t(f, locale)}
              </li>
            ))}
          </ul>
          {empty?.type === "prose" && <p className="text-body-lg measure mt-stack-lg text-theme-muted">{t(empty.body[0], locale)}</p>}
          <Disclaimer locale={locale} className="measure mt-stack-lg" />
        </div>
      </section>
      <CtaBand locale={locale} text={t(home.finalCta, locale)} />
    </main>
  );
}
