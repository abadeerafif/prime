"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

type ScrollCtx = {
  scrollTo: (target: string | number | HTMLElement, offset?: number) => void;
  stop: () => void;
  start: () => void;
};

const ScrollContext = createContext<ScrollCtx>({
  scrollTo: () => {},
  stop: () => {},
  start: () => {},
});

export const useSmoothScroll = () => useContext(ScrollContext);

export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    document.documentElement.classList.toggle("reduced-motion", reduced);
    if (reduced) return;

    const instance = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9,
    });
    lenisRef.current = instance;

    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  const value: ScrollCtx = {
    scrollTo: (target, offset = 0) => {
      const l = lenisRef.current;
      if (l) {
        l.scrollTo(target, { offset, duration: 1.6 });
      } else if (typeof target === "number") {
        window.scrollTo({ top: target, behavior: "smooth" });
      } else {
        const el = typeof target === "string" ? document.querySelector(target) : target;
        el?.scrollIntoView({ behavior: "smooth" });
      }
    },
    stop: () => lenisRef.current?.stop(),
    start: () => lenisRef.current?.start(),
  };

  return <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>;
}
