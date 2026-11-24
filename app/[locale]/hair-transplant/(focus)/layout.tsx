import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { HAIR, href } from "@/content/registry";
import { t } from "@/content/types";
import { dictFor } from "@/dictionaries";
import { ArrowIcon } from "@/components/ui/Icons";

/** Single-purpose booking layout: logo and a way back, nothing else to distract. */
export default async function FocusLayout({ children, params }: LayoutProps<"/[locale]/hair-transplant">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = dictFor(locale);
  return (
    <>
      <header className="absolute inset-x-0 top-0 z-[75] text-theme">
        <div className="container-prime flex items-center justify-between gap-6 py-5 lg:py-6">
          <Link href={href(locale, HAIR)} className="flex items-center gap-3" aria-label={t(site.hairName, locale)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-icon.png" alt="" className="h-8 w-auto lg:h-10" />
            <span className="font-display-latin text-[0.95rem] uppercase leading-tight tracking-[0.18em] lg:text-[1.05rem]" dir="ltr">
              Prime Hair Transplant
            </span>
          </Link>
          <Link href={href(locale, HAIR)} className="link-line text-label inline-flex items-center gap-2 text-theme-muted">
            <ArrowIcon className="h-3.5 w-3.5 -scale-x-100 rtl:scale-x-100" />
            {t(site.hairName, locale)}
          </Link>
        </div>
      </header>
      {children}
      <footer data-theme-section="ivory" className="relative z-10 border-t border-theme py-10 text-theme-muted">
        <div className="container-prime flex flex-wrap items-center justify-between gap-4 text-sm">
          <p>{site.address[locale]}</p>
          <p className="measure">{d.footer.disclaimer}</p>
        </div>
      </footer>
    </>
  );
}
