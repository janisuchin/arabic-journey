// Unlocking and progress rules. Pure.

export const DEFAULT_PASS_MARK = 0.8;

export interface ProgressInput {
  /** days that exist and passed validation */
  validDays: number[];
  /** day -> week */
  weekOf: (day: number) => number;
  completedDays: Set<number>;
  /** week -> best score 0..1 */
  weekTests: Record<number, number>;
  passMark: number;
  unlockAll: boolean;
  /** optional placement result: the learner may test into weeks up to this one, one week test at a time */
  placementWeek?: number;
}

/**
 * A day opens when the previous valid day is complete. The first day of a week also needs the
 * previous week's test at the pass mark. Invalid days are skipped so they never trap a learner.
 */
export function isDayUnlocked(day: number, p: ProgressInput): boolean {
  if (!p.validDays.includes(day)) return false;
  if (p.unlockAll) return true;
  const sorted = [...p.validDays].sort((a, b) => a - b);
  const idx = sorted.indexOf(day);
  if (idx === 0) return true;
  const prev = sorted[idx - 1];
  // first day of a week: the previous week's test at the pass mark opens it (that test itself needs every day of
  // its week done, unless the learner tested in after the placement check)
  if (p.weekOf(prev) !== p.weekOf(day)) return (p.weekTests[p.weekOf(prev)] ?? 0) >= p.passMark;
  return p.completedDays.has(prev);
}

const weekPassed = (week: number, p: ProgressInput) => (p.weekTests[week] ?? 0) >= p.passMark;

export function isWeekTestUnlocked(week: number, weekDays: number[], p: ProgressInput) {
  if (p.unlockAll) return true;
  const valid = weekDays.filter((d) => p.validDays.includes(d));
  if (valid.length > 0 && valid.every((d) => p.completedDays.has(d))) return true;
  // placement: test into the weeks up to the placement result, in order (week 1 first)
  if (p.placementWeek && week <= p.placementWeek) return week === 1 || weekPassed(week - 1, p);
  return false;
}

/** The final exam opens once the last week's test is passed, or with unlock-all. */
export function isFinalExamUnlocked(lastWeek: number, p: ProgressInput) {
  if (p.unlockAll) return true;
  return lastWeek > 0 && weekPassed(lastWeek, p);
}

export function nextDay(p: ProgressInput): number | null {
  const sorted = [...p.validDays].sort((a, b) => a - b);
  // days of a week whose test is already passed (tested in after placement) are not "next"; they stay open to revisit
  for (const d of sorted) if (!p.completedDays.has(d) && !weekPassed(p.weekOf(d), p) && isDayUnlocked(d, p)) return d;
  return null;
}

export const passed = (score: number, passMark = DEFAULT_PASS_MARK) => score >= passMark;
