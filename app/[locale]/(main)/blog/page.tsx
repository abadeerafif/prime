import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { metaFor } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { corporate } from "@/content/about";
import { articles } from "@/content/articles";
import { home } from "@/content/home";
import { HAIR, href, isPathVisible } from "@/content/registry";
import { t } from "@/content/types";
import { dictFor } from "@/dictionaries";
import { PageHero } from "@/components/ui/PageHero";
import { CtaBand } from "@/components/ui/CtaBand";
import { ArticleCard } from "@/components/sections/Guide";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";

const PATH = "/blog";

export async function generateMetadata({ params }: PageProps<"/[locale]/blog">) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return metaFor(locale, PATH, corporate.blog.seo);
}

export default async function BlogPage({ params }: PageProps<"/[locale]/blog">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = dictFor(locale);
  const list = articles.filter((a) => isPathVisible(`${HAIR}/articles/${a.slug}`));

  return (
    <main id="main">
      <JsonLd data={breadcrumbSchema(locale, PATH)} />
      <PageHero locale={locale} path={PATH} h1={t(corporate.blog.h1, locale)} intro={t(corporate.blog.intro, locale)} tone="dark" />
      {list.length > 0 && (
        <section data-theme-section="paper" className="section-y relative z-10">
          <ul className="container-prime grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6" role="list">
            {list.map((a, i) => {
              const first = a.blocks[0];
              const excerpt = first?.type === "prose" ? t(first.body[0], locale).replace(/\*\*/g, "") : "";
              return (
                <Reveal as="li" key={a.slug} delay={(i % 3) * 0.08} y={30}>
                  <ArticleCard
                    card={{ href: href(locale, `${HAIR}/articles/${a.slug}`), title: t(a.h1, locale), excerpt, tag: d.nav.hair }}
                    readLabel={d.common.readArticle}
                    level={2}
                  />
                </Reveal>
              );
            })}
          </ul>
        </section>
      )}
      <CtaBand locale={locale} text={t(home.finalCta, locale)} />
    </main>
  );
}
