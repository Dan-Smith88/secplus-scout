"use client";

import Link from "next/link";
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

function normalizePair(value: string) {
  return value
    .split("vs")
    .map((part) => part.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .join(" vs ");
}

export default function ConfusionPairsPage() {
  const [scope, setScope] = useState<"all" | "single">("all");
  const [selectedCode, setSelectedCode] = useState(domains[0]?.code ?? "");

  const allItems: FlatAcronym[] = useMemo(() => {
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

  const filteredItems = useMemo(() => {
    if (scope === "all") return allItems;
    return allItems.filter((item) => item.domainCode === selectedCode);
  }, [allItems, scope, selectedCode]);

  const groups = useMemo(() => {
    return Object.values(
      filteredItems
        .filter((item) => item.confusion && item.confusion.trim().length > 0)
        .reduce<Record<string, { title: string; items: FlatAcronym[] }>>(
          (acc, item) => {
            const key = normalizePair(item.confusion);
            if (!acc[key]) {
              acc[key] = { title: key, items: [] };
            }
            acc[key].items.push(item);
            return acc;
          },
          {}
        )
    ).sort((a, b) => a.title.localeCompare(b.title));
  }, [filteredItems]);

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
                key={group.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <h2 className="text-2xl font-semibold text-white">
                  {group.title}
                </h2>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {group.items.map((item) => (
                    <div
                      key={`${item.domainCode}:${item.acronym}`}
                      className="rounded-2xl border border-white/10 bg-[#0b1730] p-4"
                    >
                      <div className="text-sm text-cyan-300">
                        {item.domainCode} · {item.domainName}
                      </div>
                      <div className="mt-1 text-xl font-semibold text-white">
                        {item.acronym}
                      </div>
                      <div className="mt-1 text-cyan-200">{item.full}</div>
                      <div className="mt-3 text-sm leading-6 text-slate-300">
                        {item.plain}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}