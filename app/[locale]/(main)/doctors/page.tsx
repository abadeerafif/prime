import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { metaFor } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { doctors } from "@/content/doctors";
import { corporate } from "@/content/about";
import { home } from "@/content/home";
import { t } from "@/content/types";
import { PageHero } from "@/components/ui/PageHero";
import { DoctorCard } from "@/components/ui/DoctorCard";
import { CtaBand } from "@/components/ui/CtaBand";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";

const PATH = "/doctors";
const TONES = ["light", "warm", "dark"] as const;

export async function generateMetadata({ params }: PageProps<"/[locale]/doctors">) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return metaFor(locale, PATH, corporate.doctors.seo);
}

export default async function DoctorsPage({ params }: PageProps<"/[locale]/doctors">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <main>
      <JsonLd data={breadcrumbSchema(locale, PATH)} />
      <PageHero
        locale={locale}
        path={PATH}
        h1={t(corporate.doctors.h1, locale)}
        intro={t(corporate.doctors.intro, locale)}
        tone="dark"
      />
      <section data-theme-section="paper" className="section-y relative z-10">
        <div className="container-prime grid gap-x-8 gap-y-head sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((d, i) => (
            <Reveal key={d.id} delay={i * 0.1} y={32} className={i === 1 ? "lg:mt-head" : ""}>
              <DoctorCard doctor={d} locale={locale} tone={TONES[i % TONES.length]} />
            </Reveal>
          ))}
        </div>
      </section>
      <CtaBand locale={locale} text={t(home.finalCta, locale)} />
    </main>
  );
}
