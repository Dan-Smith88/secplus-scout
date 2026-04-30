"use client";

import Link from "next/link";
import {
  Shuffle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Layers3,
} from "lucide-react";
import { useMemo, useState } from "react";
import TopNav from "../../../components/TopNav";
import { domains } from "../../../lib/securityData";
import {
  loadMastery,
  saveMastery,
  upsertMasteryResult,
} from "../../../lib/masteryStorage";
import { shuffleArray } from "../../../lib/quizUtils";

const PROGRESS_STORAGE_KEY = "secplus-domain-progress-v1";

type StoredProgress = Record<
  string,
  {
    percent: number;
    correct: number;
    total: number;
    completedAt: string;
  }
>;

type QuestionCountOption = 10 | 20 | 30 | "all";

type FlatQuestion = {
  id: string;
  domainCode: string;
  domainName: string;
  acronym: string;
  full: string;
  plain: string;
  choices: string[];
  correctAnswer: string;
};

type SessionQuestion = FlatQuestion & {
  shuffledChoices: string[];
};

function SetupChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-cyan-300/25 bg-cyan-400/10 text-white"
          : "border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}

function ResultCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
      <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{title}</div>
      <div className="mt-3 text-4xl font-semibold text-white">{value}</div>
      <div className="mt-2 text-sm text-slate-400">{sub}</div>
    </div>
  );
}

export default function MixedQuizPage() {
  const allQuestions = useMemo<FlatQuestion[]>(() => {
    return domains.flatMap((domain) =>
      domain.acronyms.map((acronym) => ({
        id: `${domain.code}:${acronym.acronym}`,
        domainCode: domain.code,
        domainName: domain.name,
        acronym: acronym.acronym,
        full: acronym.full,
        plain: acronym.plain,
        choices: acronym.quizChoices,
        correctAnswer: acronym.quizChoices[0],
      }))
    );
  }, []);

  const allDomainCodes = useMemo(() => domains.map((domain) => domain.code), []);
  const [selectedDomainCodes, setSelectedDomainCodes] = useState<string[]>(allDomainCodes);
  const [questionCount, setQuestionCount] = useState<QuestionCountOption>(10);
  const [sessionQuestions, setSessionQuestions] = useState<SessionQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const activeQuestion = sessionQuestions[currentIndex];
  const selectedAnswer = answers[currentIndex];
  const currentCorrect =
    activeQuestion && selectedAnswer
      ? selectedAnswer === activeQuestion.correctAnswer
      : false;

  const score = useMemo(() => {
    return sessionQuestions.reduce((total, question, index) => {
      return total + (answers[index] === question.correctAnswer ? 1 : 0);
    }, 0);
  }, [answers, sessionQuestions]);

  const percent = sessionQuestions.length
    ? Math.round((score / sessionQuestions.length) * 100)
    : 0;

  const questionsAvailable = useMemo(() => {
    return allQuestions.filter((question) =>
      selectedDomainCodes.includes(question.domainCode)
    ).length;
  }, [allQuestions, selectedDomainCodes]);

  function toggleDomain(code: string) {
    setSelectedDomainCodes((current) => {
      if (current.includes(code)) {
        if (current.length === 1) return current;
        return current.filter((item) => item !== code);
      }
      return [...current, code];
    });
  }

  function startQuiz() {
    const pool = allQuestions.filter((question) =>
      selectedDomainCodes.includes(question.domainCode)
    );

    const shuffledPool = shuffleArray(pool);
    const limited =
      questionCount === "all"
        ? shuffledPool
        : shuffledPool.slice(0, Math.min(questionCount, shuffledPool.length));

    const prepared = limited.map((question) => ({
      ...question,
      shuffledChoices: shuffleArray(question.choices),
    }));

    setSessionQuestions(prepared);
    setCurrentIndex(0);
    setAnswers({});
    setQuizStarted(true);
    setQuizFinished(false);
  }

  function chooseAnswer(choice: string) {
    if (!activeQuestion) return;
    if (answers[currentIndex]) return;
    setAnswers((current) => ({
      ...current,
      [currentIndex]: choice,
    }));
  }

  function persistResults() {
    if (typeof window === "undefined") return;

    const updatedProgress: StoredProgress = (() => {
      try {
        const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch {
        return {};
      }
    })();

    let masteryStore = loadMastery();

    const byDomain: Record<string, { correct: number; total: number }> = {};

    sessionQuestions.forEach((question, index) => {
      const correct = answers[index] === question.correctAnswer;

      if (!byDomain[question.domainCode]) {
        byDomain[question.domainCode] = { correct: 0, total: 0 };
      }

      byDomain[question.domainCode].total += 1;
      byDomain[question.domainCode].correct += correct ? 1 : 0;

      masteryStore = upsertMasteryResult(
        masteryStore,
        question.domainCode,
        question.acronym,
        correct ? "know" : "missed"
      );
    });

    Object.entries(byDomain).forEach(([domainCode, stats]) => {
      const previous = updatedProgress[domainCode] ?? {
        percent: 0,
        correct: 0,
        total: 0,
        completedAt: "",
      };

      const correct = previous.correct + stats.correct;
      const total = previous.total + stats.total;
      const percentComplete = total > 0 ? Math.round((correct / total) * 100) : 0;

      updatedProgress[domainCode] = {
        correct,
        total,
        percent: percentComplete,
        completedAt: new Date().toISOString(),
      };
    });

    saveMastery(masteryStore);
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updatedProgress));
  }

  function nextQuestion() {
    if (!selectedAnswer) return;

    if (currentIndex === sessionQuestions.length - 1) {
      persistResults();
      setQuizFinished(true);
      return;
    }

    setCurrentIndex((current) => current + 1);
  }

  function restartSameQuiz() {
    startQuiz();
  }

  function resetToSetup() {
    setQuizStarted(false);
    setQuizFinished(false);
    setSessionQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
  }

  const perDomainResults = useMemo(() => {
    const resultMap: Record<
      string,
      { name: string; correct: number; total: number }
    > = {};

    sessionQuestions.forEach((question, index) => {
      if (!resultMap[question.domainCode]) {
        resultMap[question.domainCode] = {
          name: question.domainName,
          correct: 0,
          total: 0,
        };
      }

      resultMap[question.domainCode].total += 1;
      if (answers[index] === question.correctAnswer) {
        resultMap[question.domainCode].correct += 1;
      }
    });

    return Object.values(resultMap).sort((a, b) => a.name.localeCompare(b.name));
  }, [answers, sessionQuestions]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.10),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#06101f_100%)] text-white">
      <TopNav />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {!quizStarted && (
          <section className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-6 shadow-[0_12px_40px_rgba(2,6,23,0.35)]">
            <div className="max-w-3xl">
              <div className="text-sm font-medium text-cyan-300">Mixed quiz</div>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Build your mixed quiz
              </h1>
              <p className="mt-4 text-base text-slate-400 sm:text-lg">
                Pick the domains you want, choose question count, then launch the quiz
                without getting punted into another fake hallway.
              </p>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <Layers3 className="h-5 w-5 text-cyan-300" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Select domains</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Leave them all on for a broad exam-style mix or trim it down.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {domains.map((domain) => (
                    <SetupChip
                      key={domain.code}
                      active={selectedDomainCodes.includes(domain.code)}
                      onClick={() => toggleDomain(domain.code)}
                    >
                      {domain.name}
                    </SetupChip>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <Shuffle className="h-5 w-5 text-cyan-300" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Question count</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Keep it short or go full send.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {[10, 20, 30, "all"].map((option) => (
                    <SetupChip
                      key={String(option)}
                      active={questionCount === option}
                      onClick={() => setQuestionCount(option as QuestionCountOption)}
                    >
                      {option === "all" ? "All available" : `${option} questions`}
                    </SetupChip>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="text-sm text-slate-400">Questions available</div>
                  <div className="mt-2 text-3xl font-semibold text-white">
                    {questionsAvailable}
                  </div>
                  <div className="mt-2 text-sm text-slate-400">
                    Based on your current domain selection.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={startQuiz}
                disabled={selectedDomainCodes.length === 0 || questionsAvailable === 0}
                className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Start mixed quiz
                <ArrowRight className="h-4 w-4" />
              </button>

              <Link
                href="/study"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-base font-medium text-white transition hover:bg-white/5"
              >
                Back to quiz choices
              </Link>
            </div>
          </section>
        )}

        {quizStarted && !quizFinished && activeQuestion && (
          <section className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-6 shadow-[0_12px_40px_rgba(2,6,23,0.35)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-sm font-medium text-cyan-300">Mixed quiz in progress</div>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Question {currentIndex + 1} of {sessionQuestions.length}
                </h1>
                <p className="mt-3 text-slate-400">
                  Domain: {activeQuestion.domainName}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  Current score
                </div>
                <div className="mt-2 text-3xl font-semibold text-white">
                  {score}/{sessionQuestions.length}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
              <div className="text-sm font-medium text-cyan-300">{activeQuestion.acronym}</div>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                What does {activeQuestion.acronym} stand for?
              </h2>
              <p className="mt-3 text-slate-400">{activeQuestion.plain}</p>

              <div className="mt-6 grid gap-3">
                {activeQuestion.shuffledChoices.map((choice) => {
                  const isChosen = selectedAnswer === choice;
                  const isCorrectChoice = choice === activeQuestion.correctAnswer;
                  const answered = Boolean(selectedAnswer);

                  let classes =
                    "w-full rounded-2xl border px-4 py-4 text-left text-base transition ";

                  if (!answered) {
                    classes +=
                      "border-white/10 bg-white/[0.02] text-white hover:border-cyan-400/25 hover:bg-cyan-400/[0.05]";
                  } else if (isCorrectChoice) {
                    classes += "border-emerald-400/30 bg-emerald-400/10 text-white";
                  } else if (isChosen) {
                    classes += "border-rose-400/30 bg-rose-400/10 text-white";
                  } else {
                    classes += "border-white/10 bg-white/[0.02] text-slate-400";
                  }

                  return (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => chooseAnswer(choice)}
                      disabled={answered}
                      className={classes}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>

              {selectedAnswer && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="flex items-start gap-3">
                    {currentCorrect ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 text-rose-300" />
                    )}

                    <div>
                      <div className="text-lg font-semibold text-white">
                        {currentCorrect ? "Correct" : "Not quite"}
                      </div>
                      <div className="mt-2 text-sm text-slate-300">
                        Correct answer: {activeQuestion.correctAnswer}
                      </div>
                      <div className="mt-2 text-sm text-slate-400">
                        {activeQuestion.plain}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={nextQuestion}
                  disabled={!selectedAnswer}
                  className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {currentIndex === sessionQuestions.length - 1 ? "Finish quiz" : "Next question"}
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={resetToSetup}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-base font-medium text-white transition hover:bg-white/5"
                >
                  Reset setup
                </button>
              </div>
            </div>
          </section>
        )}

        {quizFinished && (
          <section className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-6 shadow-[0_12px_40px_rgba(2,6,23,0.35)]">
            <div className="max-w-3xl">
              <div className="text-sm font-medium text-cyan-300">Mixed quiz complete</div>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Results
              </h1>
              <p className="mt-4 text-base text-slate-400 sm:text-lg">
                This run updates domain progress and mastery so the dashboard stops
                pretending nothing happened.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <ResultCard
                title="Score"
                value={`${score}/${sessionQuestions.length}`}
                sub="total correct answers"
              />
              <ResultCard
                title="Percent"
                value={`${percent}%`}
                sub="overall mixed-quiz result"
              />
              <ResultCard
                title="Domains"
                value={`${perDomainResults.length}`}
                sub="domains included in this run"
              />
            </div>

            <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
              <h2 className="text-2xl font-semibold text-white">By domain</h2>
              <div className="mt-4 space-y-3">
                {perDomainResults.map((item) => {
                  const domainPercent = item.total
                    ? Math.round((item.correct / item.total) * 100)
                    : 0;

                  return (
                    <div
                      key={item.name}
                      className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <div className="text-lg font-semibold text-white">{item.name}</div>
                        <div className="mt-1 text-sm text-slate-400">
                          {item.correct} correct out of {item.total}
                        </div>
                      </div>

                      <div className="text-lg font-semibold text-cyan-300">
                        {domainPercent}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={restartSameQuiz}
                className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                <RotateCcw className="h-4 w-4" />
                Restart same quiz
              </button>

              <button
                type="button"
                onClick={resetToSetup}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-base font-medium text-white transition hover:bg-white/5"
              >
                New mixed quiz setup
              </button>

              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-base font-medium text-white transition hover:bg-white/5"
              >
                Back to dashboard
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}