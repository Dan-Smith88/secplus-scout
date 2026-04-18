"use client";

import Link from "next/link";
import { Layers3, Shuffle, RotateCcw, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import TopNav from "../../../components/TopNav";
import { domains as securityDomains } from "../../../lib/securityData";

const STORAGE_KEY = "secplus-domain-progress-v1";

type StoredProgress = Record<
  string,
  {
    percent: number;
    correct: number;
    total: number;
    completedAt: string;
  }
>;

function QuizCard({
  href,
  icon: Icon,
  title,
  description,
  meta,
  primary = false,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  meta?: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-[1.75rem] border p-5 transition ${
        primary
          ? "border-cyan-400/25 bg-[linear-gradient(135deg,rgba(8,145,178,0.18),rgba(15,23,42,0.72))] shadow-[0_20px_80px_rgba(8,145,178,0.14)]"
          : "border-white/10 bg-slate-950/50 hover:border-cyan-400/25 hover:bg-cyan-400/[0.05]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <Icon className="h-5 w-5 text-cyan-300" />
        </div>
        <ArrowRight className="h-5 w-5 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-cyan-300" />
      </div>

      <div className="mt-5 text-2xl font-semibold tracking-tight text-white">{title}</div>
      <div className="mt-2 text-sm leading-6 text-slate-400">{description}</div>
      {meta ? <div className="mt-4 text-sm font-medium text-cyan-300">{meta}</div> : null}
    </Link>
  );
}

export default function QuizPage() {
  const [progressStore, setProgressStore] = useState<StoredProgress>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const stored: StoredProgress = raw ? JSON.parse(raw) : {};
      setProgressStore(stored);
    } catch {
      setProgressStore({});
    }
  }, []);

  const resumeDomain = useMemo(() => {
    const entries = Object.entries(progressStore).sort((a, b) =>
      (b[1]?.completedAt ?? "").localeCompare(a[1]?.completedAt ?? "")
    );

    if (entries.length > 0) {
      const latestCode = entries[0][0];
      return securityDomains.find((d) => d.code === latestCode) ?? null;
    }

    return null;
  }, [progressStore]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.10),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#06101f_100%)] text-white">
      <TopNav />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-6 shadow-[0_12px_40px_rgba(2,6,23,0.35)]">
          <div className="max-w-3xl">
            <div className="text-sm font-medium text-cyan-300">Quiz</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Choose your quiz
            </h1>
            <p className="mt-4 text-base text-slate-400 sm:text-lg">
              Pick the quiz type you want and get moving.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <QuizCard
              href="/study/mixed"
              icon={Shuffle}
              title="Mixed quiz"
              description="Pull questions across domains for a broader run."
              meta="Best for exam-style switching"
              primary
            />

            <QuizCard
              href="/study"
              icon={Layers3}
              title="By domain"
              description="Go back to study mode and choose a focused domain quiz."
              meta="Best for targeted practice"
            />

            <QuizCard
              href={resumeDomain ? `/study/${resumeDomain.code}` : "/study/mixed"}
              icon={RotateCcw}
              title="Resume last quiz"
              description={
                resumeDomain
                  ? `Continue ${resumeDomain.name} where you left off.`
                  : "No saved quiz yet. Start with a mixed quiz."
              }
              meta={resumeDomain ? "Fastest way back in" : "Good place to begin"}
            />
          </div>
        </section>
      </main>
    </div>
  );
}