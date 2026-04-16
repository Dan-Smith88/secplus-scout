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

export default function AllAcronymsPage() {
  const [scope, setScope] = useState<"all" | "single">("all");
  const [selectedCode, setSelectedCode] = useState(domains[0]?.code ?? "");
  const [query, setQuery] = useState("");

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

  const filtered = useMemo(() => {
    const q = query.toLowerCase();

    return allItems.filter((item) => {
      if (scope === "single" && item.domainCode !== selectedCode) return false;

      const text =
        `${item.acronym} ${item.full} ${item.plain} ${item.domainName}`.toLowerCase();
      return text.includes(q);
    });
  }, [allItems, scope, selectedCode, query]);

  return (
    <main className="min-h-screen bg-[#07111f] px-6 py-4 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <TopNav />

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm text-cyan-300">All Acronyms</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
            Browse the full acronym library
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Search everything at once or narrow the list down to one domain.
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

            <div className="min-w-[280px] flex-1">
              <label className="mb-2 block text-sm text-slate-400">
                Search
              </label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search acronym, meaning, or domain..."
                className="w-full rounded-2xl border border-white/10 bg-[#0b1730] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/30"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-slate-400">
              No acronyms matched your filter.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={`${item.domainCode}:${item.acronym}`}
                className="rounded-3xl border border-white/10 bg-[#0b1730] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-2xl font-semibold text-white">
                      {item.acronym}
                    </div>
                    <div className="mt-1 text-cyan-200">{item.full}</div>
                  </div>

                  <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                    {item.domainCode} · {item.domainName}
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {item.plain}
                </p>

                <div className="mt-3 text-sm text-amber-200">
                  Confused with: {item.confusion}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}