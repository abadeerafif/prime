import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { metaFor } from "@/lib/seo";
import { blockFaqs, breadcrumbSchema, faqSchema } from "@/lib/schema";
import { corporate } from "@/content/about";
import { generalFaq } from "@/content/faq";
import { home } from "@/content/home";
import { HAIR, href } from "@/content/registry";
import { t } from "@/content/types";
import { dictFor } from "@/dictionaries";
import { PageHero } from "@/components/ui/PageHero";
import { BlockRenderer } from "@/components/ui/BlockRenderer";
import { CtaBand } from "@/components/ui/CtaBand";
import { LinkCard } from "@/components/ui/LinkCard";
import { JsonLd } from "@/components/seo/JsonLd";

const PATH = "/faq";

export async function generateMetadata({ params }: PageProps<"/[locale]/faq">) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return metaFor(locale, PATH, corporate.faq.seo);
}

export default async function FaqPage({ params }: PageProps<"/[locale]/faq">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = dictFor(locale);
  return (
    <main>
      <JsonLd data={[breadcrumbSchema(locale, PATH), faqSchema(blockFaqs([generalFaq]), locale)]} />
      <PageHero locale={locale} path={PATH} h1={t(corporate.faq.h1, locale)} tone="dark" />
      <section data-theme-section="paper" className="section-y relative z-10">
        <div className="container-prime grid-prime gap-y-12">
          <div className="col-span-4 md:col-span-6 lg:col-span-8">
            <BlockRenderer blocks={[generalFaq]} locale={locale} />
          </div>
          <div className="col-span-4 md:col-span-6 lg:col-span-3 lg:col-start-10">
            <div className="lg:sticky lg:top-anchor">
              <LinkCard href={href(locale, `${HAIR}/faq`)} title={d.common.hairFaqLink} text={d.common.hairFaqLinkText} tag={d.nav.hair} dark />
            </div>
          </div>
        </div>
      </section>
      <CtaBand locale={locale} text={t(home.finalCta, locale)} />
    </main>
  );
}
