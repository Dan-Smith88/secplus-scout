import { MasteryRecord, MasteryStore } from "./masteryTypes";

const STORAGE_KEY = "secplus-acronym-mastery-v1";

export function loadMastery(): MasteryStore {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveMastery(store: MasteryStore) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

export function clearMastery() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function makeKey(domainCode: string, acronym: string) {
  return `${domainCode}:${acronym}`;
}

export function upsertMasteryResult(
  store: MasteryStore,
  domainCode: string,
  acronym: string,
  result: "know" | "almost" | "missed"
): MasteryStore {
  const key = makeKey(domainCode, acronym);

  const current: MasteryRecord = store[key] ?? {
    acronym,
    domainCode,
    seen: 0,
    know: 0,
    almost: 0,
    missed: 0,
    lastResult: null,
    lastReviewedAt: null,
  };

  const updated: MasteryRecord = {
    ...current,
    seen: current.seen + 1,
    know: current.know + (result === "know" ? 1 : 0),
    almost: current.almost + (result === "almost" ? 1 : 0),
    missed: current.missed + (result === "missed" ? 1 : 0),
    lastResult: result,
    lastReviewedAt: new Date().toISOString(),
  };

  return {
    ...store,
    [key]: updated,
  };
}