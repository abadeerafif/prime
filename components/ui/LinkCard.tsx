import Link from "next/link";
import { ArrowIcon } from "@/components/ui/Icons";

type Props = { href: string; title: string; text?: string; tag?: string; dark?: boolean };

/** Bordered card that links to a hub, service or page. */
export function LinkCard({ href, title, text, tag, dark }: Props) {
  return (
    <Link
      href={href}
      data-surface={dark ? "dark" : undefined}
      className={`card-prime card-link group flex h-full flex-col justify-between gap-stack ${dark ? "border-transparent bg-charcoal text-theme" : ""}`}
    >
      <div>
        {tag && <p className="text-label mb-4 text-accent">{tag}</p>}
        <h3 className="font-display text-title text-balance text-theme">{title}</h3>
        {text && <p className="text-body mt-3 line-clamp-3 text-theme-muted">{text}</p>}
      </div>
      <ArrowIcon className="h-5 w-5 text-accent transition-transform duration-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
    </Link>
  );
}

/** First sentence of a paragraph, for card excerpts. */
export function firstSentence(text: string) {
  const m = text.match(/^(.+?[.؟?!])(\s|$)/);
  return m ? m[1] : text;
}
