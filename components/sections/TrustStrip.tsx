import { Reveal } from "@/components/motion/Reveal";
import { BloomMark } from "@/components/bloom/BloomMark";

/** Four short commitments directly under the hero. */
export function TrustStrip({ items }: { items: string[] }) {
  return (
    <section data-theme-section="ivory" className="relative z-10 pb-head">
      <div className="container-prime">
        <ul className="grid grid-cols-2 border-y border-theme lg:grid-cols-4" role="list">
          {items.map((item, i) => (
            <Reveal
              as="li"
              key={item}
              delay={i * 0.08}
              y={20}
              className={`flex items-center gap-4 py-6 pe-4 lg:py-8 lg:pe-6 ${i === 0 ? "ps-0" : i === 2 ? "ps-0 lg:ps-6" : "ps-4 lg:ps-6"} ${i % 2 === 1 ? "border-s border-theme" : ""} ${
                i >= 2 ? "border-t border-theme lg:border-t-0" : ""
              } ${i === 2 ? "lg:border-s" : ""}`}
            >
              <BloomMark tone="gold" withSparkles={false} strokeWidth={36} className="h-auto w-6 shrink-0" />
              <span className="text-body text-theme">{item}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
