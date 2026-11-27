import Link from "next/link";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";
import { Accordion } from "@/components/ui/Accordion";

type Props = { label: string; title: string; items: { q: string; a: string }[]; all: { label: string; href: string } };

export function HomeFaq({ label, title, items, all }: Props) {
  return (
    <section id="faq" data-theme-section="paper" className="section-y relative z-10">
      <div className="container-prime grid-prime gap-y-10">
        <div className="col-span-4 md:col-span-6 lg:col-span-4">
          <SectionLabel className="mb-stack-sm">{label}</SectionLabel>
          <SplitReveal as="h2" className="font-display text-display-md text-balance text-theme" mode="lines">
            {title}
          </SplitReveal>
          <Reveal className="mt-stack" delay={0.2}>
            <Link href={all.href} className="link-line text-label text-theme">
              {all.label}
            </Link>
          </Reveal>
        </div>
        <Reveal className="col-span-4 md:col-span-6 lg:col-span-7 lg:col-start-6" y={24}>
          <Accordion items={items.map((f, i) => ({ id: `home-faq-${i}`, ...f }))} />
        </Reveal>
      </div>
    </section>
  );
}
