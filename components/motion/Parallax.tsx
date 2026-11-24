"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { isTouchDevice, prefersReducedMotion } from "@/lib/motion";

type Props = {
  children: ReactNode;
  className?: string;
  /** Positive moves slower than scroll (lags), negative moves faster. In px. */
  speed?: number;
  /** Optional trigger element selector, defaults to the element itself. */
  triggerSelector?: string;
};

export function Parallax({ children, className, speed = 80, triggerSelector }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!ref.current || prefersReducedMotion()) return;
    const amount = isTouchDevice() ? speed * 0.4 : speed;
    const trigger = triggerSelector ? document.querySelector(triggerSelector) ?? ref.current : ref.current;
    gsap.fromTo(
      ref.current,
      { y: -amount },
      {
        y: amount,
        ease: "none",
        scrollTrigger: { trigger, start: "top bottom", end: "bottom top", scrub: true },
      },
    );
  }, []);

  return (
    <div ref={ref} className={`${className ?? ""} will-change-transform`}>
      {children}
    </div>
  );
}
