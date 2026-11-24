"use client";

import { useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DUR } from "@/lib/motion";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  y?: number;
  duration?: number;
  /** "scroll" waits until the element enters the viewport. "manual" leaves it to a parent timeline. */
  trigger?: "scroll" | "manual";
  start?: string;
  id?: string;
};

/** Fade-rise entrance. Elements start invisible via [data-reveal] to avoid a flash. */
export function Reveal({
  children,
  as: Tag = "div",
  className,
  style,
  delay = 0,
  y = 24,
  duration = DUR.base,
  trigger = "scroll",
  start = "top 88%",
  id,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!ref.current || trigger === "manual") return;
      gsap.fromTo(
        ref.current,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration,
          delay,
          scrollTrigger: { trigger: ref.current, start, once: true },
        },
      );
    },
    { dependencies: [trigger] },
  );

  return (
    <Tag ref={ref} id={id} className={className} style={style} data-reveal>
      {children}
    </Tag>
  );
}
