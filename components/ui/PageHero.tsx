import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/site";
import { dictFor } from "@/dictionaries";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";
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

/** Opening band of every inner page: breadcrumb, title, supporting copy and the two calls to action. */
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
          <Reveal y={12}>
            <Breadcrumb locale={locale} path={path} className="mb-stack-lg" />
          </Reveal>
          {label && <SectionLabel className="mb-stack-sm">{label}</SectionLabel>}
          <SplitReveal as="h1" className="font-display text-display-lg max-w-[18ch] text-balance text-theme" mode="lines">
            {h1}
          </SplitReveal>
          {heroLine && (
            <Reveal as="p" className="font-display text-display-sm mt-stack max-w-[30ch] text-balance text-accent" delay={0.2}>
              {heroLine}
            </Reveal>
          )}
          {intro && (
            <Reveal as="p" className="text-body-lg measure mt-stack text-theme-muted" delay={0.3}>
              {intro}
            </Reveal>
          )}
          {(primary || wa) && (
            <Reveal className="mt-stack-lg flex flex-wrap items-center gap-4" delay={0.4}>
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
            </Reveal>
          )}
          {children}
        </div>
        {aside && <div className="col-span-4 md:col-span-4 lg:col-span-4 lg:col-start-9">{aside}</div>}
      </div>
    </section>
  );
}
