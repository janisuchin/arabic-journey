/**
 * Word-only dictionary: 5,000 common Modern Standard Arabic words (English Wiktionary via kaikki.org, ranked by an
 * OpenSubtitles frequency list, AI-reviewed; CC BY-SA 4.0 — built by scripts/build-dictionary.py).
 * Loaded on first use. Transliteration comes from the app's own engine, so it always matches the course.
 */
import { normaliseAnswer } from '../core/answer';
import { translit } from '../core/translit';

export interface DictWord {
  /** fully vocalised headword; verbs in the past tense he-form (كَتَبَ), as in Arabic dictionaries */
  ar: string;
  en: string;
  pos: string;
  gender: '' | 'm' | 'f';
  plural: string;
  /** verbs: present tense he-form (يَكْتُبُ) */
  present: string;
  /** also taught in the 90-day course */
  course: boolean;
  /** 1 = most frequent */
  rank: number;
}

type Row = [string, string, string, string, string, string, number];

let cache: DictWord[] | null = null;

export function dictionary(): DictWord[] {
  if (cache) return cache;
  const doc = require('../../content/dictionary/words.json') as { words: Row[] };
  cache = doc.words.map(([ar, en, pos, gender, plural, present, course], i) => ({
    ar,
    en,
    pos,
    gender: gender === 'm' || gender === 'f' ? gender : '',
    plural,
    present,
    course: course === 1,
    rank: i + 1,
  }));
  return cache;
}

interface Keys {
  ar: string[];
  tr: string[];
  en: string;
}
let keys: Keys[] | null = null;

/** Latin search key: no macrons, dots, ʿ/ʾ or hyphens ("kitab" finds kitāb; "salam" finds salām). */
export const latinKey = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ʿʾ'`’‘\-]/g, '')
    .replace(/[^a-z ]/g, '')
    .trim();

function searchKeys(): Keys[] {
  if (keys) return keys;
  keys = dictionary().map((w) => {
    const forms = [w.ar, w.present, w.plural].filter(Boolean);
    return {
      ar: forms.map(normaliseAnswer),
      tr: [
        ...new Set(
          forms.flatMap((f) => [
            latinKey(translit(f, { sentence: false })),
            latinKey(translit(f, { style: 'simple', sentence: false })),
          ]),
        ),
      ],
      en: w.en.toLowerCase(),
    };
  });
  return keys;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Search by Arabic (with or without harakat), transliteration or English. Exact matches first, then words that
 * start with the search, then the rest; frequency order inside each group.
 */
export function searchDictionary(q: string, limit = 100): DictWord[] {
  const words = dictionary();
  const query = q.trim();
  if (!query) return words.slice(0, limit);
  const k = searchKeys();
  const arabic = /[؀-ۿ]/.test(query);
  const scored: { w: DictWord; s: number }[] = [];
  if (arabic) {
    const n = normaliseAnswer(query);
    words.forEach((w, i) => {
      const f = k[i].ar;
      const s = f.includes(n) ? 0 : f.some((x) => x.startsWith(n)) ? 1 : f.some((x) => x.includes(n)) ? 2 : -1;
      if (s >= 0) scored.push({ w, s });
    });
  } else {
    const lower = query.toLowerCase();
    const p = latinKey(query);
    const wordRe = new RegExp(`(^|[^a-z])${escape(lower)}([^a-z]|$)`);
    // a whole meaning: "book", "a book", "to write", or the course's "writes"; meanings split by ; or ,
    const meaningRe = new RegExp(`(^|[;,] )(to |a |an |the )?${escape(lower)}(e?s)?($|[;,]| \\()`);
    words.forEach((w, i) => {
      const { tr, en } = k[i];
      let s = -1;
      if (meaningRe.test(en)) s = 0;
      else if (p && tr.includes(p)) s = 0;
      else if (wordRe.test(en)) s = 1;
      else if (p.length > 1 && tr.some((t) => t.startsWith(p))) s = 2;
      else if (lower.length > 3 && en.includes(lower)) s = 3;
      if (s >= 0) scored.push({ w, s });
    });
  }
  return scored
    .sort((a, b) => a.s - b.s || a.w.rank - b.w.rank)
    .slice(0, limit)
    .map((x) => x.w);
}
