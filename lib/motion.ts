/** Shared motion tokens so every component moves with the same character. */
export const DUR = {
  fast: 0.3,
  base: 0.9,
  slow: 1.3,
  epic: 1.8,
} as const;

export const STAGGER = {
  tight: 0.05,
  base: 0.08,
  loose: 0.14,
} as const;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}