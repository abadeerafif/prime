"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DUR, prefersReducedMotion } from "@/lib/motion";

type Props = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  /** Direction the unveil travels. */
  from?: "bottom" | "top" | "start" | "end";
  delay?: number;
  trigger?: "scroll" | "ready";
  ready?: boolean;
  /** Parallax strength for the inner image while scrolling (0 disables). */
  parallax?: number;
};

const clipFor = (from: Props["from"], rtl: boolean) => {
  const start = rtl ? "end" : "start";
  const side = from === "start" || from === "end" ? (from === start ? "left" : "right") : from;
  switch (side) {
    case "top":
      return "inset(0 0 100% 0)";
    case "left":
      return "inset(0 100% 0 0)";
    case "right":
      return "inset(0 0 0 100%)";
    default:
      return "inset(100% 0 0 0)";
  }
};

/** Clip-path unveil with the image settling from a gentle zoom, plus optional parallax. */
export function ImageReveal({
  children,
  className,
  innerClassName,
  from = "bottom",
  delay = 0,
  trigger = "scroll",
  ready = false,
  parallax = 0,
}: Props) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!outer.current || !inner.current) return;
      if (trigger === "ready" && !ready) return;
      const rtl = document.documentElement.dir === "rtl";

      if (prefersReducedMotion()) {
        gsap.set(outer.current, { clipPath: "inset(0 0 0 0)", autoAlpha: 1 });
        return;
      }

      const tl = gsap.timeline({
        delay,
        scrollTrigger:
          trigger === "scroll" ? { trigger: outer.current, start: "top 85%", once: true } : undefined,
      });
      tl.fromTo(
        outer.current,
        { clipPath: clipFor(from, rtl), autoAlpha: 1 },
        { clipPath: "inset(0% 0% 0% 0%)", duration: DUR.slow, ease: "primeInOut" },
      ).fromTo(inner.current, { scale: 1.25 }, { scale: 1, duration: DUR.epic, ease: "prime" }, 0);

      if (parallax) {
        gsap.fromTo(
          inner.current,
          { yPercent: -parallax },
          {
            yPercent: parallax,
            ease: "none",
            scrollTrigger: { trigger: outer.current, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      }
    },
    { dependencies: [ready, trigger] },
  );

  return (
    <div ref={outer} className={`${className ?? ""} invisible overflow-hidden`}>
      <div ref={inner} className={`${innerClassName ?? ""} h-full w-full will-change-transform`}>
        {children}
      </div>
    </div>
  );
}
