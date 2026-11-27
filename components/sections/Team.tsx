import type { Locale } from "@/lib/i18n";
import type { Doctor } from "@/content/types";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";
import { DoctorCard } from "@/components/ui/DoctorCard";

export function Team({ locale, label, title, doctors }: { locale: Locale; label: string; title: string; doctors: Doctor[] }) {
  return (
    <section id="team" data-theme-section="ivory" className="section-y relative z-10">
      <div className="container-prime">
        <SectionLabel className="mb-stack-sm">{label}</SectionLabel>
        <SplitReveal as="h2" className="font-display text-display-lg mb-head text-balance text-theme" mode="lines">
          {title}
        </SplitReveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((d, i) => (
            <Reveal key={d.id} delay={i * 0.1} y={32} className="h-full">
              <DoctorCard doctor={d} locale={locale} index={i + 1} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
