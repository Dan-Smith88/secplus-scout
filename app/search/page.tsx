"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Shield, ChevronDown, Search } from "lucide-react";
import { domains as securityDomains } from "../../lib/securityData";

type SearchItem = {
  acronym: string;
  full: string;
  plain: string;
  confusion: string;
  domainCode: string;
  domainName: string;
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const featuresRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        featuresRef.current &&
        !featuresRef.current.contains(event.target as Node)
      ) {
        setFeaturesOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const allSearchItems = useMemo<SearchItem[]>(() => {
    return securityDomains.flatMap((domain) =>
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
    const q = query.toLowerCase().trim();

    if (!q) {
      return allSearchItems.slice(0, 20);
    }

    return allSearchItems.filter((item) => {
      const text =
        `${item.acronym} ${item.full} ${item.plain} ${item.confusion} ${item.domainCode} ${item.domainName}`.toLowerCase();
      return text.includes(q);
    });
  }, [allSearchItems, query]);

  return (
    <div className="min-h-screen bg-[#07111f] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_24%),linear-gradient(to_bottom,#07111f,#09172a,#0b1220)]" />

      <div className="relative mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <header className="sticky top-0 z-20 mb-8 rounded-3xl border border-white/10 bg-[#07111f]/80 px-5 py-4 backdrop-blur">
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
                  Quick acronym search
                </div>
              </div>
            </Link>

            <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <div className="relative" ref={featuresRef}>
                <button
                  onClick={() => setFeaturesOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 hover:bg-white/5"
                  type="button"
                >
                  Features
                  <ChevronDown className="h-4 w-4" />
                </button>

                {featuresOpen && (
                  <div className="absolute right-0 z-30 mt-2 w-80 rounded-2xl border border-white/10 bg-[#0b1730] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
                    <Link
                      href="/mastery"
                      onClick={() => setFeaturesOpen(false)}
                      className="block rounded-xl px-3 py-3 text-sm text-white hover:bg-white/5"
                    >
                      <div className="font-medium">Acronym Mastery Hub</div>
                      <div className="mt-1 text-xs text-slate-400">
                        Open the full mastery workspace
                      </div>
                    </Link>

                    <Link
                      href="/mastery/daily"
                      onClick={() => setFeaturesOpen(false)}
                      className="block rounded-xl px-3 py-3 text-sm text-white hover:bg-white/5"
                    >
                      <div className="font-medium">Daily Drill</div>
                      <div className="mt-1 text-xs text-slate-400">
                        Rotating acronym set that changes every day
                      </div>
                    </Link>

                    <Link
                      href="/mastery/confusion"
                      onClick={() => setFeaturesOpen(false)}
                      className="block rounded-xl px-3 py-3 text-sm text-white hover:bg-white/5"
                    >
                      <div className="font-medium">Confusion Pairs</div>
                      <div className="mt-1 text-xs text-slate-400">
                        Compare acronyms people mix up most
                      </div>
                    </Link>

                    <Link
                      href="/mastery/missed"
                      onClick={() => setFeaturesOpen(false)}
                      className="block rounded-xl px-3 py-3 text-sm text-white hover:bg-white/5"
                    >
                      <div className="font-medium">Missed Review</div>
                      <div className="mt-1 text-xs text-slate-400">
                        Revisit the acronyms you missed
                      </div>
                    </Link>

                    <Link
                      href="/mastery/all"
                      onClick={() => setFeaturesOpen(false)}
                      className="block rounded-xl px-3 py-3 text-sm text-white hover:bg-white/5"
                    >
                      <div className="font-medium">All Acronyms</div>
                      <div className="mt-1 text-xs text-slate-400">
                        Full searchable acronym library
                      </div>
                    </Link>

                    <Link
                      href="/search"
                      onClick={() => setFeaturesOpen(false)}
                      className="block rounded-xl px-3 py-3 text-sm text-white hover:bg-white/5"
                    >
                      <div className="font-medium">Quick Acronym Search</div>
                      <div className="mt-1 text-xs text-slate-400">
                        Search the full loaded dataset
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              <Link
                className="rounded-full border border-white/10 px-3 py-2 hover:bg-white/5"
                href="/#domains"
              >
                Domains
              </Link>

              <Link
                className="rounded-full border border-white/10 px-3 py-2 hover:bg-white/5"
                href="/#dashboard"
              >
                Dashboard
              </Link>

              <Link
                className="rounded-full bg-white px-4 py-2 font-medium text-slate-900 transition hover:opacity-90"
                href="/#domains"
              >
                Start Studying
              </Link>
            </nav>
          </div>
        </header>

        <section className="pb-10 pt-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-cyan-300">Quick Acronym Search</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
              Search the full loaded dataset
            </h1>
            <p className="mt-3 max-w-3xl text-slate-300">
              This page keeps acronym search off the main dashboard while still
              letting you search every loaded acronym across all domains.
            </p>

            <div className="relative mt-5">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search EDR, SIEM, RBAC, CASB..."
                className="w-full rounded-2xl border border-white/10 bg-[#0b1730] py-3 pl-10 pr-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/30"
              />
            </div>
          </div>
        </section>

        <section className="pb-10 pt-2">
          <div className="grid gap-4">
            {filtered.map((item) => (
              <div
                key={`${item.domainCode}:${item.acronym}`}
                className="rounded-3xl border border-white/10 bg-[#0b1730] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-2xl font-semibold tracking-tight text-white">
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

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-200">
                    Confused with: {item.confusion}
                  </span>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-slate-400">
                No acronyms matched your search. If you expected one, it is
                probably not in <code>lib/securityData.ts</code> yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}