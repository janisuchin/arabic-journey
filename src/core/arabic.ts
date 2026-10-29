// Arabic script character classes. Pure data + helpers, no React, no I/O.

export const FATHA = '\u064E';
export const DAMMA = '\u064F';
export const KASRA = '\u0650';
export const FATHATAN = '\u064B';
export const DAMMATAN = '\u064C';
export const KASRATAN = '\u064D';
export const SHADDA = '\u0651';
export const SUKUN = '\u0652';
export const DAGGER_ALIF = '\u0670';
export const TATWEEL = 'ـ';
export const ZWJ = '\u200D';

/** Harakat and other combining marks that sit on a letter. */
export const HARAKAT_RE = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

/** Any Arabic-block character (letters, marks, Arabic punctuation, Arabic-Indic digits). */
export const SCRIPT_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

/** Arabic letters only (no marks, no punctuation, no digits). */
export const LETTER_RE = /[\u0621-\u063A\u0641-\u064A\u0671]/;

export const isMark = (ch: string) => /[\u064B-\u065F\u0670]/.test(ch);
export const isLetter = (ch: string) => LETTER_RE.test(ch);
export const hasScript = (text: string) => SCRIPT_RE.test(text);

/** Letters that never connect to the following letter (right-joining only). */
const NON_JOINING_NEXT = new Set(['ا', 'أ', 'إ', 'آ', 'ٱ', 'د', 'ذ', 'ر', 'ز', 'و', 'ؤ', 'ة', 'ى', 'ء']);

/** True if this letter connects to the letter after it (dual-joining). */
export const joinsNext = (ch: string) => isLetter(ch) && !NON_JOINING_NEXT.has(ch);
/** True if this letter connects to the letter before it (everything but hamza). */
export const joinsPrev = (ch: string) => isLetter(ch) && ch !== 'ء';

/** The fourteen sun letters, which assimilate the l of the article al-. */
export const SUN_LETTERS = new Set(['ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ل', 'ن']);

/** Remove harakat (for unvocalised display and for lookup fallback). Never removes letters. */
export const stripHarakat = (text: string) => text.replace(HARAKAT_RE, '').replace(/ـ/g, '');

/** Contextual letter forms, built with ZWJ so the font's real joining glyphs are used. */
export function letterForms(ch: string) {
  const isolated = ch;
  if (!joinsPrev(ch)) return { isolated, initial: null, medial: null, final: null };
  const final = ZWJ + ch;
  if (!joinsNext(ch)) return { isolated, initial: null, medial: null, final };
  return { isolated, initial: ch + ZWJ, medial: ZWJ + ch + ZWJ, final };
}

const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩';
export const toArabicIndic = (s: string | number) => String(s).replace(/[0-9]/g, (d) => ARABIC_INDIC[Number(d)]);
export const toWesternDigits = (s: string) => s.replace(/[\u0660-\u0669]/g, (d) => String(ARABIC_INDIC.indexOf(d)));

/** Unicode bidi isolates, used on native where there is no `dir` attribute. */
export const RLI = '\u2067';
export const LRI = '\u2066';
export const FSI = '\u2068';
export const PDI = '\u2069';
export const isolateRtl = (s: string) => RLI + s + PDI;
export const isolateLtr = (s: string) => LRI + s + PDI;
export const stripIsolates = (s: string) => s.replace(/[\u2066-\u2069]/g, '');
