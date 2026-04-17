"use client";

import Link from "next/link";
import TopNav from "../../components/TopNav";

export default function StudyResumePage() {
  return (
    <main className="min-h-screen bg-[#07111f] px-6 py-4 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <TopNav />

        <section className="rounded-[2rem] border border-cyan-400/15 bg-gradient-to-br from-cyan-400/10 via-[#0c1a30] to-[#0a1426] px-6 py-5 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-sm text-cyan-300">Resume study</div>
            <h1 className="mt-1 text-[2rem] font-semibold leading-tight text-white lg:text-[2.6rem]">
              Continue studying
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Choose how you want to continue.
            </p>
          </div>
        </section>

        <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/quiz"
            className="rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-5 transition hover:bg-cyan-400/15"
          >
            <h2 className="text-2xl font-semibold text-white">Resume Quiz</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Go back into quiz mode.
            </p>
          </Link>

          <Link
            href="/mastery/daily"
            className="rounded-3xl border border-white/8 bg-white/[0.025] p-5 transition hover:border-cyan-400/20 hover:bg-white/[0.045]"
          >
            <h2 className="text-2xl font-semibold text-white">Daily Flashcards</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Warm up with today’s rotating set.
            </p>
          </Link>

          <Link
            href="/mastery/missed"
            className="rounded-3xl border border-white/8 bg-white/[0.025] p-5 transition hover:border-cyan-400/20 hover:bg-white/[0.045]"
          >
            <h2 className="text-2xl font-semibold text-white">Review Missed Terms</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Go clean up weak spots.
            </p>
          </Link>

          <Link
            href="/quiz"
            className="rounded-3xl border border-white/8 bg-white/[0.025] p-5 transition hover:border-cyan-400/20 hover:bg-white/[0.045]"
          >
            <h2 className="text-2xl font-semibold text-white">Change Domain</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Pick a different domain or mixed quiz mode.
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}