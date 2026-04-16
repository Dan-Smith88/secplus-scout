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

type FlatAcronym = {
  acronym: string;
  full: string;
  plain: string;
  confusion: string;
  domainCode: string;
  domainName: string;
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

export default function DailyDrillPage() {
  const [mounted, setMounted] = useState(false);
  const [dateKey, setDateKey] = useState("");
  const [store, setStore] = useState<MasteryStore>({});
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDateKey(getLocalDateKey());
    setStore(loadMastery());
  }, []);

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

  const dailyDeck = useMemo(() => {
    if (!mounted || !dateKey) return [];

    const scored = allItems
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
      .slice(0, 20)
      .map((x) => x.item);

    return scored;
  }, [allItems, store, mounted, dateKey]);

  const current = dailyDeck[index] ?? null;

  function recordResult(result: "know" | "almost" | "missed") {
    if (!current) return;

    const updated = upsertMasteryResult(
      store,
      current.domainCode,
      current.acronym,
      result
    );

    setStore(updated);
    saveMastery(updated);
    setRevealed(false);

    if (index < dailyDeck.length - 1) {
      setIndex(index + 1);
    }
  }

  function restartDrill() {
    setIndex(0);
    setRevealed(false);
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
            Today’s rotation: {dateKey}
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-slate-300">
              Card {Math.min(index + 1, dailyDeck.length)} of {dailyDeck.length}
            </div>

            <button
              onClick={restartDrill}
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5"
            >
              Restart today’s drill
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-[#0b1730] p-6">
          {!current ? (
            <div>
              <h2 className="text-2xl font-semibold text-white">
                You finished today’s drill
              </h2>
              <p className="mt-3 text-slate-300">
                Come back tomorrow for a refreshed set, or restart today’s drill.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-cyan-300">{current.domainName}</div>
                  <h2 className="mt-2 text-5xl font-semibold text-white">
                    {current.acronym}
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
                    {current.full}
                  </div>
                  <p className="mt-3 max-w-3xl text-slate-300">
                    {current.plain}
                  </p>
                  <div className="mt-3 text-sm text-amber-200">
                    Confused with: {current.confusion}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => recordResult("know")}
                      className="rounded-2xl bg-emerald-400 px-4 py-2 font-medium text-slate-950"
                    >
                      Know it
                    </button>

                    <button
                      onClick={() => recordResult("almost")}
                      className="rounded-2xl bg-amber-300 px-4 py-2 font-medium text-slate-950"
                    >
                      Almost
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
          )}
        </div>
      </div>
    </main>
  );
}