import Link from "next/link";
import { BloomMark } from "@/components/bloom/BloomMark";

/** Shown for unknown and unpublished routes. Bilingual because the locale is not known here. */
export default function NotFound() {
  return (
    <main
      id="main"
      data-surface="light"
      className="relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden bg-ivory px-6 py-24 text-center text-charcoal"
    >
      <BloomMark
        tone="gold"
        strokeWidth={4}
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-auto w-[min(130vw,900px)] -translate-x-1/2 -translate-y-1/2 opacity-15"
      />

      <Link href="/" aria-label="Prime Aesthetic Clinics" className="mb-head block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-landscape-charcoal-480.png" alt="" width={480} height={141} className="h-10 w-auto" />
      </Link>

      <p className="font-display-latin text-[clamp(5rem,18vw,11rem)] leading-none text-gold" aria-hidden>
        404
      </p>
      <span className="hairline-gold mx-auto my-stack block w-16" aria-hidden />

      <h1 className="font-display text-display-md text-balance" lang="ar" dir="rtl">
        لم نعثر على هذه الصفحة.
      </h1>
      <p className="font-display text-display-sm mt-3 text-balance text-theme-muted" lang="en" dir="ltr">
        This page could not be found.
      </p>

      <div className="mt-stack-lg flex flex-wrap justify-center gap-4">
        <Link href="/ar" className="btn-prime is-solid" lang="ar">
          العودة إلى الرئيسية
        </Link>
        <Link href="/en" className="btn-prime" lang="en">
          Return home
        </Link>
      </div>
    </main>
  );
}
