"use client";

import { useState } from "react";

type FlashcardItem = {
  acronym: string;
  full: string;
  plain: string;
};

type FlashcardSectionProps = {
  items: FlashcardItem[];
};

export default function FlashcardSection({
  items,
}: FlashcardSectionProps) {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  function toggleCard(acronym: string) {
    setFlipped((prev) => ({
      ...prev,
      [acronym]: !prev[acronym],
    }));
  }

  return (
    <section className="mt-10">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-white">Flashcards</h2>
        <p className="mt-2 text-sm text-slate-400">
          Click a card to flip it and see the meaning.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const isFlipped = flipped[item.acronym] || false;

          return (
            <button
              key={item.acronym}
              type="button"
              onClick={() => toggleCard(item.acronym)}
              className="min-h-[220px] rounded-3xl border border-white/10 bg-[#0b1730] p-6 text-left transition hover:bg-white/5"
            >
              {!isFlipped ? (
                <div className="flex h-full flex-col justify-center">
                  <div className="text-sm text-cyan-300">Flashcard</div>
                  <div className="mt-4 text-4xl font-semibold text-white">
                    {item.acronym}
                  </div>
                  <div className="mt-6 text-sm text-slate-400">
                    Click to reveal meaning
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col">
                  <div className="text-sm text-cyan-300">{item.acronym}</div>
                  <div className="mt-3 text-xl font-semibold text-white">
                    {item.full}
                  </div>
                  <div className="mt-4 text-sm leading-6 text-slate-300">
                    {item.plain}
                  </div>
                  <div className="mt-auto pt-6 text-xs text-slate-500">
                    Click again to flip back
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}