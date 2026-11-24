import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { SectionLabel } from "@/components/ui/SectionLabel";

type Props = {
  label: string;
  title: string;
  body: string;
  explore: { label: string; href: string };
  candidate: { label: string; href: string };
  imageAlt: string;
};

/** Featured charcoal band for the Prime Hair Transplant department. */
export function HairBand({ label, title, body, explore, candidate, imageAlt }: Props) {
  return (
    <section id="hair-band" data-theme-section="charcoal" data-surface="dark" className="section-y relative z-10 overflow-hidden bg-charcoal text-theme">
      <div className="container-prime grid-prime items-center gap-y-14">
        <div className="col-span-4 md:col-span-6 lg:col-span-6">
          <SectionLabel className="mb-stack-sm">{label}</SectionLabel>
          <SplitReveal as="h2" className="font-display text-display-lg text-balance text-ivory-light" mode="lines">
            {title}
          </SplitReveal>
          <Reveal as="p" className="text-body-lg measure mt-stack text-theme-muted" delay={0.2}>
            {body}
          </Reveal>
          <Reveal className="mt-stack-lg flex flex-wrap items-center gap-4" delay={0.3}>
            <MagneticButton href={explore.href} solid>
              {explore.label}
            </MagneticButton>
            <MagneticButton href={candidate.href}>{candidate.label}</MagneticButton>
          </Reveal>
        </div>
        <div className="relative col-span-3 col-start-2 md:col-span-3 md:col-start-4 lg:col-span-4 lg:col-start-9">
          <ImageReveal className="mask-arch aspect-[3/4] w-full" innerClassName="mask-arch" parallax={6}>
            <PhotoFrame className="h-full w-full mask-arch" tone="dark" label={imageAlt} />
          </ImageReveal>
          <span className="pointer-events-none absolute -inset-3 -z-0 mask-arch border border-gold-light/40" aria-hidden />
        </div>
      </div>
    </section>
  );
}
