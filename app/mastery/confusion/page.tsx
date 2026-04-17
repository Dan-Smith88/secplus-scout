"use client";

import { useMemo, useState } from "react";
import { domains } from "../../../lib/securityData";
import TopNav from "../../../components/TopNav";

type FlatAcronym = {
  acronym: string;
  full: string;
  plain: string;
  confusion: string;
  domainCode: string;
  domainName: string;
};

type ConfusionGroup = {
  key: string;
  title: string;
  pair: string[];
  items: FlatAcronym[];
};

function parseConfusionParts(value: string) {
  return value
    .split(/vs/i)
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizeAcronym(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizePairKey(parts: string[]) {
  return [...parts]
    .map((part) => normalizeAcronym(part))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .join("__");
}

function findBestAcronymMatch(
  target: string,
  items: FlatAcronym[]
): FlatAcronym | null {
  const normalizedTarget = normalizeAcronym(target);

  if (!normalizedTarget) return null;

  const exact = items.find(
    (item) => normalizeAcronym(item.acronym) === normalizedTarget
  );
  if (exact) return exact;

  const containsTarget = items.find((item) =>
    normalizeAcronym(item.acronym).includes(normalizedTarget)
  );
  if (containsTarget) return containsTarget;

  const targetContainsItem = items.find((item) =>
    normalizedTarget.includes(normalizeAcronym(item.acronym))
  );
  if (targetContainsItem) return targetContainsItem;

  return null;
}

export default function ConfusionPairsPage() {
  const [scope, setScope] = useState<"all" | "single">("all");
  const [selectedCode, setSelectedCode] = useState(domains[0]?.code ?? "");

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

  const scopedItems = useMemo(() => {
    if (scope === "all") return allItems;
    return allItems.filter((item) => item.domainCode === selectedCode);
  }, [allItems, scope, selectedCode]);

  const groups = useMemo<ConfusionGroup[]>(() => {
    const grouped = scopedItems
      .filter((item) => item.confusion && item.confusion.trim().length > 0)
      .reduce<Record<string, ConfusionGroup>>((acc, item) => {
        const parts = parseConfusionParts(item.confusion);
        if (parts.length < 2) return acc;

        const key = normalizePairKey(parts);

        if (!acc[key]) {
          acc[key] = {
            key,
            title: parts.join(" vs "),
            pair: parts.slice(0, 2),
            items: [],
          };
        }

        const alreadyExists = acc[key].items.some(
          (existing) =>
            normalizeAcronym(existing.acronym) === normalizeAcronym(item.acronym)
        );

        if (!alreadyExists) {
          acc[key].items.push(item);
        }

        return acc;
      }, {});

    return Object.values(grouped)
      .map((group) => {
        const completedItems: FlatAcronym[] = [];

        for (const pairPart of group.pair) {
          const existingInGroup = group.items.find(
            (item) =>
              normalizeAcronym(item.acronym) === normalizeAcronym(pairPart)
          );

          if (existingInGroup) {
            completedItems.push(existingInGroup);
            continue;
          }

          const fallbackFromAll = findBestAcronymMatch(pairPart, allItems);
          if (fallbackFromAll) {
            const duplicate = completedItems.some(
              (item) =>
                normalizeAcronym(item.acronym) ===
                normalizeAcronym(fallbackFromAll.acronym)
            );

            if (!duplicate) {
              completedItems.push(fallbackFromAll);
            }
          }
        }

        return {
          ...group,
          items: completedItems,
        };
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [scopedItems, allItems]);

  return (
    <main className="min-h-screen bg-[#07111f] px-6 py-4 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <TopNav />

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm text-cyan-300">Confusion Pairs</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
            Compare the acronyms people mix up most
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Use all domains when you want a broader review. Switch to one domain
            when one section keeps tripping you up.
          </p>

          <div className="mt-6 flex flex-wrap items-end gap-4">
            <div className="inline-flex rounded-2xl border border-white/10 bg-[#0b1730] p-1">
              <button
                onClick={() => setScope("all")}
                className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                  scope === "all"
                    ? "bg-cyan-400 text-slate-950"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                All Domains
              </button>
              <button
                onClick={() => setScope("single")}
                className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                  scope === "single"
                    ? "bg-cyan-400 text-slate-950"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                Single Domain
              </button>
            </div>

            {scope === "single" && (
              <div className="min-w-[280px]">
                <label className="mb-2 block text-sm text-slate-400">
                  Select a domain
                </label>
                <select
                  value={selectedCode}
                  onChange={(e) => setSelectedCode(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1730] px-4 py-3 text-white outline-none focus:border-cyan-300/30"
                >
                  {domains.map((domain) => (
                    <option key={domain.code} value={domain.code}>
                      {domain.code} · {domain.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-6">
          {groups.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-slate-400">
              No confusion pairs found for this scope.
            </div>
          ) : (
            groups.map((group) => (
              <div
                key={group.key}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <h2 className="text-2xl font-semibold text-white">
                  {group.pair.join(" vs ")}
                </h2>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {group.pair.map((pairPart) => {
                    const matchedItem =
                      group.items.find(
                        (item) =>
                          normalizeAcronym(item.acronym) ===
                          normalizeAcronym(pairPart)
                      ) ?? findBestAcronymMatch(pairPart, allItems);

                    if (!matchedItem) {
                      return (
                        <div
                          key={`${group.key}:${pairPart}`}
                          className="rounded-2xl border border-dashed border-amber-300/20 bg-[#0b1730] p-4"
                        >
                          <div className="text-sm text-amber-200">
                            {pairPart}
                          </div>
                          <div className="mt-2 text-sm text-slate-400">
                            No matching acronym definition was found in the data
                            for this term.
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={`${matchedItem.domainCode}:${matchedItem.acronym}:${group.key}`}
                        className="rounded-2xl border border-white/10 bg-[#0b1730] p-4"
                      >
                        <div className="text-sm text-cyan-300">
                          {matchedItem.domainCode} · {matchedItem.domainName}
                        </div>
                        <div className="mt-1 text-xl font-semibold text-white">
                          {matchedItem.acronym}
                        </div>
                        <div className="mt-1 text-cyan-200">
                          {matchedItem.full}
                        </div>
                        <div className="mt-3 text-sm leading-6 text-slate-300">
                          {matchedItem.plain}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}