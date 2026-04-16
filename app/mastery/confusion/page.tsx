"use client";

import Link from "next/link";
import { domains } from "../../../lib/securityData";

type FlatAcronym = {
  acronym: string;
  full: string;
  plain: string;
  confusion: string;
  domainCode: string;
  domainName: string;
};

type PairGroup = {
  title: string;
  terms: string[];
};

function normalizeTerm(value: string) {
  return value.trim().toUpperCase();
}

function parsePair(value: string) {
  return value
    .split("vs")
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizePairTitle(value: string) {
  const parts = parsePair(value)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 2) return value.trim();

  return `${parts[0]} vs ${parts[1]}`;
}

export default function ConfusionPairsPage() {
  const allItems: FlatAcronym[] = domains.flatMap((domain) =>
    domain.acronyms.map((item) => ({
      acronym: item.acronym,
      full: item.full,
      plain: item.plain,
      confusion: item.confusion,
      domainCode: domain.code,
      domainName: domain.name,
    }))
  );

  const acronymIndex = new Map<string, FlatAcronym>();
  for (const item of allItems) {
    acronymIndex.set(normalizeTerm(item.acronym), item);
  }

  const pairGroups: PairGroup[] = Array.from(
    new Map(
      allItems
        .filter((item) => item.confusion && item.confusion.trim().length > 0)
        .map((item) => {
          const normalizedTitle = normalizePairTitle(item.confusion);
          const terms = parsePair(item.confusion);

          return [
            normalizedTitle,
            {
              title: normalizedTitle,
              terms,
            },
          ] as const;
        })
    ).values()
  ).sort((a, b) => a.title.localeCompare(b.title));

  return (
    <main className="min-h-screen bg-[#07111f] px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/mastery"
          className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
        >
          ← Back to Acronym Mastery
        </Link>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm text-cyan-300">Confusion Pairs</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
            Study the terms people mix up most
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            This page compares confusing acronym pairs across all domains so you
            can see both terms side by side and understand the difference.
          </p>
        </div>

        <div className="mt-8 grid gap-6">
          {pairGroups.map((group) => {
            const pairItems = group.terms.map((term) => {
              const match = acronymIndex.get(normalizeTerm(term));
              return {
                requested: term,
                item: match ?? null,
              };
            });

            return (
              <div
                key={group.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <h2 className="text-2xl font-semibold text-white">
                  {group.title}
                </h2>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {pairItems.map(({ requested, item }) =>
                    item ? (
                      <div
                        key={requested}
                        className="rounded-2xl border border-white/10 bg-[#0b1730] p-4"
                      >
                        <div className="text-sm text-cyan-300">
                          {item.domainName}
                        </div>
                        <div className="mt-1 text-xl font-semibold text-white">
                          {item.acronym}
                        </div>
                        <div className="mt-1 text-cyan-200">{item.full}</div>
                        <div className="mt-3 text-sm leading-6 text-slate-300">
                          {item.plain}
                        </div>
                      </div>
                    ) : (
                      <div
                        key={requested}
                        className="rounded-2xl border border-dashed border-white/10 bg-[#0b1730] p-4"
                      >
                        <div className="text-sm text-amber-200">
                          Acronym not loaded yet
                        </div>
                        <div className="mt-2 text-xl font-semibold text-white">
                          {requested}
                        </div>
                        <div className="mt-3 text-sm leading-6 text-slate-400">
                          This side of the confusion pair is referenced in your
                          data, but its full acronym entry has not been added to
                          the master dataset yet.
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}