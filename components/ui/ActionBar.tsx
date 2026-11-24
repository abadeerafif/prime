import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { site, whatsappUrl } from "@/lib/site";
import { href } from "@/content/registry";
import { dictFor } from "@/dictionaries";
import { PhoneIcon, WhatsAppIcon } from "@/components/ui/Icons";

/** Sticky bottom bar below lg: WhatsApp, Call and Book (only the configured ones). */
export function ActionBar({ locale, bookHref, bookLabel }: { locale: Locale; bookHref: string; bookLabel: string }) {
  const dict = dictFor(locale);
  const wa = whatsappUrl();
  const item = "flex min-h-14 flex-1 items-center justify-center gap-2 px-3 text-sm font-medium transition-colors active:bg-white/5";
  return (
    <div
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
      <Link href={href(locale, bookHref)} className={`${item} bg-gold-light text-charcoal-deep active:bg-ivory-light`}>
        {bookLabel}
      </Link>
    </div>
  );
}
