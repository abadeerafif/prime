import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { t, type Doctor } from "@/content/types";
import { href } from "@/content/registry";
import { dictFor } from "@/dictionaries";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { ArrowIcon } from "@/components/ui/Icons";

type Props = { doctor: Doctor; locale: Locale; variant?: "card" | "inline"; text?: string; tone?: "light" | "dark" | "warm" };

/** Doctor face and name, placed next to every procedure call to action. */
export function DoctorCard({ doctor, locale, variant = "card", text, tone = "light" }: Props) {
  const dict = dictFor(locale);
  const profile = href(locale, `/doctors/${doctor.id}`);
  const name = t(doctor.name, locale);
  const portrait = (
    <PhotoFrame className="mask-arch aspect-[3/4] w-full" tone={tone} label={`${dict.common.portraitAlt} ${name}`} />
  );

  if (variant === "inline") {
    return (
      <div className="card-prime grid items-center gap-stack rounded-card-lg sm:grid-cols-[9rem_1fr]">
        <div className="w-28 sm:w-full">{portrait}</div>
        <div>
          <p className="text-label mb-3 text-accent">{dict.common.yourDoctor}</p>
          <p className="font-display text-display-sm text-theme">{name}</p>
          <p className="text-body mt-2 text-theme-muted">{t(doctor.title, locale)}</p>
          {text && <p className="text-body-lg mt-stack-sm text-theme-muted">{text}</p>}
          <Link href={profile} className="link-line text-label mt-stack-sm inline-flex items-center gap-2 text-theme">
            {dict.common.fullProfile}
            <ArrowIcon />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Link href={profile} className="group block">
      <div className="overflow-hidden mask-arch">
        <div className="transition-transform duration-[1.2s] group-hover:scale-105" style={{ transitionTimingFunction: "var(--ease-prime)" }}>
          {portrait}
        </div>
      </div>
      <p className="font-display text-display-sm mt-stack text-theme transition-colors duration-500 group-hover:text-accent">{name}</p>
      <p className="text-body mt-2 max-w-[32ch] text-theme-muted">{t(doctor.title, locale)}</p>
      <span className="text-label mt-stack-sm inline-flex items-center gap-2 text-theme">
        <span className="link-line">{dict.common.fullProfile}</span>
        <ArrowIcon className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
      </span>
    </Link>
  );
}
