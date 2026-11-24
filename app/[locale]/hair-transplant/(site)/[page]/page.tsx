import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { metaFor } from "@/lib/seo";
import { blockFaqs, breadcrumbSchema, faqSchema, physicianSchema, procedureSchema } from "@/lib/schema";
import { hairPages } from "@/content/hair/pages";
import { doctors } from "@/content/doctors";
import { HAIR, isPathVisible } from "@/content/registry";
import { t } from "@/content/types";
import { dictFor } from "@/dictionaries";
import { site } from "@/lib/site";
import { ContentPageView } from "@/components/templates/ContentPageView";
import { DoctorProfile } from "@/components/templates/DoctorProfile";
import { JsonLd } from "@/components/seo/JsonLd";

export function generateStaticParams() {
  return hairPages.map((p) => ({ page: p.slug }));
}

const PROCEDURES = new Set(["fue", "dhi"]);

export async function generateMetadata({ params }: PageProps<"/[locale]/hair-transplant/[page]">) {
  const { locale, page: slug } = await params;
  const page = hairPages.find((p) => p.slug === slug);
  if (!isLocale(locale) || !page) return {};
  return metaFor(locale, `${HAIR}/${slug}`, page.seo);
}

export default async function HairSubPage({ params }: PageProps<"/[locale]/hair-transplant/[page]">) {
  const { locale, page: slug } = await params;
  const page = hairPages.find((p) => p.slug === slug);
  const path = `${HAIR}/${slug}`;
  if (!isLocale(locale) || !page || !isPathVisible(path)) notFound();
  const d = dictFor(locale);
  const faqs = blockFaqs(page.blocks);
  const schema: object[] = [breadcrumbSchema(locale, path)];
  if (PROCEDURES.has(slug)) schema.push(procedureSchema(page, locale, path));
  if (faqs.length) schema.push(faqSchema(faqs, locale));

  if (slug === "specialist") {
    const doctor = doctors.find((x) => x.id === "dr-mahmoud-abdeen")!;
    const narrative = page.blocks[0]?.type === "prose" ? t(page.blocks[0].body[0], locale) : undefined;
    return (
      <main id="main">
        <JsonLd data={[physicianSchema(doctor, locale), ...schema]} />
        <DoctorProfile
          doctor={doctor}
          locale={locale}
          path={path}
          tone="stone"
          narrative={narrative}
          related={page.related}
          bookHref={`${HAIR}/book`}
          closing={page.closing && t(page.closing, locale)}
        />
      </main>
    );
  }

  return (
    <main id="main">
      <JsonLd data={schema} />
      <ContentPageView
        page={page}
        locale={locale}
        path={path}
        tone="stone"
        label={t(site.hairName, locale)}
        bookHref={`${HAIR}/book`}
        bookLabel={d.hairNav.cta}
      />
    </main>
  );
}
