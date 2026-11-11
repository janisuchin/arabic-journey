// Speaking lab engine: compare what a speech recogniser heard with the model sentence, word by word. Pure.
//
// Honest by design: recognisers write unvocalised Arabic and often normalise spelling, so the comparison ignores
// harakat and the spelling variants listed below. A match only means the recogniser wrote that word; it is not a
// pronunciation score and says nothing about individual sounds.

import { stripHarakat, toWesternDigits } from './arabic';

/**
 * Normalise one Arabic word for comparison: no harakat or tatweel, every alif form → ا, ة → ه, final ى → ي,
 * hamza seats ؤ → و and ئ → ي, Arabic-Indic digits → 0–9, no punctuation.
 */
export function speechKey(word: string): string {
  return toWesternDigits(stripHarakat(word))
    .replace(/[⁦-⁩‌‍]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[.,!?؟،؛:;"'«»()\-–—…]/g, '')
    .toLowerCase()
    .trim();
}

/** Split a sentence into words (whitespace; punctuation-only tokens dropped). */
export function speechWords(text: string): string[] {
  return text
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => speechKey(w).length > 0);
}

export interface SpeechPart {
  /** the model's word (for same/missing) or the heard word (for extra) */
  text: string;
  kind: 'same' | 'missing' | 'extra';
}

export interface SpeechCheck {
  parts: SpeechPart[];
  /** model words the recogniser wrote */
  matched: number;
  /** model words in total */
  total: number;
}

/** Word-level comparison (longest common subsequence) of the model sentence with a transcript. */
export function compareSpeech(model: string, heard: string): SpeechCheck {
  const a = speechWords(model);
  const b = speechWords(heard);
  const ka = a.map(speechKey);
  const kb = b.map(speechKey);
  const n = a.length;
  const m = b.length;
  const L: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--) L[i][j] = ka[i] === kb[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const parts: SpeechPart[] = [];
  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && ka[i] === kb[j]) {
      parts.push({ text: a[i], kind: 'same' });
      i++;
      j++;
    } else if (i < n && (j >= m || L[i + 1][j] >= L[i][j + 1])) {
      parts.push({ text: a[i], kind: 'missing' });
      i++;
    } else {
      parts.push({ text: b[j], kind: 'extra' });
      j++;
    }
  }
  return { parts, matched: L[0][0], total: n };
}
