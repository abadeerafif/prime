import Link from "next/link";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowIcon } from "@/components/ui/Icons";

type Card = { href: string; title: string; excerpt: string; tag: string };
type Props = { label: string; title: string; cards: Card[]; all: { label: string; href: string }; readLabel: string };

/** Three patient-guide articles; renders nothing when none are published. */
export function Guide({ label, title, cards, all, readLabel }: Props) {
  if (!cards.length) return null;
  return (
    <section id="guide" data-theme-section="grey" className="relative z-10 pt-section">
      <div className="container-prime">
        <div className="mb-head flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel className="mb-stack-sm">{label}</SectionLabel>
            <SplitReveal as="h2" className="font-display text-display-lg text-balance text-theme" mode="lines">
              {title}
            </SplitReveal>
          </div>
          <Link href={all.href} className="link-line text-label text-theme">
            {all.label}
          </Link>
        </div>
        <ul className="grid gap-4 md:grid-cols-3 lg:gap-6" role="list">
          {cards.map((c, i) => (
            <Reveal as="li" key={c.href} delay={i * 0.1} y={28}>
              <ArticleCard card={c} readLabel={readLabel} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ArticleCard({ card, readLabel, level = 3 }: { card: Card; readLabel: string; level?: 2 | 3 }) {
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <Link
      href={card.href}
      className="card-prime card-link group flex h-full flex-col justify-between gap-stack-lg"
    >
      <div>
        <p className="text-label mb-stack-sm text-accent">{card.tag}</p>
        <Heading className="font-display text-display-sm text-balance text-theme">{card.title}</Heading>
        <p className="text-body mt-4 line-clamp-3 text-theme-muted">{card.excerpt}</p>
      </div>
      <span className="text-label inline-flex items-center gap-2 text-theme">
        {readLabel}
        <ArrowIcon className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
      </span>
    </Link>
  );
}
