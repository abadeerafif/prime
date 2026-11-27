import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { mapsLink, site } from "@/lib/site";
import { metaFor } from "@/lib/seo";
import { breadcrumbSchema, clinicSchema } from "@/lib/schema";
import { corporate } from "@/content/about";
import { formOptions } from "@/content/options";
import { t } from "@/content/types";
import { dictFor } from "@/dictionaries";
import { PageHero } from "@/components/ui/PageHero";
import { ConsultationForm } from "@/components/forms/ConsultationForm";
import { PinIcon } from "@/components/ui/Icons";
import { ContactRows } from "@/components/ui/ContactRows";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";

const PATH = "/contact";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return metaFor(locale, PATH, corporate.contact.seo);
}

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = dictFor(locale);
  const options = formOptions(locale);

  return (
    <main id="main">
      <JsonLd data={[clinicSchema(locale), breadcrumbSchema(locale, PATH)]} />
      <PageHero locale={locale} path={PATH} h1={t(corporate.contact.h1, locale)} intro={t(corporate.contact.intro, locale)} tone="dark" />
      <section data-theme-section="paper" className="section-y relative z-10">
        <div className="container-prime grid-prime gap-y-16">
          <Reveal className="col-span-4 md:col-span-6 lg:col-span-5">
            <h2 className="text-label mb-stack-sm text-accent">{d.common.address}</h2>
            <div className="flex items-start gap-4">
              <PinIcon className="mt-1 h-6 w-6 shrink-0 text-accent" />
              <address className="font-display text-display-sm not-italic text-theme">{site.address[locale]}</address>
            </div>
            <a href={mapsLink} target="_blank" rel="noreferrer" className="link-line text-label mt-6 text-theme">
              {d.common.openMap}
            </a>
            <ContactRows locale={locale} variant="grid" className="mt-stack-lg" />
            {site.mapEmbed && (
              <iframe
                src={site.mapEmbed}
                title={d.common.openMap}
                loading="lazy"
                className="mt-stack-lg aspect-[4/3] w-full rounded-card border border-theme"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </Reveal>
          <Reveal className="col-span-4 md:col-span-6 lg:col-span-6 lg:col-start-7" delay={0.15}>
            <div data-surface="dark" className="rounded-card-lg bg-charcoal p-card-lg text-theme shadow-lift">
              <ConsultationForm variant="short" specialties={options.specialties} hairSpecialty={options.hairSpecialty} />
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
