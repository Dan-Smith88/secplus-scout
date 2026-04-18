"use client";

import Link from "next/link";
import {
  RotateCcw,
  Shuffle,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import TopNav from "../../components/TopNav";
import { domains as securityDomains } from "../../lib/securityData";

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
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  meta?: string;
  primary?: boolean;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <Icon className="h-5 w-5 text-cyan-300" />
        </div>
        <ArrowRight className="h-5 w-5 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-cyan-300" />
      </div>

      <div className="mt-5 text-2xl font-semibold tracking-tight text-white">
        {title}
      </div>
      <div className="mt-2 text-sm leading-6 text-slate-400">{description}</div>
      {meta ? <div className="mt-4 text-sm font-medium text-cyan-300">{meta}</div> : null}
    </>
  );

  const className = `group rounded-[1.75rem] border p-5 transition ${
    primary
      ? "border-cyan-400/25 bg-[linear-gradient(135deg,rgba(8,145,178,0.18),rgba(15,23,42,0.72))] shadow-[0_20px_80px_rgba(8,145,178,0.14)]"
      : "border-white/10 bg-slate-950/50 hover:border-cyan-400/25 hover:bg-cyan-400/[0.05]"
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={`${className} opacity-80`}>{content}</div>;
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-cyan-400 transition-all duration-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function getDomainStatus(progress: number) {
  if (progress === 0) return "Not started";
  if (progress < 70) return "In progress";
  if (progress < 90) return "Sharpening";
  return "Strong";
}

function getDomainAction(progress: number) {
  if (progress === 0) return "Start domain quiz";
  if (progress < 70) return "Resume domain";
  if (progress < 90) return "Review domain";
  return "Maintain";
}

export default function StudyPage() {
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

  const homepageDomains = useMemo(() => {
    return securityDomains.map((domain) => ({
      ...domain,
      progress: progressStore[domain.code]?.percent ?? 0,
      completedAt: progressStore[domain.code]?.completedAt ?? "",
    }));
  }, [progressStore]);

  const resumeDomain = useMemo(() => {
    const withDates = [...homepageDomains]
      .filter((d) => d.completedAt)
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt));

    if (withDates.length > 0) return withDates[0];

    const started = homepageDomains.filter((d) => d.progress > 0);
    if (started.length > 0) {
      return [...started].sort((a, b) => b.progress - a.progress)[0];
    }

    return homepageDomains[0] ?? null;
  }, [homepageDomains]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.10),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#06101f_100%)] text-white">
      <TopNav />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-6 shadow-[0_12px_40px_rgba(2,6,23,0.35)]">
          <div className="max-w-3xl">
            <div className="text-sm font-medium text-cyan-300">Quiz</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Choose how you want to quiz
            </h1>
            <p className="mt-4 text-base text-slate-400 sm:text-lg">
              Resume where you left off or launch a mixed quiz. For focused practice,
              pick a domain below.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <QuizCard
              href={resumeDomain ? `/study/${resumeDomain.code}` : undefined}
              icon={RotateCcw}
              title="Resume last quiz"
              description={
                resumeDomain
                  ? `Continue ${resumeDomain.name} where you left off.`
                  : "No saved quiz yet."
              }
              meta={resumeDomain ? "Fastest way back in" : "Start by domain below"}
              primary
            />

            <QuizCard
              href="/study/mixed"
              icon={Shuffle}
              title="Mixed quiz"
              description="Launch a quiz across multiple domains with real setup options."
              meta="Select domains and question count"
            />
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/45 p-5 shadow-[0_12px_40px_rgba(2,6,23,0.35)]">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Start by domain
            </h2>
            <p className="mt-2 text-slate-400">
              Pick one of the five exam domains for focused practice.
            </p>
          </div>

          <div className="mt-5 space-y-4">
            {homepageDomains.map((domain) => (
              <div
                key={domain.code}
                className="rounded-3xl border border-white/10 bg-slate-950/60 p-4"
              >
                <div className="grid gap-4 xl:grid-cols-[minmax(0,280px)_minmax(0,1fr)_160px] xl:items-center">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold leading-tight text-white xl:text-xl">
                      {domain.name}
                    </h3>

                    <div className="mt-3 inline-flex rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300">
                      {domain.weight}% exam weight
                    </div>

                    <div className="mt-3 text-sm text-slate-400">
                      {getDomainStatus(domain.progress)}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
                      <span>Progress</span>
                      <span>{domain.progress}%</span>
                    </div>
                    <ProgressBar value={domain.progress} />
                  </div>

                  <div className="flex xl:justify-end">
                    <Link
                      href={`/study/${domain.code}`}
                      className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-base font-medium text-white transition hover:bg-white/5"
                    >
                      {getDomainAction(domain.progress)}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}