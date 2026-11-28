import type { Locale } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/site";
import { href } from "@/content/registry";
import { dictFor } from "@/dictionaries";
import { Reveal } from "@/components/motion/Reveal";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { BloomMark } from "@/components/bloom/BloomMark";
import { WhatsAppIcon } from "@/components/ui/Icons";

type Props = { locale: Locale; text: string; bookHref?: string; bookLabel?: string; whatsappText?: string };

/** Charcoal closing band: one sentence, the booking button and WhatsApp. */
export function CtaBand({ locale, text, bookHref = "/book", bookLabel, whatsappText }: Props) {
  const dict = dictFor(locale);
  const wa = whatsappUrl(whatsappText);
  return (
    <section data-theme-section="charcoal" data-surface="dark" className="relative z-10 overflow-hidden bg-charcoal py-[calc(var(--spacing-head)*1.4)] text-theme">
      <BloomMark
        tone="gold"
        className="pointer-events-none absolute -end-[10%] top-1/2 h-auto w-[min(70vw,560px)] -translate-y-1/2 opacity-15"
      />
      <div className="container-prime relative">
        <Reveal className="max-w-[46rem]">
          <p className="font-display text-display-md text-balance text-theme">{text}</p>
          <div className="mt-stack-lg flex flex-wrap items-center gap-4">
            <MagneticButton href={href(locale, bookHref)} solid>
              {bookLabel ?? dict.common.book}
            </MagneticButton>
            {wa && (
              <MagneticButton href={wa}>
                <WhatsAppIcon className="h-4 w-4" />
                {dict.common.whatsapp}
              </MagneticButton>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
