"use client";

import { forwardRef, useId, type SVGProps } from "react";

type Pt = [number, number];

/** Lens (petal) outline between A and B with the given half-width. */
function lens(a: Pt, b: Pt, bulge: number): string {
  const [ax, ay] = a;
  const [bx, by] = b;
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  // 4/3 factor so a cubic reaches the intended height at its midpoint.
  const k = bulge * 1.333;
  const p = (t: number, s: number): string =>
    `${(ax + dx * t + nx * k * s).toFixed(1)} ${(ay + dy * t + ny * k * s).toFixed(1)}`;
  return `M ${ax} ${ay} C ${p(0.33, 1)}, ${p(0.67, 1)}, ${bx} ${by} C ${p(0.67, -1)}, ${p(0.33, -1)}, ${ax} ${ay} Z`;
}

/** Four-point sparkle centred at (cx, cy). */
function sparkle(cx: number, cy: number, r: number): string {
  const i = r * 0.18;
  return [
    `M ${cx} ${cy - r}`,
    `Q ${cx + i} ${cy - i} ${cx + r} ${cy}`,
    `Q ${cx + i} ${cy + i} ${cx} ${cy + r}`,
    `Q ${cx - i} ${cy + i} ${cx - r} ${cy}`,
    `Q ${cx - i} ${cy - i} ${cx} ${cy - r} Z`,
  ].join(" ");
}

export const BLOOM_VIEWBOX = "0 0 1024 730";

export const BLOOM_PATHS = {
  petals: [
    lens([14, 560], [596, 468], 92), // lower left
    lens([1010, 560], [428, 468], 92), // lower right
    lens([246, 84], [552, 452], 118), // upper left
    lens([778, 84], [472, 452], 118), // upper right
    lens([512, 470], [512, 724], 66), // bud
  ],
  sparkles: [sparkle(512, 72, 70), sparkle(252, 388, 42), sparkle(772, 388, 42)],
};

type Props = SVGProps<SVGSVGElement> & {
  /** "gold" uses the brand gradient; "ivory" or "charcoal" are flat strokes. */
  tone?: "gold" | "ivory" | "charcoal" | "current";
  strokeWidth?: number;
  withSparkles?: boolean;
  /** Fill sparkles solid like the logo. */
  solidSparkles?: boolean;
};

/**
 * The PRIME bloom rebuilt as strokeable SVG paths so it can be drawn,
 * rotated and recoloured. The official PNG lockups are still used where the
 * actual logo appears.
 */
export const BloomMark = forwardRef<SVGSVGElement, Props>(function BloomMark(
  { tone = "gold", strokeWidth = 14, withSparkles = true, solidSparkles = true, className, ...rest },
  ref,
) {
  const id = useId().replace(/:/g, "");
  const gradId = `bloom-grad-${id}`;
  const stroke =
    tone === "gold" ? `url(#${gradId})` : tone === "ivory" ? "#D9D6C7" : tone === "charcoal" ? "#494640" : "currentColor";

  return (
    <svg
      ref={ref}
      viewBox={BLOOM_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      focusable="false"
      {...rest}
    >
      {tone === "gold" && (
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#C4AB5A" />
            <stop offset="0.5" stopColor="#9B8128" />
            <stop offset="1" stopColor="#7A6420" />
          </linearGradient>
        </defs>
      )}
      <g className="bloom-petals" stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round">
        {BLOOM_PATHS.petals.map((d, i) => (
          <path key={i} d={d} className="bloom-petal" />
        ))}
      </g>
      {withSparkles && (
        <g className="bloom-sparkles" fill={solidSparkles ? stroke : "none"} stroke={stroke} strokeWidth={solidSparkles ? 0 : strokeWidth * 0.6}>
          {BLOOM_PATHS.sparkles.map((d, i) => (
            <path key={i} d={d} className="bloom-sparkle" />
          ))}
        </g>
      )}
    </svg>
  );
});
