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
        <p className="text-label mb-3 text-accent">{dict.common.yourDoctor}</p>
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
    <Link
      href={profile}
      className="card-prime group flex h-full flex-col rounded-card-lg transition-colors duration-500 hover:border-[var(--accent)]"
    >
      {index !== undefined && (
        <div className="mb-stack-sm flex items-center gap-4">
          <span className="text-label shrink-0 tabular-nums text-accent">{String(index).padStart(2, "0")}</span>
          <span className="hairline block flex-1" aria-hidden />
        </div>
      )}
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
        <ArrowIcon className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
      </span>
    </Link>
  );
}
