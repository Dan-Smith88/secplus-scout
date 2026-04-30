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
import { loadMastery, clearMastery } from "../lib/masteryStorage";
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
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
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
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4 shadow-[0_12px_40px_rgba(2,6,23,0.35)]">
      <div className="mb-3 flex items-start justify-between">
        <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
          {title}
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
          <Icon className="h-4 w-4 text-cyan-300" />
        </div>
      </div>

      <div className="text-3xl font-semibold tracking-tight text-white">{value}</div>
      <div className="mt-2 text-sm text-slate-300">{sub}</div>
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
  badge,
}: {
  href: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  meta?: string;
  primary?: boolean;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-[1.5rem] border p-4 transition ${
        primary
          ? "border-cyan-400/35 bg-[linear-gradient(135deg,rgba(8,145,178,0.24),rgba(15,23,42,0.78))] shadow-[0_24px_90px_rgba(8,145,178,0.20)]"
          : "border-white/10 bg-slate-950/50 hover:border-cyan-400/25 hover:bg-cyan-400/[0.05]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5">
          <Icon className="h-5 w-5 text-cyan-300" />
        </div>
        <ChevronRight className="h-5 w-5 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-cyan-300" />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
          {eyebrow}
        </div>
        {badge ? (
          <span className="rounded-full border border-amber-300/25 bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-amber-200">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="mt-2 text-xl font-semibold tracking-tight text-white">{title}</div>
      <div className="mt-2 text-sm leading-6 text-slate-300">{description}</div>

      {meta ? <div className="mt-3 text-sm font-medium text-cyan-300">{meta}</div> : null}
    </Link>
  );
}

function SummaryCard({
  icon: Icon,
  title,
  value,
  sub,
  actionHref,
  actionLabel,
  accent = "default",
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  sub: string;
  actionHref?: string;
  actionLabel?: string;
  accent?: "default" | "recommended";
}) {
  const valueClass =
    accent === "recommended" ? "text-amber-100" : "text-white";

  const actionClass =
    accent === "recommended"
      ? "inline-flex items-center gap-2 rounded-full border border-amber-300/20 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-400/[0.08]"
      : "inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5";

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-500">
        <Icon className="h-4 w-4" />
        {title}
      </div>
      <div className={`mt-3 text-2xl font-semibold ${valueClass}`}>{value}</div>
      <div className="mt-2 text-sm leading-6 text-slate-300">{sub}</div>

      {actionHref && actionLabel ? (
        <div className="mt-4">
          <Link href={actionHref} className={actionClass}>
            {actionLabel}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function getDomainStatus(progress: number) {
  if (progress === 0) return "Not started";
  if (progress < 70) return "In progress";
  if (progress < 90) return "Sharpening";
  return "Strong";
}

function getDomainStatusClasses(progress: number) {
  if (progress === 0) {
    return "border-white/10 bg-white/[0.03] text-slate-300";
  }
  if (progress < 70) {
    return "border-cyan-300/20 bg-cyan-400/[0.08] text-cyan-200";
  }
  if (progress < 90) {
    return "border-amber-300/20 bg-amber-400/[0.10] text-amber-200";
  }
  return "border-emerald-300/20 bg-emerald-400/[0.10] text-emerald-200";
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
  const [resetConfirm, setResetConfirm] = useState<string | null>(null);

  function resetDomain(code: string) {
    const updated = { ...progressStore };
    delete updated[code];
    setProgressStore(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
    setResetConfirm(null);
  }

  function resetAll() {
    setProgressStore({});
    setMasteryStore({});
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    clearMastery();
    setResetConfirm(null);
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
          setProgressStore(parsed as StoredProgress);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
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
  const hasEnoughReadinessData = domainsStarted >= 1;

  const masteryTotals = useMemo(() => {
    const records = Object.values(masteryStore);
    const seen = records.reduce((sum, r) => sum + r.seen, 0);
    const know = records.reduce((sum, r) => sum + r.know, 0);
    const missed = records.reduce((sum, r) => sum + r.missed, 0);
    const masteryScore = seen === 0 ? 0 : Math.round((know / seen) * 100);

    return { seen, know, missed, masteryScore };
  }, [masteryStore]);

  const recentMissCount = masteryTotals.missed;

  const weakSpots = useMemo(() => {
    const acronymMap = new Map(
      securityDomains.flatMap((domain) =>
        domain.acronyms.map((item) => [
          `${domain.code}:${item.acronym}`,
          { full: item.full, domainName: domain.name },
        ])
      )
    );

    return Object.values(masteryStore)
      .filter((r) => r.seen >= 3)
      .sort((a, b) => a.know / a.seen - b.know / b.seen)
      .slice(0, 5)
      .map((r) => ({
        ...r,
        masteryPct: Math.round((r.know / r.seen) * 100),
        full: acronymMap.get(`${r.domainCode}:${r.acronym}`)?.full ?? "",
        domainName: acronymMap.get(`${r.domainCode}:${r.acronym}`)?.domainName ?? r.domainCode,
      }));
  }, [masteryStore]);

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
            <p className="mt-4 text-base text-slate-300 sm:text-lg">
              Track progress and launch study modes.
            </p>
            <p className="mt-3 text-sm text-slate-500">
              New here? Start with Quizzes, or pick a domain below.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ActionCard
              href="/quiz"
              icon={Layers3}
              eyebrow="Quizzes"
              title="Quizzes"
              description="Start or continue a quiz by domain or mixed mode."
              meta="Best place to begin"
              badge="Start here"
              primary
            />

            <ActionCard
              href="/mastery"
              icon={Library}
              eyebrow="Flashcards"
              title="Flashcards"
              description="Open the acronym mastery hub for drills and review."
              meta="Mastery training hub"
            />

            <ActionCard
              href="/mastery/daily"
              icon={Brain}
              eyebrow="Daily review"
              title="Daily Review"
              description="Run today’s rotating drill for quick reps."
              meta="Today’s rotating set"
            />

            <ActionCard
              href="/mastery/all"
              icon={SquareStack}
              eyebrow="Reference"
              title="All Acronyms"
              description="Browse the full glossary and term library."
              meta="Full acronym list"
            />
          </div>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Trophy}
            title="Readiness"
            value={hasEnoughReadinessData ? `${overallReadiness}%` : "—"}
            sub={hasEnoughReadinessData ? "Based on weighted progress across exam domains" : "Complete at least one domain quiz to see your readiness"}
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

        {weakSpots.length > 0 && (
          <section className="mt-5 rounded-[2rem] border border-rose-400/15 bg-slate-950/45 p-5 shadow-[0_12px_40px_rgba(2,6,23,0.35)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-rose-300">
                  <AlertTriangle className="h-4 w-4" />
                  Weak spots
                </div>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">
                  Your 5 lowest-mastery acronyms
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Seen at least 3 times but still slipping. Target these first.
                </p>
              </div>
              <Link
                href="/mastery/daily"
                className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/[0.06] px-4 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-400/10"
              >
                Practice now
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {weakSpots.map((spot) => (
                <div
                  key={`${spot.domainCode}:${spot.acronym}`}
                  className="rounded-2xl border border-rose-400/15 bg-rose-400/[0.04] p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-2xl font-semibold text-white">{spot.acronym}</div>
                    <div className="rounded-full border border-rose-400/20 bg-rose-400/10 px-2 py-0.5 text-xs text-rose-200">
                      {spot.masteryPct}%
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-cyan-200 leading-snug">{spot.full}</div>
                  <div className="mt-2 text-xs text-slate-500">{spot.domainName}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-5 grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-5 shadow-[0_12px_40px_rgba(2,6,23,0.35)]">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-white">
                Progress by domain
              </h2>
              <p className="mt-2 text-slate-300">
                All five domains, with direct routing into each quiz.
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {homepageDomains.map((domain) => (
                <div
                  key={domain.code}
                  className="rounded-3xl border border-white/10 bg-slate-950/60 p-3.5"
                >
                  <div className="grid gap-3 xl:grid-cols-[minmax(0,245px)_minmax(0,1fr)_140px] xl:items-center">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold leading-tight text-white">
                        {domain.name}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300">
                          {domain.weight}% exam weight
                        </span>
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${getDomainStatusClasses(
                            domain.progress
                          )}`}
                        >
                          {getDomainStatus(domain.progress)}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                        <span>Progress</span>
                        <span>{domain.progress}%</span>
                      </div>
                      <ProgressBar value={domain.progress} />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                      <Link
                        href={`/quiz/domain?code=${encodeURIComponent(domain.code)}`}
                        className="inline-flex min-w-[122px] items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/5"
                      >
                        {getDomainAction(domain.progress)}
                        <ChevronRight className="h-4 w-4" />
                      </Link>

                      {domain.progress > 0 && resetConfirm !== domain.code && (
                        <button
                          onClick={() => setResetConfirm(domain.code)}
                          className="rounded-full border border-white/10 px-3 py-2.5 text-xs text-slate-400 transition hover:border-rose-400/30 hover:text-rose-300"
                        >
                          Reset
                        </button>
                      )}

                      {resetConfirm === domain.code && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => resetDomain(domain.code)}
                            className="rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-300 transition hover:bg-rose-400/20"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setResetConfirm(null)}
                            className="rounded-full border border-white/10 px-3 py-2 text-xs text-slate-400 transition hover:bg-white/5"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
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
              <p className="mt-2 text-slate-300">
                A quick view of where you are and where to go next.
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <SummaryCard
                icon={CircleGauge}
                title="Readiness"
                value={hasEnoughReadinessData ? `${overallReadiness}% — ${readinessLabel}` : "Not enough data yet"}
                sub={hasEnoughReadinessData ? "Overall weighted readiness across all domains." : "Complete at least one domain quiz to unlock your readiness score."}
              />

              <SummaryCard
                icon={History}
                title="Last activity"
                value={lastActiveDomain?.name ?? "None yet"}
                sub={
                  lastActiveDomain
                    ? `${lastActiveDomain.progress}% complete`
                    : "Start a quiz or mastery session to begin tracking."
                }
                actionHref={
                  lastActiveDomain
                    ? `/quiz/domain?code=${encodeURIComponent(lastActiveDomain.code)}`
                    : undefined
                }
                actionLabel={lastActiveDomain ? "Resume last activity" : undefined}
              />

              <SummaryCard
                icon={Target}
                title="Recommended next domain"
                value={nextPriorityDomain?.name ?? "General Security Concepts"}
                sub={
                  nextPriorityDomain
                    ? nextPriorityDomain.progress === 0
                      ? "Recommended because it is a high-weight domain with no progress yet."
                      : "Recommended because it is the next best area to tighten."
                    : "Good starting point for focused practice."
                }
                accent="recommended"
              />

              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  Quick links
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={
                      nextPriorityDomain
                        ? `/quiz/domain?code=${encodeURIComponent(nextPriorityDomain.code)}`
                        : "/quiz"
                    }
                    className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    Start next domain
                    <ChevronRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/quiz"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/5"
                  >
                    View all quizzes
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                <p className="mt-4 text-sm text-slate-400">
                  Start anywhere. The dashboard gets smarter once you have some activity.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="mt-5 rounded-[2rem] border border-white/[0.06] bg-slate-950/30 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-400">Reset progress</h2>
              <p className="mt-1 text-sm text-slate-500">
                Clear all stored quiz results and mastery data. This cannot be undone.
              </p>
            </div>

            {resetConfirm === "all" ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={resetAll}
                  className="rounded-full border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-sm text-rose-300 transition hover:bg-rose-400/20"
                >
                  Yes, reset everything
                </button>
                <button
                  onClick={() => setResetConfirm(null)}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-400 transition hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setResetConfirm("all")}
                className="rounded-full border border-white/[0.08] px-4 py-2 text-sm text-slate-400 transition hover:border-rose-400/30 hover:text-rose-300"
              >
                Reset all progress
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}