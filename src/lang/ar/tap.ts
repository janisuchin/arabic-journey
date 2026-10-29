// Arabic language pack: the only language-specific glue between content, engines and the UI.
// Tokens are whole words: a word is never split inside, so letters keep their joined shapes.

import {
  SCRIPT_RE,
  SHADDA,
  SUKUN,
  ZWJ,
  hasScript,
  isLetter,
  isMark,
  joinsNext,
  stripHarakat,
  toWesternDigits,
} from '../../core/arabic';
import { numberToArabic, numberToEnglish } from '../../core/numbers';
import { capitalise, capitaliseName, toStyle, translitWord, type TranslitStyle } from '../../core/translit';
import {
  autoGlossary,
  course,
  days,
  handGlossary,
  letters,
  pronunciation,
  readingsLayer,
  scenarios,
  vocabulary,
} from '../../content';
import type { Seg, Vocab } from '../../content/schema';

export { SCRIPT_RE, hasScript };

export type TokenKind = 'ar' | 'num' | 'latin' | 'space' | 'punct';
export interface Token {
  kind: TokenKind;
  text: string;
}

const AR_WORD = /[\u0621-\u065F\u0670\u0671\u0640\u200D]+/y;
const DIGITS = /[0-9\u0660-\u0669]+(?:[.,:][0-9\u0660-\u0669]+)*/y;
const LATIN = /[A-Za-zÀ-ɏḀ-ỿʿʾ'’]+(?:-[A-Za-zÀ-ɏḀ-ỿʿʾ]+)*/y;
const SPACE = /\s+/y;

/** Split text into runs. Arabic words stay whole; digits glued to an Arabic word join it. */
export function splitRuns(text: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  const at = (re: RegExp) => {
    re.lastIndex = i;
    const m = re.exec(text);
    return m && m.index === i ? m[0] : null;
  };
  while (i < text.length) {
    let m: string | null;
    if ((m = at(AR_WORD))) out.push({ kind: 'ar', text: m });
    else if ((m = at(DIGITS))) out.push({ kind: 'num', text: m });
    else if ((m = at(LATIN))) out.push({ kind: 'latin', text: m });
    else if ((m = at(SPACE))) out.push({ kind: 'space', text: m });
    else out.push({ kind: 'punct', text: (m = text[i]) });
    i += m.length;
  }
  // digits directly followed by an Arabic word belong to that word's run
  for (let k = 0; k < out.length - 1; k++)
    if (out[k].kind === 'num' && out[k + 1].kind === 'ar') {
      out[k] = { kind: 'ar', text: out[k].text + out[k + 1].text };
      out.splice(k + 1, 1);
    }
  return out;
}

export const arabicWords = (text: string) =>
  splitRuns(text)
    .filter((t) => t.kind === 'ar')
    .map((t) => t.text);

// ---------------------------------------------------------------- transliteration

/** Transliterate a sequence of words, applying cross-word elision (ṣabāḥu n-nūr). */
export function translitWords(
  words: string[],
  style: TranslitStyle,
  opts: { names?: Set<number>; capitaliseFirst?: boolean; startsAfterVowel?: boolean } = {},
): string[] {
  let prevVowel = opts.startsAfterVowel ?? false;
  return words.map((w, i) => {
    const fromLayer = readingsLayer[w];
    const { text, wasl } = fromLayer ? { text: fromLayer[0], wasl: fromLayer[1] === 1 } : translitWord(w);
    let t = text;
    if (wasl && prevVowel && /^[aiu]/.test(t)) t = t.slice(1);
    if (opts.names?.has(i)) t = capitaliseName(t);
    if (i === 0 && opts.capitaliseFirst) t = capitalise(t);
    prevVowel = /[aiuāīū]$/.test(text);
    return toStyle(t, style);
  });
}

/** Per-token transliteration for a token list (non-Arabic tokens map to themselves). */
export function tapTokens(text: string, style: TranslitStyle, names?: Set<string>) {
  const runs = splitRuns(text);
  const arIdx: number[] = [];
  runs.forEach((t, i) => t.kind === 'ar' && arIdx.push(i));
  const words = arIdx.map((i) => runs[i].text);
  const nameIdx = new Set(words.map((w, i) => (names?.has(w) ? i : -1)).filter((i) => i >= 0));
  // elision only between words separated by a plain space
  const tr: string[] = [];
  let prevEndsVowel = false;
  words.forEach((w, k) => {
    const i = arIdx[k];
    const between = k > 0 ? runs.slice(arIdx[k - 1] + 1, i) : [];
    const plainGap = k > 0 && between.every((t) => t.kind === 'space');
    const sentenceStart = k === 0 || between.some((t) => /[.!?\u061F]/.test(t.text));
    const [t] = translitWords([w], style, {
      names: nameIdx.has(k) ? new Set([0]) : undefined,
      capitaliseFirst: sentenceStart,
      startsAfterVowel: plainGap && prevEndsVowel,
    });
    tr.push(t);
    prevEndsVowel = /[aiuāīū]$/.test(translitWord(w).text);
  });
  let n = 0;
  return runs.map((t) => ({
    ...t,
    tr: t.kind === 'ar' ? tr[n++] : t.kind === 'num' ? toWesternDigits(t.text) : t.text,
  }));
}

/** Whole-line transliteration, e.g. for the gold transliteration line. */
export function translitLine(text: string, style: TranslitStyle, names?: Set<string>) {
  return tapTokens(text, style, names)
    .map((t) => (t.kind === 'punct' ? (({ '،': ',', '؟': '?', '؛': ';' } as Record<string, string>)[t.text] ?? t.text) : t.tr))
    .join('');
}

// ---------------------------------------------------------------- meanings

let segIndex: Map<string, string> | null = null;
let nameIndex: Set<string> | null = null;

function allSegs(): Seg[] {
  const segs: Seg[] = [];
  for (const d of days) {
    segs.push(...d.titleSegs, ...d.reading.segs);
    for (const s of d.sentences) segs.push(...s.segs);
    for (const l of d.dialogue.lines) segs.push(...l.segs);
  }
  for (const sc of scenarios) for (const l of sc.dialogue.lines) segs.push(...l.segs);
  for (const wk of course?.weeks ?? []) segs.push(...wk.titleSegs);
  return segs;
}

function buildIndexes() {
  segIndex = new Map();
  nameIndex = new Set();
  for (const [t, g, pos] of allSegs()) {
    if (!segIndex.has(t)) segIndex.set(t, g);
    if (pos === 'name') nameIndex.add(t);
  }
}

export function namesSet() {
  if (!nameIndex) buildIndexes();
  return nameIndex!;
}

const vocabExact = new Map(vocabulary.map((v) => [v.ar, v]));
const vocabStripped = new Map<string, Vocab | null>();
for (const v of vocabulary) {
  const k = stripHarakat(v.ar);
  vocabStripped.set(k, vocabStripped.has(k) ? null : v);
}
// plurals and other listed forms of course words
const formMeaning = new Map<string, string>();
for (const v of vocabulary) {
  const base = v.en.split(/[;(]/)[0].trim();
  if (v.plural) formMeaning.set(stripHarakat(v.plural), `${base} (plural)`);
  for (const f of v.forms ?? []) formMeaning.set(stripHarakat(f.ar), `${base} (${f.label})`);
}
// letter names and one-word examples from the letter and pronunciation pages
for (const l of letters) {
  formMeaning.set(stripHarakat(l.nameAr), `the name of the letter ${l.name}`);
  if (!l.example.ar.includes(' ')) formMeaning.set(stripHarakat(l.example.ar), l.example.en);
}
for (const p of pronunciation)
  for (const e of [...p.examples, ...(p.pairs ?? []).flat()])
    if (!e.ar.includes(' ') && !formMeaning.has(stripHarakat(e.ar))) formMeaning.set(stripHarakat(e.ar), e.en);
const letterByChar = new Map(letters.map((l) => [l.char, l]));
const numberWords = new Map<string, number>();
for (let n = 0; n <= 100; n++) numberWords.set(numberToArabic(n), n);

/** The vocabulary entry for a word, if the course teaches it. */
export function vocabOf(word: string): Vocab | undefined {
  return vocabExact.get(word) ?? vocabStripped.get(stripHarakat(word)) ?? undefined;
}

/**
 * Meaning chain: hand glossary → curated segment glosses → course vocabulary → auto glossary
 * (unvocalised, unambiguous) → numbers → single letters. Returns undefined rather than guessing.
 */
export function meaningOf(word: string): string | undefined {
  if (!segIndex) buildIndexes();
  const bare = stripHarakat(word).replace(/\u200D/g, '');
  const hand = handGlossary[word] ?? handGlossary[bare];
  if (hand) return hand;
  const seg = segIndex!.get(word);
  if (seg) return seg;
  const v = vocabOf(word);
  if (v) return v.en;
  if (autoGlossary[bare]) return autoGlossary[bare];
  const form = formMeaning.get(bare);
  if (form) return form;
  const western = toWesternDigits(word);
  if (/^\d+$/.test(western)) return numberToEnglish(Number(western));
  const num = numberWords.get(word);
  if (num !== undefined) return numberToEnglish(num);
  const letter = letterByChar.get(bare);
  if (letter) return `the letter ${letter.name}`;
  return undefined;
}

/** Meaning of a whole phrase if the course has it as a unit (vocabulary or glossary). */
export function phraseMeaning(text: string): string | undefined {
  return vocabExact.get(text)?.en ?? handGlossary[text] ?? handGlossary[stripHarakat(text)];
}

export function exampleFor(word: string) {
  return vocabOf(word)?.example;
}

// ---------------------------------------------------------------- syllables

export interface Syllable {
  /** Arabic piece with ZWJ at joins so letters keep their contextual shape */
  ar: string;
  tr: string;
}

/**
 * Split a vocalised word into syllables (CV, CVV, CVC). The Arabic pieces carry zero-width
 * joiners where the letters connect, so shown apart they still have their joined forms.
 */
export function syllables(word: string, style: TranslitStyle): Syllable[] {
  type U = { ch: string; marks: string };
  const units: U[] = [];
  for (const ch of word) {
    if (ch === 'ـ' || ch === ZWJ) continue;
    if (isMark(ch) && units.length) units[units.length - 1].marks += ch;
    else if (isLetter(ch)) units.push({ ch, marks: '' });
  }
  if (units.length === 0) return [];
  const isLong = (u: U, prev?: U) =>
    !!prev &&
    u.marks.replace(SUKUN, '') === '' &&
    (u.ch === 'ا' || u.ch === 'ى' || ((u.ch === 'و' || u.ch === 'ي') && /[\u064F\u0650]/.test(prev.marks)));
  const closesSyllable = (u: U) => u.marks === SUKUN || (u.marks === '' && !'اوىي'.includes(u.ch)) || u.marks === SHADDA;

  const groups: U[][] = [];
  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    const cur = groups[groups.length - 1];
    if (cur && (isLong(u, units[i - 1]) || (closesSyllable(u) && !/[\u064E-\u0650\u064B-\u064D]/.test(u.marks)))) {
      cur.push(u);
    } else groups.push([u]);
  }
  // keep the article with its first syllable (al-, ash-)
  if (
    groups.length > 1 &&
    groups[0].length === 1 &&
    (groups[0][0].ch === 'ا' || groups[0][0].ch === 'ٱ') &&
    groups[1][0].ch === 'ل'
  )
    groups.splice(0, 2, [...groups[0], ...groups[1]]);

  return groups.map((g, gi) => {
    let ar = g.map((u) => u.ch + u.marks).join('');
    const firstLetter = g[0].ch;
    const lastLetter = g[g.length - 1].ch;
    const prevGroup = groups[gi - 1];
    if (prevGroup && joinsNext(prevGroup[prevGroup.length - 1].ch) && firstLetter !== 'ء') ar = ZWJ + ar;
    if (gi < groups.length - 1 && joinsNext(lastLetter)) ar = ar + ZWJ;
    const raw = g.map((u) => u.ch + u.marks).join('');
    let tr: string;
    if (g.length === 2 && (g[0].ch === 'ا' || g[0].ch === 'ٱ') && g[1].ch === 'ل') tr = 'al';
    else {
      tr = translitWord(raw).text;
      if ('أإؤئء'.includes(firstLetter) && !tr.startsWith('ʾ')) tr = 'ʾ' + tr;
    }
    tr = toStyle(tr, style);
    return { ar, tr };
  });
}

// ---------------------------------------------------------------- word box data

export interface WordInfo {
  word: string;
  tr: string;
  plain: string;
  en?: string;
  vocab?: Vocab;
  example?: { ar: string; en: string };
}

export function wordToken(word: string, style: TranslitStyle, tr?: string, en?: string): WordInfo {
  const vocab = vocabOf(word);
  return {
    word,
    tr: tr ?? translitWords([word], style)[0],
    plain: stripHarakat(word),
    en: en ?? meaningOf(word),
    vocab,
    example: vocab?.example,
  };
}

export const isArabicText = (s: string) => SCRIPT_RE.test(s);
