import type { CSSProperties, ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/site";
import { dictFor } from "@/dictionaries";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { WhatsAppIcon } from "@/components/ui/Icons";

type Props = {
  locale: Locale;
  path: string;
  label?: string;
  h1: string;
  heroLine?: string;
  intro?: string;
  tone: "dark" | "stone";
  primary?: { label: string; href: string };
  showWhatsapp?: boolean;
  whatsappText?: string;
  /** Optional trailing column, e.g. a portrait. */
  aside?: ReactNode;
  children?: ReactNode;
};

const delay = (s: number) => ({ "--enter-delay": `${s}s` }) as CSSProperties;

/**
 * Opening band of every inner page: breadcrumb, title, supporting copy and the
 * two calls to action. It is the largest paint on most pages, so its entrance
 * is pure CSS rather than waiting for hydration.
 */
export function PageHero({
  locale,
  path,
  label,
  h1,
  heroLine,
  intro,
  tone,
  primary,
  showWhatsapp,
  whatsappText,
  aside,
  children,
}: Props) {
  const dict = dictFor(locale);
  const wa = showWhatsapp ? whatsappUrl(whatsappText) : null;
  const dark = tone === "dark";

  return (
    <section
      data-theme-section={dark ? "charcoal" : "ivory"}
      data-surface={dark ? "dark" : undefined}
      className={`relative z-10 overflow-hidden pb-head pt-header text-theme ${dark ? "bg-charcoal" : ""}`}
    >
      <div className="container-prime grid-prime items-end gap-y-10">
        <div className={`col-span-4 md:col-span-6 ${aside ? "lg:col-span-7" : "lg:col-span-10"}`}>
          <div className="enter">
            <Breadcrumb locale={locale} path={path} className="mb-stack-lg" />
          </div>
          {label && (
            <SectionLabel still className="enter mb-stack-sm" style={delay(0.05)}>
              {label}
            </SectionLabel>
          )}
          <h1 className="enter font-display text-display-lg max-w-[18ch] text-balance text-theme" style={delay(0.1)}>
            {h1}
          </h1>
          {heroLine && (
            <p className="enter font-display text-display-sm mt-stack max-w-[30ch] text-balance text-accent" style={delay(0.2)}>
              {heroLine}
            </p>
          )}
          {intro && (
            <p className="enter text-body-lg measure mt-stack text-theme-muted" style={delay(0.25)}>
              {intro}
            </p>
          )}
          {(primary || wa) && (
            <div className="enter mt-stack-lg flex flex-wrap items-center gap-4" style={delay(0.35)}>
              {primary && (
                <MagneticButton href={primary.href} solid>
                  {primary.label}
                </MagneticButton>
              )}
              {wa && (
                <MagneticButton href={wa}>
                  <WhatsAppIcon className="h-4 w-4" />
                  {dict.common.whatsapp}
                </MagneticButton>
              )}
            </div>
          )}
          {children}
        </div>
        {aside && <div className="col-span-4 md:col-span-4 lg:col-span-4 lg:col-start-9">{aside}</div>}
      </div>
    </section>
  );
}
