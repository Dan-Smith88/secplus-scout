"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Search,
  ChevronDown,
  Layers3,
  Brain,
  Library,
  SquareStack,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type MenuItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export default function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const menuItems: MenuItem[] = [
    {
      href: "/flashcards",
      label: "Flashcards",
      icon: Library,
    },
    {
      href: "/daily-flashcards",
      label: "Daily Set",
      icon: Brain,
    },
    {
      href: "/study",
      label: "Quizzes",
      icon: Layers3,
    },
    {
      href: "/acronyms",
      label: "All Acronyms",
      icon: SquareStack,
    },
  ];

  const practiceActive =
    pathname.startsWith("/study") ||
    pathname.startsWith("/flashcards") ||
    pathname.startsWith("/daily-flashcards") ||
    pathname.startsWith("/acronyms");

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 shadow-[0_10px_30px_rgba(8,145,178,0.16)]">
            <BookOpen className="h-5 w-5 text-cyan-300" />
          </div>

          <div>
            <div className="text-lg font-semibold text-white">SecPlus Scout</div>
            <div className="text-sm text-slate-400">Security+ study dashboard</div>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/search"
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
              pathname.startsWith("/search")
                ? "border-cyan-300/25 bg-cyan-400/10 text-white shadow-[0_10px_30px_rgba(8,145,178,0.16)]"
                : "border-white/10 text-slate-300 hover:bg-white/5"
            }`}
          >
            <Search className="h-4 w-4" />
            Search
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                open || practiceActive
                  ? "border-cyan-300/25 bg-cyan-400/10 text-white shadow-[0_10px_30px_rgba(8,145,178,0.16)]"
                  : "border-white/10 text-slate-300 hover:bg-white/5"
              }`}
            >
              Practice
              <ChevronDown
                className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
              />
            </button>

            {open && (
              <div className="absolute right-0 mt-3 w-72 rounded-[1.5rem] border border-white/10 bg-slate-950/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl">
                <div className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active =
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/");

                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 rounded-2xl border px-3 py-3 transition ${
                          active
                            ? "border-cyan-300/25 bg-cyan-400/10"
                            : "border-white/10 bg-white/[0.02] hover:border-cyan-400/25 hover:bg-cyan-400/[0.06]"
                        }`}
                      >
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
                          <Icon className="h-4 w-4 text-cyan-300" />
                        </div>

                        <div className="text-sm font-medium leading-snug text-white">
                          {item.label}
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