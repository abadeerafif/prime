import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { metaFor } from "@/lib/seo";
import { isPathVisible } from "@/content/registry";
import type { ContentPage } from "@/content/types";
import { dictFor } from "@/dictionaries";
import { ContentPageView } from "@/components/templates/ContentPageView";

/** Shared page module for the privacy policy and terms of use. */
export function legalPage(page: ContentPage) {
  const path = `/${page.slug}`;
  type Props = { params: Promise<{ locale: string }> };

  async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    if (!isLocale(locale)) return {};
    return metaFor(locale, path, page.seo);
  }

  async function Page({ params }: Props) {
    const { locale } = await params;
    if (!isLocale(locale) || !isPathVisible(path)) notFound();
    return (
      <main id="main">
        <ContentPageView page={page} locale={locale} path={path} tone="dark" notice={dictFor(locale).common.draftNotice} />
      </main>
    );
  }

  return { generateMetadata, Page };
}
