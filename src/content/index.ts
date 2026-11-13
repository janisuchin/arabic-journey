// Loads and validates all curriculum JSON. Invalid items are dropped (fail-safe) and reported
// through `contentIssues`, so the app never shows broken content.
import { z } from 'zod';

import { RAW_CULTURE } from './culture.generated';
import { RAW_DAYS } from './days.generated';
import {
  Course,
  Culture,
  Day,
  GlossEntry,
  Grammar,
  Letter,
  Placard,
  Pronunciation,
  Scenario,
  Scene,
  Vocab,
  WordPhoto,
  type Course as CourseT,
  type Culture as CultureT,
  type Day as DayT,
  type Grammar as GrammarT,
  type Letter as LetterT,
  type Placard as PlacardT,
  type Pronunciation as PronunciationT,
  type Scenario as ScenarioT,
  type Scene as SceneT,
  type Vocab as VocabT,
  type WordPhoto as WordPhotoT,
} from './schema';

export interface ContentIssue {
  where: string;
  message: string;
}

export const contentIssues: ContentIssue[] = [];

function validList<T>(schema: z.ZodType<T>, raw: unknown, where: string, idOf: (x: any, i: number) => string): T[] {
  if (!Array.isArray(raw)) {
    contentIssues.push({ where, message: 'not an array' });
    return [];
  }
  const out: T[] = [];
  raw.forEach((item, i) => {
    const r = schema.safeParse(item);
    if (r.success) out.push(r.data);
    else
      contentIssues.push({
        where: `${where}[${idOf(item, i)}]`,
        message: r.error.issues.map((x) => `${x.path.join('.')}: ${x.message}`).join('; '),
      });
  });
  return out;
}

const idOf = (x: any, i: number) => String(x?.id ?? x?.day ?? i);

export const letters: LetterT[] = validList(Letter, require('../../content/course/letters.json'), 'letters', idOf);
export const vocabulary: VocabT[] = validList(Vocab, require('../../content/course/vocabulary.json'), 'vocabulary', idOf);
export const grammar: GrammarT[] = validList(Grammar, require('../../content/course/grammar.json'), 'grammar', idOf);
export const pronunciation: PronunciationT[] = validList(
  Pronunciation,
  require('../../content/course/pronunciation.json'),
  'pronunciation',
  idOf,
);
export const scenarios: ScenarioT[] = validList(Scenario, require('../../content/course/scenarios.json'), 'scenarios', idOf);
export const scenes: SceneT[] = validList(Scene, require('../../content/course/scenes.json'), 'scenes', (x) => String(x?.scenario));
export const wordPhotos: WordPhotoT[] = validList(
  WordPhoto,
  require('../../content/course/word-photos.json'),
  'word-photos',
  (x) => String(x?.vocab),
);
export const placards: PlacardT[] = validList(Placard, require('../../content/course/placards.json'), 'placards', idOf);
export const culture: CultureT[] = validList(Culture, RAW_CULTURE, 'culture', idOf).sort((a, b) => a.n - b.n);

function loadCourse(): CourseT | null {
  const r = Course.safeParse(require('../../content/course/course.json'));
  if (r.success) return r.data;
  contentIssues.push({ where: 'course', message: r.error.issues.map((x) => `${x.path.join('.')}: ${x.message}`).join('; ') });
  return null;
}
export const course = loadCourse();

const parseGloss = (raw: unknown, where: string): Record<string, string> => {
  const r = GlossEntry.safeParse(raw);
  if (r.success) return r.data;
  contentIssues.push({ where, message: r.error.issues.map((x) => `${x.path.join('.')}: ${x.message}`).join('; ') });
  return {};
};
export const handGlossary = parseGloss(require('../../content/glossary/hand.json'), 'glossary/hand');
export const autoGlossary = parseGloss(require('../../content/glossary/auto.json'), 'glossary/auto');
/** Exercise notes for deliberate mistakes ("wrong after inna"): shown only in a mistake card or for a non-word. */
export const mistakeGlossary = parseGloss(require('../../content/glossary/mistakes.json'), 'glossary/mistakes');
/** Offline readings layer: word -> [academic transliteration, 1 if its first vowel is elidable]. */
export const readingsLayer: Record<string, [string, 0 | 1]> = require('../../content/readings/readings.json');

const vocabIds = new Set(vocabulary.map((v) => v.id));
const grammarIds = new Set(grammar.map((g) => g.id));
const pronIds = new Set(pronunciation.map((p) => p.id));
const letterIds = new Set(letters.map((l) => l.id));

function crossCheck(d: DayT): string[] {
  const errs: string[] = [];
  for (const w of [...d.newWords, ...d.review]) if (!vocabIds.has(w)) errs.push(`unknown word id "${w}"`);
  for (const g of d.grammar) if (!grammarIds.has(g)) errs.push(`unknown grammar id "${g}"`);
  for (const s of d.sentences) for (const g of s.grammar) if (!grammarIds.has(g)) errs.push(`${s.id}: unknown grammar id "${g}"`);
  for (const p of d.pronunciation) if (!pronIds.has(p)) errs.push(`unknown pronunciation id "${p}"`);
  for (const l of d.letters) if (!letterIds.has(l)) errs.push(`unknown letter id "${l}"`);
  const speakers = new Set(d.dialogue.speakers.map((s) => s.key));
  for (const line of d.dialogue.lines) if (!speakers.has(line.sp)) errs.push(`${line.id}: unknown speaker "${line.sp}"`);
  if (course) {
    const wk = course.weeks.find((w) => w.week === d.week);
    if (!wk || !wk.days.some((x) => x.day === d.day)) errs.push(`day ${d.day} is not listed in week ${d.week}`);
  }
  return errs;
}

export const days: DayT[] = validList(Day, RAW_DAYS, 'days', idOf).filter((d) => {
  const errs = crossCheck(d);
  if (errs.length) contentIssues.push({ where: `days[${d.day}]`, message: errs.join('; ') });
  return errs.length === 0;
});

export const dayByNumber = new Map(days.map((d) => [d.day, d]));
export const vocabById = new Map(vocabulary.map((v) => [v.id, v]));
export const grammarById = new Map(grammar.map((g) => [g.id, g]));
export const pronunciationById = new Map(pronunciation.map((p) => [p.id, p]));
export const letterById = new Map(letters.map((l) => [l.id, l]));
export const placardById = new Map(placards.map((p) => [p.id, p]));
export const cultureById = new Map(culture.map((c) => [c.id, c]));
/** The scene photo of a scenario, if one is bundled. */
export const sceneByScenario = new Map(scenes.map((s) => [s.scenario, s]));
/** The square word photo of a vocabulary item, if one is bundled (the rest show their emoji tile). */
export const wordPhotoByVocab = new Map(wordPhotos.map((p) => [p.vocab, p]));
export const validDays = days.map((d) => d.day).sort((a, b) => a - b);

export const weekOf = (day: number) => {
  const w = course?.weeks.find((wk) => wk.days.some((d) => d.day === day));
  return w?.week ?? Math.ceil(day / 7);
};

export const weekByNumber = (n: number) => course?.weeks.find((w) => w.week === n);
