"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { domains } from "../../../lib/securityData";

const STORAGE_KEY = "secplus-domain-progress-v1";

type Answers = Record<string, string>;

function shuffleArray<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function DomainQuizPage() {
  const searchParams = useSearchParams();
  const code = decodeURIComponent(searchParams.get("code") || "");

  const domain = useMemo(() => {
    return domains.find(
      (d) =>
        d.code === code ||
        d.slug === code ||
        d.code.toLowerCase() === code.toLowerCase() ||
        d.slug.toLowerCase() === code.toLowerCase()
    );
  }, [code]);

  const [mounted, setMounted] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);
  const [shuffledChoices, setShuffledChoices] = useState<
    Record<string, string[]>
  >({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !domain) return;

    const result: Record<string, string[]> = {};
    for (const item of domain.acronyms) {
      result[item.acronym] = shuffleArray(item.quizChoices);
    }
    setShuffledChoices(result);
  }, [mounted, domain]);

  function handleSelect(acronym: string, choice: string) {
    if (submitted) return;

    setAnswers((prev) => ({
      ...prev,
      [acronym]: choice,
    }));
  }

  function resetQuiz() {
    if (!domain) return;

    setAnswers({});
    setSubmitted(false);

    const result: Record<string, string[]> = {};
    for (const item of domain.acronyms) {
      result[item.acronym] = shuffleArray(item.quizChoices);
    }
    setShuffledChoices(result);
  }

  if (!domain) {
    return (
      <main className="min-h-screen bg-[#07111f] px-6 py-10 text-slate-100">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/"
            className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
          >
            ← Back to dashboard
          </Link>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
            <h1 className="text-3xl font-semibold text-white">
              Domain quiz not found
            </h1>
          </div>
        </div>
      </main>
    );
  }

  if (!mounted || Object.keys(shuffledChoices).length === 0) {
    return (
      <main className="min-h-screen bg-[#07111f] px-6 py-10 text-slate-100">
        <div className="mx-auto max-w-5xl">
          <Link
            href={`/study/${encodeURIComponent(domain.code)}`}
            className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
          >
            ← Back to study page
          </Link>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-cyan-300">Full domain quiz</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
              {domain.name}
            </h1>
            <p className="mt-3 text-slate-300">Loading quiz...</p>
          </div>
        </div>
      </main>
    );
  }

  const totalQuestions = domain.acronyms.length;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;

  const correctCount = domain.acronyms.filter(
    (item) => answers[item.acronym] === item.full
  ).length;

  const percentage =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const wrongItems = domain.acronyms.filter(
    (item) => answers[item.acronym] !== item.full
  );

  function submitQuiz() {
    setSubmitted(true);

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : {};

      existing[domain.code] = {
        percent: percentage,
        correct: correctCount,
        total: totalQuestions,
        completedAt: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch {
      // ignore storage failure
    }
  }

  return (
    <main className="min-h-screen bg-[#07111f] px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/study/${encodeURIComponent(domain.code)}`}
          className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
        >
          ← Back to study page
        </Link>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm text-cyan-300">Full domain quiz</div>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
                {domain.name}
              </h1>
              <p className="mt-3 max-w-2xl text-slate-300">
                Answer every acronym in this domain, then submit to see your
                percentage and review missed items.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0b1730] px-4 py-3 text-sm text-slate-300">
              {domain.weight}% of exam
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-slate-400">Questions</div>
            <div className="mt-1 text-3xl font-semibold text-white">
              {totalQuestions}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-slate-400">Answered</div>
            <div className="mt-1 text-3xl font-semibold text-white">
              {answeredCount}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-slate-400">Unanswered</div>
            <div className="mt-1 text-3xl font-semibold text-white">
              {unansweredCount}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6">
          {domain.acronyms.map((item, index) => (
            <div
              key={item.acronym}
              className="rounded-3xl border border-white/10 bg-[#0b1730] p-6"
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-cyan-300">
                    Question {index + 1}
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    What does {item.acronym} stand for?
                  </h2>
                </div>

                {submitted && (
                  <div
                    className={`rounded-full px-3 py-1 text-sm ${
                      answers[item.acronym] === item.full
                        ? "bg-emerald-400/10 text-emerald-200"
                        : "bg-rose-400/10 text-rose-200"
                    }`}
                  >
                    {answers[item.acronym] === item.full ? "Correct" : "Wrong"}
                  </div>
                )}
              </div>

              <div className="grid gap-3">
                {(shuffledChoices[item.acronym] || []).map((choice) => {
                  const isSelected = answers[item.acronym] === choice;
                  const isCorrectChoice = choice === item.full;

                  let className =
                    "rounded-2xl border p-4 text-left transition ";

                  if (!submitted) {
                    className += isSelected
                      ? "border-cyan-300/40 bg-cyan-400/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10";
                  } else {
                    if (isCorrectChoice) {
                      className += "border-emerald-300/30 bg-emerald-400/10";
                    } else if (isSelected && !isCorrectChoice) {
                      className += "border-rose-300/30 bg-rose-400/10";
                    } else {
                      className += "border-white/10 bg-white/5";
                    }
                  }

                  return (
                    <button
                      key={choice}
                      onClick={() => handleSelect(item.acronym, choice)}
                      className={className}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>

              {submitted && answers[item.acronym] !== item.full && (
                <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-slate-200">
                  <div>
                    <span className="font-semibold">Your answer:</span>{" "}
                    {answers[item.acronym] || "No answer selected"}
                  </div>
                  <div className="mt-1">
                    <span className="font-semibold">Correct answer:</span>{" "}
                    {item.full}
                  </div>
                  <div className="mt-2 text-slate-300">{item.plain}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={submitQuiz}
            className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950"
          >
            Submit domain quiz
          </button>

          <button
            onClick={resetQuiz}
            className="rounded-2xl border border-white/10 px-5 py-3 text-white hover:bg-white/5"
          >
            Reset
          </button>

          {submitted && (
            <Link
              href="/"
              className="rounded-2xl border border-white/10 px-5 py-3 text-white hover:bg-white/5"
            >
              Back to dashboard
            </Link>
          )}
        </div>

        {submitted && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-cyan-300">Results</div>
            <h2 className="mt-2 text-4xl font-semibold text-white">
              {correctCount} / {totalQuestions}
            </h2>
            <p className="mt-2 text-lg text-slate-300">
              Score:{" "}
              <span className="font-semibold text-white">{percentage}%</span>
            </p>

            {wrongItems.length > 0 ? (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-white">
                  Review missed acronyms
                </h3>
                <div className="mt-4 grid gap-4">
                  {wrongItems.map((item) => (
                    <div
                      key={item.acronym}
                      className="rounded-2xl border border-white/10 bg-[#0b1730] p-4"
                    >
                      <div className="text-lg font-semibold text-white">
                        {item.acronym}
                      </div>
                      <div className="mt-1 text-cyan-200">{item.full}</div>
                      <div className="mt-2 text-sm text-slate-300">
                        {item.plain}
                      </div>
                      <div className="mt-2 text-sm text-amber-200">
                        Confusing pair: {item.confusion}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-emerald-200">
                Perfect score.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}