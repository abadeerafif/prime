import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { hoursFor, mapsLink, site, whatsappUrl } from "@/lib/site";
import { HAIR, href, visibleLinks } from "@/content/registry";
import { hubs } from "@/content/hubs";
import { t } from "@/content/types";
import { dictFor } from "@/dictionaries";
import { Reveal } from "@/components/motion/Reveal";
import { BackToTop, FooterWordmark, Year } from "@/components/sections/FooterMotion";

type Props = { locale: Locale; variant?: "main" | "hair" };

export function Footer({ locale, variant = "main" }: Props) {
  const d = dictFor(locale);
  const hours = hoursFor(locale);
  const wa = whatsappUrl();

  const contactRows = [
    hours ? { label: d.common.hours, value: hours } : null,
    site.phone ? { label: d.common.phone, value: site.phone, href: `tel:${site.phone}` } : null,
    wa ? { label: d.common.whatsappShort, value: `+${site.whatsapp}`, href: wa } : null,
    site.email ? { label: d.common.email, value: site.email, href: `mailto:${site.email}` } : null,
  ].filter((x): x is { label: string; value: string; href?: string } => x !== null);

  const social = [
    site.instagram ? { label: "Instagram", href: site.instagram } : null,
    site.facebook ? { label: "Facebook", href: site.facebook } : null,
    site.tiktok ? { label: "TikTok", href: site.tiktok } : null,
  ].filter((x): x is { label: string; href: string } => x !== null);

  const clinicLinks = visibleLinks(["/about", "/doctors", "/blog", "/faq", "/contact", "/privacy", "/terms"]);
  const hairLinks = visibleLinks([
    `${HAIR}/what-is-hair-transplant`,
    `${HAIR}/am-i-a-candidate`,
    `${HAIR}/growth-timeline`,
    `${HAIR}/cost`,
    `${HAIR}/faq`,
    `${HAIR}/book`,
  ]);

  return (
    <footer data-theme-section="charcoal" data-surface="dark" className="relative z-10 overflow-hidden bg-charcoal-deep pb-[calc(4rem+env(safe-area-inset-bottom))] pt-section text-ivory lg:pb-0">
      <div className="container-prime">
        <div className="grid-prime gap-y-12">
          <Reveal className="col-span-4 md:col-span-6 lg:col-span-3" y={30}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-portrait-ivory.png" alt={t(site.name, locale)} className="h-auto w-28 lg:w-32" />
            <p className="font-display text-display-sm mt-stack max-w-[16ch] text-balance text-ivory-light">
              {variant === "hair" ? d.footer.hairTagline : d.footer.tagline}
            </p>
          </Reveal>

          <Reveal className="col-span-4 md:col-span-3 lg:col-span-3" delay={0.1} y={20}>
            <p className="text-label mb-stack-sm text-accent">{d.footer.contactTitle}</p>
            <address className="text-body max-w-[32ch] not-italic text-theme-muted">{site.address[locale]}</address>
            <a href={mapsLink} target="_blank" rel="noreferrer" className="link-line text-label mt-4 inline-block text-ivory">
              {d.common.openMap}
            </a>
            {contactRows.length > 0 && (
              <dl className="mt-stack space-y-3 text-body">
                {contactRows.map((row) => (
                  <div key={row.label}>
                    <dt className="text-sm text-theme-muted">{row.label}</dt>
                    <dd className="text-ivory-light" dir={row.href ? "ltr" : undefined}>
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
            )}
          </Reveal>

          <Reveal className="col-span-2 md:col-span-3 lg:col-span-3" delay={0.2} y={20}>
            <p className="text-label mb-stack-sm text-accent">{variant === "hair" ? d.footer.hairTitle : d.footer.specialtiesTitle}</p>
            <ul className="space-y-2.5 text-body text-theme-muted" role="list">
              {variant === "hair"
                ? hairLinks.map((r) => (
                    <li key={r.path}>
                      <Link href={href(locale, r.path)} className="link-line hover:text-ivory-light">
                        {t(r.title, locale)}
                      </Link>
                    </li>
                  ))
                : [
                    ...hubs.map((h) => (
                      <li key={h.id}>
                        <Link href={href(locale, `/${h.id}`)} className="link-line hover:text-ivory-light">
                          {t(h.name, locale)}
                        </Link>
                      </li>
                    )),
                    <li key="hair">
                      <Link href={href(locale, HAIR)} className="link-line text-gold-light">
                        {t(site.hairName, locale)}
                      </Link>
                    </li>,
                  ]}
            </ul>
          </Reveal>

          <Reveal className="col-span-2 md:col-span-3 lg:col-span-2 lg:col-start-11" delay={0.3} y={20}>
            <p className="text-label mb-stack-sm text-accent">{d.footer.clinicTitle}</p>
            <ul className="space-y-2.5 text-body text-theme-muted" role="list">
              {variant === "hair" && (
                <li>
                  <Link href={href(locale, "")} className="link-line text-gold-light">
                    {t(site.name, locale)}
                  </Link>
                </li>
              )}
              {clinicLinks.map((r) => (
                <li key={r.path}>
                  <Link href={href(locale, r.path)} className="link-line hover:text-ivory-light">
                    {t(r.title, locale)}
                  </Link>
                </li>
              ))}
            </ul>
            {social.length > 0 && (
              <>
                <p className="text-label mb-stack-sm mt-stack-lg text-accent">{d.common.follow}</p>
                <ul className="space-y-2.5 text-body text-theme-muted" role="list">
                  {social.map((s) => (
                    <li key={s.label}>
                      <a href={s.href} target="_blank" rel="noreferrer" className="link-line hover:text-ivory-light">
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Reveal>
        </div>

        <div className="mt-head flex flex-wrap items-center justify-between gap-6 border-t border-ivory/15 pt-stack">
          <p className="measure text-sm text-theme-muted">{d.footer.disclaimer}</p>
          <span className="text-label text-theme-muted">
            <BackToTop label={d.footer.backToTop} />
          </span>
        </div>
      </div>

      <FooterWordmark />
      <div className="container-prime flex justify-between py-5 text-label text-theme-muted">
        <span>
          © <Year /> {d.footer.rights}
        </span>
      </div>
    </footer>
  );
}
