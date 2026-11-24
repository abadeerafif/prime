"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { useSmoothScroll } from "@/components/motion/SmoothScroll";

type Item = { id: string; label: string };

/** Section index: a sticky list on desktop, a scrollable chip row on mobile. */
export function OnThisPage({ items, title }: { items: Item[]; title: string }) {
  const [active, setActive] = useState(items[0]?.id);
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((x): x is HTMLElement => !!x);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  if (items.length < 3) return null;

  const go = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActive(id);
    scrollTo(`#${id}`, -96);
  };

  return (
    <nav aria-label={title} className="lg:sticky lg:top-anchor">
      <p className="text-label mb-5 hidden text-accent lg:block">{title}</p>
      <ul className="hidden space-y-1 border-s border-theme lg:block" role="list">
        {items.map((item) => {
          const on = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => go(e, item.id)}
                aria-current={on ? "true" : undefined}
                className={`-ms-px block border-s-2 py-2 ps-5 text-body transition-[color,border-color,padding] duration-500 ${
                  on ? "border-[var(--accent)] ps-6 text-theme" : "border-transparent text-theme-muted hover:text-theme"
                }`}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
      <ul
        className="-mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)] pb-2 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
        role="list"
        data-lenis-prevent
      >
        {items.map((item) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              onClick={(e) => go(e, item.id)}
              className={`chip whitespace-nowrap transition-colors ${
                item.id === active ? "border-[var(--fg)] bg-[var(--fg)] text-[var(--bg)]" : "text-theme-muted"
              }`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
