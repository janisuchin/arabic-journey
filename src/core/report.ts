// Progress report (Prompt B section K: Me → Report). Pure: everything is computed from the learner's own answers.
// It is a mirror of what the learner did in the app, never a certificate.

import { isMastered, type Card } from './srs';

export interface ReportWeek {
  week: number;
  title: string;
  days: number[];
}

export interface ReportInput {
  weeks: ReportWeek[];
  totalDays: number;
  completedDays: number[];
  /** day -> best quiz score 0..1 */
  quizScores: Record<number, number>;
  /** week -> best week-test score 0..1 */
  weekTests: Record<number, number>;
  passMark: number;
  cards: Record<string, Card>;
  /** YYYY-MM-DD -> minutes */
  activity: Record<string, number>;
  answered: { correct: number; total: number; bySkill: Record<string, { correct: number; total: number }> };
  placement?: { at: number; week: number; score: number };
  /** today as YYYY-MM-DD (passed in so the engine stays deterministic) */
  today: string;
}

export type WeekTestStatus = 'passed' | 'below pass mark' | 'not taken';

export interface WeekRow {
  week: number;
  title: string;
  daysDone: number;
  daysTotal: number;
  /** best week-test score or null when never taken */
  score: number | null;
  status: WeekTestStatus;
}

export type SkillLevel = 'strong' | 'developing' | 'needs work' | 'too early to say';

export interface SkillRow {
  skill: string;
  correct: number;
  total: number;
  accuracy: number;
  level: SkillLevel;
}

export interface Report {
  daysDone: number;
  totalDays: number;
  /** mean of the best quiz score of every completed day, 0..1 */
  quizAverage: number;
  weeks: WeekRow[];
  weekTestsPassed: number;
  weekTestsTaken: number;
  skills: SkillRow[];
  words: { learned: number; mastered: number };
  study: { minutes: number; activeDays: number; last7Minutes: number; streak: number };
  placement: { at: number; week: number; score: number } | null;
}

/** Fewer than this many answers in a skill: the accuracy is shown but not judged. */
export const SKILL_MIN_ANSWERS = 5;

export const SKILL_LABELS: Record<string, string> = {
  quiz: 'Day quizzes',
  'week tests': 'Week tests',
  reading: 'Reading',
  culture: 'Culture',
  pronunciation: 'Pronunciation',
  scenarios: 'Scenarios',
  time: 'Telling the time',
};

export const skillLabel = (skill: string) => SKILL_LABELS[skill] ?? skill.replace(/^./, (ch) => ch.toUpperCase());

export function skillLevel(correct: number, total: number): SkillLevel {
  if (total < SKILL_MIN_ANSWERS) return 'too early to say';
  const acc = correct / total;
  if (acc >= 0.8) return 'strong';
  if (acc >= 0.6) return 'developing';
  return 'needs work';
}

const dayBefore = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};

/** Consecutive days with any study ending today (or yesterday, so an unfinished today doesn't break it). */
export function studyStreak(activity: Record<string, number>, today: string): number {
  const active = (d: string) => (activity[d] ?? 0) > 0;
  let d = active(today) ? today : dayBefore(today);
  let n = 0;
  while (active(d)) {
    n += 1;
    d = dayBefore(d);
  }
  return n;
}

export function buildReport(p: ReportInput): Report {
  const done = new Set(p.completedDays);
  const weeks: WeekRow[] = p.weeks.map((w) => {
    const score = p.weekTests[w.week];
    const status: WeekTestStatus = score === undefined ? 'not taken' : score >= p.passMark ? 'passed' : 'below pass mark';
    return {
      week: w.week,
      title: w.title,
      daysDone: w.days.filter((d) => done.has(d)).length,
      daysTotal: w.days.length,
      score: score ?? null,
      status,
    };
  });
  const scores = p.completedDays.map((d) => p.quizScores[d]).filter((s): s is number => typeof s === 'number');
  const quizAverage = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  const skills: SkillRow[] = Object.entries(p.answered.bySkill)
    .filter(([, s]) => s.total > 0)
    .map(([skill, s]) => ({
      skill,
      correct: s.correct,
      total: s.total,
      accuracy: s.correct / s.total,
      level: skillLevel(s.correct, s.total),
    }))
    // weakest first, so the learner sees what to work on; unjudged skills last
    .sort((a, b) => Number(a.total < SKILL_MIN_ANSWERS) - Number(b.total < SKILL_MIN_ANSWERS) || a.accuracy - b.accuracy);

  const cards = Object.values(p.cards);
  let last7 = 0;
  let d = p.today;
  for (let k = 0; k < 7; k++) {
    last7 += p.activity[d] ?? 0;
    d = dayBefore(d);
  }
  const entries = Object.values(p.activity);
  return {
    daysDone: done.size,
    totalDays: p.totalDays,
    quizAverage,
    weeks,
    weekTestsPassed: weeks.filter((w) => w.status === 'passed').length,
    weekTestsTaken: weeks.filter((w) => w.status !== 'not taken').length,
    skills,
    words: { learned: cards.length, mastered: cards.filter(isMastered).length },
    study: {
      minutes: entries.reduce((a, b) => a + b, 0),
      activeDays: entries.filter((m) => m > 0).length,
      last7Minutes: last7,
      streak: studyStreak(p.activity, p.today),
    },
    placement: p.placement ?? null,
  };
}
