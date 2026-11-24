"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { gsap, useGSAP } from "@/lib/gsap";
import { isTouchDevice, prefersReducedMotion } from "@/lib/motion";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  className?: string;
  solid?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
  ariaLabel?: string;
};

/**
 * Pill button that leans toward the pointer and fills with colour from the
 * pointer's entry point.
 */
export function MagneticButton({
  children,
  href,
  onClick,
  className,
  solid,
  type = "button",
  disabled,
  ariaLabel,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const fill = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el || isTouchDevice() || prefersReducedMotion()) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });

    const place = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2.4;
      gsap.set(fill.current, { left: e.clientX - r.left, top: e.clientY - r.top });
      return size;
    };
    const enter = (e: PointerEvent) => {
      const size = place(e);
      gsap.fromTo(fill.current, { width: 0, height: 0 }, { width: size, height: size, duration: 0.6, ease: "power3.out" });
    };
    const leave = (e: PointerEvent) => {
      place(e);
      gsap.to(fill.current, { width: 0, height: 0, duration: 0.5, ease: "power3.inOut" });
      xTo(0);
      yTo(0);
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * 0.25);
      yTo(dy * 0.35);
    };

    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointermove", move);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointermove", move);
    };
  }, []);

  const classes = `btn-prime ${solid ? "is-solid" : ""} ${className ?? ""}`;
  const content = (
    <>
      <span className="btn-fill" ref={fill} aria-hidden />
      <span className="relative z-10 inline-flex items-center gap-3">{children}</span>
    </>
  );

  if (href) {
    const external = /^https?:|^mailto:|^tel:/.test(href);
    if (external) {
      return (
        <a
          ref={ref as React.RefObject<HTMLAnchorElement>}
          href={href}
          className={classes}
          onClick={onClick}
          target="_blank"
          rel="noreferrer"
          aria-label={ariaLabel}
        >
          {content}
        </a>
      );
    }
    return (
      <Link ref={ref as React.RefObject<HTMLAnchorElement>} href={href} className={classes} onClick={onClick} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }
  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}
