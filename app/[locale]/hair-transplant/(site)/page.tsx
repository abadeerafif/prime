import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { mapsLink, site } from "@/lib/site";
import { metaFor } from "@/lib/seo";
import { clinicSchema, faqSchema, physicianSchema } from "@/lib/schema";
import { hairHome } from "@/content/hair/home";
import { doctors } from "@/content/doctors";
import { HAIR, href, isPathVisible } from "@/content/registry";
import { t, type Bi } from "@/content/types";
import { dictFor } from "@/dictionaries";
import { PageHero } from "@/components/ui/PageHero";
import { DoctorCard } from "@/components/ui/DoctorCard";
import { Accordion } from "@/components/ui/Accordion";
import { RelatedLinks } from "@/components/ui/RelatedLinks";
import { LinkCard } from "@/components/ui/LinkCard";
import { ArrowIcon, CheckIcon, PinIcon } from "@/components/ui/Icons";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ConsultationForm } from "@/components/forms/ConsultationForm";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";

function Heading({ title, intro }: { title: string; intro?: string }) {
  return (
    <div className="mb-head">
      <SplitReveal as="h2" className="font-display text-display-md max-w-[22ch] text-balance text-theme" mode="lines">
        {title}
      </SplitReveal>
      {intro && (
        <Reveal as="p" className="text-body-lg measure mt-stack text-theme-muted">
          {intro}
        </Reveal>
      )}
    </div>
  );
}

export async function generateMetadata({ params }: PageProps<"/[locale]/hair-transplant">) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return metaFor(locale, HAIR, hairHome.seo);
}

export default async function HairHomePage({ params }: PageProps<"/[locale]/hair-transplant">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = dictFor(locale);
  const L = (v: Bi) => t(v, locale);
  const H = hairHome;
  const abdeen = doctors.find((x) => x.id === "dr-mahmoud-abdeen")!;
  const faqs = H.faqPreview;
  const link = (path: string) => (isPathVisible(path) ? href(locale, path) : null);

  return (
    <main>
      <JsonLd data={[clinicSchema(locale, { hair: true }), physicianSchema(abdeen, locale), faqSchema(faqs, locale)]} />

      <PageHero
        locale={locale}
        path={HAIR}
        label={L(H.hero.brandLine)}
        h1={L(H.hero.h1)}
        intro={L(H.hero.sub)}
        tone="stone"
        primary={{ label: L(H.hero.book), href: href(locale, `${HAIR}/book`) }}
        showWhatsapp
      >
        <Reveal className="mt-stack" delay={0.5}>
          <Link href={href(locale, `${HAIR}/am-i-a-candidate`)} className="link-line text-label inline-flex items-center gap-2 text-theme">
            {L(H.hero.candidate)}
            <ArrowIcon />
          </Link>
        </Reveal>
      </PageHero>

      {/* Introduction */}
      <section data-theme-section="ivory" className="section-y relative z-10 !pt-0">
        <div className="container-prime grid-prime gap-y-stack border-t border-theme pt-head">
            <SplitReveal as="h2" className="font-display text-display-sm col-span-4 text-balance text-theme md:col-span-6 lg:col-span-4" mode="lines">
              {L(H.intro.title)}
            </SplitReveal>
            <Reveal as="p" className="text-body-lg measure col-span-4 text-theme-muted md:col-span-6 lg:col-span-7 lg:col-start-6" delay={0.1}>
            {L(H.intro.body)}
          </Reveal>
        </div>
      </section>

      {/* Common concerns */}
      <section data-theme-section="ivory" className="section-y relative z-10 !pt-0">
        <div className="container-prime">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" role="list">
            {H.concerns.map((c, i) => (
              <Reveal as="li" key={c.path + i} delay={i * 0.06} y={30}>
                <LinkCard href={link(c.path) ?? href(locale, `${HAIR}/book`)} title={L(c.title)} text={L(c.body)} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* When to consider + options */}
      <section data-theme-section="charcoal" data-surface="dark" className="section-y relative z-10 bg-charcoal text-theme">
        <div className="container-prime grid-prime gap-y-12">
          <div className="col-span-4 md:col-span-6 lg:col-span-5">
            <SplitReveal as="h2" className="font-display text-display-md text-ivory-light" mode="lines">
              {L(H.whenToConsider.title)}
            </SplitReveal>
            <Reveal as="p" className="text-body-lg measure mt-stack text-theme-muted" delay={0.1}>
              {L(H.whenToConsider.body)}
            </Reveal>
          </div>
          <div className="col-span-4 md:col-span-6 lg:col-span-6 lg:col-start-7">
            <Reveal as="h3" className="text-label mb-stack text-accent">
              {L(H.options.title)}
            </Reveal>
            <ol className="space-y-0" role="list">
              {H.options.items.map((o, i) => (
                <Reveal as="li" key={i} delay={i * 0.08} y={20} className="grid grid-cols-[3rem_1fr] gap-4 border-t border-[var(--line)] py-6">
                  <span className="font-display-latin text-2xl leading-none text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="font-display text-title text-ivory-light">{L(o.title)}</p>
                    <p className="text-body mt-2 text-theme-muted">{L(o.body)}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Techniques */}
      <section data-theme-section="ivory" className="section-y relative z-10">
        <div className="container-prime">
          <Heading title={L(H.techniques.title)} intro={L(H.techniques.intro)} />
          <ul className="grid gap-4 md:grid-cols-3" role="list">
            {H.techniques.cards
              .filter((c) => isPathVisible(c.path))
              .map((c, i) => (
                <Reveal as="li" key={c.path} delay={i * 0.08} y={30}>
                  <LinkCard href={href(locale, c.path)} title={L(c.title)} text={L(c.body)} />
                </Reveal>
              ))}
          </ul>
        </div>
      </section>

      {/* How we assess */}
      <section data-theme-section="ivory" className="section-y relative z-10 !pt-0">
        <div className="container-prime grid-prime gap-y-10">
          <div className="col-span-4 md:col-span-6 lg:col-span-4">
            <SplitReveal as="h2" className="font-display text-display-md text-balance text-theme lg:sticky lg:top-anchor" mode="lines">
              {L(H.assessment.title)}
            </SplitReveal>
          </div>
          <ol className="col-span-4 md:col-span-6 lg:col-span-7 lg:col-start-6" role="list">
            {H.assessment.items.map((a, i) => (
              <Reveal as="li" key={i} delay={i * 0.06} y={20} className="grid grid-cols-[3rem_1fr] gap-4 border-t border-theme py-6">
                <span className="font-display-latin text-2xl leading-none text-accent">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="font-display text-title text-theme">{L(a.title)}</p>
                  <p className="text-body mt-2 text-theme-muted">{L(a.body)}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Specialist */}
      <section data-theme-section="ivory" className="section-y relative z-10 !pt-0">
        <div className="container-prime">
          <SectionLabel className="mb-stack">{L(H.specialist.title)}</SectionLabel>
          <Reveal>
            <DoctorCard doctor={abdeen} locale={locale} variant="inline" text={L(H.specialist.body)} />
          </Reveal>
          <Reveal className="mt-stack flex flex-wrap gap-6" delay={0.1}>
            <Link href={href(locale, `${HAIR}/specialist`)} className="link-line text-label text-theme">
              {d.common.fullProfile}
            </Link>
            <Link href={href(locale, `${HAIR}/book`)} className="link-line text-label text-theme">
              {d.hairNav.cta}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Journey */}
      <section data-theme-section="ivory" className="section-y relative z-10 !pt-0">
        <div className="container-prime">
          <Heading title={L(H.journey.title)} />
          <ol className="relative grid gap-y-10 lg:grid-cols-6 lg:gap-x-6" role="list">
            <span aria-hidden className="absolute inset-y-0 start-[11px] w-px bg-[var(--line)] lg:inset-x-0 lg:inset-y-auto lg:top-[11px] lg:h-px lg:w-auto" />
            {H.journey.steps.map((s, i) => (
              <Reveal as="li" key={i} delay={i * 0.08} y={20} className="relative ps-12 lg:ps-0 lg:pt-14">
                <span aria-hidden className="absolute start-0 top-0 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--accent)] bg-[var(--bg)]">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                </span>
                <p className="text-label text-accent">
                  {d.common.step} {String(i + 1).padStart(2, "0")}
                </p>
                <p className="font-display text-title mt-3 text-theme">{L(s)}</p>
              </Reveal>
            ))}
          </ol>
          {link(`${HAIR}/procedure-steps`) && (
            <Link href={link(`${HAIR}/procedure-steps`)!} className="link-line text-label mt-stack-lg inline-flex items-center gap-2 text-theme">
              {L(H.journey.link)}
              <ArrowIcon />
            </Link>
          )}
        </div>
      </section>

      {/* Expectations */}
      <section data-theme-section="ivory" className="section-y relative z-10 !pt-0">
        <div className="container-prime grid-prime gap-y-8">
          <div className="card-prime col-span-4 rounded-card-lg p-card-lg md:col-span-6 lg:col-span-10 lg:col-start-2">
            <SplitReveal as="h2" className="font-display text-display-sm text-balance text-theme" mode="lines">
              {L(H.expectations.title)}
            </SplitReveal>
            <Reveal as="p" className="text-body-lg measure-wide mt-stack-sm text-theme-muted" delay={0.1}>
              {L(H.expectations.body)}
            </Reveal>
            <div className="mt-stack flex flex-wrap gap-6">
              {[
                { path: `${HAIR}/recovery`, label: d.hairNav.recovery },
                { path: `${HAIR}/growth-timeline`, label: d.hairNav.timeline },
              ]
                .filter((x) => isPathVisible(x.path))
                .map((x) => (
                  <Link key={x.path} href={href(locale, x.path)} className="link-line text-label inline-flex items-center gap-2 text-theme">
                    {x.label}
                    <ArrowIcon />
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ preview */}
      <section data-theme-section="ivory" className="section-y relative z-10 !pt-0">
        <div className="container-prime grid-prime gap-y-10">
          <div className="col-span-4 md:col-span-6 lg:col-span-4">
            <SplitReveal as="h2" className="font-display text-display-md text-balance text-theme" mode="lines">
              {d.common.faqs}
            </SplitReveal>
            {link(`${HAIR}/faq`) && (
              <Link href={link(`${HAIR}/faq`)!} className="link-line text-label mt-stack inline-block text-theme">
                {d.home.allFaqs}
              </Link>
            )}
          </div>
          <Reveal className="col-span-4 md:col-span-6 lg:col-span-7 lg:col-start-6">
            <Accordion items={faqs.map((f, i) => ({ id: `hair-faq-${i}`, q: L(f.q), a: L(f.a) }))} />
          </Reveal>
        </div>
      </section>

      {/* Why Prime */}
      <section data-theme-section="ivory" className="section-y relative z-10 !pt-0">
        <div className="container-prime">
          <Heading title={L(H.whyPrime.title)} />
          <ul className="grid gap-px overflow-hidden rounded-card border border-theme bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-3" role="list">
            {H.whyPrime.points.map((p, i) => (
              <Reveal as="li" key={i} delay={(i % 3) * 0.06} y={20} className="flex gap-4 bg-[var(--bg)] p-card">
                <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--accent)] text-accent">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                <span className="font-display text-title text-theme">{L(p)}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Assessment form */}
      <section id="assessment" data-theme-section="charcoal" data-surface="dark" className="section-y relative z-10 bg-charcoal text-theme">
        <div className="container-prime grid-prime gap-y-12">
          <div className="col-span-4 md:col-span-6 lg:col-span-5">
            <SplitReveal as="h2" className="font-display text-display-lg text-ivory-light" mode="lines">
              {L(H.form.title)}
            </SplitReveal>
            <Reveal as="p" className="text-body-lg mt-stack max-w-[44ch] text-theme-muted" delay={0.1}>
              {L(H.form.text)}
            </Reveal>
            <Reveal className="mt-stack-lg flex items-start gap-3 text-theme-muted" delay={0.2}>
              <PinIcon className="mt-1 h-5 w-5 shrink-0 text-gold-light" />
              <div>
                <p className="text-body">{site.address[locale]}</p>
                <a href={mapsLink} target="_blank" rel="noreferrer" className="link-line text-label mt-2 inline-block text-ivory">
                  {d.common.openMap}
                </a>
              </div>
            </Reveal>
          </div>
          <Reveal className="col-span-4 md:col-span-6 lg:col-span-6 lg:col-start-7" delay={0.1}>
            <ConsultationForm variant="hair" />
          </Reveal>
        </div>
      </section>

      <div data-theme-section="ivory" className="section-y relative z-10 !pt-0">
        <RelatedLinks locale={locale} paths={H.related} title={d.common.related} />
        <div className="container-prime mt-head">
          <p className="measure border-t border-theme pt-6 text-sm text-theme-muted">{L(H.disclaimer)}</p>
        </div>
      </div>
    </main>
  );
}
