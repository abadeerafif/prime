"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Question = { q: string; options: string[] };
type Labels = { start: string; back: string; step: string; of: string; restart: string; book: string; intro: string };

type Props = {
  questions: Question[];
  result: string;
  dynamicRecent: string;
  dynamicPrevious: string;
  privacy: string;
  labels: Labels;
  bookHref: string;
};

// Answer positions that change the result copy (indices match the source questionnaire).
const ONSET = 1;
const SPED_UP = 3;
const PREVIOUS = 5;

/** Six-question, non-diagnostic questionnaire. Answers stay in memory only. */
export function CandidacyQuiz({ questions, result, dynamicRecent, dynamicPrevious, privacy, labels, bookHref }: Props) {
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const step = answers.length;
  const done = step === questions.length;
  // Each new question (or the result) takes focus, so screen readers read it
  // and keyboard users continue from the right place.
  const focusTarget = useRef<HTMLElement>(null);
  const interacted = useRef(false);

  useEffect(() => {
    if (!interacted.current) return;
    focusTarget.current?.focus({ preventScroll: true });
  }, [step, started]);

  const restart = () => {
    setAnswers([]);
    setStarted(false);
  };

  const begin = () => {
    interacted.current = true;
    setStarted(true);
  };

  return (
    <div className="card-prime p-card-lg">
      {!started ? (
        <div className="flex flex-col items-start gap-6">
          <p className="text-body-lg max-w-[48ch] text-theme-muted">{labels.intro}</p>
          <button ref={focusTarget as React.RefObject<HTMLButtonElement>} type="button" className="btn-prime is-solid" onClick={begin}>
            {labels.start}
          </button>
          <p className="text-body text-theme-muted">{privacy}</p>
        </div>
      ) : done ? (
        <div className="flex flex-col items-start gap-6">
          <p ref={focusTarget as React.RefObject<HTMLParagraphElement>} tabIndex={-1} className="font-display text-display-sm text-theme focus:outline-none">
            {result}
          </p>
          {(answers[ONSET] === 0 || answers[SPED_UP] === 0) && (
            <p className="text-body-lg border-s-2 border-[var(--accent)] ps-5 text-theme-muted">{dynamicRecent}</p>
          )}
          {answers[PREVIOUS] === 0 && (
            <p className="text-body-lg border-s-2 border-[var(--accent)] ps-5 text-theme-muted">{dynamicPrevious}</p>
          )}
          <div className="flex flex-wrap items-center gap-6">
            <Link href={bookHref} className="btn-prime is-solid">
              {labels.book}
            </Link>
            <button type="button" className="link-line text-label text-theme" onClick={restart}>
              {labels.restart}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-stack flex items-center gap-4">
            <p className="text-label text-accent">
              {labels.step} {step + 1} {labels.of} {questions.length}
            </p>
            <span className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-[var(--line)]" aria-hidden>
              <span
                className="absolute inset-y-0 start-0 rounded-full bg-accent transition-[width] duration-700 ease-[var(--ease-prime)]"
                style={{ width: `${(step / questions.length) * 100}%` }}
              />
            </span>
          </div>
          <fieldset key={step} className="animate-[stage-in_.5s_var(--ease-prime)]">
            <legend
              ref={focusTarget as React.RefObject<HTMLLegendElement>}
              tabIndex={-1}
              className="font-display text-display-sm mb-stack text-theme focus:outline-none"
            >
              <span className="sr-only">
                {labels.step} {step + 1} {labels.of} {questions.length}:{" "}
              </span>
              {questions[step].q}
            </legend>
            <div className="flex flex-wrap gap-3">
              {questions[step].options.map((opt, i) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setAnswers([...answers, i])}
                  className="min-h-12 rounded-full border border-theme px-5 py-2.5 text-body text-theme transition-[color,background-color,border-color,scale] duration-300 hover:border-[var(--fg)] hover:bg-[var(--fg)] hover:text-[var(--bg)] active:scale-[0.97]"
                >
                  {opt}
                </button>
              ))}
            </div>
          </fieldset>
          {step > 0 && (
            <button type="button" className="link-line text-label mt-stack text-theme-muted" onClick={() => setAnswers(answers.slice(0, -1))}>
              {labels.back}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
