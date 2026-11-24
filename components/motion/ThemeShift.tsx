"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * Watches every [data-theme] section and mirrors the active one onto <html>,
 * which drives the CSS variables for the page's colour journey. Re-scans
 * whenever the route changes.
 */
export function ThemeShift({ routeKey }: { routeKey: string }) {
  useEffect(() => {
    const root = document.documentElement;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-theme-section]"));
    const triggers = sections.map((section) => {
      const theme = section.dataset.themeSection ?? "ivory";
      return ScrollTrigger.create({
        trigger: section,
        // Read at refresh time so sections can change their start after mount.
        start: () => section.dataset.themeStart ?? "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          if (self.isActive) root.setAttribute("data-theme", theme);
        },
      });
    });
    // Ensure the first section wins on load.
    root.setAttribute("data-theme", sections[0]?.dataset.themeSection ?? "ivory");

    return () => triggers.forEach((t) => t.kill());
  }, [routeKey]);

  return null;
}
