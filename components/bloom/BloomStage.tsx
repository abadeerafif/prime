"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { isTouchDevice, prefersReducedMotion } from "@/lib/motion";
import { useIntro, useLocale } from "@/components/Providers";
import { BloomMark } from "./BloomMark";

/**
 * A single, persistent bloom fixed behind the page. One scrubbed timeline
 * moves it through the sections: large and slowly turning behind the hero,
 * drifting to the side for philosophy and treatments, nearly dissolving in
 * the gallery, then settling into a compact ivory seal beside the booking
 * headline.
 */
export function BloomStage() {
  const stage = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const { introDone } = useIntro();
  const { sign } = useLocale();

  useGSAP(
    () => {
      const el = stage.current;
      const mark = svg.current;
      if (!el || !mark) return;

      const reduced = prefersReducedMotion();
      const mobile = isTouchDevice() || window.innerWidth < 1024;
      const vw = () => window.innerWidth;
      const vh = () => window.innerHeight;

      const heroPose: gsap.TweenVars = {
        x: sign * vw() * (mobile ? 0.05 : 0.22),
        y: vh() * 0.05,
        scale: mobile ? 1.1 : 1.35,
        opacity: mobile ? 0.3 : 0.55,
      };

      // Before the preloader hands over, hold the hero pose invisibly so the
      // preloader can measure where its bloom should fly to.
      if (!introDone) {
        gsap.set(el, { ...heroPose, visibility: "hidden" });
        return;
      }
      gsap.set(el, { ...heroPose, visibility: "visible" });

      if (reduced) {
        gsap.set(el, { opacity: 0.35 });
        return;
      }

      // Ambient rotation that never stops; scroll keyframes layer on top.
      const spin = gsap.to(mark, { rotate: 360, duration: 180, ease: "none", repeat: -1 });
      const sections = {
        hero: document.getElementById("hero"),
        philosophy: document.getElementById("philosophy"),
        treatments: document.getElementById("treatments"),
        experience: document.getElementById("hair-band"),
        journey: document.getElementById("journey"),
        contact: document.getElementById("contact"),
      };

      const keyframes: Array<{ el: HTMLElement | null; to: gsap.TweenVars }> = [
        { el: sections.hero, to: heroPose },
        {
          el: sections.philosophy,
          to: { x: sign * -vw() * (mobile ? 0.1 : 0.3), y: -vh() * 0.1, scale: mobile ? 1.6 : 2, opacity: mobile ? 0.12 : 0.22 },
        },
        {
          el: sections.treatments,
          to: { x: sign * vw() * (mobile ? 0.45 : 0.28), y: mobile ? -vh() * 0.2 : 0, scale: mobile ? 0.9 : 1.1, opacity: mobile ? 0.18 : 0.35 },
        },
        {
          el: sections.experience,
          to: { x: 0, y: vh() * 0.1, scale: 3, opacity: 0.06 },
        },
        {
          // The journey and booking sections are opaque (curtain reveal), so the
          // stage bloom dissolves here and a local seal takes over in Booking.
          el: sections.journey,
          to: { x: sign * -vw() * 0.3, y: 0, scale: 0.9, opacity: 0 },
        },
      ];

      keyframes.slice(1).forEach((kf, i) => {
        const prev = keyframes[i].el;
        if (!kf.el || !prev) return;
        gsap.to(el, {
          ...kf.to,
          ease: "none",
          scrollTrigger: {
            trigger: kf.el,
            start: "top bottom",
            end: "top 20%",
            scrub: 0.8,
          },
        });
      });

      // Pointer tilt on desktop, only while the hero is in view.
      if (!mobile) {
        const xTo = gsap.quickTo(mark, "x", { duration: 1.4, ease: "power2" });
        const yTo = gsap.quickTo(mark, "y", { duration: 1.4, ease: "power2" });
        let active = true;
        const move = (e: PointerEvent) => {
          if (!active) return;
          xTo(((e.clientX / vw()) - 0.5) * 50);
          yTo(((e.clientY / vh()) - 0.5) * 50);
        };
        const heroTrigger = sections.hero
          ? ScrollTrigger.create({
              trigger: sections.hero,
              start: "top top",
              end: "bottom top",
              onToggle: (s) => {
                active = s.isActive;
                if (!active) {
                  xTo(0);
                  yTo(0);
                }
              },
            })
          : null;
        window.addEventListener("pointermove", move, { passive: true });
        return () => {
          window.removeEventListener("pointermove", move);
          heroTrigger?.kill();
          spin.kill();
        };
      }

      return () => spin.kill();
    },
    { dependencies: [introDone, sign], revertOnUpdate: true },
  );

  return (
    <div
      ref={stage}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center will-change-transform"
      data-bloom-stage
    >
      <BloomMark
        ref={svg}
        tone="gold"
        strokeWidth={6}
        solidSparkles
        className="h-auto w-[min(120vw,70vh)] opacity-90 lg:w-[min(60vw,80vh)]"
      />
    </div>
  );
}
