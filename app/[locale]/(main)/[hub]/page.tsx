import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { metaFor } from "@/lib/seo";
import { blockFaqs, breadcrumbSchema, faqSchema } from "@/lib/schema";
import { hubs } from "@/content/hubs";
import { services } from "@/content/services";
import { doctors } from "@/content/doctors";
import { home } from "@/content/home";
import { href, isPathVisible } from "@/content/registry";
import { t } from "@/content/types";
import { dictFor } from "@/dictionaries";
import { PageHero } from "@/components/ui/PageHero";
import { BlockRenderer } from "@/components/ui/BlockRenderer";
import { OnThisPage } from "@/components/ui/OnThisPage";
import { DoctorCard } from "@/components/ui/DoctorCard";
import { CtaBand } from "@/components/ui/CtaBand";
import { RelatedLinks } from "@/components/ui/RelatedLinks";
import { LinkCard, firstSentence } from "@/components/ui/LinkCard";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";

export function generateStaticParams() {
  return hubs.map((h) => ({ hub: h.id }));
}

const findHub = (id: string) => hubs.find((h) => h.id === id);

export async function generateMetadata({ params }: PageProps<"/[locale]/[hub]">) {
  const { locale, hub: id } = await params;
  const hub = findHub(id);
  if (!isLocale(locale) || !hub) return {};
  return metaFor(locale, `/${hub.id}`, hub.seo);
}

export default async function HubPage({ params }: PageProps<"/[locale]/[hub]">) {
  const { locale, hub: id } = await params;
  const hub = findHub(id);
  if (!isLocale(locale) || !hub) notFound();
  const d = dictFor(locale);
  const path = `/${hub.id}`;
  const doctor = doctors.find((x) => x.id === hub.doctor)!;
  const list = services.filter((s) => s.hub === hub.id && isPathVisible(`/${s.hub}/${s.slug}`));
  const blocks = hub.blocks ?? [];
  const toc = blocks.filter((b) => b.title).map((b) => ({ id: b.id, label: t(b.title!, locale) }));
  const faqs = blockFaqs(blocks);

  return (
    <main id="main">
      <JsonLd data={[breadcrumbSchema(locale, path), ...(faqs.length ? [faqSchema(faqs, locale)] : [])]} />
      <PageHero
        locale={locale}
        path={path}
        label={d.nav.specialties}
        h1={t(hub.h1, locale)}
        heroLine={hub.heroLine && t(hub.heroLine, locale)}
        intro={t(hub.intro, locale)}
        tone="dark"
        primary={{ label: d.common.book, href: href(locale, "/book") }}
        showWhatsapp
      />

      <div data-theme-section="paper" className="section-y relative z-10">
        <div className="container-prime grid-prime gap-y-16">
          <div className="col-span-4 md:col-span-6 lg:col-span-7">
            <h2 className="text-label mb-stack text-accent">{d.common.services}</h2>
            {list.length > 0 || hub.id === "medical-aesthetics" ? (
              <ul className="grid gap-4 sm:grid-cols-2" role="list">
                {hub.id === "medical-aesthetics" &&
                  (["botox", "fillers"] as const).map((other) => {
                    const h = findHub(other)!;
                    return (
                      <Reveal as="li" key={other} y={24}>
                        <LinkCard href={href(locale, `/${other}`)} title={t(h.name, locale)} text={firstSentence(t(h.intro, locale))} tag={d.nav.specialties} />
                      </Reveal>
                    );
                  })}
                {list.map((s, i) => (
                  <Reveal as="li" key={s.slug} delay={(i % 2) * 0.08} y={24}>
                    <LinkCard
                      href={href(locale, `/${s.hub}/${s.slug}`)}
                      title={t(s.h1, locale)}
                      text={firstSentence(t(s.intro ?? s.seo.description, locale))}
                    />
                  </Reveal>
                ))}
              </ul>
            ) : (
              <p className="text-body-lg max-w-[52ch] text-theme-muted">{d.common.allServicesSoon}</p>
            )}
          </div>
          <div className="col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9">
            <div className="lg:sticky lg:top-anchor">
              <DoctorCard doctor={doctor} locale={locale} variant="inline" text={t(doctor.headline, locale)} />
            </div>
          </div>
        </div>

        {blocks.length > 0 && (
          <div className="container-prime grid-prime gap-y-10 pt-section">
            <aside className="col-span-4 md:col-span-6 lg:col-span-3">
              <OnThisPage items={toc} title={d.common.onThisPage} />
            </aside>
            <div className="col-span-4 md:col-span-6 lg:col-span-7 lg:col-start-5">
              <div className="max-w-[46rem] space-y-head">
                <BlockRenderer blocks={blocks} locale={locale} />
              </div>
            </div>
          </div>
        )}

        <RelatedLinks locale={locale} paths={hub.related} title={d.common.related} />
      </div>

      <CtaBand locale={locale} text={t(home.finalCta, locale)} />
    </main>
  );
}
