import Link from "next/link";
import { notFound } from "next/navigation";
import { domains } from "../../../lib/securityData";
import AcronymCard from "./AcronymCard";

export default async function StudyDomainPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const domain = domains.find(
    (d) =>
      d.code === code ||
      d.slug === code ||
      d.code.toLowerCase() === code.toLowerCase() ||
      d.slug.toLowerCase() === code.toLowerCase()
  );

  if (!domain) {
    notFound();
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
              <p className="text-sm text-cyan-300">{domain.code}</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
                {domain.name}
              </h1>
              <p className="mt-3 max-w-2xl text-slate-300">
                {domain.description}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
              {domain.weight}% of exam
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-dashed border-white/10 bg-white/5 p-5">
          <div className="text-lg font-semibold text-white">
            Suggested first step
          </div>
          <div className="mt-2 text-sm text-slate-400">
            Review the acronyms below, use flashcards for memorization, then take the full domain quiz.
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/quiz/domain?code=${encodeURIComponent(domain.code)}`}
              className="inline-flex rounded-2xl bg-cyan-400 px-4 py-2 font-medium text-slate-950"
            >
              Take full domain quiz
            </Link>

            <Link
              href={`/study/${encodeURIComponent(domain.code)}/flashcards`}
              className="inline-flex rounded-2xl border border-white/10 px-4 py-2 text-white hover:bg-white/5"
            >
              Flashcards
            </Link>

            <Link
              href="/"
              className="inline-flex rounded-2xl border border-white/10 px-4 py-2 text-white hover:bg-white/5"
            >
              Back to dashboard
            </Link>
          </div>
        </div>

        <section className="mt-10">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-white">
              Acronym review
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Mark what feels easy or hard before taking the quiz.
            </p>
          </div>

          <div className="grid gap-4">
            {domain.acronyms.map((item) => (
              <AcronymCard
                key={item.acronym}
                domainCode={domain.code}
                item={item}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}