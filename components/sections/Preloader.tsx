"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { useIntro } from "@/components/Providers";
import { useSmoothScroll } from "@/components/motion/SmoothScroll";
import { BloomMark } from "@/components/bloom/BloomMark";

/**
 * Ivory curtain in which the bloom draws itself petal by petal. On completion
 * the bloom glides to its hero position while the curtain lifts, so the
 * preloader becomes the hero rather than cutting to it.
 */
export function Preloader({ tagline }: { tagline: string }) {
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const bloomWrap = useRef<HTMLDivElement>(null);
  const bloom = useRef<SVGSVGElement>(null);
  const text = useRef<HTMLParagraphElement>(null);
  const [done, setDone] = useState(false);
  const started = useRef(false);
  const { introDone, setIntroDone } = useIntro();
  // Arriving from another page of the site: the intro has already played.
  const [skip] = useState(introDone);
  const { stop, start } = useSmoothScroll();

  // Plain useEffect rather than useGSAP: the context revert on StrictMode
  // remount would otherwise kill the intro timeline mid-flight.
  useEffect(
    () => {
      if (!root.current || !bloom.current || !bloomWrap.current) return;
      // Guard against React StrictMode running the effect twice in development.
      if (started.current) return;
      started.current = true;
      if (skip) return;
      const reduced = prefersReducedMotion();

      stop();
      document.documentElement.style.overflow = "hidden";
      const release = () => {
        document.documentElement.style.overflow = "";
        start();
        window.scrollTo(0, 0);
      };

      if (reduced) {
        gsap.set(root.current, { autoAlpha: 0 });
        window.setTimeout(() => {
          setIntroDone(true);
          setDone(true);
          release();
        }, 0);
        return;
      }

      // Returning within the same session (e.g. after a language switch):
      // a brief curtain lift instead of the full draw.
      if (sessionStorage.getItem("prime-intro")) {
        gsap.set([bloomWrap.current, text.current], { autoAlpha: 0 });
        gsap.to(panel.current, {
          yPercent: -100,
          duration: 0.9,
          ease: "primeInOut",
          delay: 0.1,
          onComplete: () => {
            setIntroDone(true);
            setDone(true);
            release();
          },
        });
        return;
      }

      const petals = bloom.current.querySelectorAll(".bloom-petal");
      const sparkles = bloom.current.querySelectorAll(".bloom-sparkle");

      // Whole intro, including the curtain lift, lands in about two seconds.
      const tl = gsap.timeline({
        defaults: { ease: "prime" },
        onComplete: () => {
          sessionStorage.setItem("prime-intro", "1");
          setIntroDone(true);
          setDone(true);
          release();
        },
      });

      // Dev aid: append #slow-intro to the URL to inspect the choreography.
      if (process.env.NODE_ENV !== "production" && window.location.hash === "#slow-intro") tl.timeScale(0.15);

      tl.set(bloom.current, { autoAlpha: 1 })
        .fromTo(petals, { drawSVG: "50% 50%" }, { drawSVG: "0% 100%", duration: 0.9, stagger: 0.05, ease: "primeInOut" })
        .fromTo(
          sparkles,
          { scale: 0, transformOrigin: "50% 50%", autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.5, stagger: 0.05 },
          "-=0.5",
        )
        .fromTo(text.current, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.3)
        .addLabel("handoff", 1.3)
        .to(text.current, { autoAlpha: 0, y: -8, duration: 0.4 }, "handoff")
        .add(() => {
          // FLIP the bloom to wherever the stage bloom is waiting.
          const target = document.querySelector<SVGSVGElement>("[data-bloom-stage] svg");
          const wrap = bloomWrap.current;
          if (!target || !wrap) return;
          const t = target.getBoundingClientRect();
          const w = wrap.getBoundingClientRect();
          const scale = t.width / w.width;
          const dx = t.left + t.width / 2 - (w.left + w.width / 2);
          const dy = t.top + t.height / 2 - (w.top + w.height / 2);
          gsap.to(wrap, { x: `+=${dx}`, y: `+=${dy}`, scale, duration: 1, ease: "primeInOut" });
          gsap.to(bloom.current, { opacity: 0.85, duration: 1, ease: "primeInOut" });
        }, "handoff")
        .to(panel.current, { yPercent: -100, duration: 1, ease: "primeInOut" }, "handoff+=0.05")
        .to(bloomWrap.current, { autoAlpha: 0, duration: 0.3, overwrite: "auto" }, "handoff+=0.95");

      // Intentionally not killed on cleanup: the intro must run to completion
      // even if React remounts the component during development.
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  if (done || skip) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[80]" aria-hidden>
      <div ref={panel} className="absolute inset-0 bg-ivory" />
      <div
        ref={bloomWrap}
        className="pointer-events-none absolute left-1/2 top-1/2 w-[min(70vw,320px)] -translate-x-1/2 -translate-y-1/2 lg:w-[min(30vw,380px)]"
      >
        <BloomMark ref={bloom} tone="gold" strokeWidth={10} className="invisible h-auto w-full" />
      </div>
      <div className="absolute inset-x-0 bottom-[12vh] flex flex-col items-center text-charcoal">
        <p ref={text} className="font-display text-display-sm invisible">
          {tagline}
        </p>
      </div>
    </div>
  );
}
