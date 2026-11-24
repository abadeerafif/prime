"use client";

import { useRef, useSyncExternalStore } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { useSmoothScroll } from "@/components/motion/SmoothScroll";

/** Oversized wordmark revealed letter by letter along the bottom edge. */
export function FooterWordmark() {
  const wordmark = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const letters = wordmark.current?.querySelectorAll("[data-letter]");
    if (!letters) return;
    if (prefersReducedMotion()) {
      gsap.set(letters, { yPercent: 0 });
      return;
    }
    gsap.fromTo(
      letters,
      { yPercent: 105 },
      {
        yPercent: 0,
        duration: 1.4,
        stagger: 0.07,
        ease: "prime",
        scrollTrigger: { trigger: wordmark.current, start: "top 95%", once: true },
      },
    );
  }, []);

  return (
    <div ref={wordmark} className="container-prime mt-head flex items-end justify-between" aria-hidden>
      <div className="flex overflow-hidden font-display-latin text-[clamp(5rem,22vw,22rem)] leading-[0.8] text-ivory/90" dir="ltr">
        {"PRIME".split("").map((letter, i) => (
          <span key={i} data-letter className="block">
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
}

export function BackToTop({ label }: { label: string }) {
  const { scrollTo } = useSmoothScroll();
  return (
    <button type="button" onClick={() => scrollTo(0)} className="link-line inline-flex items-center gap-3">
      {label}
      <span aria-hidden className="inline-block h-6 w-px bg-current" />
    </button>
  );
}

/** Client-only year so the static prerender never bakes in a build date. */
export function Year() {
  const year = useSyncExternalStore(
    () => () => {},
    () => new Date().getFullYear(),
    () => null,
  );
  return <>{year ?? ""}</>;
}
