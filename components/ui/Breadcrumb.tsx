import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { href, trail } from "@/content/registry";
import { t } from "@/content/types";
import { dictFor } from "@/dictionaries";

export function Breadcrumb({ locale, path, className }: { locale: Locale; path: string; className?: string }) {
  const items = trail(path);
  if (items.length < 2) return null;
  const dict = dictFor(locale);
  return (
    <nav aria-label={dict.common.breadcrumb} className={className}>
      <ol className="text-label flex flex-wrap items-center gap-x-3 gap-y-1 text-theme-muted">
        {items.map((r, i) => {
          const last = i === items.length - 1;
          return (
            <li key={r.path} className="flex items-center gap-3">
              {last ? (
                <span aria-current="page" className="text-theme">
                  {t(r.title, locale)}
                </span>
              ) : (
                <Link href={href(locale, r.path)} className="link-line transition-colors hover:text-theme">
                  {r.path === "" ? dict.common.home : t(r.title, locale)}
                </Link>
              )}
              {!last && <span aria-hidden className="inline-block h-px w-4 bg-current opacity-50" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
