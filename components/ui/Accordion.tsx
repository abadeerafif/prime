"use client";

import { useId, useState } from "react";
import { PlusMinus } from "@/components/ui/Icons";

type Item = { id: string; q: string; a: string };

/** Question list with one answer open at a time. */
export function Accordion({ items, className, level = 3 }: { items: Item[]; className?: string; level?: 3 | 4 }) {
  const [open, setOpen] = useState<string | null>(null);
  const base = useId();
  const Heading = level === 4 ? "h4" : "h3";

  return (
    <ul className={`border-t border-theme ${className ?? ""}`} role="list">
      {items.map((item) => {
        const isOpen = open === item.id;
        const panelId = `${base}-${item.id}`;
        return (
          <li key={item.id} className="border-b border-theme">
            <Heading>
              <button
                type="button"
                className="group flex w-full items-center gap-6 py-6 text-start"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : item.id)}
              >
                <span className={`font-display text-title flex-1 transition-colors group-hover:text-accent ${isOpen ? "text-accent" : "text-theme"}`}>
                  {item.q}
                </span>
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-500 ${
                    isOpen ? "border-[var(--accent)]" : "border-theme group-hover:border-[var(--accent)]"
                  }`}
                >
                  <PlusMinus open={isOpen} className="h-3.5 w-3.5 text-accent" />
                </span>
              </button>
            </Heading>
            <div
              id={panelId}
              role="region"
              className="grid"
              style={{
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                transition: "grid-template-rows .7s var(--ease-prime-in-out)",
              }}
              inert={!isOpen}
            >
              <div className="overflow-hidden">
                <p
                  className="text-body-lg measure pb-7 pe-15 text-theme-muted"
                  style={{ opacity: isOpen ? 1 : 0, transition: "opacity .5s var(--ease-prime)", transitionDelay: isOpen ? ".15s" : "0s" }}
                >
                  {item.a}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
