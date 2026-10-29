// Rule-based transliteration of fully vocalised Modern Standard Arabic.
// Pure and deterministic. It reads exactly what the harakat say and never guesses a vowel:
// a consonant with no mark gets no vowel. Style "academic" follows ALA-LC conventions
// (ā ī ū, ḥ ṣ ḍ ṭ ẓ, ʿ ʾ, sh kh th dh gh, al- with sun-letter assimilation);
// style "simple" uses plain ASCII-friendly letters (aa ii uu, ' for ʿ and ʾ).

import {
  DAGGER_ALIF,
  DAMMA,
  DAMMATAN,
  FATHA,
  FATHATAN,
  KASRA,
  KASRATAN,
  SHADDA,
  SUKUN,
  SUN_LETTERS,
  isLetter,
  isMark,
  stripHarakat,
  toWesternDigits,
} from './arabic';

export type TranslitStyle = 'academic' | 'simple';

const CONSONANTS: Record<string, string> = {
  ب: 'b',
  ت: 't',
  ث: 'th',
  ج: 'j',
  ح: 'ḥ',
  خ: 'kh',
  د: 'd',
  ذ: 'dh',
  ر: 'r',
  ز: 'z',
  س: 's',
  ش: 'sh',
  ص: 'ṣ',
  ض: 'ḍ',
  ط: 'ṭ',
  ظ: 'ẓ',
  ع: 'ʿ',
  غ: 'gh',
  ف: 'f',
  ق: 'q',
  ك: 'k',
  ل: 'l',
  م: 'm',
  ن: 'n',
  ه: 'h',
  و: 'w',
  ي: 'y',
  ء: 'ʾ',
  أ: 'ʾ',
  إ: 'ʾ',
  ؤ: 'ʾ',
  ئ: 'ʾ',
  ة: 't',
};

const VOWEL: Record<string, string> = {
  [FATHA]: 'a',
  [DAMMA]: 'u',
  [KASRA]: 'i',
  [FATHATAN]: 'an',
  [DAMMATAN]: 'un',
  [KASRATAN]: 'in',
};

const PUNCT: Record<string, string> = { '،': ',', '؟': '?', '؛': ';', '«': '"', '»': '"', '٪': '%' };

/** Words whose reading cannot be derived from their spelling. Keyed by the unvocalised form. */
export const FIXED_TRANSLIT: Record<string, string> = {
  الله: 'allāh',
  اللّه: 'allāh',
};

interface Unit {
  ch: string;
  marks: string;
}

function parseUnits(word: string): Unit[] {
  const units: Unit[] = [];
  for (const ch of word) {
    if (ch === 'ـ' || ch === '\u200D' || ch === '\u200C') continue;
    if (isMark(ch)) {
      if (units.length) units[units.length - 1].marks += ch;
      continue;
    }
    units.push({ ch, marks: '' });
  }
  return units;
}

const vowelOf = (marks: string) => {
  for (const m of marks) if (VOWEL[m]) return VOWEL[m];
  return '';
};
const hasVowel = (marks: string) => vowelOf(marks) !== '';
const has = (marks: string, m: string) => marks.includes(m);

export interface WordTranslit {
  text: string;
  /** The first vowel is a hamzat al-wasl / article vowel that drops after a vowel. */
  wasl: boolean;
}

/** Transliterate one Arabic word (no spaces). Always returns academic letters. */
export function translitWord(word: string): WordTranslit {
  const fixed = FIXED_TRANSLIT[stripHarakat(word)];
  if (fixed) return { text: fixed, wasl: true };

  const u = parseUnits(word);
  let out = '';
  let i = 0;
  let wasl = false;
  let suppressShaddaAt = -1;
  let afterPrefix = false;

  const isWaslAlif = (x?: Unit) => !!x && (x.ch === 'ا' || x.ch === 'ٱ');
  const lamOk = (x?: Unit) => !!x && x.ch === 'ل' && (x.marks === '' || x.marks === SUKUN);
  const articleAt = (k: number) =>
    isWaslAlif(u[k]) && (u[k].marks === '' || u[k].marks === FATHA) && lamOk(u[k + 1]) && u.length > k + 2;

  const article = (k: number) => {
    const next = u[k + 2];
    if (SUN_LETTERS.has(next.ch) && has(next.marks, SHADDA)) {
      suppressShaddaAt = k + 2;
      return 'a' + CONSONANTS[next.ch] + '-';
    }
    return 'al-';
  };

  if (articleAt(0)) {
    out = article(0);
    i = 2;
    wasl = true;
    afterPrefix = true;
  } else if (u.length > 4 && 'وفبك'.includes(u[0].ch) && (u[0].marks === FATHA || u[0].marks === KASRA) && articleAt(1)) {
    // wa-/fa-/bi-/ka- + article: the article's a is elided (wa-l-kitāb, bi-sh-shāriʿ)
    out = CONSONANTS[u[0].ch] + vowelOf(u[0].marks) + '-' + article(1).slice(1);
    i = 3;
    afterPrefix = true;
  } else if (u.length > 2 && 'وف'.includes(u[0].ch) && u[0].marks === FATHA && 'أإآ'.includes(u[1].ch)) {
    // wa-/fa- before a word starting with hamza: wa-anta, fa-ana
    out = CONSONANTS[u[0].ch] + 'a-';
    i = 1;
    afterPrefix = true;
  } else if (u.length > 3 && u[0].ch === 'ل' && u[0].marks === KASRA && lamOk(u[1])) {
    // li- + article: li-l-kitāb, li-sh-shams
    const next = u[2];
    if (SUN_LETTERS.has(next.ch) && has(next.marks, SHADDA)) {
      suppressShaddaAt = 2;
      out = 'li-' + CONSONANTS[next.ch] + '-';
    } else out = 'li-l-';
    i = 2;
    afterPrefix = true;
  } else if (isWaslAlif(u[0]) && u.length > 2 && (u[0].marks === '' || u[0].marks === KASRA || u[0].marks === DAMMA)) {
    // hamzat al-wasl on a verb or noun such as ism, ibn, ithnān
    out = u[0].marks === DAMMA ? 'u' : 'i';
    i = 1;
    wasl = true;
  }

  const start = i;
  for (; i < u.length; i++) {
    const { ch, marks } = u[i];
    const prev = u[i - 1];
    const last = out.slice(-1);
    const atStart = i === start;

    if (!isLetter(ch)) {
      out += ch;
      continue;
    }

    if (ch === 'ا' || ch === 'ٱ') {
      if (has(marks, FATHATAN)) out += 'an';
      else if (
        i === 1 &&
        marks === '' &&
        'وفبلك'.includes(u[0].ch) &&
        /^[aiu]$/.test(vowelOf(u[0].marks)) &&
        u[2] &&
        has(u[2].marks, SUKUN)
      )
        out += '-'; // hamzat al-wasl after a one-letter prefix: wa-smuki
      else if (out.endsWith('an') && prev && has(prev.marks, FATHATAN)) {
        /* alif carrying the tanween of the previous letter: silent */
      } else if (i === u.length - 1 && prev && prev.ch === 'و' && (out.endsWith('ū') || out.endsWith('w'))) {
        /* silent alif after plural waw */
      } else if (atStart && hasVowel(marks)) out += vowelOf(marks);
      else if (last === 'a') out = out.slice(0, -1) + 'ā';
      else out += 'ā';
      continue;
    }

    if (ch === 'آ') {
      out += (atStart ? '' : 'ʾ') + 'ā';
      continue;
    }

    if (ch === 'ى') {
      if (has(marks, FATHATAN)) out += 'an';
      else if (last === 'a') out = out.slice(0, -1) + 'ā';
      else out += 'ā';
      continue;
    }

    if (ch === 'ة') {
      if (hasVowel(marks)) out += 't' + vowelOf(marks);
      else if (last === 'ā') out += 'h';
      else if (last !== 'a') out += 'a';
      continue;
    }

    if (ch === 'و' && !hasVowel(marks) && !has(marks, SHADDA)) {
      if (last === 'u') out = out.slice(0, -1) + 'ū';
      else if (last === 'a' || atStart || has(marks, SUKUN)) out += 'w';
      else out += 'ū';
      continue;
    }

    if (ch === 'ي' && !hasVowel(marks)) {
      if (has(marks, SHADDA)) {
        // nisba ending in pause: miṣrī; otherwise a doubled y
        if (i === u.length - 1 && last === 'i') out = out.slice(0, -1) + 'ī';
        else out += 'yy';
        continue;
      }
      if (last === 'i') out = out.slice(0, -1) + 'ī';
      else if (last === 'a' || atStart || has(marks, SUKUN)) out += 'y';
      else out += 'ī';
      continue;
    }

    // ordinary consonant (including hamza seats)
    let c = CONSONANTS[ch] ?? '';
    const hamza = 'أإؤئء'.includes(ch);
    if (hamza && (atStart || (afterPrefix && i === start))) c = '';
    if (has(marks, SHADDA) && i !== suppressShaddaAt) c = c + c;
    out += c;
    if (has(marks, DAGGER_ALIF)) out += 'ā';
    else if (hasVowel(marks)) out += vowelOf(marks);
    else if (ch === 'إ') out += 'i';
  }

  return { text: out, wasl };
}

const ACADEMIC_TO_SIMPLE: [RegExp, string][] = [
  [/ā/g, 'aa'],
  [/ī/g, 'ii'],
  [/ū/g, 'uu'],
  [/Ā/g, 'Aa'],
  [/Ī/g, 'Ii'],
  [/Ū/g, 'Uu'],
  [/ḥ/g, 'h'],
  [/ṣ/g, 's'],
  [/ḍ/g, 'd'],
  [/ṭ/g, 't'],
  [/ẓ/g, 'z'],
  [/Ḥ/g, 'H'],
  [/Ṣ/g, 'S'],
  [/Ḍ/g, 'D'],
  [/Ṭ/g, 'T'],
  [/Ẓ/g, 'Z'],
  [/[ʿʾ]/g, "'"],
];

export function toStyle(academic: string, style: TranslitStyle) {
  if (style === 'academic') return academic;
  let s = academic;
  for (const [re, rep] of ACADEMIC_TO_SIMPLE) s = s.replace(re, rep);
  return s;
}

export function capitalise(s: string) {
  return s.replace(/^([ʾʿ'"\-]*)(\p{L})/u, (_, pre: string, ch: string) => pre + ch.toUpperCase());
}

/** Capitalise a name: after any prefix and article it is the noun that takes the capital (al-Qāhira). */
export function capitaliseName(s: string) {
  const m = /^((?:[wfbkl][ai]-)?(?:(?:a|i)?(?:l|sh|th|dh|[tdrzsnṣḍṭẓ])-)?)(.*)$/u.exec(s);
  return m ? m[1] + capitalise(m[2]) : capitalise(s);
}

const WORD_RE = /[\u0621-\u065F\u0670\u0671\u0640]+/y;

export interface TranslitOptions {
  style?: TranslitStyle;
  /** Capitalise the first word and every word after . ! ? */
  sentence?: boolean;
  /** Indexes of words (in order) that are names and get a capital letter. */
  names?: number[];
}

/**
 * Transliterate a whole Arabic text. Latin text and digits pass through; Arabic-Indic digits
 * become Western digits; Arabic punctuation becomes Latin punctuation. Across words, the vowel
 * of the article or of hamzat al-wasl drops after a vowel (ṣabāḥu n-nūr, mā smuk).
 */
export function translit(text: string, opts: TranslitOptions = {}): string {
  const style = opts.style ?? 'academic';
  const names = new Set(opts.names ?? []);
  let out = '';
  let prevEndsVowel = false;
  let wordIndex = 0;
  let sentenceStart = opts.sentence ?? true;
  let i = 0;
  while (i < text.length) {
    WORD_RE.lastIndex = i;
    const m = WORD_RE.exec(text);
    if (m && m.index === i) {
      const { text: w0, wasl } = translitWord(m[0]);
      let w = w0;
      if (wasl && prevEndsVowel && /^[aiu]/.test(w)) w = w.slice(1);
      if (names.has(wordIndex)) w = capitaliseName(w);
      if (sentenceStart) w = capitalise(w);
      sentenceStart = false;
      out += w;
      prevEndsVowel = /[aiuāīū]$/.test(w0);
      wordIndex++;
      i += m[0].length;
      continue;
    }
    const ch = text[i];
    const mapped = PUNCT[ch] ?? toWesternDigits(ch);
    if (/[.!?\u061F]/.test(ch)) sentenceStart = opts.sentence ?? true;
    if (!/\s/.test(ch)) prevEndsVowel = false;
    out += mapped.replace(/[\u2066-\u2069\u200D\u200C]/g, '');
    i++;
  }
  return toStyle(out, style);
}
