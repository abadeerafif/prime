import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { site, whatsappUrl } from "@/lib/site";
import { metaFor } from "@/lib/seo";
import { clinicSchema } from "@/lib/schema";
import { home } from "@/content/home";
import { doctors } from "@/content/doctors";
import { articles } from "@/content/articles";
import { formOptions } from "@/content/options";
import { HAIR, href, isPathVisible } from "@/content/registry";
import { t } from "@/content/types";
import { dictFor } from "@/dictionaries";
import { Preloader } from "@/components/sections/Preloader";
import { BloomStage } from "@/components/bloom/BloomStage";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { Philosophy } from "@/components/sections/Philosophy";
import { Treatments } from "@/components/sections/Treatments";
import { HairBand } from "@/components/sections/HairBand";
import { Team } from "@/components/sections/Team";
import { Guide } from "@/components/sections/Guide";
import { HomeFaq } from "@/components/sections/HomeFaq";
import { Journey } from "@/components/sections/Journey";
import { Booking } from "@/components/sections/Booking";
import { JsonLd } from "@/components/seo/JsonLd";

export async function generateMetadata({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return metaFor(locale, "", home.seo);
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = dictFor(locale);
  const L = (v: { ar: string; en: string }) => t(v, locale);
  const wa = whatsappUrl();
  const options = formOptions(locale);

  const guideCards = articles
    .filter((a) => isPathVisible(`${HAIR}/articles/${a.slug}`))
    .slice(0, 3)
    .map((a) => {
      const first = a.blocks[0];
      const excerpt = first?.type === "prose" ? L(first.body[0]).replace(/\*\*/g, "") : "";
      return { href: href(locale, `${HAIR}/articles/${a.slug}`), title: L(a.h1), excerpt, tag: d.nav.hair };
    });

  return (
    <>
      <JsonLd data={clinicSchema(locale)} />
      <Preloader tagline={d.preloader.tagline} />
      <BloomStage />
      <main id="main" className="relative z-10">
        <Hero
          brand={L(home.hero.brand)}
          lines={home.hero.lines[locale]}
          intro={L(home.hero.intro)}
          cta={d.common.book}
          secondary={
            wa
              ? { label: d.common.whatsapp, href: wa, whatsapp: true }
              : { label: d.nav.allSpecialties, href: href(locale, "/specialties") }
          }
          scroll={d.common.scroll}
          imageAlt={d.common.imageAlt}
        />
        <TrustStrip items={home.trust.map(L)} />
        <Philosophy
          label={d.home.philosophyLabel}
          statement={L(home.statement)}
          pillars={home.pillars.map((p) => ({ title: L(p.title), body: L(p.body) }))}
          link={{ label: d.home.aboutLink, href: href(locale, "/about") }}
        />
        <Treatments
          label={d.home.specialtiesLabel}
          title={d.home.specialtiesTitle}
          more={d.common.explore}
          items={home.specialties.map((s) => ({
            id: s.path.slice(1),
            name: L(s.name),
            blurb: L(s.line),
            href: href(locale, s.path),
          }))}
        />
        <HairBand
          label={L(home.hairBand.label)}
          title={L(home.hairBand.title)}
          body={L(home.hairBand.body)}
          explore={{ label: L(home.hairBand.explore), href: href(locale, HAIR) }}
          candidate={{ label: L(home.hairBand.candidate), href: href(locale, `${HAIR}/am-i-a-candidate`) }}
          imageAlt={d.common.imageAlt}
        />
        <Team locale={locale} label={d.home.teamLabel} title={L(home.teamTitle)} doctors={doctors} />
        {isPathVisible("/results") && (
          <section data-theme-section="ivory" className="section-y container-prime relative z-10">
            <h2 className="font-display text-display-lg text-balance text-theme">{L(home.results.title)}</h2>
            <p className="text-body-lg measure mt-stack text-theme-muted">{L(home.results.body)}</p>
            <Link href={href(locale, "/results")} className="link-line text-label mt-stack-lg inline-block text-theme">
              {d.home.resultsLink}
            </Link>
          </section>
        )}
        <Guide
          label={d.home.guideLabel}
          title={L(home.guideTitle)}
          cards={guideCards}
          all={{ label: d.home.allArticles, href: href(locale, "/blog") }}
          readLabel={d.common.readArticle}
        />
        <HomeFaq
          label={d.home.faqLabel}
          title={d.home.faqTitle}
          items={home.faqs.map((f) => ({ q: L(f.q), a: L(f.a) }))}
          all={{ label: d.home.allFaqs, href: href(locale, "/faq") }}
        />
        <Journey
          dict={{
            label: d.home.visitLabel,
            title: d.home.visitTitle,
            steps: home.steps.map((s) => ({ title: L(s.title), body: L(s.body) })),
          }}
        />
        <Booking
          label={d.home.bookingLabel}
          titleLines={d.home.bookingTitleLines}
          intro={d.home.bookingIntro}
          whatsappLabel={d.common.whatsapp}
          address={site.address[locale]}
          openMap={d.common.openMap}
          specialties={options.specialties}
          hairSpecialty={options.hairSpecialty}
          doctors={options.doctors}
        />
      </main>
    </>
  );
}
