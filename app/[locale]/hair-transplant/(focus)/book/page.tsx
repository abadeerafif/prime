import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { hoursFor, site, whatsappUrl } from "@/lib/site";
import { metaFor } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { hairBook } from "@/content/hair/book";
import { HAIR, href, isPathVisible } from "@/content/registry";
import { t, type Bi } from "@/content/types";
import { dictFor } from "@/dictionaries";
import { ConsultationForm } from "@/components/forms/ConsultationForm";
import { CheckIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { NumberedList } from "@/components/ui/NumberedList";
import { AddressBlock } from "@/components/ui/AddressBlock";
import { MagneticButton } from "@/components/motion/MagneticButton";
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
    <main id="main" data-hide-actionbar>
      <JsonLd data={breadcrumbSchema(locale, PATH)} />
      <section data-theme-section="ivory" className="relative z-10 pb-section pt-header">
        <div className="container-prime grid-prime gap-y-12">
          <div className="col-span-4 md:col-span-6 lg:col-span-5">
            <h1 className="enter font-display text-display-lg text-balance text-theme">{L(B.h1)}</h1>
            <p className="enter text-body-lg mt-stack max-w-[48ch] text-theme-muted" style={{ "--enter-delay": "0.15s" } as CSSProperties}>
              {L(B.sub)}
            </p>

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
          <NumberedList reveal layout="grid" columns={4} items={B.howItWorks.map((s) => ({ body: L(s) }))} />

          <AddressBlock className="mt-head" address={site.address[locale]} mapLabel={d.common.openMap}>
            {hours && <p className="text-body mt-1">{hours}</p>}
          </AddressBlock>
        </div>
      </section>
    </main>
  );
}
