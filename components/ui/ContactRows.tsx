import type { Locale } from "@/lib/i18n";
import { hoursFor, site, whatsappUrl } from "@/lib/site";
import { dictFor } from "@/dictionaries";

type Row = { label: string; value: string; href?: string };

/** Hours, phone, WhatsApp and email, keeping only the ones that are configured. */
export function contactRows(locale: Locale): Row[] {
  const d = dictFor(locale);
  const hours = hoursFor(locale);
  const wa = whatsappUrl();
  return [
    hours ? { label: d.common.hours, value: hours } : null,
    site.phone ? { label: d.common.phone, value: site.phone, href: `tel:${site.phone}` } : null,
    wa ? { label: d.common.whatsappShort, value: `+${site.whatsapp}`, href: wa } : null,
    site.email ? { label: d.common.email, value: site.email, href: `mailto:${site.email}` } : null,
  ].filter((x): x is Row => x !== null);
}

/** "compact": small labels stacked (footer). "grid": accent labels over ruled cells (contact page). */
export function ContactRows({ locale, variant, className }: { locale: Locale; variant: "compact" | "grid"; className?: string }) {
  const rows = contactRows(locale);
  if (!rows.length) return null;
  const grid = variant === "grid";
  return (
    <dl className={`${grid ? "grid gap-6 sm:grid-cols-2" : "space-y-3 text-body"} ${className ?? ""}`}>
      {rows.map((row) => (
        <div key={row.label} className={grid ? "border-t border-theme pt-4" : ""}>
          <dt className={grid ? "text-label text-accent" : "text-sm text-theme-muted"}>{row.label}</dt>
          <dd className={grid ? "text-body-lg mt-2 text-theme" : "text-ivory-light"} dir={row.href ? "ltr" : undefined}>
            {row.href ? (
              <a href={row.href} className="link-line">
                {row.value}
              </a>
            ) : (
              row.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
