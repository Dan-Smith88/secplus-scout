export type MasteryRecord = {
  acronym: string;
  domainCode: string;
  seen: number;
  know: number;
  almost: number;
  missed: number;
  lastResult: "know" | "almost" | "missed" | null;
  lastReviewedAt: string | null;
};

export type MasteryStore = Record<string, MasteryRecord>;