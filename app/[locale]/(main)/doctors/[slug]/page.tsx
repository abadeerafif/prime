import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { metaFor } from "@/lib/seo";
import { breadcrumbSchema, faqSchema, physicianSchema } from "@/lib/schema";
import { doctors } from "@/content/doctors";
import { DoctorProfile } from "@/components/templates/DoctorProfile";
import { JsonLd } from "@/components/seo/JsonLd";

export function generateStaticParams() {
  return doctors.map((d) => ({ slug: d.id }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/doctors/[slug]">) {
  const { locale, slug } = await params;
  const doctor = doctors.find((d) => d.id === slug);
  if (!isLocale(locale) || !doctor) return {};
  return metaFor(locale, `/doctors/${slug}`, doctor.seo);
}

export default async function DoctorPage({ params }: PageProps<"/[locale]/doctors/[slug]">) {
  const { locale, slug } = await params;
  const doctor = doctors.find((d) => d.id === slug);
  if (!isLocale(locale) || !doctor) notFound();
  const path = `/doctors/${slug}`;
  return (
    <main>
      <JsonLd
        data={[
          physicianSchema(doctor, locale),
          breadcrumbSchema(locale, path),
          ...(doctor.faqs.length ? [faqSchema(doctor.faqs, locale)] : []),
        ]}
      />
      <DoctorProfile doctor={doctor} locale={locale} path={path} tone="dark" />
    </main>
  );
}
