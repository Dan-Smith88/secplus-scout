"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { domains } from "../../../lib/securityData";

type FlatAcronym = {
  acronym: string;
  full: string;
  plain: string;
  confusion: string;
  domainCode: string;
  domainName: string;
};

export default function AllAcronymsPage() {
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
      const text =
        `${item.acronym} ${item.full} ${item.plain} ${item.domainName}`.toLowerCase();
      return text.includes(q);
    });
  }, [allItems, query]);

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
          <div className="text-sm text-cyan-300">All Acronyms</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
            Browse every acronym across all domains
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            This page gives you one searchable list of all acronyms currently
            loaded into the app, across every domain.
          </p>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search acronym, meaning, or domain..."
            className="mt-5 w-full rounded-2xl border border-white/10 bg-[#0b1730] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/30"
          />
        </div>

        <div className="mt-8 grid gap-4">
          {filtered.map((item) => (
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
          ))}

          {filtered.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-slate-400">
              No acronyms matched your search.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}