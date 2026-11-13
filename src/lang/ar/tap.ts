// Arabic language pack: the only language-specific glue between content, engines and the UI.
// Tokens are whole words: a word is never split inside, so letters keep their joined shapes.

import {
  ENDS_TANWIN,
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
  course,
  culture,
  days,
  handGlossary,
  letters,
  mistakeGlossary,
  placards,
  pronunciation,
  readingsLayer,
  scenarios,
  scenes,
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
    const { text, wasl } = readingOf(w);
    let t = text;
    if (wasl && prevVowel && /^[aiu]/.test(t)) t = t.slice(1);
    if (opts.names?.has(i)) t = nameReading(w) ?? capitaliseName(t);
    if (i === 0 && opts.capitaliseFirst) t = capitalise(t);
    prevVowel = endsInVowel(w, text);
    return toStyle(t, style);
  });
}

/** The reading of one word: the offline layer, else the engine; an unvocalised word gets none (never guess). */
function readingOf(w: string): { text: string; wasl: boolean } {
  const fromLayer = readingsLayer[w];
  if (fromLayer) return { text: fromLayer[0], wasl: fromLayer[1] === 1 };
  if (!/[ً-ْٰـ]/.test(w) && stripHarakat(w).replace(/‍/g, '').length > 1) return { text: '', wasl: false };
  return translitWord(w);
}

/** A word ending in a vowel or in tanwīn lets the next article or hamzat al-waṣl elide (jiddan l-yawma). */
const endsInVowel = (w: string, tr: string) => /[aiuāīū]$/.test(tr) || ENDS_TANWIN.test(w);

let bareNames: Set<string> | null = null;
/** A name behind a one-letter clitic keeps its capital and gets a hyphen: wa-Laylā, li-Sāmī, wa-ʿUmar. */
function nameReading(w: string): string | undefined {
  const m = /^([وفلبك])([َِ])(.+)$/.exec(w);
  if (!m) return undefined;
  if (!bareNames) bareNames = new Set([...namesSet()].map((n) => stripHarakat(n)));
  const rest = stripHarakat(m[3]);
  if (rest.length < 2 || rest.startsWith('ال') || !bareNames.has(rest)) return undefined;
  const clitic = ({ و: 'w', ف: 'f', ل: 'l', ب: 'b', ك: 'k' } as Record<string, string>)[m[1]] + (m[2] === 'َ' ? 'a' : 'i');
  return `${clitic}-${capitaliseName(readingOf(m[3]).text)}`;
}

/** Per-token transliteration for a token list (non-Arabic tokens map to themselves). */
export function tapTokens(text: string, style: TranslitStyle, names?: Set<string>, sentence = true) {
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
    const sentenceStart = sentence && (k === 0 || between.some((t) => /[.!?\u061F]/.test(t.text)));
    const [t] = translitWords([w], style, {
      names: nameIdx.has(k) ? new Set([0]) : undefined,
      capitaliseFirst: sentenceStart,
      startsAfterVowel: plainGap && prevEndsVowel,
    });
    tr.push(t);
    prevEndsVowel = endsInVowel(w, readingOf(w).text);
  });
  let n = 0;
  return runs.map((t) => ({
    ...t,
    tr: t.kind === 'ar' ? tr[n++] : t.kind === 'num' ? toWesternDigits(t.text) : t.text,
  }));
}

/**
 * Transliteration of an Arabic run inside English prose: no sentence capital (the run is mid-sentence),
 * a bare letter is named (tāʾ marbūṭa, not its sound table 'a / at'), an unvocalised word gets none.
 */
export function proseTranslit(text: string, style: TranslitStyle) {
  return tapTokens(text, style, namesSet(), false)
    .map((t) => {
      if (t.kind === 'punct') return ({ '،': ',', '؟': '?', '؛': ';' } as Record<string, string>)[t.text] ?? t.text;
      const letter = t.kind === 'ar' && t.text.length === 1 ? letterByChar.get(t.text) : undefined;
      return letter ? toStyle(letter.name, style) : t.tr;
    })
    .join('')
    .trim();
}

/** Whole-line transliteration, e.g. for the gold transliteration line. */
export function translitLine(text: string, style: TranslitStyle, names?: Set<string>) {
  return tapTokens(text, style, names)
    .map((t) => (t.kind === 'punct' ? (({ '،': ',', '؟': '?', '؛': ';' } as Record<string, string>)[t.text] ?? t.text) : t.tr))
    .join('');
}

// ---------------------------------------------------------------- meanings
//
// A tapped word is always looked up by its VOCALISED form. The unvocalised spelling is ambiguous
// (مدرسة = madrasa "school" or mudarrisa "teacher (f)"; شربت = I / you (m) / you (f) / she drank), so it
// is never used to borrow a meaning from another word. A form with different harakat only lends its
// meaning when the two are compatible: no letter has two different vowels, except the case ending of a
// noun, and a missing mark matches anything (pausal الْمَدْرَسَة = الْمَدْرَسَةِ).
// When one form has several glosses in the course, the lesson the learner is in decides (GlossCtx.day),
// then the course dictionary, then the most frequent gloss. Exercise notes ("wrong after inna") live in
// content/glossary/mistakes.json and are shown only inside a mistake card, or for a non-word.

/** Where a tap happens: the lesson day (week tests use the week's last day) and whether it is a mistake card. */
export interface GlossCtx {
  day?: number;
  mistake?: boolean;
}

interface Sense {
  en: string;
  n: number;
  first: number;
  days: Set<number>;
  src: 'seg' | 'vocab' | 'form';
  pos?: string;
}

const MARK_RE = /[ً-ْٰ]/;
const TANWIN_RE = /[ً-ٍ]/;
const isVocalised = (w: string) => MARK_RE.test(w);
const clean = (w: string) => w.replace(/‍/g, '');
/** Exercise notes never leave their own line. */
export const isExerciseNote = (g: string) => /\bwrong\b/i.test(g);
/** Last letters whose vowel marks the person (-tu/-ta/-ti, -ka/-ki). */
const PERSON_END = new Set(['ت', 'ك']);
const SHORT_VOWEL = /^[َُِ]$/;
const NOMINAL_POS = new Set(['noun', 'adj', 'name', 'number', 'demonstrative']);

let exact: Map<string, Sense[]> | null = null;
let bySkeleton: Map<string, string[]> | null = null;
let nameIndex: Set<string> | null = null;
let order = 0;

function addSense(word: string, en: string, src: Sense['src'], pos?: string, day?: number) {
  const w = clean(word);
  if (!w || !en || isExerciseNote(en)) return;
  let list = exact!.get(w);
  if (!list) {
    exact!.set(w, (list = []));
    const k = stripHarakat(w);
    const forms = bySkeleton!.get(k);
    if (forms) forms.push(w);
    else bySkeleton!.set(k, [w]);
  }
  let s = list.find((x) => x.en === en && x.src === src);
  if (!s) list.push((s = { en, n: 0, first: order++, days: new Set(), src, pos }));
  s.n++;
  if (day !== undefined) s.days.add(day);
  if (pos && !s.pos) s.pos = pos;
}

function buildIndexes() {
  exact = new Map();
  bySkeleton = new Map();
  nameIndex = new Set();
  const seg = (list: Seg[], day?: number) => {
    for (const [t, g, pos] of list) {
      addSense(t, g, 'seg', pos, day);
      if (pos === 'name') nameIndex!.add(t);
    }
  };
  for (const d of days) {
    seg([...d.titleSegs, ...d.reading.segs], d.day);
    for (const s of d.sentences) seg(s.segs, d.day);
    for (const l of d.dialogue.lines) seg(l.segs, d.day);
  }
  for (const sc of scenarios) for (const l of sc.dialogue.lines) seg(l.segs);
  for (const wk of course?.weeks ?? []) seg(wk.titleSegs, wk.week * 7);
  for (const p of placards) {
    seg(p.titleSegs);
    for (const it of [...p.items, ...(p.example ? [p.example] : [])]) seg(it.segs);
  }
  for (const c of culture) {
    seg([...c.titleSegs, ...c.reading.segs]);
    for (const s of c.sections) {
      seg(s.titleSegs ?? []);
      for (const x of s.sentences) seg(x.segs);
    }
    for (const w of c.words) seg(w.segs);
  }
  // a one-word scene spot glosses its word; a phrase spot is a unit (phraseMeaning)
  for (const s of scenes) for (const sp of s.spots) if (!sp.ar.includes(' ')) addSense(sp.ar, sp.en, 'seg');
  for (const v of vocabulary) {
    addSense(v.ar, v.en, 'vocab', v.pos);
    const base = v.en.split(/[;(]/)[0].trim();
    if (v.plural) addSense(v.plural, `${base} (plural)`, 'form', v.pos);
    for (const f of v.forms ?? []) addSense(f.ar, `${base} (${f.label.replace(/ \((.*)\)$/, ', $1')})`, 'form', v.pos);
  }
  // letter names and one-word examples from the letter and pronunciation pages
  for (const l of letters) {
    addSense(l.nameAr, `the name of the letter ${l.name}`, 'form', 'noun');
    if (!l.example.ar.includes(' ')) addSense(l.example.ar, l.example.en, 'form');
  }
  for (const p of pronunciation)
    for (const e of [...p.examples, ...(p.pairs ?? []).flat()]) if (!e.ar.includes(' ')) addSense(e.ar, e.en, 'form');
}

export function namesSet() {
  if (!nameIndex) buildIndexes();
  return nameIndex!;
}

type Unit = { ch: string; vowel: string; shadda: boolean; marked: boolean };
function units(w: string): Unit[] {
  const out: Unit[] = [];
  for (const ch of w) {
    if (ch === ZWJ || ch === 'ـ') continue;
    if (isMark(ch)) {
      const u = out[out.length - 1];
      if (!u) continue;
      u.marked = true;
      if (ch === SHADDA) u.shadda = true;
      else u.vowel += ch;
    } else out.push({ ch, vowel: '', shadda: false, marked: false });
  }
  return out;
}

/**
 * Two vocalisations of the same skeleton can stand for the same word: no letter carries two different
 * vowels or a shadda on one side only (unless that side is unmarked there). The last letter may differ
 * in its case or mood vowel (al-madrasatu / al-madrasati, humu / hum, yastamirru / yastamirra), except
 * the person endings -tu/-ta/-ti and -ka/-ki (sharibtu ≠ sharibta, ismuka ≠ ismuki).
 */
export function compatibleForms(a: string, b: string, pos?: string): boolean {
  const ua = units(a);
  const ub = units(b);
  if (ua.length !== ub.length) return false;
  const nominal =
    (pos !== undefined && NOMINAL_POS.has(pos)) ||
    /^(ال|ٱل)/.test(stripHarakat(a)) ||
    stripHarakat(a).endsWith('ة') ||
    TANWIN_RE.test(a) ||
    TANWIN_RE.test(b);
  for (let i = 0; i < ua.length; i++) {
    const x = ua[i];
    const y = ub[i];
    if (x.ch !== y.ch) return false;
    if (!x.marked || !y.marked) continue;
    if (x.shadda !== y.shadda) return false;
    const last = i === ua.length - 1;
    if (!x.vowel || !y.vowel || x.vowel === y.vowel) continue;
    if (!last) return false;
    // -tu/-ta/-ti and -ka/-ki mark the person even on a noun (ismuka ≠ ismuki); only tanwīn or sukūn may differ
    if (PERSON_END.has(x.ch) && (!nominal || (SHORT_VOWEL.test(x.vowel) && SHORT_VOWEL.test(y.vowel)))) return false;
  }
  return true;
}

function pick(senses: Sense[], ctx: GlossCtx): string | undefined {
  if (!senses.length) return undefined;
  const byFreq = (a: Sense, b: Sense) => b.n - a.n || a.first - b.first;
  const segs = senses.filter((s) => s.src === 'seg');
  if (ctx.day !== undefined) {
    const sameDay = segs.filter((s) => s.days.has(ctx.day!)).sort(byFreq);
    if (sameDay.length) return sameDay[0].en;
  }
  // the course dictionary, except for a verb: its sentences give the person (he works, not 'to work')
  const vocab = senses.find((s) => s.src === 'vocab');
  if (vocab && !(vocab.pos === 'verb' && segs.length)) return vocab.en;
  if (segs.length) return [...segs].sort(byFreq)[0].en;
  return [...senses].sort(byFreq)[0].en;
}

const vocabExact = new Map(vocabulary.map((v) => [v.ar, v]));
const vocabBySkeleton = new Map<string, Vocab[]>();
for (const v of vocabulary) {
  const k = stripHarakat(v.ar);
  vocabBySkeleton.set(k, [...(vocabBySkeleton.get(k) ?? []), v]);
}
const scenePhrases = new Map(scenes.flatMap((s) => s.spots.map((sp) => [sp.ar, sp.en] as [string, string])));
const letterByChar = new Map(letters.map((l) => [l.char, l]));
const numberWords = new Map<string, number>();
for (let n = 0; n <= 100; n++) numberWords.set(numberToArabic(n), n);

/** The vocabulary entry for a word, if the course teaches it (exact form, else one compatible form). */
export function vocabOf(word: string): Vocab | undefined {
  const w = clean(word);
  const hit = vocabExact.get(w);
  if (hit) return hit;
  if (!isVocalised(w)) return undefined;
  const found = (vocabBySkeleton.get(stripHarakat(w)) ?? []).filter((v) => compatibleForms(w, v.ar, v.pos));
  return found.length === 1 ? found[0] : undefined;
}

/**
 * Meaning chain: mistake note (inside a mistake card) → a bare letter → hand glossary (exact form) →
 * the form's own glosses (lesson day first) → compatible vocalisations → all readings of an unvocalised
 * word → numbers → letters → mistake note of a non-word. Returns undefined rather than guessing.
 */
export function meaningOf(word: string, ctx: GlossCtx = {}): string | undefined {
  if (!exact) buildIndexes();
  const w = clean(word);
  const bare = stripHarakat(w);
  if (ctx.mistake && mistakeGlossary[w]) return mistakeGlossary[w];
  const letter = letterByChar.get(bare);
  if (letter && w === bare) return `the letter ${letter.name}`;
  const hand = handGlossary[w] ?? (isVocalised(w) ? undefined : handGlossary[bare]);
  if (hand) return hand;
  const own = pick(exact!.get(w) ?? [], ctx);
  if (own) return own;
  const forms = bySkeleton!.get(bare) ?? [];
  if (isVocalised(w)) {
    const senses = forms
      .filter((f) => compatibleForms(w, f, exact!.get(f)?.find((s) => s.pos)?.pos))
      .flatMap((f) => exact!.get(f)!);
    const near = pick(senses, ctx);
    if (near) return near;
  } else if (forms.length) {
    const readings = [...new Set(forms.map((f) => pick(exact!.get(f)!, ctx)!))];
    return readings.slice(0, 4).join(' / ');
  }
  const western = toWesternDigits(w);
  if (/^\d+$/.test(western)) return numberToEnglish(Number(western));
  const num = numberWords.get(w);
  if (num !== undefined) return numberToEnglish(num);
  if (letter) return `the letter ${letter.name}`;
  return mistakeGlossary[w];
}

/** Meaning of a whole phrase if the course has it as a unit (vocabulary or glossary). */
export function phraseMeaning(text: string): string | undefined {
  return (
    vocabExact.get(text)?.en ??
    handGlossary[text] ??
    (isVocalised(text) ? undefined : handGlossary[stripHarakat(text)]) ??
    scenePhrases.get(text)
  );
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

export function wordToken(word: string, style: TranslitStyle, tr?: string, en?: string, ctx: GlossCtx = {}): WordInfo {
  const vocab = vocabOf(word);
  return {
    word,
    tr: tr ?? translitWords([word], style)[0],
    plain: stripHarakat(word),
    en: en ?? meaningOf(word, ctx),
    vocab,
    example: vocab?.example,
  };
}

export const isArabicText = (s: string) => SCRIPT_RE.test(s);
