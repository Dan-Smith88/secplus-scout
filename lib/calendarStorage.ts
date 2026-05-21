const CALENDAR_KEY = "secplus-calendar-v1";

export type DayEntry = {
  note: string;
  domainCode: string | null;
};

export type CalendarStore = {
  plannedDays: string[]; // "YYYY-MM-DD" local date strings
  examDate: string | null;
  dayEntries: Record<string, DayEntry>; // keyed by "YYYY-MM-DD"
};

export function loadCalendar(): CalendarStore {
  try {
    const raw = localStorage.getItem(CALENDAR_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        plannedDays: Array.isArray(parsed.plannedDays) ? parsed.plannedDays : [],
        examDate: typeof parsed.examDate === "string" ? parsed.examDate : null,
        dayEntries:
          typeof parsed.dayEntries === "object" &&
          parsed.dayEntries !== null &&
          !Array.isArray(parsed.dayEntries)
            ? parsed.dayEntries
            : {},
      };
    }
  } catch { /* ignore */ }
  return { plannedDays: [], examDate: null, dayEntries: {} };
}

export function saveCalendar(store: CalendarStore): void {
  try {
    localStorage.setItem(CALENDAR_KEY, JSON.stringify(store));
  } catch { /* ignore */ }
}
