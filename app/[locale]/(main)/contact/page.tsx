import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { hoursFor, mapsLink, site, whatsappUrl } from "@/lib/site";
import { metaFor } from "@/lib/seo";
import { breadcrumbSchema, clinicSchema } from "@/lib/schema";
import { corporate } from "@/content/about";
import { formOptions } from "@/content/options";
import { t } from "@/content/types";
import { dictFor } from "@/dictionaries";
import { PageHero } from "@/components/ui/PageHero";
import { ConsultationForm } from "@/components/forms/ConsultationForm";
import { PinIcon } from "@/components/ui/Icons";
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
  const hours = hoursFor(locale);
  const wa = whatsappUrl();
  const rows = [
    hours ? { label: d.common.hours, value: hours } : null,
    site.phone ? { label: d.common.phone, value: site.phone, href: `tel:${site.phone}` } : null,
    wa ? { label: d.common.whatsappShort, value: `+${site.whatsapp}`, href: wa } : null,
    site.email ? { label: d.common.email, value: site.email, href: `mailto:${site.email}` } : null,
  ].filter((x): x is { label: string; value: string; href?: string } => x !== null);

  return (
    <main>
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
            <a href={mapsLink} target="_blank" rel="noreferrer" className="link-line text-label mt-6 inline-block text-theme">
              {d.common.openMap}
            </a>
            {rows.length > 0 && (
              <dl className="mt-stack-lg grid gap-6 sm:grid-cols-2">
                {rows.map((r) => (
                  <div key={r.label} className="border-t border-theme pt-4">
                    <dt className="text-label text-accent">{r.label}</dt>
                    <dd className="text-body-lg mt-2 text-theme" dir={r.href ? "ltr" : undefined}>
                      {r.href ? (
                        <a href={r.href} className="link-line">
                          {r.value}
                        </a>
                      ) : (
                        r.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
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
            <div data-surface="dark" className="rounded-card-lg bg-charcoal p-card-lg text-theme">
              <ConsultationForm variant="short" specialties={options.specialties} hairSpecialty={options.hairSpecialty} />
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
