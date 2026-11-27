import { Fragment } from "react";
import type { Locale } from "@/lib/i18n";
import { hoursFor, site, whatsappUrl } from "@/lib/site";
import { dictFor } from "@/dictionaries";

type LinkItem = { value: string; href: string };
type Row = { label: string; value?: string; links?: LinkItem[] };

/** Hours, phone numbers, WhatsApp and email, keeping only the ones that are configured. */
export function contactRows(locale: Locale): Row[] {
  const d = dictFor(locale);
  const hours = hoursFor(locale);
  const wa = whatsappUrl();
  const waDisplay =
    site.phones.find((p) => p.dial.replace(/\D/g, "") === site.whatsapp)?.display ??
    (site.whatsapp ? `+${site.whatsapp}` : null);

  const rows: (Row | null)[] = [
    hours ? { label: d.common.hours, value: hours } : null,
    site.phones.length
      ? {
          label: d.common.phone,
          links: site.phones.map((p) => ({ value: p.display, href: `tel:${p.dial}` })),
        }
      : null,
    wa && waDisplay ? { label: d.common.whatsappShort, links: [{ value: waDisplay, href: wa }] } : null,
    site.email ? { label: d.common.email, links: [{ value: site.email, href: `mailto:${site.email}` }] } : null,
  ];
  return rows.filter((x): x is Row => x !== null);
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
          <dd
            className={grid ? "text-body-lg mt-2 text-theme" : "text-ivory-light"}
            dir={row.links ? "ltr" : undefined}
          >
            {row.links ? (
              <span className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1">
                {row.links.map((item, i) => (
                  <Fragment key={item.href}>
                    {i > 0 && (
                      <span className="text-theme-muted" aria-hidden>
                        |
                      </span>
                    )}
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                      className="link-line whitespace-nowrap"
                    >
                      {item.value}
                    </a>
                  </Fragment>
                ))}
              </span>
            ) : (
              row.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
