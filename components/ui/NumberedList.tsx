import { Reveal } from "@/components/motion/Reveal";

type Item = { title?: string; body?: string };

type Props = {
  items: Item[];
  /** "stack": numeral beside the text, one row per step. "grid": numeral above, in columns. */
  layout?: "stack" | "grid";
  columns?: 2 | 3 | 4;
  /** Use "h3" when the list sits under an h2 and each step is a heading in its own right. */
  titleAs?: "h3" | "p";
  /** Fade each step in on scroll. Off when a parent already reveals the list. */
  reveal?: boolean;
  className?: string;
};

const GRID = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" } as const;

/** Numbered steps with one numeral size, rule and rhythm across the site. */
export function NumberedList({ items, layout = "stack", columns = 3, titleAs: Title = "p", reveal = false, className }: Props) {
  const grid = layout === "grid";
  return (
    <ol className={`${grid ? `grid gap-x-8 gap-y-10 ${GRID[columns]}` : ""} ${className ?? ""}`} role="list">
      {items.map((item, i) => {
        const liClass = `border-t border-theme ${grid ? "pt-6" : "grid grid-cols-[3.5rem_1fr] gap-4 py-6"}`;
        const content = (
          <>
            <span className="font-display-latin block text-[2rem] leading-none text-accent">{String(i + 1).padStart(2, "0")}</span>
            <div className={grid ? "mt-4" : ""}>
              {item.title && <Title className="font-display text-title text-theme">{item.title}</Title>}
              {item.body && (
                <p className={`text-theme-muted first-letter:uppercase ${item.title ? "text-body mt-2" : "text-body-lg"}`}>{item.body}</p>
              )}
            </div>
          </>
        );
        return reveal ? (
          <Reveal as="li" key={i} delay={(grid ? i % columns : i) * 0.07} y={20} className={liClass}>
            {content}
          </Reveal>
        ) : (
          <li key={i} className={liClass}>
            {content}
          </li>
        );
      })}
    </ol>
  );
}
