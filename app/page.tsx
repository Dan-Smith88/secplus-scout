"use client";

import Link from "next/link";
import {
  ArrowRight,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  Target,
  ChevronRight,
  CalendarDays,
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
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
        style={{ width: `${value}%` }}
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
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
            {title}
          </div>
          <div className="mt-1 text-[1.6rem] font-semibold tracking-tight text-white">
            {value}
          </div>
          <div className="mt-0.5 text-xs text-slate-400">{sub}</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-2">
          <Icon className="h-4 w-4 text-cyan-300" />
        </div>
      </div>
    </div>
  );
}

function ActionRow({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-[#0b1730]/45 px-4 py-3 transition hover:border-cyan-400/20 hover:bg-white/[0.04]"
    >
      <div>
        <div className="font-medium text-white">{title}</div>
        <div className="mt-1 text-sm text-slate-400">{description}</div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
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
    }));
  }, [progressStore]);

  const overallReadiness = useMemo(() => {
    const totalWeight = homepageDomains.reduce(
      (sum, domain) => sum + domain.weight,
      0
    );
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
    const entries = Object.entries(progressStore).sort((a, b) =>
      (b[1]?.completedAt ?? "").localeCompare(a[1]?.completedAt ?? "")
    );

    if (entries.length === 0) return null;
    return homepageDomains.find((d) => d.code === entries[0][0]) ?? null;
  }, [progressStore, homepageDomains]);

  const weakestStartedDomain = useMemo(() => {
    const started = homepageDomains.filter((d) => d.progress > 0);
    if (started.length === 0) return null;
    return [...started].sort((a, b) => a.progress - b.progress)[0];
  }, [homepageDomains]);

  const nextUnstartedDomain = useMemo(() => {
    return homepageDomains.find((d) => d.progress === 0) ?? null;
  }, [homepageDomains]);

  const weakestDomain = useMemo(() => {
    return [...homepageDomains].sort((a, b) => a.progress - b.progress)[0];
  }, [homepageDomains]);

  const recommendedDomain =
    nextUnstartedDomain ??
    weakestStartedDomain ??
    weakestDomain ??
    homepageDomains[0];

  const continueDomain = lastActiveDomain ?? recommendedDomain;
  const focusDomain = weakestStartedDomain ?? recommendedDomain;

  return (
    <div className="min-h-screen bg-[#07111f] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_22%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.07),transparent_18%),linear-gradient(to_bottom,#07111f,#09172a,#0b1220)]" />

      <div className="relative mx-auto max-w-7xl px-6 py-4 lg:px-8">
        <TopNav />

        <section className="mb-4 rounded-[2rem] border border-cyan-400/15 bg-gradient-to-br from-cyan-400/10 via-[#0c1a30] to-[#0a1426] px-5 py-4 lg:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-sm text-cyan-300">Dashboard</div>
              <h1 className="mt-1 text-[1.95rem] font-semibold leading-tight text-white lg:text-[2.35rem]">
                Welcome back
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Readiness is {overallReadiness}%. You have started {domainsStarted} of{" "}
                {homepageDomains.length} domains.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/study"
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
              >
                Continue Studying
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/mastery/daily"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0b1730] px-5 py-3 font-medium text-white hover:bg-white/10"
              >
                <CalendarDays className="h-4 w-4" />
                Daily Flashcards
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
            value={String(domainsStarted)}
            sub={`${homepageDomains.length} total domains`}
          />
          <StatCard
            icon={AlertTriangle}
            title="Missed terms"
            value={String(recentMissCount)}
            sub="waiting for review"
          />
        </section>

        <section className="mt-4 rounded-3xl border border-white/8 bg-white/[0.02] p-4">
          <div className="mb-3.5">
            <div className="text-lg font-semibold text-white">Progress by domain</div>
            <div className="text-sm text-slate-400">
              What you have worked on and where to continue next.
            </div>
          </div>

          <div className="space-y-2.5">
            {homepageDomains.map((domain) => (
              <div
                key={domain.code}
                className="rounded-2xl border border-white/8 bg-[#0b1730]/45 px-4 py-3"
              >
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(220px,1fr)_auto] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="truncate font-medium text-white">
                        {domain.name}
                      </div>
                      <div className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-slate-300">
                        {domain.weight}% exam weight
                      </div>
                    </div>
                    <div className="mt-1.5 text-xs text-slate-400">
                      {getDomainStatus(domain.progress)}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs text-slate-400">
                      <span>Progress</span>
                      <span>{domain.progress}%</span>
                    </div>
                    <ProgressBar value={domain.progress} />
                  </div>

                  <div className="flex justify-start lg:justify-end">
                    <Link
                      href={`/quiz/domain?code=${encodeURIComponent(domain.code)}`}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
                    >
                      {getDomainAction(domain.progress)}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="rounded-3xl border border-white/8 bg-[#081325]/65 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-cyan-300">Continue where you left off</div>
                <h2 className="mt-1 text-[1.55rem] font-semibold text-white">
                  {continueDomain.name}
                </h2>
                <p className="mt-1.5 text-sm text-slate-400">
                  {lastActiveDomain
                    ? "Most recently completed domain quiz."
                    : "Best next domain based on your current progress."}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right">
                <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  Progress
                </div>
                <div className="text-lg font-semibold text-white">
                  {continueDomain.progress}%
                </div>
              </div>
            </div>

            <div className="mt-3.5">
              <ProgressBar value={continueDomain.progress} />
            </div>

            <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-3">
                <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  Status
                </div>
                <div className="mt-1 text-sm font-medium text-white">
                  {getDomainStatus(continueDomain.progress)}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {continueDomain.weight}% of exam
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-3">
                <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  Focus next
                </div>
                <div className="mt-1 text-sm font-medium text-white">
                  {focusDomain.name}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  Weakest active area
                </div>
              </div>
            </div>

            <div className="mt-3.5 flex flex-wrap items-center gap-3">
              <Link
                href="/study"
                className="rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
              >
                Continue Studying
              </Link>

              <Link
                href="/quiz"
                className="text-sm font-medium text-cyan-300 hover:text-cyan-200"
              >
                Change quiz scope
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-4">
            <div className="text-lg font-semibold text-white">Next best actions</div>
            <div className="mt-1 text-sm text-slate-400">
              Practical shortcuts when you want the next obvious move.
            </div>

            <div className="mt-3.5 space-y-2.5">
              <ActionRow
                title={
                  recentMissCount > 0 ? "Review missed terms" : "Run Daily Flashcards"
                }
                description={
                  recentMissCount > 0
                    ? `${recentMissCount} missed term${
                        recentMissCount === 1 ? "" : "s"
                      } waiting for cleanup.`
                    : "Fastest warm-up before quizzes or review."
                }
                href={recentMissCount > 0 ? "/mastery/missed" : "/mastery/daily"}
              />

              <ActionRow
                title="Take a broader quiz"
                description="Choose all domains or one domain from the quiz page."
                href="/quiz"
              />

              <ActionRow
                title="Compare confusion pairs"
                description="Use when similar acronyms keep blurring together."
                href="/mastery/confusion"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}