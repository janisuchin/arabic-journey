import { buildFinalExam, FINAL_PER_WEEK, finalExamResult } from '../finalExam';
import { isFinalExamUnlocked, type ProgressInput } from '../progress';
import { buildReport, type ReportInput } from '../report';

const weeks = Array.from({ length: 13 }, (_, i) => ({
  week: i + 1,
  test: Array.from({ length: i === 11 ? 8 : 10 }, (_, k) => `w${i + 1}q${k}`),
}));

describe('final exam', () => {
  it('draws four questions from every week, in course order, deterministically', () => {
    const exam = buildFinalExam(weeks);
    expect(exam).toHaveLength(13 * FINAL_PER_WEEK);
    expect(exam.map((x) => x.week)).toEqual(exam.map((x) => x.week).sort((a, b) => a - b));
    for (const x of exam) expect(x.q.startsWith(`w${x.week}q`)).toBe(true);
    expect(new Set(exam.map((x) => x.q)).size).toBe(exam.length); // no repeats
    expect(buildFinalExam(weeks)).toEqual(exam);
    expect(buildFinalExam([...weeks].reverse())).toEqual(exam); // input order does not matter
  });
  it('skips weeks without a test', () => {
    expect(
      buildFinalExam([
        { week: 1, test: ['a', 'b'] },
        { week: 2, test: [] },
      ]),
    ).toEqual([expect.objectContaining({ week: 1 }), expect.objectContaining({ week: 1 })]);
  });
  it('scores by week and lists the weak weeks, weakest first', () => {
    const r = finalExamResult(
      [
        { week: 1, correct: true },
        { week: 1, correct: true },
        { week: 2, correct: false },
        { week: 2, correct: true },
        { week: 3, correct: false },
        { week: 3, correct: false },
      ],
      0.8,
    );
    expect(r).toMatchObject({ correct: 3, total: 6, score: 0.5 });
    expect(r.byWeek[2]).toEqual({ correct: 1, total: 2 });
    expect(r.weakWeeks).toEqual([3, 2]);
    expect(finalExamResult([], 0.8)).toMatchObject({ score: 0, weakWeeks: [] });
  });
});

describe('final exam unlock', () => {
  const base: ProgressInput = {
    validDays: [1],
    weekOf: (d) => Math.ceil(d / 7),
    completedDays: new Set(),
    weekTests: {},
    passMark: 0.8,
    unlockAll: false,
  };
  it('opens after the last week test is passed, or with unlock-all', () => {
    expect(isFinalExamUnlocked(13, base)).toBe(false);
    expect(isFinalExamUnlocked(13, { ...base, weekTests: { 13: 0.7 } })).toBe(false);
    expect(isFinalExamUnlocked(13, { ...base, weekTests: { 13: 0.8 } })).toBe(true);
    expect(isFinalExamUnlocked(13, { ...base, unlockAll: true })).toBe(true);
    expect(isFinalExamUnlocked(0, { ...base, weekTests: { 0: 1 } })).toBe(false);
  });
});

describe('final exam in the report', () => {
  const input = (finalExam?: ReportInput['finalExam'], completed = 0): ReportInput => ({
    weeks: weeks.map((w) => ({ week: w.week, title: `W${w.week}`, days: [w.week] })),
    totalDays: 13,
    completedDays: Array.from({ length: completed }, (_, i) => i + 1),
    quizScores: {},
    weekTests: {},
    passMark: 0.8,
    cards: {},
    activity: {},
    answered: { correct: 0, total: 0, bySkill: {} },
    finalExam,
    today: '2026-11-11',
  });
  const record = {
    at: 1,
    score: 0.9,
    correct: 47,
    total: 52,
    byWeek: { 1: { correct: 2, total: 4 }, 2: { correct: 4, total: 4 } },
    attempts: 2,
  };
  it('is null when not taken and the report is not final', () => {
    const r = buildReport(input(undefined, 13));
    expect(r.finalExam).toBeNull();
    expect(r.finished).toBe(false);
  });
  it('marks pass, weak weeks and the final report', () => {
    const r = buildReport(input(record, 13));
    expect(r.finalExam).toMatchObject({ passed: true, weakWeeks: [1], attempts: 2 });
    expect(r.finished).toBe(true);
    expect(buildReport(input(record, 12)).finished).toBe(false);
    expect(buildReport(input({ ...record, score: 0.5 }, 13))).toMatchObject({ finished: false, finalExam: { passed: false } });
  });
});
