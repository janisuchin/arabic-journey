// Rule-based transliteration of fully vocalised Modern Standard Arabic.
// Pure and deterministic. It reads exactly what the harakat say and never guesses a vowel:
// a consonant with no mark gets no vowel. Style "academic" follows ALA-LC conventions
// (ā ī ū, ḥ ṣ ḍ ṭ ẓ, ʿ ʾ, sh kh th dh gh, al- with sun-letter assimilation);
// style "simple" uses plain ASCII-friendly letters (aa ii uu, ' for ʿ and ʾ).

import {
  DAGGER_ALIF,
  ENDS_TANWIN,
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
  للخسارة: 'la-l-khasāra', // yā la-l-khasāra: the la- of exclamation before the article
};
/** Words written with a letter that is not said (the wāw of أُولٰئِكَ), without the case vowel; no waṣl. */
const SILENT_LETTER_TRANSLIT: Record<string, string> = {
  أولئك: 'ulāʾik',
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
  // Fragments written with a tatweel: ending ـِي -> -ī, prefix/stem الـ -> al-, كَتَبْـ -> katab-
  if (word.length > 1 && word.startsWith('ـ')) {
    // a stand-in bāʾ carries the vowel (not tāʾ, which would read t+h as t·h before an ending -hu)
    const t = translitWord('ب' + word.slice(1)).text;
    return { text: '-' + t.slice(1), wasl: false };
  }
  if (word.length > 1 && word.endsWith('ـ')) {
    const stem = word.slice(0, -1);
    if (stripHarakat(stem) === 'ال') return { text: 'al-', wasl: true };
    return { text: translitWord(stem).text + '-', wasl: false };
  }
  // a hamza seat shown on its own is the hamza: ʾ (like ء)
  if (/^[أإؤئ]$/.test(word)) return { text: 'ʾ', wasl: false };
  const silent = SILENT_LETTER_TRANSLIT[stripHarakat(word)];
  if (silent) return { text: silent + vowelOf(parseUnits(word).at(-1)?.marks ?? ''), wasl: false };
  const fixed = FIXED_TRANSLIT[stripHarakat(word)];
  if (fixed) {
    // the case vowel written on the last letter is read inside a phrase: Allāhu yusallimuki
    const lastMarks = parseUnits(word).at(-1)?.marks ?? '';
    return { text: fixed + vowelOf(lastMarks), wasl: true };
  }

  const u = parseUnits(word);
  let out = '';
  let i = 0;
  let wasl = false;
  let suppressShaddaAt = -1;
  let afterPrefix = false;

  const isWaslAlif = (x?: Unit) => !!x && (x.ch === 'ا' || x.ch === 'ٱ');
  const lamOk = (x?: Unit) => !!x && x.ch === 'ل' && (x.marks === '' || x.marks === SUKUN);
  /** al- before a noun that itself starts with hamzat al-waṣl: the lām takes a kasra (الِاسْتِفْهَام). */
  const lamKasraWasl = (k: number) =>
    !!u[k] && u[k].ch === 'ل' && u[k].marks === KASRA && isWaslAlif(u[k + 1]) && u[k + 1].marks === '' && u.length > k + 2;
  /** The lām of the article at k (after its alif, or after li-): returns the article text and where the noun starts. */
  const lamArticle = (k: number): { text: string; next: number } | null => {
    if (lamKasraWasl(k)) return { text: 'l-i', next: k + 2 };
    if (!lamOk(u[k]) || u.length <= k + 1) return null;
    const next = u[k + 1];
    if (SUN_LETTERS.has(next.ch) && has(next.marks, SHADDA)) {
      suppressShaddaAt = k + 1;
      return { text: CONSONANTS[next.ch] + '-', next: k + 1 };
    }
    return { text: 'l-', next: k + 1 };
  };
  const articleAt = (k: number) =>
    isWaslAlif(u[k]) &&
    (u[k].marks === '' || u[k].marks === FATHA) &&
    (lamOk(u[k + 1]) || lamKasraWasl(k + 1)) &&
    u.length > k + 2;
  const prefixVowel = (x?: Unit) => !!x && (x.marks === FATHA || x.marks === KASRA);
  const proclitic = (k: number) => CONSONANTS[u[k].ch] + vowelOf(u[k].marks) + '-';

  // one or two proclitics before the article: wa-l-, bi-sh-, wa-bi-l-, wa-li-r-rajuli, fa-li-l-
  let k = 0;
  let pre = '';
  if (u.length > 3 && 'وف'.includes(u[0].ch) && u[0].marks === FATHA && ('بك'.includes(u[1].ch) || u[1].ch === 'ل')) {
    const inner = u[1];
    if (
      prefixVowel(inner) &&
      ((inner.ch !== 'ل' && articleAt(2)) || (inner.ch === 'ل' && inner.marks === KASRA && lamOk(u[2])))
    ) {
      pre = proclitic(0);
      k = 1;
    }
  }

  if (k === 0 && isWaslAlif(u[0]) && u[0].marks === '' && u[1]?.ch === 'ل' && has(u[1].marks, SHADDA)) {
    // relative pronouns alladhī, allatī, alladhīna: the waṣla vowel is a (like the article)
    out = 'a';
    i = 1;
    wasl = true;
  } else if (k === 0 && articleAt(0)) {
    const art = lamArticle(1)!;
    out = 'a' + art.text;
    i = art.next;
    wasl = true;
    afterPrefix = true;
  } else if (u.length > k + 3 && 'وفبك'.includes(u[k].ch) && prefixVowel(u[k]) && articleAt(k + 1)) {
    // (wa-) wa-/fa-/bi-/ka- + article: the article's a is elided (wa-l-kitāb, bi-sh-shāriʿ, wa-bi-l-ashjār)
    const art = lamArticle(k + 2)!;
    out = pre + proclitic(k) + art.text;
    i = art.next;
    afterPrefix = true;
  } else if (u.length > k + 2 && u[k].ch === 'ل' && u[k].marks === KASRA && (lamOk(u[k + 1]) || lamKasraWasl(k + 1))) {
    // (wa-) li- + article: li-l-kitāb, li-sh-shams, wa-li-r-rajuli
    const art = lamArticle(k + 1)!;
    out = pre + 'li-' + art.text;
    i = art.next;
    afterPrefix = true;
  } else if (u.length > 2 && 'وف'.includes(u[0].ch) && u[0].marks === FATHA && 'أإآ'.includes(u[1].ch)) {
    // wa-/fa- before a word starting with hamza: wa-anta, fa-ana
    out = CONSONANTS[u[0].ch] + 'a-';
    i = 1;
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
        (has(u[2].marks, SUKUN) || has(u[2].marks, SHADDA))
      )
        out += '-'; // hamzat al-wasl after a one-letter prefix: wa-smuki, wa-ttaṣala
      else if (marks === '' && prev && has(prev.marks, KASRA) && u[i + 1]?.ch === 'ئ') {
        /* the old spelling مِائَة: the alif is silent (miʾa) */
      } else if (out.endsWith('an') && prev && has(prev.marks, FATHATAN)) {
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
      else if (prev && has(prev.marks, FATHATAN)) {
        /* tanwīn written on the letter before: maqhan, liḥan */
      } else if (last === 'a') out = out.slice(0, -1) + 'ā';
      else out += 'ā';
      continue;
    }

    if (ch === 'ة') {
      // ة before a suffix is a spelling mistake (غُرْفَةِي): show it as written, ghurfa-ī
      if (i < u.length - 1 && isLetter(u[i + 1].ch)) out += (last === 'a' ? '' : 'a') + '-' + vowelOf(marks);
      else if (hasVowel(marks)) out += 't' + vowelOf(marks);
      else if (last === 'ā') out += 'h';
      else if (last !== 'a') out += 'a';
      continue;
    }

    if (ch === 'و' && !hasVowel(marks) && !has(marks, SHADDA)) {
      if (last === 'u') out = out.slice(0, -1) + 'ū';
      // a consonant after a, ā or a vowelless letter: yawm, wāw, ḥulw, badw
      else if (last === 'a' || last === 'ā' || atStart || has(marks, SUKUN) || (prev && has(prev.marks, SUKUN))) out += 'w';
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
      // a consonant after a, ā or a vowelless letter: bayt, shāy, zāy, raʾy, nafy
      else if (last === 'a' || last === 'ā' || atStart || has(marks, SUKUN) || (prev && has(prev.marks, SUKUN))) out += 'y';
      else out += 'ī';
      continue;
    }

    // ordinary consonant (including hamza seats)
    let c = CONSONANTS[ch] ?? '';
    const hamza = 'أإؤئء'.includes(ch);
    if (hamza && (atStart || (afterPrefix && i === start))) c = '';
    // s+h, k+h, d+h, t+h are two letters, not sh, kh, dh, th: as·halu
    if (ch === 'ه' && prev && 'سكدت'.includes(prev.ch) && !hasVowel(prev.marks)) c = '·' + c;
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
  if (s.startsWith('-')) return s; // an ending shown on its own (-hu, -ī) is not a sentence
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
  let prevTanwin = false;
  let i = 0;
  while (i < text.length) {
    WORD_RE.lastIndex = i;
    const m = WORD_RE.exec(text);
    if (m && m.index === i) {
      const { text: w0, wasl } = translitWord(m[0]);
      let w = w0;
      if (wasl && prevEndsVowel && /^[aiu]/.test(w)) {
        w = w.slice(1);
        // tanwīn before hamzat al-waṣl takes a helping kasra: jiddani l-yawma
        if (prevTanwin) out = out.replace(/(\s+)$/, 'i$1');
      }
      if (names.has(wordIndex)) w = capitaliseName(w);
      if (sentenceStart) w = capitalise(w);
      sentenceStart = false;
      out += w;
      prevTanwin = ENDS_TANWIN.test(m[0]);
      prevEndsVowel = /[aiuāīū]$/.test(w0) || prevTanwin;
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
