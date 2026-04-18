"use client";

import Link from "next/link";
import {
  Trophy,
  CheckCircle2,
  Target,
  AlertTriangle,
  Layers3,
  Library,
  Brain,
  SquareStack,
  ChevronRight,
  CircleGauge,
  History,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import TopNav from "../components/TopNav";
import { domains as securityDomains } from "../lib/securityData";
import { loadMastery } from "../lib/masteryStorage";
import { MasteryStore } from "../lib/masteryTypes";

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

function StatCard({
  icon: Icon,
  title,
  value,
  sub,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-[0_12px_40px_rgba(2,6,23,0.35)]">
      <div className="mb-4 flex items-start justify-between">
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
          {title}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-2">
          <Icon className="h-4 w-4 text-cyan-300" />
        </div>
      </div>

      <div className="text-4xl font-semibold tracking-tight text-white">{value}</div>
      <div className="mt-2 text-sm text-slate-400">{sub}</div>
    </div>
  );
}

function ActionCard({
  href,
  icon: Icon,
  eyebrow,
  title,
  description,
  meta,
  primary = false,
}: {
  href: string;
  icon: LucideIcon;
  eyebrow: string;
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
          ? "border-cyan-400/25 bg-[linear-gradient(135deg,rgba(8,145,178,0.18),rgba(15,23,42,0.72))] shadow-[0_20px_80px_rgba(8,145,178,0.16)]"
          : "border-white/10 bg-slate-950/50 hover:border-cyan-400/25 hover:bg-cyan-400/[0.05]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <Icon className="h-5 w-5 text-cyan-300" />
        </div>
        <ChevronRight className="h-5 w-5 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-cyan-300" />
      </div>

      <div className="mt-5 text-xs uppercase tracking-[0.22em] text-slate-500">
        {eyebrow}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
        {title}
      </div>
      <div className="mt-2 text-sm leading-6 text-slate-400">{description}</div>

      {meta ? <div className="mt-4 text-sm font-medium text-cyan-300">{meta}</div> : null}
    </Link>
  );
}

function SummaryCard({
  icon: Icon,
  title,
  value,
  sub,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-500">
        <Icon className="h-4 w-4" />
        {title}
      </div>
      <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
      <div className="mt-2 text-sm text-slate-400">{sub}</div>
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
  if (progress === 0) return "Start quiz";
  if (progress < 70) return "Resume quiz";
  if (progress < 100) return "Review quiz";
  return "Maintain";
}

function getReadinessLabel(readiness: number) {
  if (readiness < 25) return "Getting started";
  if (readiness < 50) return "Building foundation";
  if (readiness < 75) return "Progressing well";
  if (readiness < 90) return "Nearly ready";
  return "Exam-ready review";
}

export default function HomePage() {
  const [progressStore, setProgressStore] = useState<StoredProgress>({});
  const [masteryStore, setMasteryStore] = useState<MasteryStore>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const stored: StoredProgress = raw ? JSON.parse(raw) : {};
      setProgressStore(stored);
    } catch {
      setProgressStore({});
    }

    setMasteryStore(loadMastery());
  }, []);

  const homepageDomains = useMemo(() => {
    return securityDomains.map((domain) => ({
      ...domain,
      progress: progressStore[domain.code]?.percent ?? 0,
      completedAt: progressStore[domain.code]?.completedAt ?? "",
    }));
  }, [progressStore]);

  const overallReadiness = useMemo(() => {
    const totalWeight = homepageDomains.reduce((sum, domain) => sum + domain.weight, 0);
    if (totalWeight === 0) return 0;

    const weightedScore = homepageDomains.reduce(
      (sum, domain) => sum + domain.progress * domain.weight,
      0
    );

    return Math.round(weightedScore / totalWeight);
  }, [homepageDomains]);

  const readinessLabel = getReadinessLabel(overallReadiness);
  const domainsStarted = homepageDomains.filter((d) => d.progress > 0).length;

  const masteryTotals = useMemo(() => {
    const records = Object.values(masteryStore);
    const seen = records.reduce((sum, r) => sum + r.seen, 0);
    const know = records.reduce((sum, r) => sum + r.know, 0);
    const missed = records.reduce((sum, r) => sum + r.missed, 0);
    const masteryScore = seen === 0 ? 0 : Math.round((know / seen) * 100);

    return { seen, know, missed, masteryScore };
  }, [masteryStore]);

  const recentMissCount = masteryTotals.missed;

  const lastActiveDomain = useMemo(() => {
    const withDates = [...homepageDomains]
      .filter((d) => d.completedAt)
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt));

    if (withDates.length > 0) return withDates[0];

    const started = homepageDomains.filter((d) => d.progress > 0);
    if (started.length > 0) {
      return [...started].sort((a, b) => b.progress - a.progress)[0];
    }

    return null;
  }, [homepageDomains]);

  const nextPriorityDomain = useMemo(() => {
    const unstarted = homepageDomains.filter((d) => d.progress === 0);
    if (unstarted.length > 0) {
      return [...unstarted].sort((a, b) => b.weight - a.weight)[0];
    }

    const active = homepageDomains.filter((d) => d.progress < 100);
    if (active.length > 0) {
      return [...active].sort((a, b) => a.progress - b.progress || b.weight - a.weight)[0];
    }

    return homepageDomains[0] ?? null;
  }, [homepageDomains]);

  const hasProgress = domainsStarted > 0;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.10),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#06101f_100%)] text-white">
      <TopNav />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-6 shadow-[0_12px_40px_rgba(2,6,23,0.35)]">
          <div className="max-w-3xl">
            <div className="text-sm font-medium text-cyan-300">Dashboard</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Study Dashboard
            </h1>
            <p className="mt-4 text-base text-slate-400 sm:text-lg">
              Track readiness, launch study modes, and monitor domain progress.
            </p>
            <p className="mt-3 text-sm text-slate-500">
              New here? Start with Quizzes or pick a domain below.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ActionCard
              href="/study"
              icon={Layers3}
              eyebrow="Quizzes"
              title="Quizzes"
              description="Start or continue a quiz by domain or mixed mode."
              meta="Best place to begin"
              primary
            />

            <ActionCard
              href="/flashcards"
              icon={Library}
              eyebrow="Flashcards"
              title="Flashcards"
              description="Study cards by topic at your own pace."
              meta="General card study"
            />

            <ActionCard
              href="/daily-flashcards"
              icon={Brain}
              eyebrow="Daily review"
              title="Daily Review"
              description="Quick rotating review session for fast reps."
              meta="Shortest study session"
            />

            <ActionCard
              href="/acronyms"
              icon={SquareStack}
              eyebrow="Reference"
              title="All Acronyms"
              description="Browse the full glossary and term library."
              meta="Full acronym list"
            />
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Trophy}
            title="Readiness"
            value={`${overallReadiness}%`}
            sub="Based on weighted progress across exam domains"
          />
          <StatCard
            icon={CheckCircle2}
            title="Mastery"
            value={`${masteryTotals.masteryScore}%`}
            sub="Based on know vs seen"
          />
          <StatCard
            icon={Target}
            title="Domains started"
            value={`${domainsStarted}`}
            sub={`${homepageDomains.length} total domains`}
          />
          <StatCard
            icon={AlertTriangle}
            title="Missed terms"
            value={`${recentMissCount}`}
            sub="Waiting for review"
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-5 shadow-[0_12px_40px_rgba(2,6,23,0.35)]">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-white">
                Progress by domain
              </h2>
              <p className="mt-2 text-slate-400">
                All five domains, with direct routing into each quiz.
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
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-5 shadow-[0_12px_40px_rgba(2,6,23,0.35)]">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-white">
                Study Summary
              </h2>
              <p className="mt-2 text-slate-400">
                A quick view of where you are and where to go next.
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <SummaryCard
                icon={CircleGauge}
                title="Readiness"
                value={`${overallReadiness}% — ${readinessLabel}`}
                sub="Overall weighted readiness across all domains."
              />

              <SummaryCard
                icon={History}
                title="Last activity"
                value={lastActiveDomain?.name ?? "None yet"}
                sub={
                  lastActiveDomain
                    ? `${lastActiveDomain.progress}% complete`
                    : "Start a quiz or flashcard session to begin tracking."
                }
              />

              <SummaryCard
                icon={Target}
                title="Recommended next domain"
                value={nextPriorityDomain?.name ?? "General Security Concepts"}
                sub={
                  nextPriorityDomain
                    ? nextPriorityDomain.progress === 0
                      ? `Recommended because it is a high-weight domain with no progress yet.`
                      : `Recommended because it is the next best area to tighten.`
                    : "Good starting point for focused practice."
                }
              />

              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  Quick links
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={nextPriorityDomain ? `/study/${nextPriorityDomain.code}` : "/study"}
                    className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    Open next domain
                    <ChevronRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/study"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/5"
                  >
                    Open quizzes
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                {!hasProgress ? (
                  <p className="mt-4 text-sm text-slate-400">
                    Start anywhere. The dashboard gets smarter once you have some activity.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}