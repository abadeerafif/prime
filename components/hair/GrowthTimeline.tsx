"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { useLocale } from "@/components/Providers";

type Stage = { period: string; body: string; note: string };

/**
 * Month-by-month growth stages. Desktop: a stepped track with one stage card
 * at a time. Mobile: every stage stacked, no interaction.
 */
export function GrowthTimeline({ items }: { items: Stage[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const { isRtl } = useLocale();
  const stage = items[active];

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const forward = isRtl ? "ArrowLeft" : "ArrowRight";
    const back = isRtl ? "ArrowRight" : "ArrowLeft";
    let next = active;
    if (e.key === forward) next = Math.min(items.length - 1, active + 1);
    else if (e.key === back) next = Math.max(0, active - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    else return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div>
      {/* Desktop stepper */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Track runs between the first and last dot centres. */}
          <div aria-hidden className="absolute inset-x-0 top-[11px]" style={{ paddingInline: `${50 / items.length}%` }}>
            <div className="relative h-px bg-[var(--line)]">
              <span
                className="absolute inset-y-0 start-0 bg-accent transition-[width] duration-700"
                style={{ width: `${(active / (items.length - 1)) * 100}%`, transitionTimingFunction: "var(--ease-prime-in-out)" }}
              />
            </div>
          </div>
          <div role="tablist" aria-orientation="horizontal" className="relative flex justify-between" onKeyDown={onKey}>
            {items.map((it, i) => {
              const selected = i === active;
              return (
                <button
                  key={it.period}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`stage-tab-${i}`}
                  aria-selected={selected}
                  aria-controls="stage-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(i)}
                  className="group flex flex-col items-center gap-4 px-1 text-center"
                  style={{ width: `${100 / items.length}%` }}
                >
                  <span
                    className={`block h-[23px] w-[23px] rounded-full border transition-all duration-500 ${
                      i <= active ? "border-[var(--accent)] bg-accent" : "border-[var(--line)] bg-theme"
                    } ${selected ? "scale-110 ring-4 ring-[color-mix(in_srgb,var(--accent)_25%,transparent)]" : ""}`}
                  />
                  <span className={`text-label transition-colors ${selected ? "text-theme" : "text-theme-muted group-hover:text-theme"}`}>
                    {it.period}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div
          id="stage-panel"
          role="tabpanel"
          aria-labelledby={`stage-tab-${active}`}
          className="card-prime mt-stack-lg grid gap-stack p-card-lg lg:grid-cols-[1fr_auto]"
        >
          <div key={active} className="animate-[stage-in_.6s_var(--ease-prime)]">
            <p className="text-label mb-4 text-accent">{stage.period}</p>
            <p className="font-display text-display-sm text-theme">{stage.body}</p>
          </div>
          <p className="text-body max-w-[28ch] self-end border-s border-theme ps-6 text-theme-muted">{stage.note}</p>
        </div>
      </div>

      {/* Mobile stack */}
      <ol className="relative space-y-8 md:hidden" role="list">
        <span aria-hidden className="absolute inset-y-0 start-[7px] w-px bg-[var(--line)]" />
        {items.map((it) => (
          <li key={it.period} className="relative ps-10">
            <span aria-hidden className="absolute start-0 top-1.5 block h-[15px] w-[15px] rounded-full bg-accent" />
            <p className="text-label mb-2 text-accent">{it.period}</p>
            <p className="text-body-lg text-theme">{it.body}</p>
            <p className="text-body mt-2 text-theme-muted">{it.note}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
