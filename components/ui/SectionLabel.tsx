import { Reveal } from "@/components/motion/Reveal";

export function SectionLabel({ children, className }: { children: string; className?: string }) {
  return (
    <Reveal as="p" className={`text-label flex items-center gap-4 text-accent ${className ?? ""}`} y={16}>
      <span className="hairline-gold inline-block w-10 shrink-0" />
      <span>{children}</span>
    </Reveal>
  );
}
