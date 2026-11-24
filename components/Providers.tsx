"use client";

import { createContext, Suspense, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { dirFor } from "@/lib/i18n";
import { ScrollTrigger } from "@/lib/gsap";
import type { Dictionary } from "@/dictionaries";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { RouteEffects } from "@/components/RouteEffects";

type LocaleCtx = { locale: Locale; dir: "ltr" | "rtl"; isRtl: boolean; sign: 1 | -1 };
const LocaleContext = createContext<LocaleCtx>({ locale: "ar", dir: "rtl", isRtl: true, sign: -1 });
export const useLocale = () => useContext(LocaleContext);

type IntroCtx = { introDone: boolean; setIntroDone: (v: boolean) => void };
const IntroContext = createContext<IntroCtx>({ introDone: false, setIntroDone: () => {} });
export const useIntro = () => useContext(IntroContext);

const DictContext = createContext<Dictionary | null>(null);
/** UI strings for client components; server components call getDictionary directly. */
export function useDict(): Dictionary {
  const dict = useContext(DictContext);
  if (!dict) throw new Error("useDict must be used inside <Providers>");
  return dict;
}

type Props = { locale: Locale; dict: Dictionary; children: ReactNode };

export function Providers({ locale, dict, children }: Props) {
  const [introDone, setIntroDone] = useState(false);
  const localeValue = useMemo<LocaleCtx>(() => {
    const dir = dirFor(locale);
    return { locale, dir, isRtl: dir === "rtl", sign: dir === "rtl" ? -1 : 1 };
  }, [locale]);
  const introValue = useMemo(() => ({ introDone, setIntroDone }), [introDone]);

  // Re-measure scroll positions once fonts are in and once the preloader has
  // handed over, so pinned sections and reveals line up with the final layout.
  useEffect(() => {
    let cancelled = false;
    document.fonts?.ready.then(() => !cancelled && ScrollTrigger.refresh());
    if (introDone) {
      const id = window.setTimeout(() => ScrollTrigger.refresh(), 200);
      return () => {
        cancelled = true;
        window.clearTimeout(id);
      };
    }
    return () => {
      cancelled = true;
    };
  }, [introDone]);

  return (
    <LocaleContext.Provider value={localeValue}>
      <DictContext.Provider value={dict}>
        <IntroContext.Provider value={introValue}>
          <SmoothScroll>
            <Suspense fallback={null}>
              <RouteEffects />
            </Suspense>
            <ScrollProgress />
            {children}
          </SmoothScroll>
        </IntroContext.Provider>
      </DictContext.Provider>
    </LocaleContext.Provider>
  );
}
