import type { Locale } from "@/lib/i18n";
import { t, type Block } from "@/content/types";
import { quiz } from "@/content/hair/quiz";
import { dictFor } from "@/dictionaries";
import { Reveal } from "@/components/motion/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import { RichText } from "@/components/ui/RichText";
import { CheckIcon, DashIcon } from "@/components/ui/Icons";
import { GrowthTimeline } from "@/components/hair/GrowthTimeline";
import { CandidacyQuiz } from "@/components/hair/CandidacyQuiz";

type Props = { blocks: Block[]; locale: Locale; bookHref?: string };

const H2 = ({ children }: { children: string }) => (
  <h2 className="font-display text-display-sm mb-stack text-balance text-theme">{children}</h2>
);

const Dot = () => <span aria-hidden className="mt-[0.75em] block h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />;

const tint = "bg-[color-mix(in_srgb,var(--fg)_5%,transparent)]";

/** Renders typed content blocks into the long-form reading column. */
export function BlockRenderer({ blocks, locale, bookHref = "/book" }: Props) {
  const dict = dictFor(locale);
  return (
    <>
      {blocks.map((block) => (
        <Reveal as="section" key={block.id} id={block.id} className="scroll-mt-anchor" y={24}>
          {renderBlock(block, locale, dict, bookHref)}
        </Reveal>
      ))}
    </>
  );
}

function renderBlock(block: Block, locale: Locale, dict: ReturnType<typeof dictFor>, bookHref: string) {
  switch (block.type) {
    case "prose":
      return (
        <>
          {block.title && <H2>{t(block.title, locale)}</H2>}
          <div className="space-y-6">
            {block.body.map((p, i) => (
              <p key={i} className="text-body-lg measure text-theme-muted">
                <RichText text={t(p, locale)} />
              </p>
            ))}
          </div>
        </>
      );

    case "list":
      return (
        <>
          <H2>{t(block.title, locale)}</H2>
          {block.intro && <p className="text-body-lg measure mb-stack-sm text-theme-muted">{t(block.intro, locale)}</p>}
          <ul className="space-y-4" role="list">
            {block.items.map((item, i) => (
              <li key={i} className="text-body-lg measure flex gap-4 text-theme-muted">
                <Dot />
                <span className="first-letter:uppercase">{t(item, locale)}</span>
              </li>
            ))}
          </ul>
        </>
      );

    case "pair":
      return (
        <>
          <H2>{t(block.title, locale)}</H2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { side: block.suits, icon: <CheckIcon className="h-4 w-4" />, outline: false },
              { side: block.notSuits, icon: <DashIcon className="h-4 w-4" />, outline: true },
            ].map(({ side, icon, outline }, k) => (
              <div key={k} className={`card-prime ${outline ? "" : `border-transparent ${tint}`}`}>
                <p className="text-label mb-stack-sm flex items-center gap-3 text-accent">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current">{icon}</span>
                  {t(side.title, locale)}
                </p>
                <ul className="space-y-3" role="list">
                  {side.items.map((item, i) => (
                    <li key={i} className="text-body flex gap-3 text-theme-muted">
                      <Dot />
                      <span className="first-letter:uppercase">{t(item, locale)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      );

    case "steps": {
      const horizontal = block.items.length <= 6;
      return (
        <>
          <H2>{t(block.title, locale)}</H2>
          <ol className={`grid gap-x-8 gap-y-10 ${horizontal ? "sm:grid-cols-2 lg:grid-cols-3" : ""}`} role="list">
            {block.items.map((item, i) => (
              <li key={i} className={`relative border-t border-theme pt-6 ${horizontal ? "" : "flex gap-6"}`}>
                <span className="font-display-latin block w-12 shrink-0 text-[2.5rem] leading-none text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className={horizontal ? "mt-4" : ""}>
                  {item.title && <h3 className="font-display text-title mb-2 text-theme">{t(item.title, locale)}</h3>}
                  <p className="text-body text-theme-muted first-letter:uppercase">{t(item.body, locale)}</p>
                </div>
              </li>
            ))}
          </ol>
        </>
      );
    }

    case "table":
      return (
        <>
          {block.title && <H2>{t(block.title, locale)}</H2>}
          <div className="hidden overflow-hidden rounded-card border border-theme md:block">
            <table className="w-full border-collapse text-start">
              <thead>
                <tr className={tint}>
                  {block.columns.map((c, i) => (
                    <th key={i} scope="col" className="text-label px-6 py-4 text-start text-accent">
                      {t(c, locale)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r} className="border-t border-theme align-top transition-colors hover:bg-[color-mix(in_srgb,var(--fg)_3%,transparent)]">
                    {row.map((cell, c) =>
                      c === 0 ? (
                        <th key={c} scope="row" className="font-display text-title w-[28%] px-6 py-5 text-start font-normal text-theme">
                          {t(cell, locale)}
                        </th>
                      ) : (
                        <td key={c} className="text-body px-6 py-5 text-theme-muted first-letter:uppercase">
                          {t(cell, locale)}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="space-y-4 md:hidden" role="list">
            {block.rows.map((row, r) => (
              <li key={r} className="card-prime rounded-card-sm">
                <p className="font-display text-title mb-3 text-theme">{t(row[0], locale)}</p>
                <dl className="space-y-3">
                  {row.slice(1).map((cell, c) => (
                    <div key={c}>
                      {block.columns.length > 2 && (
                        <dt className="text-label text-accent">{t(block.columns[c + 1], locale)}</dt>
                      )}
                      <dd className="text-body text-theme-muted first-letter:uppercase">{t(cell, locale)}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        </>
      );

    case "timeline":
      return (
        <>
          {block.title && <H2>{t(block.title, locale)}</H2>}
          <GrowthTimeline
            items={block.items.map((x) => ({ period: t(x.period, locale), body: t(x.body, locale), note: t(x.note, locale) }))}
          />
        </>
      );

    case "callout":
      return (
        <div className={`rounded-e-card border-s-2 border-[var(--accent)] p-card ${tint}`}>
          <h2 className="font-display text-title mb-stack-sm text-theme">{t(block.title, locale)}</h2>
          <ul className="space-y-3" role="list">
            {block.items.map((item, i) => (
              <li key={i} className="text-body flex gap-3 text-theme-muted">
                <Dot />
                <span className="first-letter:uppercase">{t(item, locale)}</span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "faq":
      return (
        <>
          <H2>{t(block.title, locale)}</H2>
          <div className="space-y-12">
            {block.groups.map((g, gi) => (
              <div key={gi}>
                {g.title && <h3 className="text-label mb-4 text-accent">{t(g.title, locale)}</h3>}
                <Accordion
                  level={g.title ? 4 : 3}
                  items={g.items.map((f, i) => ({ id: `${block.id}-${gi}-${i}`, q: t(f.q, locale), a: t(f.a, locale) }))}
                />
              </div>
            ))}
          </div>
        </>
      );

    case "quiz":
      return (
        <>
          <H2>{t(block.title, locale)}</H2>
          <CandidacyQuiz
            bookHref={`/${locale}${bookHref}`}
            labels={dict.quiz}
            questions={quiz.questions.map((q) => ({ q: t(q.q, locale), options: q.options.map((o) => t(o, locale)) }))}
            result={t(quiz.result, locale)}
            dynamicRecent={t(quiz.dynamicRecent, locale)}
            dynamicPrevious={t(quiz.dynamicPrevious, locale)}
            privacy={t(quiz.privacy, locale)}
          />
        </>
      );
  }
}
