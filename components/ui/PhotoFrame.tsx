import type { ReactNode } from "react";

type Props = {
  className?: string;
  tone?: "light" | "dark" | "warm";
  label?: string;
  children?: ReactNode;
};

/**
 * Stand-in for photography, in brand tones. Reads as art direction rather
 * than a missing image: no visible caption, only an accessible label. Swap
 * the inner markup for a next/image once real imagery is available; the
 * surrounding reveal and parallax logic does not need to change.
 */
export function PhotoFrame({ className, tone = "light", label = "Photography", children }: Props) {
  const toneClass = tone === "dark" ? "is-dark" : tone === "warm" ? "is-warm" : "";
  return (
    <div className={`photo-placeholder ${toneClass} ${className ?? ""}`} role="img" aria-label={label}>
      {children}
    </div>
  );
}
