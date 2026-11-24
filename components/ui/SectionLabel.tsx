import type { CSSProperties } from "react";
import { Reveal } from "@/components/motion/Reveal";

type Props = { children: string; className?: string; style?: CSSProperties; /** Skip the scroll reveal, e.g. above the fold. */ still?: boolean };

export function SectionLabel({ children, className, style, still }: Props) {
  const classes = `text-label flex items-center gap-4 text-accent ${className ?? ""}`;
  const content = (
    <>
      <span className="hairline-gold inline-block w-10 shrink-0" />
      <span>{children}</span>
    </>
  );
  if (still) {
    return (
      <p className={classes} style={style}>
        {content}
      </p>
    );
  }
  return (
    <Reveal as="p" className={classes} style={style} y={16}>
      {content}
    </Reveal>
  );
}
