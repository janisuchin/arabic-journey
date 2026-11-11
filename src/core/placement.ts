// Optional placement check (Prompt B section L). Pure.
//
// Six stages of four questions, drawn from the week tests. The check stops at the first stage below 3 of 4.
// The result only lets the learner *take* the week tests up to the recommended week, one at a time: passing each
// test opens the next week, so nobody skips foundations they don't know yet.

import { seededShuffle } from './answer';

export interface PlacementWeek<Q> {
  week: number;
  test: Q[];
}

export interface PlacementStage<Q> {
  /** weeks covered by this stage */
  weeks: number[];
  questions: Q[];
}

export const PLACEMENT_STAGES: number[][] = [
  [1, 2],
  [3, 4],
  [5, 6],
  [7, 8],
  [9, 10],
  [11, 12, 13],
];
export const PLACEMENT_PER_STAGE = 4;
export const PLACEMENT_STAGE_PASS = 0.75;

export function buildPlacement<Q>(weeks: PlacementWeek<Q>[], seed = 7): PlacementStage<Q>[] {
  return PLACEMENT_STAGES.map((ws, k) => {
    const pool = weeks.filter((w) => ws.includes(w.week)).flatMap((w) => w.test);
    return { weeks: ws, questions: seededShuffle(pool, seed + k).slice(0, PLACEMENT_PER_STAGE) };
  }).filter((s) => s.questions.length > 0);
}

/** The last week of the highest stage passed in a row from the start; 0 = start from Day 1. */
export function placementResult(scores: { weeks: number[]; correct: number; total: number }[]): number {
  let week = 0;
  for (const s of scores) {
    if (s.total > 0 && s.correct / s.total >= PLACEMENT_STAGE_PASS) week = Math.max(...s.weeks);
    else break;
  }
  return week;
}
