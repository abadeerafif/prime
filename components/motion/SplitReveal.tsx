"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { DUR, STAGGER, prefersReducedMotion } from "@/lib/motion";
import { useLocale } from "@/components/Providers";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** "lines" masks each line and slides it up. "words" fades words in sequence. */
  mode?: "lines" | "words";
  delay?: number;
  stagger?: number;
  duration?: number;
  /** When "manual", the parent is expected to call play via the `ready` prop. */
  trigger?: "scroll" | "manual" | "ready";
  ready?: boolean;
  start?: string;
  yPercent?: number;
};

/**
 * Masked text reveal built on GSAP SplitText. Splits by line/word only, never
 * by character, so Arabic letter joining is preserved.
 */
export function SplitReveal({
  children,
  as: Tag = "div",
  className,
  mode = "lines",
  delay = 0,
  stagger = STAGGER.base,
  duration = DUR.slow,
  trigger = "scroll",
  ready = false,
  start = "top 85%",
  yPercent = 110,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const { isRtl } = useLocale();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (trigger === "ready" && !ready) return;
      if (prefersReducedMotion()) {
        gsap.set(el, { autoAlpha: 1 });
        return;
      }

      const split = SplitText.create(el, {
        type: mode === "lines" ? "lines" : "lines,words",
        mask: mode === "lines" ? "lines" : undefined,
        linesClass: "line",
        wordsClass: "word",
        autoSplit: true,
        // aria-label is not allowed on a plain <span> (used for headline lines),
        // so spans keep their text readable as-is instead.
        aria: Tag === "span" ? "none" : "auto",
        onSplit: (self) => {
          const targets = mode === "lines" ? self.lines : self.words;
          gsap.set(el, { autoAlpha: 1 });
          const vars: gsap.TweenVars = {
            duration,
            delay,
            stagger,
            ease: "prime",
          };
          const from: gsap.TweenVars =
            mode === "lines"
              ? { yPercent, rotate: isRtl ? -1.5 : 1.5, transformOrigin: isRtl ? "100% 100%" : "0% 100%" }
              : { autoAlpha: 0, y: 24 };
          const to: gsap.TweenVars =
            mode === "lines" ? { yPercent: 0, rotate: 0, ...vars } : { autoAlpha: 1, y: 0, ...vars };

          if (trigger === "scroll") {
            to.scrollTrigger = { trigger: el, start, once: true };
          }
          return gsap.fromTo(targets, from, to);
        },
      });

      return () => split.revert();
    },
    { dependencies: [ready, trigger, mode, Tag], revertOnUpdate: true },
  );

  return (
    <Tag ref={ref} className={`${className ?? ""} split-mask invisible`}>
      {children}
    </Tag>
  );
}
