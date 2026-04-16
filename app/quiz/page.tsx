"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { domains } from "../../lib/securityData";

function shuffleArray<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const customQuizChoices: Record<string, string[]> = {
  MFA: [
    "Multifactor Authentication",
    "Multi-Factor Authorization",
    "Multiple Form Authentication",
    "Role-Based Access Control",
  ],
  RBAC: [
    "Role-Based Access Control",
    "Rule-Based Access Configuration",
    "Remote-Based Authentication Control",
    "Multifactor Authentication",
  ],
  CIA: [
    "Confidentiality, Integrity, Availability",
    "Confidentiality, Inspection, Access",
    "Control, Identity, Authorization",
    "Role-Based Access Control",
  ],
};

export default function QuizPage() {
  const searchParams = useSearchParams();
  const domainCode = searchParams.get("domain");
  const term = searchParams.get("term");

  const target = useMemo(() => {
    const allAcronyms = domains.flatMap((domain) =>
      domain.acronyms.map((item) => ({
        ...item,
        domainCode: domain.code,
        domainName: domain.name,
      }))
    );

    return allAcronyms.find(
      (item) =>
        item.domainCode === domainCode &&
        item.acronym.toLowerCase() === (term || "").toLowerCase()
    );
  }, [domainCode, term]);

  const choices = useMemo(() => {
    if (!target) return [];

    const manualChoices = customQuizChoices[target.acronym];
    if (manualChoices) {
      return shuffleArray(manualChoices);
    }

    const distractors = domains
      .flatMap((domain) => domain.acronyms)
      .filter((item) => item.acronym !== target.acronym)
      .slice(0, 3)
      .map((item) => item.full);

    return shuffleArray([target.full, ...distractors]);
  }, [target]);

  const [selected, setSelected] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!target) {
    return (
      <main className="min-h-screen bg-[#07111f] px-6 py-10 text-slate-100">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
          >
            ← Back to dashboard
          </Link>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
            <h1 className="text-3xl font-semibold text-white">
              Quiz not found
            </h1>
            <p className="mt-3 text-slate-300">
              The quiz link is missing the domain or acronym.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const isCorrect = selected === target.full;

  return (
    <main className="min-h-screen bg-[#07111f] px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/study/${encodeURIComponent(domainCode || "")}`}
          className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
        >
          ← Back to study page
        </Link>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm text-cyan-300">Quick quiz</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
            What does {target.acronym} stand for?
          </h1>
          <p className="mt-3 text-slate-400">
            Choose the best answer.
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          {choices.map((choice) => (
            <button
              key={choice}
              onClick={() => !submitted && setSelected(choice)}
              className={`rounded-3xl border p-5 text-left transition ${
                selected === choice
                  ? "border-cyan-300/40 bg-cyan-400/10"
                  : "border-white/10 bg-[#0b1730] hover:bg-white/5"
              }`}
            >
              {choice}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => setSubmitted(true)}
            disabled={!selected}
            className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit answer
          </button>

          <button
            onClick={() => {
              setSelected("");
              setSubmitted(false);
            }}
            className="rounded-2xl border border-white/10 px-5 py-3 text-white hover:bg-white/5"
          >
            Reset
          </button>
        </div>

        {submitted && (
          <div
            className={`mt-6 rounded-3xl border p-6 ${
              isCorrect
                ? "border-emerald-300/20 bg-emerald-400/10"
                : "border-rose-300/20 bg-rose-400/10"
            }`}
          >
            <div className="text-2xl font-semibold text-white">
              {isCorrect ? "Correct" : "Not quite"}
            </div>

            <p className="mt-3 text-slate-200">
              <span className="font-semibold">Answer:</span> {target.full}
            </p>

            <p className="mt-3 text-slate-200">
              <span className="font-semibold">Meaning:</span> {target.plain}
            </p>

            <p className="mt-3 text-slate-200">
              <span className="font-semibold">Common confusion:</span>{" "}
              {target.confusion}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}