import Link from "next/link";

/** Shown for unknown and unpublished routes. Bilingual because the locale is not known here. */
export default function NotFound() {
  return (
    <div data-surface="light" className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ivory px-6 text-center text-charcoal">
      <p className="text-label text-accent">404</p>
      <h1 className="font-display text-display-md" lang="ar" dir="rtl">
        لم نعثر على هذه الصفحة.
      </h1>
      <p className="font-display text-display-sm text-theme-muted" lang="en" dir="ltr">
        This page could not be found.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        <Link href="/ar" className="btn-prime is-solid" lang="ar">
          العودة إلى الرئيسية
        </Link>
        <Link href="/en" className="btn-prime" lang="en">
          Return home
        </Link>
      </div>
    </div>
  );
}
