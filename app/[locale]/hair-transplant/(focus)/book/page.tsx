import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { hoursFor, mapsLink, site, whatsappUrl } from "@/lib/site";
import { metaFor } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { hairBook } from "@/content/hair/book";
import { HAIR, href, isPathVisible } from "@/content/registry";
import { t, type Bi } from "@/content/types";
import { dictFor } from "@/dictionaries";
import { ConsultationForm } from "@/components/forms/ConsultationForm";
import { CheckIcon, PinIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";

const PATH = `${HAIR}/book`;

export async function generateMetadata({ params }: PageProps<"/[locale]/hair-transplant/book">) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return metaFor(locale, PATH, hairBook.seo);
}

export default async function HairBookPage({ params }: PageProps<"/[locale]/hair-transplant/book">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = dictFor(locale);
  const L = (v: Bi) => t(v, locale);
  const B = hairBook;
  const wa = whatsappUrl(L(B.whatsappPrefill));
  const hours = hoursFor(locale);
  const followUps = [
    { path: `${HAIR}/growth-timeline`, label: d.hairNav.timeline },
    { path: `${HAIR}/recovery`, label: d.hairNav.recovery },
  ].filter((x) => isPathVisible(x.path));

  const success = (
    <>
      <p>{L(B.thanks)}</p>
      {followUps.length > 0 && (
        <span className="mt-4 flex flex-wrap gap-5 text-label">
          {followUps.map((x) => (
            <Link key={x.path} href={href(locale, x.path)} className="link-line">
              {x.label}
            </Link>
          ))}
        </span>
      )}
    </>
  );

  return (
    <main data-hide-actionbar>
      <JsonLd data={breadcrumbSchema(locale, PATH)} />
      <section data-theme-section="ivory" className="relative z-10 pb-section pt-header">
        <div className="container-prime grid-prime gap-y-12">
          <div className="col-span-4 md:col-span-6 lg:col-span-5">
            <SplitReveal as="h1" className="font-display text-display-lg text-balance text-theme" mode="lines">
              {L(B.h1)}
            </SplitReveal>
            <Reveal as="p" className="text-body-lg mt-stack max-w-[48ch] text-theme-muted" delay={0.15}>
              {L(B.sub)}
            </Reveal>

            <Reveal className="mt-head" delay={0.2}>
              <h2 className="text-label mb-stack-sm text-accent">{L(B.benefitsTitle)}</h2>
              <ul className="space-y-4" role="list">
                {B.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-4 text-body-lg text-theme">
                    <span className="mt-[0.2em] flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--accent)] text-accent">
                      <CheckIcon className="h-3 w-3" />
                    </span>
                    {L(b)}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div className="order-first col-span-4 md:col-span-6 lg:order-none lg:col-span-6 lg:col-start-7">
            <Reveal>
              <div data-surface="dark" className="rounded-card-lg bg-charcoal p-card-lg text-theme">
                <ConsultationForm variant="hair" success={success} />
                <p className="mt-stack-lg border-t border-[var(--line)] pt-6 text-sm text-theme-muted">{L(B.privacyNote)}</p>
              </div>
            </Reveal>
            {wa && (
              <Reveal className="mt-6" delay={0.1}>
                <MagneticButton href={wa}>
                  <WhatsAppIcon className="h-4 w-4" />
                  {d.common.whatsapp}
                </MagneticButton>
              </Reveal>
            )}
          </div>
        </div>

        <div className="container-prime mt-section">
          <h2 className="text-label mb-stack text-accent">{L(B.howTitle)}</h2>
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" role="list">
            {B.howItWorks.map((s, i) => (
              <Reveal as="li" key={i} delay={i * 0.08} y={20} className="border-t border-theme pt-5">
                <span className="font-display-latin text-3xl leading-none text-accent">{String(i + 1).padStart(2, "0")}</span>
                <p className="text-body-lg mt-4 text-theme">{L(s)}</p>
              </Reveal>
            ))}
          </ol>

          <div className="mt-head flex flex-wrap items-start gap-3 text-theme-muted">
            <PinIcon className="mt-1 h-5 w-5 shrink-0 text-accent" />
            <div>
              <p className="text-body">{site.address[locale]}</p>
              {hours && <p className="text-body mt-1">{hours}</p>}
              <a href={mapsLink} target="_blank" rel="noreferrer" className="link-line text-label mt-2 inline-block text-theme">
                {d.common.openMap}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
