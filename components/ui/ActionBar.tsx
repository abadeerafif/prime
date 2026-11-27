import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { site, whatsappUrl } from "@/lib/site";
import { href } from "@/content/registry";
import { dictFor } from "@/dictionaries";
import { PhoneIcon, WhatsAppIcon } from "@/components/ui/Icons";

/**
 * Sticky booking bar below lg: WhatsApp, Call and Book (only the configured
 * ones). With booking alone it shrinks to a floating pill instead of a slab.
 */
export function ActionBar({ locale, bookHref, bookLabel }: { locale: Locale; bookHref: string; bookLabel: string }) {
  const dict = dictFor(locale);
  const wa = whatsappUrl();
  const book = href(locale, bookHref);

  if (!wa && !site.phone) {
    return (
      <nav
        aria-label={dict.common.quickActions}
        className="action-bar pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-[var(--gutter)] pb-[calc(1rem+env(safe-area-inset-bottom))] lg:hidden"
      >
        <Link
          href={book}
          className="pointer-events-auto flex min-h-12 items-center justify-center rounded-full bg-gold-light px-7 text-sm font-medium text-charcoal-deep shadow-[0_12px_30px_-12px_rgba(53,51,46,0.55)] transition-colors active:bg-ivory-light"
        >
          {bookLabel}
        </Link>
      </nav>
    );
  }

  const item = "flex min-h-14 flex-1 items-center justify-center gap-2 px-3 text-sm font-medium transition-colors active:bg-white/5";
  return (
    <nav
      aria-label={dict.common.quickActions}
      data-surface="dark"
      className="action-bar fixed inset-x-0 bottom-0 z-[60] flex divide-x divide-[var(--line)] border-t border-[var(--line)] bg-charcoal-deep/95 pb-[env(safe-area-inset-bottom)] text-theme backdrop-blur rtl:divide-x-reverse lg:hidden"
    >
      {wa && (
        <a href={wa} target="_blank" rel="noreferrer" className={item}>
          <WhatsAppIcon className="h-4 w-4" />
          {dict.common.whatsappShort}
        </a>
      )}
      {site.phone && (
        <a href={`tel:${site.phone}`} className={item}>
          <PhoneIcon className="h-4 w-4" />
          {dict.common.call}
        </a>
      )}
      <Link href={book} className={`${item} flex-[1.5] whitespace-nowrap bg-gold-light text-charcoal-deep active:bg-ivory-light`}>
        {bookLabel}
      </Link>
    </nav>
  );
}
