"use client";

import Link from "next/link";
import {
  ArrowRight,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  Target,
  ChevronRight,
  PlayCircle,
  Layers3,
  Brain,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { domains as securityDomains } from "../lib/securityData";
import { loadMastery } from "../lib/masteryStorage";
import { MasteryStore } from "../lib/masteryTypes";
import TopNav from "../components/TopNav";

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

        <ArrowRight className="h-5 w-5 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-cyan-300" />
      </div>

      <div className="mt-5 text-xs uppercase tracking-[0.22em] text-slate-500">
        {eyebrow}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-white">{title}</div>
      <div className="mt-2 text-sm leading-6 text-slate-400">{description}</div>

      {meta ? <div className="mt-4 text-sm font-medium text-cyan-300">{meta}</div> : null}
    </Link>
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
  if (progress < 70) return "Continue";
  if (progress < 90) return "Review";
  return "Maintain";
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

  const nextUnstartedDomain = useMemo(() => {
    return homepageDomains.find((d) => d.progress === 0) ?? null;
  }, [homepageDomains]);

  const weakestStartedDomain = useMemo(() => {
    const started = homepageDomains.filter((d) => d.progress > 0);
    if (started.length === 0) return null;
    return [...started].sort((a, b) => a.progress - b.progress)[0];
  }, [homepageDomains]);

  const strongestDomain = useMemo(() => {
    const started = homepageDomains.filter((d) => d.progress > 0);
    if (started.length === 0) return null;
    return [...started].sort((a, b) => b.progress - a.progress)[0];
  }, [homepageDomains]);

  const resumeDomain = lastActiveDomain ?? nextUnstartedDomain ?? homepageDomains[0] ?? null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.10),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#06101f_100%)] text-white">
      <TopNav />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-6 shadow-[0_12px_40px_rgba(2,6,23,0.35)]">
          <div className="max-w-3xl">
            <div className="text-sm font-medium text-cyan-300">Dashboard</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Choose your next move
            </h1>
            <p className="mt-4 text-base text-slate-400 sm:text-lg">
              Make the next click obvious.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ActionCard
              href={resumeDomain ? `/study/${resumeDomain.code}` : "/study"}
              icon={PlayCircle}
              eyebrow="Continue"
              title="Resume studying"
              description={
                resumeDomain?.progress && resumeDomain.progress > 0
                  ? `Continue ${resumeDomain.name} where you left off.`
                  : "Start your first domain and build momentum."
              }
              meta={
                resumeDomain?.progress && resumeDomain.progress > 0
                  ? `${resumeDomain.progress}% complete`
                  : "Pick a domain to begin"
              }
              primary
            />

            <ActionCard
              href="/study"
              icon={Layers3}
              eyebrow="Start"
              title="Start a quiz"
              description="Pick a domain or use the practice area for a broader run."
              meta="Choose your scope"
            />

            <ActionCard
              href="/study"
              icon={AlertTriangle}
              eyebrow="Review"
              title="Review weak spots"
              description="Revisit missed terms and anything that still feels slippery."
              meta={
                recentMissCount > 0
                  ? `${recentMissCount} missed term${recentMissCount === 1 ? "" : "s"} waiting`
                  : "Use review mode to tighten weak areas"
              }
            />

            <ActionCard
              href="/daily-flashcards"
              icon={Brain}
              eyebrow="Warm-up"
              title="Daily flashcards"
              description="Quick reps before you tackle a quiz or a review pass."
              meta="Fastest study option"
            />
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Trophy}
            title="Readiness"
            value={`${overallReadiness}%`}
            sub="weighted by exam importance"
          />
          <StatCard
            icon={CheckCircle2}
            title="Mastery"
            value={`${masteryTotals.masteryScore}%`}
            sub="based on know vs seen"
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
            sub="waiting for review"
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-5 shadow-[0_12px_40px_rgba(2,6,23,0.35)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-white">
                  Progress snapshot
                </h2>
                <p className="mt-2 text-slate-400">
                  All five domains, no weird hiding tricks.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {homepageDomains.map((domain) => (
                <div
                  key={domain.code}
                  className="rounded-3xl border border-white/10 bg-slate-950/60 p-4"
                >
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,260px)_minmax(0,1fr)_140px] xl:items-center">
                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold leading-tight text-white">
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
                        className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-base font-medium text-white transition hover:bg-white/5"
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
                What to focus on
              </h2>
              <p className="mt-2 text-slate-400">
                One glance, three signals, less overthinking.
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  Resume now
                </div>
                <div className="mt-3 text-2xl font-semibold text-white">
                  {resumeDomain?.name ?? "Choose a domain"}
                </div>
                <div className="mt-2 text-sm text-slate-400">
                  {resumeDomain?.progress && resumeDomain.progress > 0
                    ? `${resumeDomain.progress}% complete`
                    : "No active progress yet"}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  Weakest active area
                </div>
                <div className="mt-3 text-2xl font-semibold text-white">
                  {weakestStartedDomain?.name ?? "None yet"}
                </div>
                <div className="mt-2 text-sm text-slate-400">
                  {weakestStartedDomain
                    ? `${weakestStartedDomain.progress}% complete`
                    : "Start a quiz to generate useful signals"}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  Strongest area
                </div>
                <div className="mt-3 text-2xl font-semibold text-white">
                  {strongestDomain?.name ?? "None yet"}
                </div>
                <div className="mt-2 text-sm text-slate-400">
                  {strongestDomain
                    ? `${strongestDomain.progress}% complete`
                    : "Your strongest area shows up after you start"}
                </div>
              </div>

              <Link
                href="/"
                className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-950/60 px-5 py-4 transition hover:border-cyan-400/25 hover:bg-cyan-400/[0.05]"
              >
                <div>
                  <div className="text-lg font-semibold text-white">Open full progress view</div>
                  <div className="mt-1 text-sm text-slate-400">
                    Check readiness, mastery, and all domain progress together.
                  </div>
                </div>

                <BarChart3 className="h-5 w-5 text-cyan-300" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}