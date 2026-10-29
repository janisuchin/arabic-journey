// Answer matching and quiz helpers. Pure.

import { stripHarakat, toWesternDigits } from './arabic';

/** Normalise an answer: harakat-insensitive for Arabic, case/punctuation-insensitive for Latin. */
export function normaliseAnswer(s: string): string {
  return toWesternDigits(stripHarakat(s))
    .normalize('NFKD')
    .replace(/[\u0300-\u036f\u0653-\u0655]/g, '')
    .replace(/[\u0623\u0625\u0622\u0671]/g, 'ا')
    .replace(/ى(?=\s|$)/g, 'ي')
    .replace(/[.,!?\u061F\u060C\u061B:;"'ʿʾ\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export const answersMatch = (given: string, expected: string | string[]) =>
  (Array.isArray(expected) ? expected : [expected]).some((e) => normaliseAnswer(e) === normaliseAnswer(given));

/** Deterministic shuffle (mulberry32) so tests and screenshots are stable. */
export function seededShuffle<T>(items: T[], seed: number): T[] {
  const a = [...items];
  let t = seed >>> 0;
  const rand = () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function score(correct: number, total: number) {
  return total === 0 ? 0 : correct / total;
}
