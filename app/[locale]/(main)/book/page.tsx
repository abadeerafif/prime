import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { mapsLink, site } from "@/lib/site";
import { metaFor } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { corporate } from "@/content/about";
import { home } from "@/content/home";
import { formOptions } from "@/content/options";
import { t } from "@/content/types";
import { dictFor } from "@/dictionaries";
import { PageHero } from "@/components/ui/PageHero";
import { ConsultationForm } from "@/components/forms/ConsultationForm";
import { PinIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";

const PATH = "/book";

export async function generateMetadata({ params }: PageProps<"/[locale]/book">) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return metaFor(locale, PATH, corporate.book.seo);
}

export default async function BookPage({ params }: PageProps<"/[locale]/book">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = dictFor(locale);
  const options = formOptions(locale);
  return (
    <main data-hide-actionbar>
      <JsonLd data={breadcrumbSchema(locale, PATH)} />
      <PageHero locale={locale} path={PATH} h1={t(corporate.book.h1, locale)} intro={t(corporate.book.intro, locale)} tone="dark" />
      <section data-theme-section="paper" className="section-y relative z-10">
        <div className="container-prime grid-prime gap-y-14">
          <Reveal className="order-2 col-span-4 md:col-span-6 lg:order-1 lg:col-span-4">
            <ol className="space-y-8" role="list">
              {home.steps.map((s, i) => (
                <li key={i} className="flex gap-5 border-t border-theme pt-5">
                  <span className="font-display-latin w-10 shrink-0 text-2xl leading-none text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="font-display text-title text-theme">{t(s.title, locale)}</p>
                    <p className="text-body mt-2 text-theme-muted">{t(s.body, locale)}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-stack-lg flex items-start gap-3 text-theme-muted">
              <PinIcon className="mt-1 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="text-body">{site.address[locale]}</p>
                <a href={mapsLink} target="_blank" rel="noreferrer" className="link-line text-label mt-2 inline-block text-theme">
                  {d.common.openMap}
                </a>
              </div>
            </div>
          </Reveal>
          <Reveal className="order-1 col-span-4 md:col-span-6 lg:order-2 lg:col-span-7 lg:col-start-6">
            <div data-surface="dark" className="rounded-card-lg bg-charcoal p-card-lg text-theme">
              <ConsultationForm
                variant="general"
                specialties={options.specialties}
                hairSpecialty={options.hairSpecialty}
                doctors={options.doctors}
              />
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
