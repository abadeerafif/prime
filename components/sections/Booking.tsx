"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { whatsappUrl } from "@/lib/site";
import { useLocale } from "@/components/Providers";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";
import { BloomMark } from "@/components/bloom/BloomMark";
import { ConsultationForm } from "@/components/forms/ConsultationForm";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { AddressBlock } from "@/components/ui/AddressBlock";
import { SectionLabel } from "@/components/ui/SectionLabel";

type Props = {
  label: string;
  titleLines: string[];
  intro: string;
  whatsappLabel: string;
  address: string;
  openMap: string;
  specialties: string[];
  hairSpecialty: string;
  doctors: string[];
};

/**
 * Charcoal closing scene. On tall desktop viewports it is revealed as the
 * journey section lifts away like a curtain; elsewhere it flows normally so
 * the form is never clipped. The ivory bloom settles into a compact seal
 * above the form.
 */
export function Booking({ label, titleLines, intro, whatsappLabel, address, openMap, specialties, hairSpecialty, doctors }: Props) {
  const wrapper = useRef<HTMLDivElement>(null);
  const seal = useRef<SVGSVGElement>(null);
  const [curtain, setCurtain] = useState(false);
  const { sign } = useLocale();
  const wa = whatsappUrl();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 64rem) and (min-height: 56rem)");
    const apply = () => setCurtain(mq.matches && !prefersReducedMotion());
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useGSAP(
    () => {
      ScrollTrigger.refresh();
      if (!wrapper.current || !seal.current) return;
      if (prefersReducedMotion()) {
        gsap.set(seal.current, { opacity: 0.9 });
        return;
      }
      // Seal closes: it arrives large and open, then tightens and settles.
      gsap.fromTo(
        seal.current,
        { scale: 1.5, rotate: sign * 25, opacity: 0.25 },
        {
          scale: 1,
          rotate: 0,
          opacity: 0.9,
          ease: "none",
          scrollTrigger: { trigger: wrapper.current, start: "top 70%", end: curtain ? "top -20%" : "top 10%", scrub: 0.8 },
        },
      );
    },
    { dependencies: [sign, curtain], revertOnUpdate: true },
  );

  return (
    <div
      ref={wrapper}
      id="contact"
      className={`relative z-0 ${curtain ? "-mt-[100vh] h-[200vh]" : ""}`}
      data-theme-section="charcoal"
      data-theme-start={curtain ? "top -50%" : "top 55%"}
      data-surface="dark"
    >
      <section
        className={`flex flex-col justify-center overflow-hidden bg-charcoal text-ivory ${
          curtain ? "sticky top-0 h-screen py-20" : "min-h-screen pb-section pt-header"
        }`}
      >
        <div className="container-prime grid-prime relative items-start gap-y-14">
          <div className="col-span-4 md:col-span-6 lg:col-span-6">
            <SectionLabel className="mb-stack-sm">{label}</SectionLabel>
            <h2 className="font-display text-display-xl text-ivory-light">
              {titleLines.map((line, i) => (
                <SplitReveal key={i} as="span" className="block" mode="lines" delay={i * 0.12}>
                  {line}
                </SplitReveal>
              ))}
            </h2>
            <Reveal as="p" className="text-body-lg mt-stack max-w-[42ch] text-theme-muted" delay={0.3}>
              {intro}
            </Reveal>
            <Reveal className="mt-stack-lg flex flex-col items-start gap-6" delay={0.4}>
              {wa && (
                <a href={wa} target="_blank" rel="noreferrer" className="link-line text-label inline-flex items-center gap-3 text-ivory">
                  <WhatsAppIcon />
                  {whatsappLabel}
                </a>
              )}
              <AddressBlock address={address} mapLabel={openMap} />
            </Reveal>
          </div>

          {/* Seal and enquiry form */}
          <div className="col-span-4 flex flex-col gap-8 md:col-span-6 lg:col-span-5 lg:col-start-8">
            <BloomMark
              ref={seal}
              tone="ivory"
              strokeWidth={5}
              className="pointer-events-none h-auto w-[min(28vw,120px)] self-end opacity-0 lg:w-[min(10vw,140px)]"
            />
            <ConsultationForm variant="general" specialties={specialties} hairSpecialty={hairSpecialty} doctors={doctors} />
          </div>
        </div>
      </section>
    </div>
  );
}
