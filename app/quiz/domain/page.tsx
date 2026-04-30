"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { domains } from "../../../lib/securityData";
import { loadMastery, saveMastery, upsertMasteryResult } from "../../../lib/masteryStorage";
import { shuffleArray, getRandomSubset } from "../../../lib/quizUtils";
import TopNav from "../../../components/TopNav";

const STORAGE_KEY = "secplus-domain-progress-v1";
const MIXED_QUIZ_SIZE = 15;

type Answers = Record<string, string>;
type QuizItem = {
  acronym: string;
  full: string;
  plain: string;
  confusion: string;
  quizChoices: [string, string, string, string];
  domainCode: string;
  domainName: string;
  domainWeight: number;
};

export default function DomainQuizPage() {
  const searchParams = useSearchParams();
  const code = decodeURIComponent(searchParams.get("code") || "");

  const isMixedQuiz = code.toLowerCase() === "all";

  const singleDomain = useMemo(() => {
    if (isMixedQuiz) return null;

    return domains.find(
      (d) =>
        d.code === code ||
        d.slug === code ||
        d.code.toLowerCase() === code.toLowerCase() ||
        d.slug.toLowerCase() === code.toLowerCase()
    );
  }, [code, isMixedQuiz]);

  const allMixedItems = useMemo<QuizItem[]>(() => {
    return domains.flatMap((domain) =>
      domain.acronyms.map((item) => ({
        ...item,
        domainCode: domain.code,
        domainName: domain.name,
        domainWeight: domain.weight,
      }))
    );
  }, []);

  const fullSingleDomainItems = useMemo<QuizItem[]>(() => {
    if (!singleDomain) return [];

    return singleDomain.acronyms.map((item) => ({
      ...item,
      domainCode: singleDomain.code,
      domainName: singleDomain.name,
      domainWeight: singleDomain.weight,
    }));
  }, [singleDomain]);

  const [mounted, setMounted] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);
  const [shuffledChoices, setShuffledChoices] = useState<Record<string, string[]>>(
    {}
  );
  const [mixedQuizItems, setMixedQuizItems] = useState<QuizItem[]>([]);

  const quizItems = isMixedQuiz ? mixedQuizItems : fullSingleDomainItems;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (isMixedQuiz) {
      setMixedQuizItems(getRandomSubset(allMixedItems, MIXED_QUIZ_SIZE));
    } else {
      setMixedQuizItems([]);
    }

    setAnswers({});
    setSubmitted(false);
  }, [mounted, isMixedQuiz, allMixedItems, code]);

  useEffect(() => {
    if (!mounted || quizItems.length === 0) return;

    const result: Record<string, string[]> = {};
    for (const item of quizItems) {
      result[`${item.domainCode}:${item.acronym}`] = shuffleArray(
        item.quizChoices
      );
    }
    setShuffledChoices(result);
  }, [mounted, quizItems]);

  function itemKey(item: QuizItem) {
    return `${item.domainCode}:${item.acronym}`;
  }

  function handleSelect(key: string, choice: string) {
    if (submitted) return;

    setAnswers((prev) => ({
      ...prev,
      [key]: choice,
    }));
  }

  function buildChoiceMap(items: QuizItem[]) {
    const result: Record<string, string[]> = {};
    for (const item of items) {
      result[itemKey(item)] = shuffleArray(item.quizChoices);
    }
    return result;
  }

  function resetQuiz() {
    setAnswers({});
    setSubmitted(false);

    if (isMixedQuiz) {
      const nextItems = getRandomSubset(allMixedItems, MIXED_QUIZ_SIZE);
      setMixedQuizItems(nextItems);
      setShuffledChoices(buildChoiceMap(nextItems));
    } else {
      setShuffledChoices(buildChoiceMap(fullSingleDomainItems));
    }
  }

  function generateAnotherMixedQuiz() {
    if (!isMixedQuiz) return;

    const nextItems = getRandomSubset(allMixedItems, MIXED_QUIZ_SIZE);
    setMixedQuizItems(nextItems);
    setAnswers({});
    setSubmitted(false);
    setShuffledChoices(buildChoiceMap(nextItems));
  }

  if (!isMixedQuiz && !singleDomain) {
    return (
      <main className="min-h-screen bg-[#07111f] px-6 py-4 text-slate-100">
        <div className="mx-auto max-w-5xl">
          <TopNav />
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h1 className="text-3xl font-semibold text-white">
              Quiz scope not found
            </h1>
          </div>
        </div>
      </main>
    );
  }

  if (!mounted || quizItems.length === 0 || Object.keys(shuffledChoices).length === 0) {
    return (
      <main className="min-h-screen bg-[#07111f] px-6 py-4 text-slate-100">
        <div className="mx-auto max-w-5xl">
          <TopNav />
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-cyan-300">Quiz</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
              {isMixedQuiz ? "Mixed all-domain quiz" : singleDomain?.name}
            </h1>
            <p className="mt-3 text-slate-300">Loading quiz...</p>
          </div>
        </div>
      </main>
    );
  }

  const totalQuestions = quizItems.length;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;

  const correctCount = quizItems.filter(
    (item) => answers[itemKey(item)] === item.full
  ).length;

  const percentage =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const wrongItems = quizItems.filter(
    (item) => answers[itemKey(item)] !== item.full
  );

  function submitQuiz() {
    setSubmitted(true);

    // Save domain-level progress for single-domain quizzes
    if (!isMixedQuiz && singleDomain) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const existing = raw ? JSON.parse(raw) : {};

        existing[singleDomain.code] = {
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

    // Save per-acronym mastery results for all quiz types
    try {
      let store = loadMastery();
      for (const item of quizItems) {
        const key = itemKey(item);
        const result = answers[key] === item.full ? "know" : "missed";
        store = upsertMasteryResult(store, item.domainCode, item.acronym, result);
      }
      saveMastery(store);
    } catch {
      // ignore storage failure
    }
  }

  return (
    <main className="min-h-screen bg-[#07111f] px-6 py-4 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <TopNav />

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm text-cyan-300">Quiz</div>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
                {isMixedQuiz ? "Mixed all-domain quiz" : singleDomain?.name}
              </h1>
              <p className="mt-3 max-w-2xl text-slate-300">
                {isMixedQuiz
                  ? "This quiz pulls a random 15-question set from every loaded domain. Finish it, then generate another random set if you want more reps."
                  : "Answer every acronym in this domain, then submit to see your percentage and review missed items."}
              </p>
            </div>

            <Link
              href="/quiz"
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white hover:bg-white/5"
            >
              Change scope
            </Link>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
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

        <div className="mt-6 grid gap-6">
          {quizItems.map((item, index) => {
            const key = itemKey(item);
            const selectedAnswer = answers[key];

            return (
              <div
                key={`${key}:${index}`}
                className="rounded-3xl border border-white/10 bg-[#0b1730] p-6"
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-cyan-300">
                      Question {index + 1} • {item.domainCode} · {item.domainName}
                    </div>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      What does {item.acronym} stand for?
                    </h2>
                  </div>

                  {submitted && (
                    <div
                      className={`rounded-full px-3 py-1 text-sm ${
                        selectedAnswer === item.full
                          ? "bg-emerald-400/10 text-emerald-200"
                          : "bg-rose-400/10 text-rose-200"
                      }`}
                    >
                      {selectedAnswer === item.full ? "Correct" : "Wrong"}
                    </div>
                  )}
                </div>

                <div className="grid gap-3">
                  {(shuffledChoices[key] || []).map((choice) => {
                    const isSelected = selectedAnswer === choice;
                    const isCorrectChoice = choice === item.full;

                    let className = "rounded-2xl border p-4 text-left transition ";

                    if (!submitted) {
                      className += isSelected
                        ? "border-cyan-300/40 bg-cyan-400/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10";
                    } else if (isCorrectChoice) {
                      className += "border-emerald-300/30 bg-emerald-400/10";
                    } else if (isSelected && !isCorrectChoice) {
                      className += "border-rose-300/30 bg-rose-400/10";
                    } else {
                      className += "border-white/10 bg-white/5";
                    }

                    return (
                      <button
                        key={choice}
                        onClick={() => handleSelect(key, choice)}
                        className={className}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>

                {submitted && selectedAnswer !== item.full && (
                  <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-slate-200">
                    <div>
                      <span className="font-semibold">Your answer:</span>{" "}
                      {selectedAnswer || "No answer selected"}
                    </div>
                    <div className="mt-1">
                      <span className="font-semibold">Correct answer:</span>{" "}
                      {item.full}
                    </div>
                    <div className="mt-2 text-slate-300">{item.plain}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={submitQuiz}
            className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950"
          >
            Submit quiz
          </button>

          <button
            onClick={resetQuiz}
            className="rounded-2xl border border-white/10 px-5 py-3 text-white hover:bg-white/5"
          >
            {isMixedQuiz ? "Randomize this quiz" : "Reset"}
          </button>
        </div>

        {submitted && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-cyan-300">Results</div>
            <h2 className="mt-2 text-4xl font-semibold text-white">
              {correctCount} / {totalQuestions}
            </h2>
            <p className="mt-2 text-lg text-slate-300">
              Score: <span className="font-semibold text-white">{percentage}%</span>
            </p>

            {isMixedQuiz && (
              <div className="mt-5">
                <button
                  onClick={generateAnotherMixedQuiz}
                  className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
                >
                  Take another random 15-question quiz
                </button>
              </div>
            )}

            {wrongItems.length > 0 ? (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-white">
                  Review missed acronyms
                </h3>
                <div className="mt-4 grid gap-4">
                  {wrongItems.map((item, index) => (
                    <div
                      key={`${itemKey(item)}:wrong:${index}`}
                      className="rounded-2xl border border-white/10 bg-[#0b1730] p-4"
                    >
                      <div className="text-sm text-cyan-300">
                        {item.domainCode} · {item.domainName}
                      </div>
                      <div className="mt-1 text-lg font-semibold text-white">
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