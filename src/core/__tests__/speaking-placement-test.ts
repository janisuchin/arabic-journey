import { buildPlacement, placementResult } from '../placement';
import { isDayUnlocked, isWeekTestUnlocked, nextDay, type ProgressInput } from '../progress';
import { compareSpeech, speechKey } from '../speech';

describe('speaking lab comparison', () => {
  it('ignores harakat and the usual spelling variants', () => {
    expect(speechKey('مَدْرَسَةٌ')).toBe(speechKey('مدرسه'));
    expect(speechKey('إِلَى')).toBe(speechKey('الي'));
    expect(speechKey('مَسْؤُول')).toBe(speechKey('مسوول'));
    expect(speechKey('٣')).toBe('3');
    expect(speechKey('؟')).toBe('');
  });
  it('marks every word heard', () => {
    const r = compareSpeech('أَنَا مِنْ مِصْرَ.', 'انا من مصر');
    expect(r.matched).toBe(3);
    expect(r.total).toBe(3);
    expect(r.parts.every((p) => p.kind === 'same')).toBe(true);
    // the model's vocalised spelling is shown, not the transcript
    expect(r.parts[0].text).toBe('أَنَا');
  });
  it('shows missing and extra words', () => {
    const r = compareSpeech('أَنَا مِنْ مِصْرَ', 'انا في مصر');
    expect(r.matched).toBe(2);
    expect(r.parts.map((p) => p.kind).sort()).toEqual(['extra', 'missing', 'same', 'same']);
    expect(compareSpeech('شُكْرًا', '').parts).toEqual([{ text: 'شُكْرًا', kind: 'missing' }]);
  });
});

describe('placement check', () => {
  const weeks = Array.from({ length: 13 }, (_, i) => ({
    week: i + 1,
    test: Array.from({ length: 10 }, (_, k) => `w${i + 1}q${k}`),
  }));
  it('builds six stages of four questions from the right weeks', () => {
    const stages = buildPlacement(weeks);
    expect(stages).toHaveLength(6);
    for (const s of stages) {
      expect(s.questions).toHaveLength(4);
      for (const q of s.questions) expect(s.weeks).toContain(Number(q.slice(1, q.indexOf('q'))));
    }
    expect(buildPlacement(weeks)).toEqual(stages); // deterministic
  });
  it('recommends the last week of the highest stage passed in a row', () => {
    expect(placementResult([{ weeks: [1, 2], correct: 2, total: 4 }])).toBe(0);
    expect(
      placementResult([
        { weeks: [1, 2], correct: 4, total: 4 },
        { weeks: [3, 4], correct: 3, total: 4 },
        { weeks: [5, 6], correct: 1, total: 4 },
        { weeks: [7, 8], correct: 4, total: 4 },
      ]),
    ).toBe(4);
  });
});

describe('testing in after placement', () => {
  const base: ProgressInput = {
    validDays: [1, 2, 3, 8, 9, 15],
    weekOf: (d) => Math.ceil(d / 7),
    completedDays: new Set(),
    weekTests: {},
    passMark: 0.8,
    unlockAll: false,
  };
  it('week tests stay locked without placement', () => {
    expect(isWeekTestUnlocked(1, [1, 2, 3], base)).toBe(false);
  });
  it('lets the learner take week tests up to the placement week, in order', () => {
    const p = { ...base, placementWeek: 2 };
    expect(isWeekTestUnlocked(1, [1, 2, 3], p)).toBe(true);
    expect(isWeekTestUnlocked(2, [8, 9], p)).toBe(false);
    expect(isWeekTestUnlocked(2, [8, 9], { ...p, weekTests: { 1: 0.9 } })).toBe(true);
    expect(isWeekTestUnlocked(3, [15], { ...p, weekTests: { 1: 0.9, 2: 0.9 } })).toBe(false);
  });
  it('a passed week test opens the next week and moves "next day" there', () => {
    const p = { ...base, placementWeek: 2, weekTests: { 1: 0.9 } };
    expect(isDayUnlocked(8, p)).toBe(true);
    expect(isDayUnlocked(9, p)).toBe(false);
    expect(nextDay(p)).toBe(8);
    // skipped days stay open to revisit
    expect(isDayUnlocked(1, p)).toBe(true);
  });
});

describe('reading questions', () => {
  it('hide the transliteration only when it would give the answer away', () => {
    const { asksReading } = jest.requireActual<typeof import('../answer')>('../answer');
    expect(asksReading('How is this word read?')).toBe(true);
    expect(asksReading('What does this mean?')).toBe(false);
    expect(asksReading('Which word is ready?')).toBe(false);
  });
});
