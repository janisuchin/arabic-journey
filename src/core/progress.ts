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
  if (!p.completedDays.has(prev)) return false;
  const w = p.weekOf(day);
  if (p.weekOf(prev) !== w) {
    const score = p.weekTests[p.weekOf(prev)] ?? 0;
    if (score < p.passMark) return false;
  }
  return true;
}

export function isWeekTestUnlocked(week: number, weekDays: number[], p: ProgressInput) {
  if (p.unlockAll) return true;
  const valid = weekDays.filter((d) => p.validDays.includes(d));
  return valid.length > 0 && valid.every((d) => p.completedDays.has(d));
}

export function nextDay(p: ProgressInput): number | null {
  const sorted = [...p.validDays].sort((a, b) => a - b);
  for (const d of sorted) if (!p.completedDays.has(d) && isDayUnlocked(d, p)) return d;
  return null;
}

export const passed = (score: number, passMark = DEFAULT_PASS_MARK) => score >= passMark;
