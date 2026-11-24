import type { Locale } from "@/lib/i18n";
import { dictFor } from "@/dictionaries";

export function Disclaimer({ locale, className }: { locale: Locale; className?: string }) {
  return <p className={`text-sm text-theme-muted ${className ?? ""}`}>{dictFor(locale).footer.disclaimer}</p>;
}
