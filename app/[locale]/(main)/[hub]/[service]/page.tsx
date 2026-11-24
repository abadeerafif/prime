import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { metaFor } from "@/lib/seo";
import { blockFaqs, breadcrumbSchema, faqSchema, procedureSchema } from "@/lib/schema";
import { services } from "@/content/services";
import { hubs } from "@/content/hubs";
import { isPathVisible } from "@/content/registry";
import { t } from "@/content/types";
import { ContentPageView } from "@/components/templates/ContentPageView";
import { JsonLd } from "@/components/seo/JsonLd";

export function generateStaticParams() {
  return services.map((s) => ({ hub: s.hub, service: s.slug }));
}

const find = (hub: string, slug: string) => services.find((s) => s.hub === hub && s.slug === slug);

export async function generateMetadata({ params }: PageProps<"/[locale]/[hub]/[service]">) {
  const { locale, hub, service } = await params;
  const page = find(hub, service);
  if (!isLocale(locale) || !page) return {};
  return metaFor(locale, `/${hub}/${service}`, page.seo);
}

export default async function ServicePage({ params }: PageProps<"/[locale]/[hub]/[service]">) {
  const { locale, hub, service } = await params;
  const page = find(hub, service);
  const path = `/${hub}/${service}`;
  if (!isLocale(locale) || !page || !isPathVisible(path)) notFound();
  const hubName = hubs.find((h) => h.id === page.hub)!.name;
  const faqs = blockFaqs(page.blocks);

  return (
    <main>
      <JsonLd
        data={[
          procedureSchema(page, locale, path),
          breadcrumbSchema(locale, path),
          ...(faqs.length ? [faqSchema(faqs, locale)] : []),
        ]}
      />
      <ContentPageView page={page} locale={locale} path={path} tone="dark" label={t(hubName, locale)} />
    </main>
  );
}
