import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { t, type ContentPage } from "@/content/types";
import { doctors } from "@/content/doctors";
import { home } from "@/content/home";
import { dictFor } from "@/dictionaries";
import { PageHero } from "@/components/ui/PageHero";
import { BlockRenderer } from "@/components/ui/BlockRenderer";
import { OnThisPage } from "@/components/ui/OnThisPage";
import { DoctorCard } from "@/components/ui/DoctorCard";
import { CtaBand } from "@/components/ui/CtaBand";
import { RelatedLinks } from "@/components/ui/RelatedLinks";
type Props = {
  page: ContentPage;
  locale: Locale;
  path: string;
  tone: "dark" | "stone";
  label?: string;
  bookHref?: string;
  bookLabel?: string;
  notice?: string;
  /** Extra content after the blocks, inside the reading column. */
  children?: ReactNode;
};

/** Long-form reading template shared by service pages, hair pages, articles and legal pages. */
export function ContentPageView({ page, locale, path, tone, label, bookHref = "/book", bookLabel, notice, children }: Props) {
  const dict = dictFor(locale);
  const doctor = page.doctor ? doctors.find((d) => d.id === page.doctor) : undefined;
  const toc = page.blocks.filter((b) => b.title).map((b) => ({ id: b.id, label: t(b.title!, locale) }));

  return (
    <>
      <PageHero
        locale={locale}
        path={path}
        label={label}
        h1={t(page.h1, locale)}
        heroLine={page.heroLine && t(page.heroLine, locale)}
        intro={page.intro && t(page.intro, locale)}
        tone={tone}
        primary={{ label: bookLabel ?? dict.common.book, href: `/${locale}${bookHref}` }}
        showWhatsapp
      />

      <div data-theme-section={tone === "dark" ? "paper" : "ivory"} className="section-y relative z-10">
        <div className="container-prime grid-prime gap-y-10">
          <aside className="col-span-4 md:col-span-6 lg:col-span-3">
            <OnThisPage items={toc} title={dict.common.onThisPage} />
          </aside>
          <div className="col-span-4 md:col-span-6 lg:col-span-7 lg:col-start-5">
            <div className="max-w-[46rem] space-y-head">
              {notice && <p className="text-label border-s-2 border-[var(--accent)] ps-4 text-accent">{notice}</p>}
              <BlockRenderer blocks={page.blocks} locale={locale} bookHref={bookHref} />
              {children}
              {doctor && <DoctorCard doctor={doctor} locale={locale} variant="inline" text={t(doctor.headline, locale)} />}
            </div>
          </div>
        </div>
        <RelatedLinks locale={locale} paths={page.related} title={dict.common.related} />
      </div>

      <CtaBand
        locale={locale}
        text={t(page.closing ?? home.finalCta, locale)}
        bookHref={bookHref}
        bookLabel={bookLabel}
      />
    </>
  );
}
