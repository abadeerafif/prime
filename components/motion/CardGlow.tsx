"use client";

import { useEffect } from "react";
import { isTouchDevice, prefersReducedMotion } from "@/lib/motion";

/**
 * Soft gold light that follows the pointer across hovered cards. One delegated
 * listener writes --mx/--my on the card under the pointer, at most once per
 * frame; the glow itself is drawn in CSS (.card-link::before).
 */
export function CardGlow() {
  useEffect(() => {
    if (isTouchDevice() || prefersReducedMotion()) return;
    let frame = 0;
    let last: PointerEvent | null = null;

    const paint = () => {
      frame = 0;
      const e = last;
      if (!e || !(e.target instanceof Element)) return;
      const card = e.target.closest<HTMLElement>(".card-link");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };

    const move = (e: PointerEvent) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    document.addEventListener("pointermove", move, { passive: true });
    return () => {
      document.removeEventListener("pointermove", move);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
