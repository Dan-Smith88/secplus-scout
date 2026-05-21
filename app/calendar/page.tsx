"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, X } from "lucide-react";
import Link from "next/link";
import TopNav from "../../components/TopNav";
import { loadCalendar, saveCalendar, CalendarStore } from "../../lib/calendarStorage";
import { domains } from "../../lib/securityData";

const PROGRESS_KEY = "secplus-domain-progress-v1";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getActivityDates(progressRaw: string | null): Set<string> {
  const dates = new Set<string>();
  if (!progressRaw) return dates;
  try {
    const parsed = JSON.parse(progressRaw);
    for (const val of Object.values(parsed)) {
      const { completedAt } = val as { completedAt?: string };
      if (completedAt) dates.add(completedAt.slice(0, 10));
    }
  } catch { /* ignore */ }
  return dates;
}

function buildMonthGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();
  const weeks: (Date | null)[][] = [];
  let week: (Date | null)[] = Array(startDow).fill(null);

  for (let d = 1; d <= lastDay.getDate(); d++) {
    week.push(new Date(year, month, d));
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

export default function CalendarPage() {
  const now = new Date();
  const today = toLocalDateStr(now);

  const [mounted, setMounted] = useState(false);
  const [store, setStore] = useState<CalendarStore>({ plannedDays: [], examDate: null, dayEntries: {} });
  const [activityDates, setActivityDates] = useState<Set<string>>(new Set());
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [examInput, setExamInput] = useState("");
  const [showExamInput, setShowExamInput] = useState(false);

  // Day detail panel state
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  useEffect(() => {
    const cal = loadCalendar();
    setStore(cal);
    setExamInput(cal.examDate ?? "");
    const raw = localStorage.getItem(PROGRESS_KEY);
    setActivityDates(getActivityDates(raw));
    setMounted(true);
  }, []);

  function handleDayClick(dateStr: string) {
    let updated = store;
    if (!store.plannedDays.includes(dateStr)) {
      updated = { ...store, plannedDays: [...store.plannedDays, dateStr] };
      setStore(updated);
      saveCalendar(updated);
    }
    const entry = updated.dayEntries[dateStr];
    setNoteInput(entry?.note ?? "");
    setSelectedDomain(entry?.domainCode ?? null);
    setSelectedDay(dateStr);
  }

  function saveEntry(dateStr: string, note: string, domainCode: string | null) {
    const dayEntries = { ...store.dayEntries };
    if (!note && !domainCode) {
      delete dayEntries[dateStr];
    } else {
      dayEntries[dateStr] = { note, domainCode };
    }
    const updated = { ...store, dayEntries };
    setStore(updated);
    saveCalendar(updated);
  }

  function removePlannedDay(dateStr: string) {
    const plannedDays = store.plannedDays.filter((d) => d !== dateStr);
    const dayEntries = { ...store.dayEntries };
    delete dayEntries[dateStr];
    const updated = { ...store, plannedDays, dayEntries };
    setStore(updated);
    saveCalendar(updated);
    setSelectedDay(null);
  }

  function applyExamDate(date: string | null) {
    const updated = { ...store, examDate: date };
    setStore(updated);
    saveCalendar(updated);
    setShowExamInput(false);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  }

  const weeks = buildMonthGrid(viewYear, viewMonth);

  const examDaysLeft = (() => {
    if (!store.examDate) return null;
    const todayMs = new Date(today + "T00:00:00").getTime();
    const examMs = new Date(store.examDate + "T00:00:00").getTime();
    return Math.round((examMs - todayMs) / 86400000);
  })();

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const weekStart = toLocalDateStr(startOfWeek);
  const weekEnd = toLocalDateStr(endOfWeek);
  const plannedThisWeek = store.plannedDays.filter((d) => d >= weekStart && d <= weekEnd).length;
  const totalScheduled = store.plannedDays.filter((d) => d >= today).length;

  const selectedDayLabel = selectedDay
    ? new Date(selectedDay + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric",
      })
    : null;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.10),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#06101f_100%)] text-white">
        <TopNav />
        <main className="mx-auto max-w-5xl px-6 py-8">
          <div className="h-96 animate-pulse rounded-[2rem] border border-white/10 bg-slate-950/45" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.10),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#06101f_100%)] text-white">
      <TopNav />

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <section className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-6 shadow-[0_12px_40px_rgba(2,6,23,0.35)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-cyan-300">Study Planner</div>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">Calendar</h1>
              <p className="mt-3 text-base text-slate-300">
                Plan study days and track your schedule toward exam day.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5"
            >
              ← Dashboard
            </Link>
          </div>

          {/* Exam date + stats */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {store.examDate ? (
              <div className="flex items-center gap-3 rounded-2xl border border-rose-400/25 bg-rose-400/[0.08] px-4 py-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-rose-300/70">Exam date</div>
                  <div className="mt-0.5 text-base font-semibold text-rose-100">
                    {new Date(store.examDate + "T12:00:00").toLocaleDateString("en-US", {
                      month: "long", day: "numeric", year: "numeric",
                    })}
                  </div>
                </div>
                {examDaysLeft !== null && (
                  <div className="ml-2 text-right">
                    <div className="text-2xl font-semibold text-rose-200">{examDaysLeft}</div>
                    <div className="text-[11px] text-rose-300/70">days left</div>
                  </div>
                )}
                <button
                  onClick={() => setShowExamInput(true)}
                  className="ml-1 text-xs text-slate-400 transition hover:text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => applyExamDate(null)}
                  className="text-slate-500 transition hover:text-rose-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowExamInput(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300 transition hover:border-cyan-400/25 hover:bg-cyan-400/[0.06] hover:text-white"
              >
                <Calendar className="h-4 w-4 text-cyan-300" />
                Set exam date
              </button>
            )}

            {showExamInput && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={examInput}
                  onChange={(e) => setExamInput(e.target.value)}
                  min={today}
                  className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white [color-scheme:dark]"
                />
                <button
                  onClick={() => examInput ? applyExamDate(examInput) : setShowExamInput(false)}
                  className="rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-200 transition hover:bg-cyan-400/20"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowExamInput(false)}
                  className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
              <div className="text-2xl font-semibold text-white">{plannedThisWeek}</div>
              <div className="text-sm text-slate-400">days planned<br />this week</div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
              <div className="text-2xl font-semibold text-white">{totalScheduled}</div>
              <div className="text-sm text-slate-400">days<br />scheduled</div>
            </div>
          </div>
        </section>

        {/* Calendar grid */}
        <section className="mt-5 rounded-[2rem] border border-white/10 bg-slate-950/45 p-6 shadow-[0_12px_40px_rgba(2,6,23,0.35)]">
          {/* Month navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="text-xl font-semibold text-white">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </div>
            <button
              onClick={nextMonth}
              className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="mt-5 grid grid-cols-7 gap-1">
            {DOW.map((d) => (
              <div
                key={d}
                className="py-1 text-center text-[11px] uppercase tracking-[0.18em] text-slate-500"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Week rows */}
          <div className="mt-1 space-y-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1">
                {week.map((date, di) => {
                  if (!date) return <div key={di} />;

                  const dateStr = toLocalDateStr(date);
                  const isToday = dateStr === today;
                  const isPast = dateStr < today;
                  const isPlanned = store.plannedDays.includes(dateStr);
                  const isActivity = activityDates.has(dateStr);
                  const isExam = store.examDate === dateStr;
                  const isMissed = isPast && isPlanned && !isActivity;
                  const isSelected = dateStr === selectedDay;
                  const hasEntry = !!(store.dayEntries[dateStr]?.note || store.dayEntries[dateStr]?.domainCode);

                  let cellClass =
                    "flex min-h-[3.5rem] flex-col items-center justify-start rounded-2xl border p-2 transition ";

                  if (isSelected) {
                    cellClass += "border-cyan-300/50 bg-cyan-400/20 ring-1 ring-cyan-400/30";
                  } else if (isExam) {
                    cellClass += "border-rose-400/40 bg-rose-400/15";
                  } else if (isActivity) {
                    cellClass += "border-emerald-400/30 bg-emerald-400/10";
                  } else if (isMissed) {
                    cellClass += "border-amber-400/25 bg-amber-400/[0.06]";
                  } else if (isPlanned) {
                    cellClass += "cursor-pointer border-cyan-400/35 bg-cyan-400/15 hover:bg-cyan-400/20";
                  } else if (isPast) {
                    cellClass += "border-white/[0.04]";
                  } else {
                    cellClass += "cursor-pointer border-white/[0.06] bg-white/[0.01] hover:border-cyan-400/25 hover:bg-cyan-400/[0.06]";
                  }

                  const numberClass = isExam
                    ? "text-rose-200"
                    : isActivity
                    ? "text-emerald-200"
                    : isMissed
                    ? "text-amber-200"
                    : isPlanned || isSelected
                    ? "text-cyan-100"
                    : isToday
                    ? "text-cyan-300"
                    : isPast
                    ? "text-slate-600"
                    : "text-slate-300";

                  return (
                    <button
                      key={di}
                      onClick={() => !isPast && !isExam && handleDayClick(dateStr)}
                      disabled={isPast || isExam}
                      className={cellClass}
                    >
                      <span className={`text-sm font-medium ${numberClass}`}>
                        {date.getDate()}
                      </span>
                      {isToday && !isSelected && (
                        <span className="mt-0.5 h-1 w-1 rounded-full bg-cyan-400" />
                      )}
                      {isExam && (
                        <span className="mt-0.5 text-[9px] uppercase tracking-wide text-rose-300">
                          Exam
                        </span>
                      )}
                      {isActivity && !isExam && (
                        <span className="mt-0.5 text-[9px] uppercase tracking-wide text-emerald-300">
                          Done
                        </span>
                      )}
                      {isMissed && (
                        <span className="mt-0.5 text-[9px] uppercase tracking-wide text-amber-300">
                          Missed
                        </span>
                      )}
                      {isPlanned && !isMissed && !isActivity && !isExam && (
                        <span className="mt-0.5 text-[9px] uppercase tracking-wide text-cyan-300">
                          {hasEntry ? "●" : "Plan"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-white/[0.06] pt-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="h-3 w-3 rounded-sm border border-cyan-400/35 bg-cyan-400/15" />
              Planned
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="h-3 w-3 rounded-sm border border-emerald-400/30 bg-emerald-400/10" />
              Studied
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="h-3 w-3 rounded-sm border border-amber-400/25 bg-amber-400/[0.06]" />
              Missed
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="h-3 w-3 rounded-sm border border-rose-400/40 bg-rose-400/15" />
              Exam day
            </div>
            <div className="ml-auto text-sm text-slate-500">
              Click a future day to plan it and add details
            </div>
          </div>
        </section>

        {/* Day detail panel */}
        {selectedDay && (
          <section className="mt-5 rounded-[2rem] border border-cyan-400/20 bg-slate-950/45 p-6 shadow-[0_12px_40px_rgba(2,6,23,0.35)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-300">
                  Study plan
                </div>
                <h2 className="mt-1 text-2xl font-semibold text-white">{selectedDayLabel}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => removePlannedDay(selectedDay)}
                  className="rounded-full border border-rose-400/20 px-3 py-2 text-xs text-rose-300 transition hover:bg-rose-400/10"
                >
                  Remove from plan
                </button>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Note / goal */}
            <div className="mt-5">
              <label className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Study goal / note
              </label>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                onBlur={() => saveEntry(selectedDay, noteInput, selectedDomain)}
                placeholder="e.g. Review Domain 2 acronyms, focus on cryptography terms…"
                rows={3}
                className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-cyan-400/30 focus:outline-none"
              />
            </div>

            {/* Domain picker */}
            <div className="mt-5">
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Domain to study
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {domains.map((domain) => {
                  const active = selectedDomain === domain.code;
                  return (
                    <button
                      key={domain.code}
                      onClick={() => {
                        const next = active ? null : domain.code;
                        setSelectedDomain(next);
                        saveEntry(selectedDay, noteInput, next);
                      }}
                      className={`rounded-2xl border px-3 py-2 text-sm transition ${
                        active
                          ? "border-cyan-400/35 bg-cyan-400/15 text-cyan-100"
                          : "border-white/10 bg-white/[0.02] text-slate-300 hover:border-cyan-400/25 hover:bg-cyan-400/[0.06] hover:text-white"
                      }`}
                    >
                      <span className="font-medium text-cyan-300/70">{domain.code}</span>
                      {" — "}
                      {domain.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save confirmation hint */}
            <p className="mt-4 text-xs text-slate-600">
              Changes save automatically. Click another day or close to dismiss.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
