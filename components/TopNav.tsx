"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ElementType } from "react";
import {
  ChevronDown,
  CalendarDays,
  BookOpenCheck,
  AlertTriangle,
  Layers3,
  LibraryBig,
  LayoutDashboard,
} from "lucide-react";

type PracticeItem = {
  href: string;
  label: string;
  description: string;
  icon: ElementType;
};

const PRACTICE_ITEMS: PracticeItem[] = [
  {
    href: "/mastery/daily",
    label: "Daily Flashcards",
    description: "Today’s rotating 10-card set",
    icon: CalendarDays,
  },
  {
    href: "/quiz",
    label: "Quizzes",
    description: "Choose all domains or one domain",
    icon: BookOpenCheck,
  },
  {
    href: "/mastery/missed",
    label: "Missed Review",
    description: "Retake missed terms",
    icon: AlertTriangle,
  },
  {
    href: "/mastery/confusion",
    label: "Confusion Pairs",
    description: "Compare similar acronyms",
    icon: Layers3,
  },
  {
    href: "/mastery/all",
    label: "All Acronyms",
    description: "Browse the full library",
    icon: LibraryBig,
  },
];

function linkClasses(active: boolean) {
  return active
    ? "rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-white"
    : "rounded-full border border-white/10 px-3 py-2 text-slate-300 hover:bg-white/5";
}

export default function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const practiceActive = PRACTICE_ITEMS.some((item) =>
    pathname.startsWith(item.href)
  );

  return (
    <header className="sticky top-0 z-30 mb-5 rounded-3xl border border-white/10 bg-[#07111f]/85 px-5 py-4 backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-400/15 p-2.5 ring-1 ring-cyan-300/20">
            <LayoutDashboard className="h-5 w-5 text-cyan-300" />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight text-white">
              SecPlus Scout
            </div>
            <div className="text-xs text-slate-400">
              Security+ study dashboard
            </div>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/" className={linkClasses(pathname === "/")}>
            Dashboard
          </Link>

          <Link
            href="/search"
            className={linkClasses(pathname.startsWith("/search"))}
          >
            Search
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className={
                open || practiceActive
                  ? "inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-white shadow-[0_10px_30px_rgba(8,145,178,0.16)]"
                  : "inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-slate-300 hover:bg-white/5"
              }
            >
              Practice
              <ChevronDown
                className={`h-4 w-4 transition ${
                  open ? "rotate-180 text-cyan-200" : ""
                }`}
              />
            </button>

            {open && (
              <div className="absolute right-0 mt-3 w-[360px] rounded-[28px] border border-cyan-300/15 bg-[#081936]/95 p-3 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl">
                <div className="px-2 pb-2 pt-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  Practice tools
                </div>

                <div className="space-y-2">
                  {PRACTICE_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active = pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`block rounded-2xl border px-4 py-3 transition ${
                          active
                            ? "border-cyan-300/25 bg-cyan-400/10"
                            : "border-white/8 bg-white/[0.02] hover:border-cyan-400/25 hover:bg-cyan-400/[0.06]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="rounded-xl border border-cyan-300/15 bg-cyan-400/10 p-2">
                            <Icon className="h-4 w-4 text-cyan-300" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-white">
                              {item.label}
                            </div>
                            <div className="mt-1 text-sm text-slate-400">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}