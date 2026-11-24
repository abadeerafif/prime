import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { metaFor } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { articles } from "@/content/articles";
import { HAIR, isPathVisible } from "@/content/registry";
import { t } from "@/content/types";
import { dictFor } from "@/dictionaries";
import { ContentPageView } from "@/components/templates/ContentPageView";
import { JsonLd } from "@/components/seo/JsonLd";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/hair-transplant/articles/[slug]">) {
  const { locale, slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!isLocale(locale) || !article) return {};
  return metaFor(locale, `${HAIR}/articles/${slug}`, article.seo);
}

export default async function ArticlePage({ params }: PageProps<"/[locale]/hair-transplant/articles/[slug]">) {
  const { locale, slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  const path = `${HAIR}/articles/${slug}`;
  if (!isLocale(locale) || !article || !isPathVisible(path)) notFound();
  const d = dictFor(locale);
  return (
    <main>
      <JsonLd data={breadcrumbSchema(locale, path)} />
      <ContentPageView
        page={article}
        locale={locale}
        path={path}
        tone="stone"
        label={`${t(site.hairName, locale)} · ${d.nav.guide}`}
        bookHref={`${HAIR}/book`}
        bookLabel={d.hairNav.cta}
      />
    </main>
  );
}
