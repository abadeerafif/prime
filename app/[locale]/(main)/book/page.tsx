import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { metaFor } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { corporate } from "@/content/about";
import { home } from "@/content/home";
import { formOptions } from "@/content/options";
import { t } from "@/content/types";
import { dictFor } from "@/dictionaries";
import { PageHero } from "@/components/ui/PageHero";
import { ConsultationForm } from "@/components/forms/ConsultationForm";
import { NumberedList } from "@/components/ui/NumberedList";
import { AddressBlock } from "@/components/ui/AddressBlock";
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
    <main id="main" data-hide-actionbar>
      <JsonLd data={breadcrumbSchema(locale, PATH)} />
      <PageHero locale={locale} path={PATH} h1={t(corporate.book.h1, locale)} intro={t(corporate.book.intro, locale)} tone="dark" />
      <section data-theme-section="paper" className="section-y relative z-10">
        <div className="container-prime grid-prime gap-y-14">
          <Reveal className="order-2 col-span-4 md:col-span-6 lg:order-1 lg:col-span-4">
            <NumberedList items={home.steps.map((s) => ({ title: t(s.title, locale), body: t(s.body, locale) }))} />
            <AddressBlock className="mt-stack-lg" address={site.address[locale]} mapLabel={d.common.openMap} />
          </Reveal>
          <Reveal className="order-1 col-span-4 md:col-span-6 lg:order-2 lg:col-span-7 lg:col-start-6">
            <div data-surface="dark" className="rounded-card-lg bg-charcoal p-card-lg text-theme shadow-lift">
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
