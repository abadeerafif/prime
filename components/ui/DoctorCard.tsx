import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { t, type Doctor } from "@/content/types";
import { hubs } from "@/content/hubs";
import { href } from "@/content/registry";
import { dictFor } from "@/dictionaries";
import { ArrowIcon } from "@/components/ui/Icons";

type Props = { doctor: Doctor; locale: Locale; variant?: "card" | "inline"; text?: string; index?: number };

/** Typography-led doctor card, placed in team grids and next to procedure calls to action. */
export function DoctorCard({ doctor, locale, variant = "card", text, index }: Props) {
  const dict = dictFor(locale);
  const profile = href(locale, `/doctors/${doctor.id}`);
  const name = t(doctor.name, locale);
  const badges = doctor.hubs
    .map((id) => hubs.find((h) => h.id === id))
    .filter((h): h is NonNullable<typeof h> => Boolean(h))
    .map((h) => ({ id: h.id, label: t(h.name, locale) }));

  if (variant === "inline") {
    return (
      <div className="card-prime rounded-card-lg">
        <span className="hairline-gold mb-4 block w-10" aria-hidden />
        <p className="text-label mb-1 text-accent">{dict.common.yourDoctor}</p>
        <p className="font-display text-display-sm text-theme">{name}</p>
        <p className="text-body mt-2 text-theme-muted">{t(doctor.title, locale)}</p>
        {badges.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" role="list">
            {badges.map((b) => (
              <li key={b.id} className="chip text-theme">
                {b.label}
              </li>
            ))}
          </ul>
        )}
        {text && <p className="text-body-lg mt-stack-sm text-theme-muted">{text}</p>}
        <Link href={profile} className="link-line text-label mt-stack-sm inline-flex items-center gap-2 text-theme">
          {dict.common.fullProfile}
          <ArrowIcon />
        </Link>
      </div>
    );
  }

  return (
    <Link href={profile} className="card-prime card-link group flex h-full flex-col rounded-card-lg">
      <div className="mb-stack flex items-end gap-4">
        {index !== undefined && (
          <span className="font-display-latin shrink-0 text-display-sm leading-none tabular-nums text-accent" dir="ltr">
            {String(index).padStart(2, "0")}
          </span>
        )}
        <span className="relative mb-1.5 block flex-1" aria-hidden>
          <span className="hairline block w-full" />
          <span className="hairline-gold absolute inset-x-0 top-0 block origin-left scale-x-0 transition-transform duration-700 ease-prime group-hover:scale-x-100 group-focus-visible:scale-x-100 rtl:origin-right" />
        </span>
      </div>
      <p className="font-display text-display-sm text-theme transition-colors duration-500 group-hover:text-accent">{name}</p>
      <p className="text-body mt-2 max-w-[32ch] text-theme-muted">{t(doctor.title, locale)}</p>
      {badges.length > 0 && (
        <ul className="mt-stack-sm flex flex-wrap gap-2" role="list">
          {badges.map((b) => (
            <li key={b.id} className="chip text-theme">
              {b.label}
            </li>
          ))}
        </ul>
      )}
      <p className="text-body mt-stack-sm text-theme-muted">{t(doctor.headline, locale)}</p>
      <span className="text-label mt-auto inline-flex items-center gap-2 pt-stack text-theme">
        <span className="link-line">{dict.common.fullProfile}</span>
        <ArrowIcon className="arrow-nudge h-4 w-4" />
      </span>
    </Link>
  );
}
