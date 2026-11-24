"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { DUR } from "@/lib/motion";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  y?: number;
  duration?: number;
  id?: string;
};

// One observer for every reveal on the page. The bottom margin matches the
// old ScrollTrigger start ("top 88%"): elements reveal once 12% into view.
let observer: IntersectionObserver | null = null;
function observe(el: Element) {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-revealed");
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -12% 0px" },
  );
  observer.observe(el);
  return () => observer?.unobserve(el);
}

/**
 * Fade-rise entrance, driven by CSS (see [data-reveal] in globals.css) and a
 * shared IntersectionObserver, so dozens of reveals cost no layout reads.
 */
export function Reveal({ children, as: Tag = "div", className, style, delay = 0, y = 24, duration = DUR.base, id }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return observe(ref.current);
  }, []);

  const vars = {
    "--reveal-y": `${y}px`,
    "--reveal-delay": `${delay}s`,
    "--reveal-dur": `${duration}s`,
    ...style,
  } as CSSProperties;

  return (
    <Tag ref={ref} id={id} className={className} style={vars} data-reveal>
      {children}
    </Tag>
  );
}
