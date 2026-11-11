// Final exam (Prompt B section L). Pure.
//
// A cumulative test over all 13 weeks: a fixed number of questions per week, drawn from the week tests with a fixed
// seed, in course order (week 1 first). It opens once the last week test is passed (or with unlock-all). The result
// is stored with a per-week breakdown so the Report can say which weeks still need work. It is a mirror of the
// learner's answers in this app, never a certificate.

import { seededShuffle } from './answer';

export interface FinalWeek<Q> {
  week: number;
  test: Q[];
}

export interface FinalQuestion<Q> {
  week: number;
  q: Q;
}

export interface WeekScore {
  correct: number;
  total: number;
}

export interface FinalExamResult {
  correct: number;
  total: number;
  /** 0..1 */
  score: number;
  byWeek: Record<number, WeekScore>;
  /** weeks below the pass mark, weakest first */
  weakWeeks: number[];
}

export const FINAL_PER_WEEK = 4;
export const FINAL_SEED = 13;

/** Up to FINAL_PER_WEEK questions from every week that has a test, week 1 first. Deterministic. */
export function buildFinalExam<Q>(weeks: FinalWeek<Q>[], seed = FINAL_SEED): FinalQuestion<Q>[] {
  return [...weeks]
    .sort((a, b) => a.week - b.week)
    .flatMap((w) =>
      seededShuffle(w.test, seed + w.week)
        .slice(0, FINAL_PER_WEEK)
        .map((q) => ({ week: w.week, q })),
    );
}

export function finalExamResult(answers: { week: number; correct: boolean }[], passMark: number): FinalExamResult {
  const byWeek: Record<number, WeekScore> = {};
  let correct = 0;
  for (const a of answers) {
    const w = (byWeek[a.week] ??= { correct: 0, total: 0 });
    w.total += 1;
    if (a.correct) {
      w.correct += 1;
      correct += 1;
    }
  }
  const total = answers.length;
  const weakWeeks = Object.entries(byWeek)
    .map(([week, s]) => ({ week: Number(week), acc: s.total ? s.correct / s.total : 0 }))
    .filter((x) => x.acc < passMark)
    .sort((a, b) => a.acc - b.acc || a.week - b.week)
    .map((x) => x.week);
  return { correct, total, score: total ? correct / total : 0, byWeek, weakWeeks };
}
