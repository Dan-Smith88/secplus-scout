"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { domains } from "../../lib/securityData";
import { clearMastery, loadMastery } from "../../lib/masteryStorage";
import { MasteryStore } from "../../lib/masteryTypes";

type FlatAcronym = {
  acronym: string;
  full: string;
  plain: string;
  confusion: string;
  domainCode: string;
  domainName: string;
};

export default function MasteryHomePage() {
  const [mounted, setMounted] = useState(false);
  const [store, setStore] = useState<MasteryStore>({});

  useEffect(() => {
    setMounted(true);
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

  const recentMisses = useMemo(() => {
    return allItems
      .map((item) => {
        const key = `${item.domainCode}:${item.acronym}`;
        const stat = store[key];
        return { item, stat };
      })
      .filter((entry) => entry.stat?.lastResult === "missed")
      .sort((a, b) => {
        const aTime = a.stat?.lastReviewedAt ?? "";
        const bTime = b.stat?.lastReviewedAt ?? "";
        return bTime.localeCompare(aTime);
      })
      .slice(0, 8)
      .map((entry) => entry.item);
  }, [allItems, store]);

  const totals = useMemo(() => {
    const records = Object.values(store);
    const seen = records.reduce((sum, r) => sum + r.seen, 0);
    const know = records.reduce((sum, r) => sum + r.know, 0);
    const missed = records.reduce((sum, r) => sum + r.missed, 0);

    const masteryScore = seen === 0 ? 0 : Math.round((know / seen) * 100);

    return { seen, know, missed, masteryScore };
  }, [store]);

  function resetAllMastery() {
    const confirmed = window.confirm(
      "Reset all Acronym Mastery history? This will clear know and missed tracking."
    );

    if (!confirmed) return;

    clearMastery();
    setStore({});
  }

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#07111f] px-6 py-10 text-slate-100">
        <div className="mx-auto max-w-6xl">Loading mastery...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07111f] px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
        >
          ← Back to dashboard
        </Link>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm text-cyan-300">Acronym Mastery</div>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
                Master acronyms with focused drills
              </h1>
              <p className="mt-3 max-w-3xl text-slate-300">
                This section is your cross-domain acronym training hub. Use it to
                run a rotating daily drill, study confusion pairs across all
                domains, review missed terms, and browse every acronym in one
                place.
              </p>
            </div>

            <button
              onClick={resetAllMastery}
              className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-2 text-sm text-rose-200 hover:bg-rose-400/20"
            >
              Reset mastery data
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-slate-400">Mastery score</div>
            <div className="mt-1 text-3xl font-semibold text-white">
              {totals.masteryScore}%
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-slate-400">Know</div>
            <div className="mt-1 text-3xl font-semibold text-white">
              {totals.know}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-slate-400">Missed</div>
            <div className="mt-1 text-3xl font-semibold text-white">
              {totals.missed}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/mastery/daily"
            className="rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-6 hover:bg-cyan-400/15"
          >
            <div className="text-sm text-cyan-200">Daily Drill</div>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Rotating 10-card drill
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-200">
              A daily set of acronyms that rotates every day. It prioritizes new,
              weak, and recently missed terms.
            </p>
          </Link>

          <Link
            href="/mastery/confusion"
            className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10"
          >
            <div className="text-sm text-cyan-300">Confusion Pairs</div>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Compare the dangerous lookalikes
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Study the terms students most often mix up across all domains,
              with explanations to understand the difference.
            </p>
          </Link>

          <Link
            href="/mastery/missed"
            className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10"
          >
            <div className="text-sm text-cyan-300">Missed Review</div>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Retake your weak terms
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Focus only on the acronyms you have marked as missed in previous
              drills.
            </p>
          </Link>

          <Link
            href="/mastery/all"
            className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10"
          >
            <div className="text-sm text-cyan-300">All Acronyms</div>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Full master list
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Browse all loaded acronyms across every domain, with their full
              meaning and plain-English explanation.
            </p>
          </Link>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold text-white">Recent misses</h2>
          <p className="mt-2 text-sm text-slate-400">
            Terms you most recently marked as missed.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {recentMisses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#0b1730] p-4 text-slate-400">
                No missed acronyms yet.
              </div>
            ) : (
              recentMisses.map((item) => (
                <div
                  key={`${item.domainCode}:${item.acronym}`}
                  className="rounded-2xl border border-white/10 bg-[#0b1730] p-4"
                >
                  <div className="text-sm text-cyan-300">{item.domainName}</div>
                  <div className="mt-1 text-lg font-semibold text-white">
                    {item.acronym}
                  </div>
                  <div className="mt-1 text-sm text-cyan-200">{item.full}</div>
                  <div className="mt-2 text-sm text-slate-300">{item.plain}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}