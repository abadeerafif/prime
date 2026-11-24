import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { metaFor } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { about } from "@/content/about";
import { home } from "@/content/home";
import { href } from "@/content/registry";
import { t } from "@/content/types";
import { dictFor } from "@/dictionaries";
import { PageHero } from "@/components/ui/PageHero";
import { CtaBand } from "@/components/ui/CtaBand";
import { ArrowIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";

const PATH = "/about";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return metaFor(locale, PATH, about.seo);
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = dictFor(locale);
  return (
    <main>
      <JsonLd data={breadcrumbSchema(locale, PATH)} />
      <PageHero locale={locale} path={PATH} h1={t(about.h1, locale)} heroLine={t(home.pillars[1].title, locale)} tone="dark" />
      <section data-theme-section="paper" className="section-y relative z-10">
        <div className="container-prime grid-prime gap-y-12">
          <Reveal as="p" className="font-display text-display-sm col-span-4 text-balance text-theme md:col-span-6 lg:col-span-6">
            {t(about.body, locale)}
          </Reveal>
          <Reveal as="p" className="text-body-lg col-span-4 text-theme-muted md:col-span-6 lg:col-span-5 lg:col-start-8" delay={0.15}>
            {t(about.approach, locale)}
          </Reveal>
        </div>

        <div className="container-prime section-y !pb-0">
          <h2 className="text-label mb-stack text-accent">{d.common.values}</h2>
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-theme bg-[var(--line)] md:grid-cols-5" role="list">
            {about.values.map((v, i) => (
              <Reveal as="li" key={v.en} delay={i * 0.06} y={20} className={`bg-[var(--bg)] p-card ${i === 4 ? "col-span-2 md:col-span-1" : ""}`}>
                <span className="font-display-latin block text-[2rem] leading-none text-accent">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-title mt-stack-sm block text-theme">{t(v, locale)}</span>
              </Reveal>
            ))}
          </ul>
          <Link href={href(locale, "/doctors")} className="link-line text-label mt-stack-lg inline-flex items-center gap-2 text-theme">
            {d.common.meetTeam}
            <ArrowIcon />
          </Link>
        </div>
      </section>
      <CtaBand locale={locale} text={t(home.finalCta, locale)} />
    </main>
  );
}
