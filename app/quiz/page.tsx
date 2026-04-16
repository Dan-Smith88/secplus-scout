"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpenCheck, Layers3 } from "lucide-react";
import { domains } from "../../lib/securityData";
import TopNav from "../../components/TopNav";

export default function QuizLauncherPage() {
  const [scope, setScope] = useState<"all" | "single">("all");
  const [selectedCode, setSelectedCode] = useState(domains[0]?.code ?? "");

  const launchHref = useMemo(() => {
    if (scope === "all") return "/quiz/domain?code=all";
    return `/quiz/domain?code=${encodeURIComponent(selectedCode)}`;
  }, [scope, selectedCode]);

  const selectedDomain = domains.find((d) => d.code === selectedCode) ?? null;

  return (
    <main className="min-h-screen bg-[#07111f] px-6 py-4 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <TopNav />

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm text-cyan-300">Quizzes</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
            Choose your quiz scope
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Use all domains when you want broad recall pressure. Use a single
            domain when you want focused drilling on a weak area.
          </p>

          <div className="mt-6 inline-flex rounded-2xl border border-white/10 bg-[#0b1730] p-1">
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
            <div className="mt-5 max-w-md">
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

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-[#0b1730] p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-cyan-300/15 bg-cyan-400/10 p-2.5">
                  {scope === "all" ? (
                    <Layers3 className="h-5 w-5 text-cyan-300" />
                  ) : (
                    <BookOpenCheck className="h-5 w-5 text-cyan-300" />
                  )}
                </div>
                <div>
                  <div className="text-sm text-cyan-300">Current selection</div>
                  <div className="text-xl font-semibold text-white">
                    {scope === "all"
                      ? "Mixed quiz across all domains"
                      : selectedDomain?.name}
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                {scope === "all"
                  ? "This will mix every loaded acronym into one larger quiz."
                  : "This will run a full quiz only for the selected domain."}
              </p>

              <Link
                href={launchHref}
                className="mt-5 inline-flex items-center rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
              >
                Start quiz
              </Link>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <div className="text-sm text-slate-400">Best use</div>
              <div className="mt-2 text-lg font-semibold text-white">
                Quick rule of thumb
              </div>

              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                <div>
                  <span className="font-medium text-white">All Domains:</span>{" "}
                  use when you want exam-style pressure and mixed recall.
                </div>
                <div>
                  <span className="font-medium text-white">Single Domain:</span>{" "}
                  use when one area is dragging your readiness score down.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}