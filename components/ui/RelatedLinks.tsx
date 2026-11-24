import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { href, visibleLinks } from "@/content/registry";
import { t } from "@/content/types";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowIcon } from "@/components/ui/Icons";

/** Up to three cards linking sideways; renders nothing when none are published. */
export function RelatedLinks({ locale, paths, title, max = 3 }: { locale: Locale; paths?: string[]; title: string; max?: number }) {
  const links = visibleLinks(paths).slice(0, max);
  if (!links.length) return null;
  return (
    <section className="container-prime pt-section">
      <h2 className="text-label mb-stack text-accent">{title}</h2>
      <ul className="grid gap-4 md:grid-cols-3" role="list">
        {links.map((r, i) => (
          <Reveal as="li" key={r.path} delay={i * 0.08} y={24}>
            <Link
              href={href(locale, r.path)}
              className="card-prime card-link group flex h-full min-h-40 flex-col justify-between gap-stack"
            >
              <span className="font-display text-title text-balance text-theme">{t(r.title, locale)}</span>
              <ArrowIcon className="h-5 w-5 text-accent transition-transform duration-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
