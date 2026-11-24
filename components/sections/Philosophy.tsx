"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { useLocale } from "@/components/Providers";
import { SectionLabel } from "@/components/ui/SectionLabel";

type Props = {
  label: string;
  statement: string;
  pillars: { title: string; body: string }[];
  link?: { label: string; href: string };
};

/**
 * On desktop: a pinned scene where the mission statement lights up word by
 * word as you scroll, then lifts away as the two pillars slide in. Below lg
 * (and with reduced motion) the section flows normally: the statement, then
 * the pillars underneath it.
 */
export function Philosophy({ label, statement: statementText, pillars: items, link }: Props) {
  const section = useRef<HTMLElement>(null);
  const statement = useRef<HTMLHeadingElement>(null);
  const pillars = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);
  const { sign } = useLocale();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 64rem)");
    const apply = () => setPinned(mq.matches && !prefersReducedMotion());
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useGSAP(
    () => {
      const el = section.current;
      const text = statement.current;
      const pillarEls = pillars.current?.querySelectorAll<HTMLElement>("[data-pillar]");
      const lines = pillars.current?.querySelectorAll<HTMLElement>("[data-pillar-line]");
      if (!el || !text || !pillarEls || !lines) return;

      if (!pinned) {
        gsap.set(text, { autoAlpha: 1, yPercent: 0 });
        gsap.set(pillars.current, { autoAlpha: 1 });
        if (prefersReducedMotion()) {
          gsap.set(pillarEls, { autoAlpha: 1, x: 0 });
          gsap.set(lines, { scaleX: 1 });
          return;
        }
        gsap.fromTo(
          pillarEls,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.15, scrollTrigger: { trigger: pillars.current, start: "top 85%", once: true } },
        );
        gsap.fromTo(
          lines,
          { scaleX: 0 },
          { scaleX: 1, duration: 1.4, stagger: 0.15, ease: "primeInOut", scrollTrigger: { trigger: pillars.current, start: "top 85%", once: true } },
        );
        return;
      }

      const split = SplitText.create(text, {
        type: "words",
        wordsClass: "word",
        aria: "auto",
        autoSplit: true,
        onSplit: (self) => {
          gsap.set(text, { autoAlpha: 1 });
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
              refreshPriority: 1,
            },
          });

          tl.fromTo(self.words, { opacity: 0.18 }, { opacity: 1, stagger: 0.6, duration: 1.2, ease: "none" })
            .to({}, { duration: 1 })
            .to(text, { yPercent: -40, autoAlpha: 0, duration: 3, ease: "primeInOut" })
            .fromTo(
              pillarEls,
              { autoAlpha: 0, x: (i) => (i === 0 ? -1 : 1) * sign * 90 },
              { autoAlpha: 1, x: 0, duration: 3.5, stagger: 0.4, ease: "prime" },
              "-=1.5",
            )
            .fromTo(lines, { scaleX: 0 }, { scaleX: 1, duration: 2.5, stagger: 0.4, ease: "primeInOut" }, "<+0.5")
            .to({}, { duration: 1.5 });
          return tl;
        },
      });

      return () => split.revert();
    },
    { dependencies: [sign, pinned], revertOnUpdate: true },
  );

  return (
    <section
      id="philosophy"
      ref={section}
      data-theme-section="grey"
      className={pinned ? "relative h-[200vh]" : "section-y relative"}
    >
      <div className={pinned ? "sticky top-0 flex h-screen flex-col justify-center overflow-hidden" : ""}>
        <div className="container-prime">
          <SectionLabel className="mb-stack-lg">{label}</SectionLabel>

          <div className="relative">
            <h2
              ref={statement}
              className="font-display text-display-md invisible max-w-[22ch] text-balance text-theme lg:text-display-lg"
            >
              {statementText}
            </h2>

            <div
              ref={pillars}
              className={`grid grid-cols-1 gap-12 md:grid-cols-2 lg:gap-24 ${
                pinned ? "absolute inset-0 content-center" : "mt-head"
              }`}
            >
              {items.map((pillar, i) => (
                <article key={pillar.title} data-pillar className="invisible">
                  <span data-pillar-line className="hairline-gold mb-stack block w-full origin-left rtl:origin-right" />
                  <h3 className="font-display text-display-sm mb-stack-sm text-balance text-theme">{pillar.title}</h3>
                  <p className="text-body-lg max-w-[46ch] text-theme-muted">{pillar.body}</p>
                  {link && i === items.length - 1 && (
                    <Link href={link.href} className="link-line text-label mt-stack inline-block text-theme">
                      {link.label}
                    </Link>
                  )}
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
