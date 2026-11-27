"use client";

import { useRef, type MouseEvent } from "react";
import Link from "next/link";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { useIntro } from "@/components/Providers";
import { useSmoothScroll } from "@/components/motion/SmoothScroll";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Photo } from "@/components/ui/PhotoFrame";
import { photos } from "@/lib/images";
import { WhatsAppIcon } from "@/components/ui/Icons";

type Props = {
  brand: string;
  lines: string[];
  intro: string;
  cta: string;
  secondary: { label: string; href: string; whatsapp?: boolean };
  scroll: string;
  imageAlt: string;
};

export function Hero({ brand, lines, intro, cta, secondary, scroll, imageAlt }: Props) {
  const section = useRef<HTMLElement>(null);
  const headline = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const meta = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const { introDone } = useIntro();
  const { scrollTo } = useSmoothScroll();

  useGSAP(
    () => {
      if (!section.current) return;
      const reduced = prefersReducedMotion();

      if (introDone && reduced) {
        gsap.set([...meta.current!.children, cue.current], { autoAlpha: 1 });
      } else if (introDone) {
        // Supporting copy and buttons arrive after the headline lines.
        gsap.fromTo(
          meta.current!.children,
          { autoAlpha: 0, y: 30 },
          { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12, delay: 0.7 },
        );
        gsap.fromTo(cue.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, delay: 1.4 });
      }

      if (reduced) return;

      // Scroll cue line travels on a loop.
      const cueLine = cue.current?.querySelector("[data-cue-line]");
      if (cueLine) {
        gsap.fromTo(
          cueLine,
          { scaleY: 0, transformOrigin: "top" },
          { scaleY: 1, duration: 1.2, ease: "primeInOut", repeat: -1, yoyo: true, repeatDelay: 0.2 },
        );
      }

      // Layered parallax: headline climbs faster than the image as we leave.
      const st = { trigger: section.current, start: "top top", end: "bottom top", scrub: true };
      gsap.to(headline.current, { yPercent: -35, ease: "none", scrollTrigger: st });
      gsap.to(frame.current, { yPercent: 12, scale: 1.08, ease: "none", scrollTrigger: st });
      // Copy and buttons drift up but stay legible; never fade to a disabled look.
      gsap.to(meta.current, { yPercent: -60, autoAlpha: 0.85, ease: "none", scrollTrigger: { ...st, end: "60% top" } });
      gsap.to(cue.current, { autoAlpha: 0, ease: "none", scrollTrigger: { ...st, end: "15% top" } });
    },
    { dependencies: [introDone] },
  );

  const toContact = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    scrollTo("#contact", -24);
  };

  return (
    <section
      id="hero"
      ref={section}
      data-theme-section="ivory"
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-28 lg:justify-center lg:pb-16 lg:pt-anchor"
    >
      <div className="container-prime grid-prime relative items-end">
        {/* Headline across the leading 8 columns, layered above the image */}
        <div ref={headline} className="relative z-10 col-span-4 md:col-span-6 lg:col-span-8 lg:col-start-1 lg:row-start-1">
          <h1 className="font-display text-display-xl text-theme">
            <SplitReveal
              as="span"
              className="text-label font-body mb-stack block text-accent"
              mode="words"
              trigger="ready"
              ready={introDone}
              delay={0.2}
            >
              {brand}
            </SplitReveal>
            {lines.map((line, i) => (
              <SplitReveal
                key={i}
                as="span"
                className="block"
                mode="lines"
                trigger="ready"
                ready={introDone}
                delay={0.35 + i * 0.14}
              >
                {line}
              </SplitReveal>
            ))}
          </h1>
        </div>

        {/* Arched frame on the trailing side, overlapping the headline slightly */}
        <div
          ref={frame}
          className="relative z-0 col-span-2 col-start-3 mt-2 md:col-span-3 md:col-start-4 lg:col-span-4 lg:col-start-9 lg:row-start-1 lg:mt-0 lg:translate-y-[2vh]"
        >
          <ImageReveal
            className="mask-arch aspect-[3/4] max-h-[62vh] w-full"
            innerClassName="mask-arch"
            from="bottom"
            trigger="ready"
            ready={introDone}
            delay={0.5}
          >
            <Photo
              photo={photos.hero}
              alt={imageAlt}
              sizes="(min-width: 1024px) 34vw, 50vw"
              className="h-full w-full mask-arch"
              preload
            />
          </ImageReveal>
          <span className="pointer-events-none absolute -inset-3 -z-10 mask-arch border border-gold/60" aria-hidden />
        </div>

        {/* Supporting sentence and calls to action */}
        <div ref={meta} className="relative z-10 col-span-4 mt-stack flex flex-col gap-stack md:col-span-5 lg:col-span-6 lg:row-start-2 lg:mt-stack-lg">
          <p className="text-body-lg measure invisible text-theme-muted">{intro}</p>
          <div className="invisible flex flex-wrap items-center gap-4">
            <MagneticButton href="#contact" solid onClick={toContact}>
              {cta}
            </MagneticButton>
            {secondary.whatsapp ? (
              <MagneticButton href={secondary.href}>
                <WhatsAppIcon className="h-4 w-4" />
                {secondary.label}
              </MagneticButton>
            ) : (
              <Link href={secondary.href} className="link-line text-label text-theme">
                {secondary.label}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div
        ref={cue}
        className="invisible absolute bottom-8 end-[var(--gutter)] hidden items-center gap-4 text-label text-theme-muted lg:flex"
        aria-hidden
      >
        <span>{scroll}</span>
        <span className="relative block h-16 w-px overflow-hidden bg-[var(--line)]">
          <span data-cue-line className="absolute inset-0 block bg-accent" />
        </span>
      </div>
    </section>
  );
}
