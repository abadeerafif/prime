import type { Locale } from "@/lib/i18n";
import { t, type Doctor } from "@/content/types";
import { home } from "@/content/home";
import { href, visibleLinks } from "@/content/registry";
import { services } from "@/content/services";
import { dictFor } from "@/dictionaries";
import { PageHero } from "@/components/ui/PageHero";
import { Accordion } from "@/components/ui/Accordion";
import { CtaBand } from "@/components/ui/CtaBand";
import { LinkCard } from "@/components/ui/LinkCard";
import { Reveal } from "@/components/motion/Reveal";

type Props = {
  doctor: Doctor;
  locale: Locale;
  path: string;
  tone: "dark" | "stone";
  /** Overrides for the hair mini-site specialist page. */
  intro?: string;
  narrative?: string;
  related?: string[];
  bookHref?: string;
  closing?: string;
};

/** Doctor profile: portrait, approved title, headline, bio, areas, approach, related services and FAQs. */
export function DoctorProfile({ doctor, locale, path, tone, intro, narrative, related, bookHref = "/book", closing }: Props) {
  const d = dictFor(locale);
  const name = t(doctor.name, locale);
  const relatedPaths =
    related ??
    [...doctor.hubs.map((h) => `/${h}`), ...services.filter((s) => doctor.hubs.includes(s.hub)).map((s) => `/${s.hub}/${s.slug}`)];
  const links = visibleLinks(relatedPaths).slice(0, 6);

  return (
    <>
      <PageHero
        locale={locale}
        path={path}
        h1={name}
        heroLine={t(doctor.title, locale)}
        intro={intro}
        tone={tone}
        primary={{ label: d.common.book, href: href(locale, bookHref) }}
        showWhatsapp
      />

      <div data-theme-section={tone === "dark" ? "paper" : "ivory"} className="section-y relative z-10">
        <div className="container-prime grid-prime gap-y-16">
          <div className="col-span-4 md:col-span-6 lg:col-span-7">
            <Reveal as="p" className="font-display text-display-md text-balance text-theme">
              {t(doctor.headline, locale)}
            </Reveal>
            <Reveal as="p" className="text-body-lg measure mt-stack-lg text-theme-muted" delay={0.1}>
              {narrative ?? t(doctor.bio, locale)}
            </Reveal>

            <Reveal className="mt-head" delay={0.1}>
              <h2 className="text-label mb-stack-sm text-accent">{d.common.approach}</h2>
              <p className="text-body-lg measure text-theme-muted">{t(doctor.approach, locale)}</p>
            </Reveal>
          </div>

          <div className="col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9">
            <Reveal>
              <h2 className="text-label mb-stack-sm text-accent">{d.common.areas}</h2>
              <ul className="flex flex-wrap gap-2" role="list">
                {doctor.areas.map((a) => (
                  <li key={a.en} className="chip text-theme first-letter:uppercase">
                    {t(a, locale)}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>

        {links.length > 0 && (
          <div className="container-prime pt-section">
            <h2 className="text-label mb-stack text-accent">{d.common.relatedServices}</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
              {links.map((r, i) => (
                <Reveal as="li" key={r.path} delay={(i % 3) * 0.08} y={24}>
                  <LinkCard href={href(locale, r.path)} title={t(r.title, locale)} />
                </Reveal>
              ))}
            </ul>
          </div>
        )}

        {doctor.faqs.length > 0 && (
          <div className="container-prime grid-prime gap-y-8 pt-section">
            <h2 className="font-display text-display-sm col-span-4 text-theme md:col-span-6 lg:col-span-4">{d.common.faqs}</h2>
            <div className="col-span-4 md:col-span-6 lg:col-span-7 lg:col-start-6">
              <Accordion items={doctor.faqs.map((f, i) => ({ id: `doc-faq-${i}`, q: t(f.q, locale), a: t(f.a, locale) }))} />
            </div>
          </div>
        )}
      </div>

      <CtaBand locale={locale} text={closing ?? t(home.finalCta, locale)} bookHref={bookHref} />
    </>
  );
}
