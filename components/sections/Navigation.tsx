"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { isTouchDevice, prefersReducedMotion } from "@/lib/motion";
import { otherLocale } from "@/lib/i18n";
import { useIntro, useLocale } from "@/components/Providers";
import { useSmoothScroll } from "@/components/motion/SmoothScroll";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { ArrowIcon, PlusMinus } from "@/components/ui/Icons";

export type NavLink = { label: string; href: string; highlight?: boolean };
export type NavGroup = {
  label: string;
  columns: { title?: string; links: NavLink[] }[];
  feature?: NavLink & { text: string };
  footer?: NavLink;
};
export type NavConfig = {
  variant: "main" | "hair";
  logo: { alt: string; text?: string };
  homeHref: string;
  items: (NavLink | NavGroup)[];
  cta: { label: string; href: string };
  back?: NavLink;
  brandLine?: NavLink;
  labels: { menu: string; close: string; langToggle: string; langToggleAria: string; primary: string };
};

const isGroup = (item: NavLink | NavGroup): item is NavGroup => "columns" in item;

export function Navigation({ config }: { config: NavConfig }) {
  const header = useRef<HTMLElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<number | null>(null);
  const [mobileGroup, setMobileGroup] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const holdRef = useRef(false);
  const heldForIntro = useRef(false);
  const { introDone } = useIntro();
  const { locale } = useLocale();
  const { stop, start } = useSmoothScroll();
  const router = useRouter();
  const pathname = usePathname();
  const isCurrent = (href: string) => href !== config.homeHref && (pathname === href || pathname.startsWith(`${href}/`));
  const groupCurrent = (group: NavGroup) => group.columns.some((c) => c.links.some((l) => isCurrent(l.href)));

  useEffect(() => {
    holdRef.current = open || panel !== null;
  }, [open, panel]);

  // Entrance after the preloader hands off, then hide/show on scroll direction
  // and pick up a backdrop once the page has moved.
  useGSAP(
    () => {
      const el = header.current;
      if (!el) return;
      // Only the home preloader holds the header back; inner pages keep the
      // CSS entrance it was server-rendered with.
      if (!introDone) {
        if (document.querySelector("[data-preloader]")) {
          heldForIntro.current = true;
          gsap.set(el, { autoAlpha: 0, y: -16 });
        }
        return;
      }
      if (heldForIntro.current) {
        heldForIntro.current = false;
        gsap.to(el, { autoAlpha: 1, y: 0, duration: 1, delay: 0.3 });
      }

      let hidden = false;
      const st = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const y = self.scroll();
          setScrolled(y > 40);
          const shouldHide = !holdRef.current && !el.matches(":focus-within") && self.direction === 1 && y > 120;
          if (shouldHide !== hidden) {
            hidden = shouldHide;
            gsap.to(el, { yPercent: hidden ? -110 : 0, duration: 0.6, ease: "primeInOut", overwrite: "auto" });
          }
        },
      });
      // Keyboard focus arriving in a hidden header brings it back.
      const onFocus = () => {
        if (!hidden) return;
        hidden = false;
        gsap.to(el, { yPercent: 0, duration: 0.4, ease: "primeInOut", overwrite: "auto" });
      };
      el.addEventListener("focusin", onFocus);
      return () => {
        st.kill();
        el.removeEventListener("focusin", onFocus);
      };
    },
    { dependencies: [introDone] },
  );

  // Full-screen mobile menu.
  useGSAP(
    () => {
      const el = overlay.current;
      if (!el) return;
      const links = el.querySelectorAll("[data-menu-link]");
      const meta = el.querySelectorAll("[data-menu-meta]");
      if (prefersReducedMotion()) {
        if (open) stop();
        else start();
        gsap.set(el, { clipPath: open ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)", pointerEvents: open ? "auto" : "none" });
        gsap.set(links, { yPercent: 0 });
        gsap.set(meta, { autoAlpha: 1, y: 0 });
        return;
      }
      if (open) {
        stop();
        gsap
          .timeline()
          .set(el, { pointerEvents: "auto" })
          .fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "primeInOut" })
          .fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.06 }, "-=0.45")
          .fromTo(meta, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.05 }, "-=0.7");
      } else {
        start();
        gsap
          .timeline()
          .to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.7, ease: "primeInOut" })
          .set(el, { pointerEvents: "none" });
      }
    },
    { dependencies: [open] },
  );

  // While the menu is open, the page behind it leaves the tab order and the accessibility tree.
  useEffect(() => {
    const behind = Array.from(document.querySelectorAll<HTMLElement>("main, footer, .action-bar"));
    behind.forEach((node) => (node.inert = open));
    return () => behind.forEach((node) => (node.inert = false));
  }, [open]);

  // Focus into the menu when it opens, back to the toggle when it closes.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      const first = overlay.current?.querySelector<HTMLElement>("[data-menu-link]");
      const id = window.setTimeout(() => first?.focus({ preventScroll: true }), 400);
      wasOpen.current = true;
      return () => window.clearTimeout(id);
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      toggle.current?.focus({ preventScroll: true });
    }
  }, [open]);

  // Escape closes everything; a click outside the header closes the mega-menu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      setPanel(null);
    };
    const onDown = (e: PointerEvent) => {
      if (header.current && !header.current.contains(e.target as Node)) setPanel(null);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, []);

  const closeAll = () => {
    setOpen(false);
    setPanel(null);
    setMobileGroup(null);
  };

  const switchLocale = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const next = otherLocale(locale);
    const target = window.location.pathname.replace(/^\/(ar|en)(?=\/|$)/, `/${next}`) + window.location.hash;
    document.cookie = `prime-locale=${next}; path=/; max-age=31536000; samesite=lax`;
    sessionStorage.setItem("prime-intro", "1");
    // Soft ivory wash before the route changes; it is removed once the new locale has painted.
    const wash = document.createElement("div");
    wash.style.cssText = "position:fixed;inset:0;z-index:90;background:#D9D6C7;opacity:0;pointer-events:none;";
    document.body.appendChild(wash);
    gsap.to(wash, {
      opacity: 1,
      duration: 0.45,
      ease: "primeInOut",
      onComplete: () => {
        router.push(target);
        window.setTimeout(() => gsap.to(wash, { opacity: 0, duration: 0.6, onComplete: () => wash.remove() }), 900);
      },
    });
  };

  const langHref = pathname.replace(/^\/(ar|en)(?=\/|$)/, `/${otherLocale(locale)}`);
  const langLink = (
    <Link
      href={langHref}
      // Prefetching the other locale would pull in its font preloads too.
      prefetch={false}
      onClick={switchLocale}
      className="link-line text-label text-theme"
      aria-label={config.labels.langToggleAria}
      lang={otherLocale(locale)}
    >
      {config.labels.langToggle}
    </Link>
  );

  const hover = (i: number | null) => {
    if (!isTouchDevice()) setPanel(i);
  };

  return (
    <>
      <header
        ref={header}
        className={`site-header enter fixed inset-x-0 top-0 z-[75] text-theme ${(scrolled || panel !== null) && !open ? "is-scrolled" : ""}`}
        data-surface={open ? "light" : undefined}
        onPointerLeave={() => hover(null)}
      >
        <div className={`container-prime flex items-center justify-between gap-6 transition-[padding] duration-500 ${scrolled ? "py-3 lg:py-4" : "py-5 lg:py-6"}`}>
          <div className="flex min-w-0 flex-col">
            <Link href={config.homeHref} onClick={closeAll} className="tap-target block" aria-label={config.logo.alt}>
              {config.variant === "main" ? (
                <span className="relative block h-8 w-[112px] sm:h-9 sm:w-[140px] lg:h-10 lg:w-[160px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/logo-landscape-charcoal-480.png" alt="" width={480} height={141} className={`absolute inset-0 h-full w-full object-contain object-left rtl:object-right ${open ? "" : "theme-dark:hidden"}`} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/logo-landscape-ivory-480.png" alt="" width={480} height={141} className={`absolute inset-0 hidden h-full w-full object-contain object-left rtl:object-right ${open ? "" : "theme-dark:block"}`} />
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/logo-icon-168.png" alt="" width={168} height={121} className="h-8 w-auto lg:h-10" />
                  <span className="font-display-latin text-[0.95rem] uppercase leading-tight tracking-[0.18em] lg:text-[1.05rem]" dir="ltr">
                    {config.logo.text}
                  </span>
                </span>
              )}
            </Link>
            {config.brandLine && (
              <Link href={config.brandLine.href} className="link-line mt-1 hidden self-start text-xs text-theme-muted sm:inline-block">
                {config.brandLine.label}
              </Link>
            )}
          </div>

          <nav className="hidden items-center gap-6 xl:gap-8 lg:flex" aria-label={config.labels.primary}>
            {config.items.map((item, i) =>
              isGroup(item) ? (
                <button
                  key={item.label}
                  type="button"
                  className="text-label inline-flex items-center gap-2 text-theme"
                  aria-expanded={panel === i}
                  aria-controls={`nav-panel-${i}`}
                  onClick={() => setPanel(panel === i ? null : i)}
                  onPointerEnter={() => hover(i)}
                >
                  <span className={panel === i || groupCurrent(item) ? "text-accent" : ""}>{item.label}</span>
                  <span
                    aria-hidden
                    className="block h-1.5 w-1.5 border-b border-e border-current transition-transform duration-500"
                    style={{ transform: `translateY(${panel === i ? 2 : -2}px) rotate(${panel === i ? 225 : 45}deg)` }}
                  />
                </button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeAll}
                  onPointerEnter={() => hover(null)}
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                  className={
                    item.highlight
                      ? "text-label inline-flex min-h-10 items-center rounded-full border border-[var(--accent)] px-4 text-theme transition-colors hover:bg-[var(--accent)] hover:text-[var(--bg)]"
                      : `link-line text-label ${isCurrent(item.href) ? "text-accent" : "text-theme"}`
                  }
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex shrink-0 items-center gap-4 lg:gap-5">
            <span className="hidden sm:inline-flex">{langLink}</span>
            {/* Below lg the sticky action bar carries the booking button. */}
            <span className="hidden lg:inline-flex">
              <MagneticButton href={config.cta.href} className="btn-compact" onClick={closeAll}>
                {config.cta.label}
              </MagneticButton>
            </span>
            <button
              ref={toggle}
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="relative flex h-10 w-10 items-center justify-center lg:hidden"
              aria-expanded={open}
              aria-controls="prime-menu"
              aria-label={open ? config.labels.close : config.labels.menu}
            >
              <span className={`absolute h-px w-6 bg-current transition-transform duration-500 ${open ? "rotate-45" : "-translate-y-1"}`} />
              <span className={`absolute h-px w-6 bg-current transition-transform duration-500 ${open ? "-rotate-45" : "translate-y-1"}`} />
            </button>
          </div>
        </div>

        {/* Desktop mega-menu panel */}
        {config.items.map((item, i) =>
          isGroup(item) ? (
            <div
              key={item.label}
              id={`nav-panel-${i}`}
              data-surface="light"
              className="absolute inset-x-0 top-full hidden border-t border-theme bg-ivory-light text-charcoal shadow-[0_30px_60px_-40px_rgba(53,51,46,0.5)] lg:block"
              style={{
                clipPath: panel === i ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)",
                transition: "clip-path .6s var(--ease-prime-in-out)",
                pointerEvents: panel === i ? "auto" : "none",
              }}
              inert={panel !== i}
            >
              <div className="container-prime grid grid-cols-12 gap-x-8 gap-y-stack py-head">
                {item.columns.map((col) => (
                  <div key={col.title ?? col.links[0]?.href} className="col-span-3">
                    {col.title && <p className="text-label mb-5 text-accent">{col.title}</p>}
                    <ul className="space-y-3" role="list">
                      {col.links.map((l) => (
                        <li key={l.href}>
                          <Link
                            href={l.href}
                            onClick={closeAll}
                            aria-current={isCurrent(l.href) ? "page" : undefined}
                            className={`font-display text-title transition-colors hover:text-accent ${isCurrent(l.href) ? "text-accent" : "text-theme"}`}
                          >
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {item.feature && (
                  <Link
                    href={item.feature.href}
                    onClick={closeAll}
                    className="group col-span-3 flex flex-col justify-between rounded-card bg-charcoal p-card text-ivory-light"
                  >
                    <span className="text-label text-gold-light">{item.feature.label}</span>
                    <span className="font-display text-title mt-stack">{item.feature.text}</span>
                    <ArrowIcon className="mt-6 h-5 w-5 text-gold-light transition-transform duration-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </Link>
                )}
                {item.footer && (
                  <div className="col-span-12 border-t border-theme pt-6">
                    <Link href={item.footer.href} onClick={closeAll} className="link-line text-label inline-flex items-center gap-2 text-theme">
                      {item.footer.label}
                      <ArrowIcon />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : null,
        )}
      </header>

      {/* Mobile overlay */}
      <div
        id="prime-menu"
        ref={overlay}
        className="pointer-events-none fixed inset-0 z-[70] flex flex-col justify-between overflow-y-auto bg-ivory px-[var(--gutter)] pb-stack-lg pt-anchor text-charcoal"
        style={{ clipPath: "inset(0 0 100% 0)" }}
        aria-hidden={!open}
        inert={!open}
        data-surface="light"
        data-lenis-prevent
      >
        <nav className="flex flex-col" aria-label={config.labels.menu}>
          {config.items.map((item, i) => (
            <div key={isGroup(item) ? item.label : item.href} className="overflow-hidden border-b border-theme">
              {isGroup(item) ? (
                <>
                  <button
                    type="button"
                    data-menu-link
                    className="flex w-full items-center justify-between py-3 text-start font-display text-display-md"
                    aria-expanded={mobileGroup === i}
                    onClick={() => setMobileGroup(mobileGroup === i ? null : i)}
                  >
                    {item.label}
                    <PlusMinus open={mobileGroup === i} className="h-4 w-4 text-accent" />
                  </button>
                  <div
                    className="grid"
                    style={{
                      gridTemplateRows: mobileGroup === i ? "1fr" : "0fr",
                      transition: "grid-template-rows .6s var(--ease-prime-in-out)",
                    }}
                    inert={mobileGroup !== i}
                  >
                    <div className="overflow-hidden">
                      <div className="space-y-6 pb-6">
                        {item.columns.map((col) => (
                          <div key={col.title ?? col.links[0]?.href}>
                            {col.title && <p className="text-label mb-3 text-accent">{col.title}</p>}
                            <ul className="space-y-2" role="list">
                              {col.links.map((l) => (
                                <li key={l.href}>
                                  <Link href={l.href} onClick={closeAll} className="text-body-lg">
                                    {l.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                        {item.feature && (
                          <Link href={item.feature.href} onClick={closeAll} className="text-body-lg flex items-center gap-2 text-accent">
                            {item.feature.label}
                            <ArrowIcon />
                          </Link>
                        )}
                        {item.footer && (
                          <Link href={item.footer.href} onClick={closeAll} className="link-line text-label inline-block">
                            {item.footer.label}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  href={item.href}
                  onClick={closeAll}
                  data-menu-link
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                  className={`block py-3 font-display text-display-md ${item.highlight || isCurrent(item.href) ? "text-accent" : ""}`}
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
        <div className="mt-stack-lg flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-4" data-menu-meta>
            {langLink}
            {config.back && (
              <Link href={config.back.href} onClick={closeAll} className="link-line text-label">
                {config.back.label}
              </Link>
            )}
          </div>
          <span data-menu-meta>
            <MagneticButton href={config.cta.href} solid onClick={closeAll}>
              {config.cta.label}
            </MagneticButton>
          </span>
        </div>
      </div>
    </>
  );
}
