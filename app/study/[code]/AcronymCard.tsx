"use client";

import { useState } from "react";

type AcronymCardProps = {
  domainCode: string;
  item: {
    acronym: string;
    full: string;
    plain: string;
    confusion: string;
  };
};

export default function AcronymCard({
  domainCode,
  item,
}: AcronymCardProps) {
  const [status, setStatus] = useState<"easy" | "hard" | null>(null);

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0b1730] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-3xl font-semibold text-white">
            {item.acronym}
          </div>
          <div className="mt-1 text-cyan-200">{item.full}</div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-200">
            Confused with: {item.confusion}
          </div>

          {status && (
            <div
              className={`rounded-full px-3 py-1 text-xs ${
                status === "easy"
                  ? "bg-emerald-400/10 text-emerald-200"
                  : "bg-rose-400/10 text-rose-200"
              }`}
            >
              Marked {status}
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-slate-300">{item.plain}</p>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={() => setStatus("easy")}
          className={`rounded-2xl px-4 py-2 font-medium ${
            status === "easy"
              ? "bg-emerald-400 text-slate-950"
              : "bg-cyan-400 text-slate-950"
          }`}
        >
          Mark easy
        </button>

        <button
          onClick={() => setStatus("hard")}
          className={`rounded-2xl border px-4 py-2 ${
            status === "hard"
              ? "border-rose-300 bg-rose-400/10 text-rose-200"
              : "border-white/10 text-white hover:bg-white/5"
          }`}
        >
          Mark hard
        </button>
      </div>
    </div>
  );
}