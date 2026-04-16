"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { domains } from "../../../lib/securityData";
import {
  loadMastery,
  saveMastery,
  upsertMasteryResult,
} from "../../../lib/masteryStorage";
import { MasteryStore } from "../../../lib/masteryTypes";

const DAILY_DRILL_SIZE = 10;

type FlatAcronym = {
  acronym: string;
  full: string;
  plain: string;
  confusion: string;
  domainCode: string;
  domainName: string;
};

type DrillResult = {
  acronym: string;
  full: string;
  plain: string;
  confusion: string;
  domainCode: string;
  domainName: string;
  result: "know" | "missed";
};

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildDailyDeck(
  allItems: FlatAcronym[],
  store: MasteryStore,
  dateKey: string
) {
  return allItems
    .map((item) => {
      const key = `${item.domainCode}:${item.acronym}`;
      const stat = store[key];

      let priority = 0;
      if (!stat) priority += 100;
      if (stat?.lastResult === "missed") priority += 80;
      if (stat?.lastResult === "almost") priority += 50;
      if (stat?.lastResult === "know") priority += 10;
      if ((stat?.seen ?? 0) < 2) priority += 20;

      const dayNoise = hashString(`${dateKey}:${key}`) % 25;

      return {
        item,
        score: priority + dayNoise,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, DAILY_DRILL_SIZE)
    .map((x) => x.item);
}

function getResultBadgeClasses(result: "know" | "missed") {
  if (result === "know") {
    return "border-emerald-400/30 bg-emerald-400/15 text-emerald-200";
  }
  return "border-rose-400/30 bg-rose-400/15 text-rose-200";
}

function getResultLabel(result: "know" | "missed") {
  if (result === "know") return "Know it";
  return "Missed";
}

export default function DailyDrillPage() {
  const [mounted, setMounted] = useState(false);
  const [dateKey, setDateKey] = useState("");
  const [store, setStore] = useState<MasteryStore>({});
  const [dailyDeck, setDailyDeck] = useState<FlatAcronym[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [sessionResults, setSessionResults] = useState<DrillResult[]>([]);
  const [reviewMode, setReviewMode] = useState(false);

  const allItems = useMemo<FlatAcronym[]>(() => {
    return domains.flatMap((domain) =>
      domain.acronyms.map((item) => ({
        acronym: item.acronym,
        full: item.full,
        plain: item.plain,
        confusion: item.confusion,
        domainCode: domain.code,
        domainName: domain.name,
      }))
    );
  }, []);

  useEffect(() => {
    const currentDateKey = getLocalDateKey();
    const loadedStore = loadMastery();

    setMounted(true);
    setDateKey(currentDateKey);
    setStore(loadedStore);
    setDailyDeck(buildDailyDeck(allItems, loadedStore, currentDateKey));
    setIndex(0);
    setRevealed(false);
    setSessionResults([]);
    setReviewMode(false);
  }, [allItems]);

  const current = dailyDeck[index] ?? null;
  const isComplete = index >= dailyDeck.length && dailyDeck.length > 0;

  const resultCounts = useMemo(() => {
    return sessionResults.reduce(
      (acc, item) => {
        acc[item.result] += 1;
        return acc;
      },
      { know: 0, missed: 0 }
    );
  }, [sessionResults]);

  function recordResult(result: "know" | "missed") {
    if (!current) return;

    const updated = upsertMasteryResult(
      store,
      current.domainCode,
      current.acronym,
      result
    );

    setStore(updated);
    saveMastery(updated);

    setSessionResults((prev) => [
      ...prev,
      {
        acronym: current.acronym,
        full: current.full,
        plain: current.plain,
        confusion: current.confusion,
        domainCode: current.domainCode,
        domainName: current.domainName,
        result,
      },
    ]);

    setRevealed(false);
    setReviewMode(false);

    if (index < dailyDeck.length - 1) {
      setIndex((prev) => prev + 1);
    } else {
      setIndex(dailyDeck.length);
    }
  }

  function restartDrill() {
    if (!dateKey) return;

    setDailyDeck(buildDailyDeck(allItems, loadMastery(), dateKey));
    setIndex(0);
    setRevealed(false);
    setSessionResults([]);
    setReviewMode(false);
  }

  if (!mounted || !dateKey) {
    return (
      <main className="min-h-screen bg-[#07111f] px-6 py-10 text-slate-100">
        <div className="mx-auto max-w-6xl">Loading daily drill...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07111f] px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/mastery"
          className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
        >
          ← Back to Acronym Mastery
        </Link>

        <div className="mt-8 rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-6">
          <div className="text-sm text-cyan-200">Daily Drill</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
            Today’s rotating acronym set
          </h1>
          <p className="mt-3 max-w-3xl text-slate-200">
            This page gives you a rotating drill that changes every day. It
            prioritizes new, weak, and recently missed acronyms, so the set is
            not static and should evolve as you improve.
          </p>
          <div className="mt-4 text-sm text-cyan-100">
            Today’s rotation: {dateKey} • {dailyDeck.length} flashcards
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-slate-300">
              {!isComplete
                ? `Card ${index + 1} of ${dailyDeck.length}`
                : reviewMode
                ? `Reviewing ${sessionResults.length} answers`
                : `Completed ${dailyDeck.length} of ${dailyDeck.length}`}
            </div>

            <div className="flex flex-wrap gap-3">
              {isComplete && (
                <button
                  onClick={() => setReviewMode((prev) => !prev)}
                  className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5"
                >
                  {reviewMode ? "Hide answer review" : "Review answers"}
                </button>
              )}

              <button
                onClick={restartDrill}
                className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5"
              >
                Restart today’s drill
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-[#0b1730] p-6">
          {!isComplete ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-cyan-300">{current?.domainName}</div>
                  <h2 className="mt-2 text-5xl font-semibold text-white">
                    {current?.acronym}
                  </h2>
                </div>
              </div>

              {!revealed ? (
                <div className="mt-8">
                  <button
                    onClick={() => setRevealed(true)}
                    className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950"
                  >
                    Reveal answer
                  </button>
                </div>
              ) : (
                <div className="mt-8">
                  <div className="text-2xl font-semibold text-white">
                    {current?.full}
                  </div>
                  <p className="mt-3 max-w-3xl text-slate-300">
                    {current?.plain}
                  </p>
                  <div className="mt-3 text-sm text-amber-200">
                    Confused with: {current?.confusion}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => recordResult("know")}
                      className="rounded-2xl bg-emerald-400 px-4 py-2 font-medium text-slate-950"
                    >
                      Know it
                    </button>

                    <button
                      onClick={() => recordResult("missed")}
                      className="rounded-2xl bg-rose-400 px-4 py-2 font-medium text-slate-950"
                    >
                      Missed
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : !reviewMode ? (
            <div>
              <h2 className="text-2xl font-semibold text-white">
                You finished today’s drill
              </h2>
              <p className="mt-3 text-slate-300">
                You completed all {dailyDeck.length} flashcards for today. You
                can now review your answers or come back tomorrow for a refreshed
                set.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-emerald-200/80">
                    Know it
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-white">
                    {resultCounts.know}
                  </div>
                </div>

                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-rose-200/80">
                    Missed
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-white">
                    {resultCounts.missed}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    Answer review
                  </h2>
                  <p className="mt-2 text-slate-300">
                    Here is the full set you just completed, along with how you
                    marked each one.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {sessionResults.map((item, reviewIndex) => (
                  <div
                    key={`${item.domainCode}:${item.acronym}:${reviewIndex}`}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm text-cyan-300">
                          {item.domainName}
                        </div>
                        <h3 className="mt-1 text-2xl font-semibold text-white">
                          {item.acronym}
                        </h3>
                      </div>

                      <div
                        className={`rounded-full border px-3 py-1 text-sm font-medium ${getResultBadgeClasses(
                          item.result
                        )}`}
                      >
                        {getResultLabel(item.result)}
                      </div>
                    </div>

                    <div className="mt-4 text-xl font-semibold text-white">
                      {item.full}
                    </div>
                    <p className="mt-2 max-w-3xl text-slate-300">
                      {item.plain}
                    </p>
                    <div className="mt-3 text-sm text-amber-200">
                      Confused with: {item.confusion}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}