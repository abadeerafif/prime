"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "@/lib/gsap";
import { useIntro, useLocale } from "@/components/Providers";
import { ThemeShift } from "@/components/motion/ThemeShift";

/**
 * Per-navigation housekeeping. Inner pages have no preloader, so the intro is
 * marked done straight away; every route starts at the top and re-measures
 * its scroll triggers once the new layout is in.
 */
export function RouteEffects() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const { setIntroDone } = useIntro();

  useEffect(() => {
    if (pathname !== `/${locale}`) setIntroDone(true);
    window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname, locale, setIntroDone]);

  return <ThemeShift routeKey={pathname} />;
}
