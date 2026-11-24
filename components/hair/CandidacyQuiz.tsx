"use client";

import { useState } from "react";
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

  const restart = () => {
    setAnswers([]);
    setStarted(false);
  };

  return (
    <div className="card-prime p-card-lg" aria-live="polite">
      {!started ? (
        <div className="flex flex-col items-start gap-6">
          <p className="text-body-lg max-w-[48ch] text-theme-muted">{labels.intro}</p>
          <button type="button" className="btn-prime is-solid" onClick={() => setStarted(true)}>
            {labels.start}
          </button>
          <p className="text-body text-theme-muted">{privacy}</p>
        </div>
      ) : done ? (
        <div className="flex flex-col items-start gap-6">
          <p className="font-display text-display-sm text-theme">{result}</p>
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
            <span className="relative h-px flex-1 bg-[var(--line)]">
              <span
                className="absolute inset-y-0 start-0 bg-accent transition-[width] duration-500"
                style={{ width: `${(step / questions.length) * 100}%` }}
              />
            </span>
          </div>
          <fieldset key={step} className="animate-[stage-in_.5s_var(--ease-prime)]">
            <legend className="font-display text-display-sm mb-stack text-theme">{questions[step].q}</legend>
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
