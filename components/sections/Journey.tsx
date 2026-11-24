"use client";

import { useRef, useState } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { gsap } from "@/lib/gsap-draw";
import { prefersReducedMotion } from "@/lib/motion";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";
import { BloomMark } from "@/components/bloom/BloomMark";

type Props = { dict: { label: string; title: string; steps: { title: string; body: string }[] } };

/**
 * Sticky scene: the title and a rolling step number stay fixed while the four
 * steps scroll past. A gold stem draws down the page and a small bloom opens
 * at each step as it becomes active.
 */
export function Journey({ dict }: Props) {
  const section = useRef<HTMLElement>(null);
  const steps = useRef<HTMLOListElement>(null);
  const stem = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(() => {
    const list = steps.current;
    if (!list) return;
    const items = list.querySelectorAll<HTMLElement>("[data-step]");

    const triggers = Array.from(items).map((item, i) =>
      ScrollTrigger.create({
        trigger: item,
        start: "top 60%",
        end: "bottom 60%",
        onToggle: (self) => self.isActive && setActive(i),
      }),
    );

    if (!prefersReducedMotion() && stem.current) {
      gsap.fromTo(
        stem.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: list, start: "top 60%", end: "bottom 60%", scrub: 0.6 },
        },
      );
    }

    return () => triggers.forEach((t) => t.kill());
  }, []);

  // Draw the small bloom of the active step.
  useGSAP(
    () => {
      const list = steps.current;
      if (!list) return;
      const marks = list.querySelectorAll<SVGSVGElement>("[data-step-bloom]");
      marks.forEach((mark, i) => {
        const petals = mark.querySelectorAll(".bloom-petal");
        if (i === active) {
          if (prefersReducedMotion()) {
            gsap.set(petals, { drawSVG: "0% 100%" });
            return;
          }
          gsap.fromTo(petals, { drawSVG: "50% 50%" }, { drawSVG: "0% 100%", duration: 1.4, stagger: 0.08, ease: "primeInOut" });
          gsap.fromTo(mark, { rotate: -20, scale: 0.8 }, { rotate: 0, scale: 1, duration: 1.4, ease: "prime" });
        } else {
          gsap.to(petals, { drawSVG: "50% 50%", duration: 0.6, ease: "primeInOut" });
        }
      });
    },
    { dependencies: [active] },
  );

  return (
    <section id="journey" ref={section} data-theme-section="ivory" data-surface="light" className="section-y relative z-10 bg-ivory text-charcoal">
      <div className="container-prime grid-prime items-start">
        {/* Fixed column */}
        <div className="col-span-4 md:col-span-6 lg:sticky lg:top-anchor lg:col-span-5">
          <SectionLabel className="mb-stack-sm">{dict.label}</SectionLabel>
          <SplitReveal as="h2" className="font-display text-display-lg max-w-[12ch] text-balance text-charcoal" mode="lines">
            {dict.title}
          </SplitReveal>
          <Reveal className="mt-stack-lg hidden items-end gap-4 lg:flex" delay={0.3}>
            <span className="font-display-latin block h-[1em] overflow-hidden text-[clamp(5rem,10vw,11rem)] leading-none text-gold" aria-hidden>
              <span
                className="block transition-transform duration-[900ms]"
                style={{
                  transform: `translateY(-${(active / dict.steps.length) * 100}%)`,
                  transitionTimingFunction: "var(--ease-prime-in-out)",
                }}
              >
                {dict.steps.map((_, i) => (
                  <span key={i} className="block h-[1em]">
                    0{i + 1}
                  </span>
                ))}
              </span>
            </span>
            <span className="text-label mb-4 text-theme-muted">/ 0{dict.steps.length}</span>
          </Reveal>
        </div>

        {/* Scrolling steps */}
        <ol ref={steps} className="relative col-span-4 mt-head md:col-span-6 lg:col-span-6 lg:col-start-7 lg:mt-0" role="list">
          <span aria-hidden className="absolute inset-y-0 start-[11px] w-px bg-charcoal/15" />
          <span ref={stem} aria-hidden className="absolute inset-y-0 start-[11px] w-px origin-top bg-gold" />
          {dict.steps.map((step, i) => (
            <li
              key={step.title}
              data-step
              className="relative min-h-[32vh] ps-16 pb-head transition-opacity duration-700 lg:min-h-[40vh]"
              style={{ opacity: active === i ? 1 : 0.6 }}
            >
              <BloomMark
                data-step-bloom
                tone="gold"
                withSparkles={false}
                strokeWidth={28}
                className="absolute -start-[13px] top-1 h-auto w-12"
              />
              <Reveal y={24}>
                <p className="text-label mb-4 text-accent lg:hidden">0{i + 1}</p>
                <h3 className="font-display text-display-sm mb-stack-sm text-charcoal">{step.title}</h3>
                <p className="text-body-lg max-w-[40ch] text-theme-muted">{step.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
