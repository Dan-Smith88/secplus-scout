"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Shield,
  ChevronDown,
  ChevronRight,
  BrainCircuit,
  CheckCircle2,
  Trophy,
  AlertTriangle,
  Search,
  ArrowRight,
  CalendarDays,
  BookOpen,
} from "lucide-react";
import { motion } from "framer-motion";
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
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function SummaryStat({
  icon: Icon,
  title,
  value,
  sub,
  href,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  sub: string;
  href?: string;
}) {
  const content = (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 transition hover:border-cyan-400/20 hover:bg-white/[0.04]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
            {title}
          </div>
          <div className="mt-1 text-[1.7rem] font-semibold tracking-tight text-white">
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

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

function FocusRow({
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
      <div className="min-w-0">
        <div className="font-medium text-white">{title}</div>
        <div className="mt-1 text-sm leading-6 text-slate-400">
          {description}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
    </Link>
  );
}

function PracticeMenuItem({
  href,
  icon: Icon,
  title,
  description,
  recommended = false,
  onClick,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  recommended?: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group block rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.08]"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl border border-cyan-300/15 bg-cyan-400/10 p-2">
          <Icon className="h-4 w-4 text-cyan-300" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-white">{title}</div>
            {recommended && (
              <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-cyan-200">
                Recommended
              </span>
            )}
          </div>
          <div className="mt-1 text-sm text-slate-400">{description}</div>
        </div>

        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 transition group-hover:text-cyan-200" />
      </div>
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
  const [practiceOpen, setPracticeOpen] = useState(false);
  const practiceRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        practiceRef.current &&
        !practiceRef.current.contains(event.target as Node)
      ) {
        setPracticeOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const startedDomains = homepageDomains.filter((d) => d.progress > 0).length;

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
    const entries = Object.entries(progressStore).sort((a, b) => {
      return (b[1]?.completedAt ?? "").localeCompare(a[1]?.completedAt ?? "");
    });

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

  const hasStudyHistory =
    startedDomains > 0 || masteryTotals.seen > 0 || recentMissCount > 0;

  return (
    <div className="min-h-screen bg-[#07111f] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_22%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.07),transparent_18%),linear-gradient(to_bottom,#07111f,#09172a,#0b1220)]" />

      <div className="relative mx-auto max-w-7xl px-6 py-4 lg:px-8">
        <header className="sticky top-0 z-20 mb-5 rounded-3xl border border-white/10 bg-[#07111f]/80 px-5 py-4 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-400/15 p-2.5 ring-1 ring-cyan-300/20">
                <Shield className="h-6 w-6 text-cyan-300" />
              </div>
              <div>
                <div className="text-lg font-semibold tracking-tight">
                  SecPlus Scout
                </div>
                <div className="text-xs text-slate-400">
                  Security+ study dashboard proof of concept
                </div>
              </div>
            </Link>

            <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <Link
                href={`/quiz/domain?code=${encodeURIComponent(continueDomain.code)}`}
                className="rounded-full border border-white/10 px-3 py-2 hover:bg-white/5"
              >
                Study
              </Link>

              <Link
                href="/mastery"
                className="rounded-full border border-white/10 px-3 py-2 hover:bg-white/5"
              >
                Mastery
              </Link>

              <Link
                href="/search"
                className="rounded-full border border-white/10 px-3 py-2 hover:bg-white/5"
              >
                Search
              </Link>

              <div className="relative" ref={practiceRef}>
                <button
                  onClick={() => setPracticeOpen((prev) => !prev)}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-2 transition ${
                    practiceOpen
                      ? "border border-cyan-300/30 bg-cyan-400/10 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_10px_30px_rgba(2,132,199,0.18)]"
                      : "border border-white/10 hover:bg-white/5"
                  }`}
                  type="button"
                  aria-expanded={practiceOpen}
                  aria-haspopup="menu"
                >
                  Practice
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      practiceOpen ? "rotate-180 text-cyan-200" : ""
                    }`}
                  />
                </button>

                {practiceOpen && (
                  <div className="absolute right-0 z-30 mt-3 w-[360px] rounded-[28px] border border-cyan-300/15 bg-[#081936]/95 p-3 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl">
                    <div className="px-2 pb-2 pt-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                      Practice shortcuts
                    </div>

                    <div className="space-y-2">
                      <PracticeMenuItem
                        href="/mastery/daily"
                        icon={CalendarDays}
                        title="Daily Drill"
                        description="Today’s rotating 10-card set"
                        recommended={recentMissCount === 0}
                        onClick={() => setPracticeOpen(false)}
                      />

                      <PracticeMenuItem
                        href="/mastery/missed"
                        icon={AlertTriangle}
                        title="Missed Review"
                        description="Retake terms you missed"
                        recommended={recentMissCount > 0}
                        onClick={() => setPracticeOpen(false)}
                      />
                    </div>

                    <div className="my-3 h-px bg-white/10" />

                    <div className="px-2 pb-2 pt-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                      Reference
                    </div>

                    <div className="space-y-2">
                      <PracticeMenuItem
                        href="/mastery/confusion"
                        icon={BrainCircuit}
                        title="Confusion Pairs"
                        description="Compare similar acronyms"
                        onClick={() => setPracticeOpen(false)}
                      />

                      <PracticeMenuItem
                        href="/mastery/all"
                        icon={BookOpen}
                        title="All Acronyms"
                        description="Browse the full library"
                        onClick={() => setPracticeOpen(false)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <a
                className="rounded-full bg-white px-4 py-2 font-medium text-slate-900 transition hover:opacity-90"
                href="#domains"
              >
                Start Studying
              </a>
            </nav>
          </div>
        </header>

        <section className="mb-4">
          <div className="rounded-[2rem] border border-cyan-400/15 bg-gradient-to-br from-cyan-400/10 via-[#0c1a30] to-[#0a1426] px-6 py-5 lg:px-8 lg:py-5.5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl"
            >
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
                <BrainCircuit className="h-4 w-4" />
                {hasStudyHistory ? "Welcome back" : "Focused Security+ prep"}
              </div>

              <h1 className="text-[2.25rem] font-semibold leading-[1.04] tracking-tight text-white lg:text-[3rem]">
                {hasStudyHistory
                  ? "Keep the momentum going."
                  : "Study with a clean dashboard, not chaos."}
              </h1>

              <p className="mt-2.5 max-w-2xl text-[15px] leading-7 text-slate-300">
                {hasStudyHistory
                  ? `You have started ${startedDomains} domain${
                      startedDomains === 1 ? "" : "s"
                    }, and your current readiness score is ${overallReadiness}%.`
                  : "Start by domain, use daily drills for recall, and keep weak areas from piling up."}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`/quiz/domain?code=${encodeURIComponent(continueDomain.code)}`}
                  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
                >
                  {hasStudyHistory ? "Continue Studying" : "Start Studying"}
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/mastery/daily"
                  className="rounded-2xl border border-white/10 bg-[#0b1730] px-5 py-3 font-medium text-white hover:bg-white/10"
                >
                  Today’s Daily Drill
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="pb-4">
          <div className="grid gap-3.5 xl:grid-cols-[1.25fr_0.75fr]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="rounded-3xl border border-white/8 bg-[#081325]/65 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-cyan-300">Resume here</div>
                  <h2 className="mt-1 text-[1.75rem] font-semibold leading-tight text-white">
                    {continueDomain.name}
                  </h2>
                  <p className="mt-1.5 text-sm leading-6 text-slate-400">
                    {lastActiveDomain
                      ? "This is your most recently active domain."
                      : "This is the best next place to start."}
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
                    Weakest area needing attention
                  </div>
                </div>
              </div>

              <div className="mt-3.5 flex flex-wrap gap-3">
                <Link
                  href={`/quiz/domain?code=${encodeURIComponent(continueDomain.code)}`}
                  className="rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
                >
                  Continue Quiz
                </Link>

                <a
                  href="#domains"
                  className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5"
                >
                  View All Domains
                </a>
              </div>
            </motion.div>

            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
              <SummaryStat
                icon={Trophy}
                title="Readiness"
                value={`${overallReadiness}%`}
                sub="weighted by exam importance"
              />
              <SummaryStat
                icon={CheckCircle2}
                title="Mastery"
                value={`${masteryTotals.masteryScore}%`}
                sub="know / missed"
                href="/mastery"
              />
              <SummaryStat
                icon={AlertTriangle}
                title="Recent misses"
                value={String(recentMissCount)}
                sub="terms needing review"
                href={
                  recentMissCount > 0
                    ? "/mastery/missed"
                    : "/mastery/confusion"
                }
              />
            </div>
          </div>
        </section>

        <section id="dashboard" className="pb-8 pt-0.5">
          <div className="mb-3.5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-[2rem] font-semibold tracking-tight text-white">
                Your study dashboard
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Focus on the next best action, not ten tabs and a prayer.
              </p>
            </div>

            <Link
              href="/mastery"
              className="text-sm font-medium text-cyan-300 hover:text-cyan-200"
            >
              Open Acronym Mastery →
            </Link>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.48fr_0.52fr]">
            <div
              id="domains"
              className="rounded-3xl border border-white/8 bg-white/[0.02] p-4"
            >
              <div className="mb-3.5">
                <div className="text-lg font-semibold text-white">
                  Progress by domain
                </div>
                <div className="text-sm text-slate-400">
                  Where to continue and what to fix next.
                </div>
              </div>

              <div className="space-y-2.5">
                {homepageDomains.map((domain) => (
                  <div
                    key={domain.code}
                    className="rounded-2xl border border-white/8 bg-[#0b1730]/45 px-4 py-3 transition hover:border-cyan-400/20"
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
                          href={`/quiz/domain?code=${encodeURIComponent(
                            domain.code
                          )}`}
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
            </div>

            <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-4">
              <div className="text-lg font-semibold text-white">Focus next</div>
              <div className="mt-1 text-sm text-slate-400">
                Keep the next steps dead simple.
              </div>

              <div className="mt-3.5 space-y-2.5">
                <FocusRow
                  title={
                    recentMissCount > 0 ? "Review missed terms" : "Run Daily Drill"
                  }
                  description={
                    recentMissCount > 0
                      ? `You have ${recentMissCount} missed item${
                          recentMissCount === 1 ? "" : "s"
                        } waiting.`
                      : "Fastest way to warm up recall before deeper study."
                  }
                  href={
                    recentMissCount > 0
                      ? "/mastery/missed"
                      : "/mastery/daily"
                  }
                />

                <FocusRow
                  title={`Work on ${focusDomain.name}`}
                  description="Weakest active area that needs attention next."
                  href={`/quiz/domain?code=${encodeURIComponent(
                    focusDomain.code
                  )}`}
                />

                <FocusRow
                  title="Search acronyms and terms"
                  description="Jump straight to a term when you know what is giving you trouble."
                  href="/search"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}