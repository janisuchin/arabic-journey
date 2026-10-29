import { answersMatch, normaliseAnswer, seededShuffle } from '../answer';
import { letterForms, stripHarakat, toArabicIndic, ZWJ } from '../arabic';
import { clockTime, numberToArabic, numberToEnglish, ordinal, parseDigits } from '../numbers';
import { isDayUnlocked, nextDay, type ProgressInput } from '../progress';
import { isMastered, newCard, review } from '../srs';

describe('numbers', () => {
  it('counts in Arabic', () => {
    expect(numberToArabic(3)).toBe('ثَلَاثَة');
    expect(numberToArabic(11)).toBe('أَحَدَ عَشَرَ');
    expect(numberToArabic(21)).toBe('وَاحِد وَعِشْرُون');
    expect(numberToArabic(100)).toBe('مِئَة');
    expect(numberToArabic(2000)).toBe('أَلْفَان');
    expect(numberToArabic(3005)).toBe('ثَلَاثَةُ آلَاف وَخَمْسَة');
  });
  it('gives the English', () => {
    expect(numberToEnglish(0)).toBe('zero');
    expect(numberToEnglish(42)).toBe('forty-two');
    expect(numberToEnglish(1999)).toBe('one thousand nine hundred and ninety-nine');
  });
  it('reads Arabic-Indic digits', () => {
    expect(parseDigits('٢٥')).toBe(25);
    expect(toArabicIndic(2024)).toBe('٢٠٢٤');
    expect(parseDigits('abc')).toBeNull();
  });
  it('ordinals and clock times', () => {
    expect(ordinal(3).ar).toBe('ثَالِث');
    expect(ordinal(1, 'f').ar).toBe('أُولَى');
    expect(clockTime(5).ar).toBe('السَّاعَةُ الْخَامِسَة');
    expect(clockTime(7, 30).en).toBe('It is half past seven.');
    expect(clockTime(11, 45).ar).toBe('السَّاعَةُ الثَّانِيَةَ عَشْرَةَ إِلَّا رُبْعًا');
  });
});

describe('letters and harakat', () => {
  it('builds contextual forms with ZWJ and never for non-joining slots', () => {
    expect(letterForms('ب')).toEqual({ isolated: 'ب', initial: 'ب' + ZWJ, medial: ZWJ + 'ب' + ZWJ, final: ZWJ + 'ب' });
    expect(letterForms('د')).toEqual({ isolated: 'د', initial: null, medial: null, final: ZWJ + 'د' });
    expect(letterForms('ء').final).toBeNull();
  });
  it('strips harakat without touching letters', () => {
    expect(stripHarakat('مَرْحَبًا')).toBe('مرحبا');
  });
});

describe('SRS', () => {
  it('moves through learning steps and graduates', () => {
    const now = 0;
    let c = newCard('x', now);
    c = review(c, 'good', now);
    expect(c.step).toBe(1);
    c = review(c, 'good', now);
    expect(c.step).toBe(-1);
    expect(c.interval).toBe(1);
    c = review(c, 'again', now);
    expect(c.ease).toBeCloseTo(2.3);
    expect(c.step).toBe(0);
  });
  it('marks mastered at 21+ days', () => {
    expect(isMastered({ ...newCard('x', 0), step: -1, interval: 21 })).toBe(true);
  });
});

describe('unlocking', () => {
  const base: ProgressInput = {
    validDays: [1, 2, 3, 8],
    weekOf: (d) => Math.ceil(d / 7),
    completedDays: new Set(),
    weekTests: {},
    passMark: 0.8,
    unlockAll: false,
  };
  it('needs the previous day', () => {
    expect(isDayUnlocked(1, base)).toBe(true);
    expect(isDayUnlocked(2, base)).toBe(false);
    expect(isDayUnlocked(2, { ...base, completedDays: new Set([1]) })).toBe(true);
  });
  it('needs the week test at 80% for a new week', () => {
    const p = { ...base, completedDays: new Set([1, 2, 3]) };
    expect(isDayUnlocked(8, p)).toBe(false);
    expect(isDayUnlocked(8, { ...p, weekTests: { 1: 0.7 } })).toBe(false);
    expect(isDayUnlocked(8, { ...p, weekTests: { 1: 0.8 } })).toBe(true);
  });
  it('skips invalid days and honours unlock-all', () => {
    expect(isDayUnlocked(5, base)).toBe(false);
    expect(isDayUnlocked(3, { ...base, unlockAll: true })).toBe(true);
    expect(nextDay({ ...base, completedDays: new Set([1]) })).toBe(2);
  });
});

describe('answers', () => {
  it('matches ignoring harakat, case and punctuation', () => {
    expect(answersMatch('مرحبا', 'مَرْحَبًا')).toBe(true);
    expect(answersMatch('Hello!', 'hello')).toBe(true);
    expect(normaliseAnswer('إِلَى')).toBe('الي');
  });
  it('shuffles deterministically', () => {
    expect(seededShuffle([1, 2, 3, 4], 5)).toEqual(seededShuffle([1, 2, 3, 4], 5));
  });
});
