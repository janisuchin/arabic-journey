import { buildReport, skillLevel, studyStreak, type ReportInput } from '../report';
import { newCard } from '../srs';

const weeks = Array.from({ length: 13 }, (_, i) => ({
  week: i + 1,
  title: `Week ${i + 1}`,
  days: Array.from({ length: 7 }, (_, k) => i * 7 + k + 1),
}));

const base = (): ReportInput => ({
  weeks,
  totalDays: 90,
  completedDays: [1, 2, 3, 8],
  quizScores: { 1: 1, 2: 0.8, 3: 0.6, 8: 1, 50: 0.2 },
  weekTests: { 1: 0.9, 2: 0.5 },
  passMark: 0.8,
  cards: { a: newCard('a', 0), b: { ...newCard('b', 0), step: -1, interval: 30 } },
  activity: { '2026-11-11': 10, '2026-11-10': 5, '2026-11-09': 15, '2026-11-01': 30 },
  answered: {
    correct: 12,
    total: 20,
    bySkill: { quiz: { correct: 9, total: 10 }, reading: { correct: 2, total: 6 }, time: { correct: 1, total: 2 } },
  },
  placement: { at: 1, week: 2, score: 0.7 },
  today: '2026-11-11',
});

describe('progress report', () => {
  it('counts days, weeks and week tests', () => {
    const r = buildReport(base());
    expect(r.daysDone).toBe(4);
    expect(r.weeks[0]).toMatchObject({ week: 1, daysDone: 3, daysTotal: 7, score: 0.9, status: 'passed' });
    expect(r.weeks[1]).toMatchObject({ daysDone: 1, score: 0.5, status: 'below pass mark' });
    expect(r.weeks[2]).toMatchObject({ daysDone: 0, score: null, status: 'not taken' });
    expect(r.weekTestsPassed).toBe(1);
    expect(r.weekTestsTaken).toBe(2);
  });
  it('averages only the quizzes of completed days', () => {
    // day 50 has a score but was never completed: it does not count
    expect(buildReport(base()).quizAverage).toBeCloseTo((1 + 0.8 + 0.6 + 1) / 4);
    expect(buildReport({ ...base(), completedDays: [], quizScores: {} }).quizAverage).toBe(0);
  });
  it('sorts skills weakest first and leaves tiny samples unjudged, at the end', () => {
    const r = buildReport(base());
    expect(r.skills.map((s) => s.skill)).toEqual(['reading', 'quiz', 'time']);
    expect(r.skills[0].level).toBe('needs work');
    expect(r.skills[1].level).toBe('strong');
    expect(r.skills[2].level).toBe('too early to say');
    expect(skillLevel(7, 10)).toBe('developing');
    expect(skillLevel(4, 4)).toBe('too early to say');
  });
  it('counts words, study time and the streak', () => {
    const r = buildReport(base());
    expect(r.words).toEqual({ learned: 2, mastered: 1 });
    expect(r.study).toEqual({ minutes: 60, activeDays: 4, last7Minutes: 30, streak: 3 });
    expect(r.placement).toEqual({ at: 1, week: 2, score: 0.7 });
    expect(buildReport({ ...base(), placement: undefined }).placement).toBeNull();
  });
  it('keeps the streak alive when today has no study yet, and breaks it after a gap', () => {
    expect(studyStreak({ '2026-11-10': 5, '2026-11-09': 5 }, '2026-11-11')).toBe(2);
    expect(studyStreak({ '2026-11-09': 5 }, '2026-11-11')).toBe(0);
    expect(studyStreak({}, '2026-11-11')).toBe(0);
    // the streak crosses a month boundary
    expect(studyStreak({ '2026-11-01': 1, '2026-10-31': 1, '2026-10-30': 1 }, '2026-11-01')).toBe(3);
  });
});
