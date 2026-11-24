"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gsap, useGSAP } from "@/lib/gsap";
import { isTouchDevice, prefersReducedMotion } from "@/lib/motion";
import { useLocale } from "@/components/Providers";
import { Reveal } from "@/components/motion/Reveal";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { PlusMinus } from "@/components/ui/Icons";

type Item = { id: string; name: string; blurb: string; href: string };
type Props = { label: string; title: string; intro?: string; more: string; items: Item[] };

const TONES: Array<"light" | "dark" | "warm"> = ["light", "warm", "dark"];

/**
 * Specialty index: a large typographic list with a sticky petal-shaped
 * preview. Hovering a row marks it active and wipes the preview to that
 * specialty; clicking a row opens its hub. Below lg the rows become an
 * accordion instead.
 */
export function Treatments({ label, title, intro, more, items }: Props) {
  const list = useRef<HTMLUListElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [desktop, setDesktop] = useState(false);
  const [hoverable, setHoverable] = useState(true);
  const { sign } = useLocale();
  const router = useRouter();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 64rem)");
    const apply = () => {
      setDesktop(mq.matches);
      setHoverable(!isTouchDevice());
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Entrance: rows rise in sequence and their hairlines draw from the leading edge.
  useGSAP(() => {
    const rows = list.current?.querySelectorAll("[data-row]");
    const lines = list.current?.querySelectorAll("[data-row-line]");
    if (!rows || !lines) return;
    if (prefersReducedMotion()) {
      gsap.set(rows, { autoAlpha: 1 });
      gsap.set(lines, { scaleX: 1 });
      return;
    }
    const tl = gsap.timeline({ scrollTrigger: { trigger: list.current, start: "top 80%", once: true } });
    tl.fromTo(rows, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.06 }).fromTo(
      lines,
      { scaleX: 0 },
      { scaleX: 1, duration: 1.4, stagger: 0.07, ease: "primeInOut" },
      0.1,
    );
  }, []);

  // Preview wipe when the active specialty changes.
  useGSAP(
    () => {
      const panels = preview.current?.querySelectorAll<HTMLElement>("[data-panel]");
      if (!panels) return;
      panels.forEach((panel, i) => {
        if (i === active) {
          gsap.set(panel, { zIndex: 2 });
          gsap.fromTo(
            panel,
            { clipPath: "inset(0 0 100% 0)", scale: 1.1 },
            { clipPath: "inset(0 0 0% 0)", scale: 1, duration: 1.1, ease: "primeInOut" },
          );
        } else {
          gsap.set(panel, { zIndex: 1, clipPath: "inset(0 0 0% 0)", delay: 1.1 });
        }
      });
    },
    { dependencies: [active] },
  );

  const onRowClick = (e: MouseEvent<HTMLButtonElement>, i: number) => {
    if (desktop) {
      e.preventDefault();
      router.push(items[i].href);
      return;
    }
    setExpanded(expanded === i ? null : i);
  };

  return (
    <section id="treatments" data-theme-section="ivory" className="section-y relative">
      <div className="container-prime">
        <div className="grid-prime mb-head items-end">
          <div className="col-span-4 md:col-span-6 lg:col-span-7">
            <SectionLabel className="mb-stack-sm">{label}</SectionLabel>
            <SplitReveal as="h2" className="font-display text-display-lg text-balance text-theme" mode="lines">
              {title}
            </SplitReveal>
          </div>
          {intro && (
            <Reveal as="p" className="text-body-lg col-span-4 mt-stack max-w-[38ch] text-theme-muted md:col-span-6 lg:col-span-4 lg:col-start-9 lg:mt-0" delay={0.2}>
              {intro}
            </Reveal>
          )}
        </div>

        <div className="grid-prime items-start">
          <ul ref={list} className="col-span-4 md:col-span-6 lg:col-span-7" role="list">
            {items.map((item, i) => {
              const isActive = hoverable && active === i;
              const isOpen = expanded === i;
              return (
                <li key={item.id} data-row className="invisible relative">
                  <span data-row-line className="hairline block w-full origin-left rtl:origin-right" />
                  <button
                    type="button"
                    onPointerEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={(e) => onRowClick(e, i)}
                    aria-expanded={desktop ? undefined : isOpen}
                    aria-controls={desktop ? undefined : `specialty-${item.id}`}
                    className="group flex min-h-16 w-full items-center gap-5 py-5 text-start lg:gap-8 lg:py-6"
                    style={{
                      transform: `translateX(${isActive ? sign * 10 : 0}px)`,
                      transition: "transform .6s var(--ease-prime)",
                    }}
                  >
                    <span className="text-label w-8 shrink-0 tabular-nums text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <span className={`font-display text-display-sm flex-1 transition-colors ${isActive ? "text-accent" : "text-theme"}`}>
                      {item.name}
                    </span>
                    <span
                      className="text-label hidden text-theme-muted transition-transform duration-500 lg:block"
                      style={{ transform: `translateX(${isActive ? 0 : sign * -12}px)`, opacity: isActive ? 1 : 0 }}
                      aria-hidden
                    >
                      {more} <span className="inline-block rtl:-scale-x-100">→</span>
                    </span>
                    <PlusMinus open={isOpen} className="ms-auto h-5 w-5 lg:hidden" />
                  </button>

                  {/* Accordion body below lg */}
                  <div
                    id={`specialty-${item.id}`}
                    className="grid lg:hidden"
                    style={{
                      gridTemplateRows: isOpen ? "1fr" : "0fr",
                      transition: "grid-template-rows .8s var(--ease-prime-in-out)",
                    }}
                  >
                    <div className="overflow-hidden">
                      {/* Indent = number column (w-8) + row gap (gap-5) */}
                      <div className="pb-8 ps-13">
                        <p className="text-body max-w-[42ch] text-theme-muted">{item.blurb}</p>
                        <Link href={item.href} className="link-line text-label mt-stack-sm inline-block text-theme">
                          {more} <span className="inline-block rtl:-scale-x-100">→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
            <span className="hairline block w-full" />
          </ul>

          {/* Sticky petal preview (lg and up) */}
          <div className="sticky top-anchor col-span-4 col-start-9 hidden lg:block">
            <Reveal y={32}>
              <div ref={preview} className="mask-petal relative aspect-[4/5] w-full overflow-hidden">
                {items.map((item, i) => (
                  <div key={item.id} data-panel className="absolute inset-0">
                    <PhotoFrame className="h-full w-full" tone={TONES[i % TONES.length]} label={item.name} />
                  </div>
                ))}
              </div>
              <div className="relative mt-stack min-h-[7rem]">
                {items.map((item, i) => (
                  <p
                    key={item.id}
                    className="text-body-lg absolute inset-x-0 top-0 text-theme-muted"
                    style={{
                      opacity: active === i ? 1 : 0,
                      transform: `translateY(${active === i ? 0 : 12}px)`,
                      transition: "opacity .7s var(--ease-prime), transform .7s var(--ease-prime)",
                    }}
                    aria-hidden={active !== i}
                  >
                    {item.blurb}
                  </p>
                ))}
              </div>
              <Link href={items[active].href} className="link-line text-label mt-4 inline-block text-theme">
                {more} {items[active].name} <span className="inline-block rtl:-scale-x-100">→</span>
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
