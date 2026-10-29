/* eslint-disable @typescript-eslint/no-redeclare -- each schema and its inferred type share a name */
import { z } from 'zod';

import { hasScript } from '../core/arabic';

const latinOnly = z.string().refine((s) => !hasScript(s), 'must not contain Arabic script');
const arabic = z.string().min(1).refine(hasScript, 'must contain Arabic script');
/** English prose that may contain Arabic runs (shown with RichText, every run tappable). */
const rich = z.string().min(1);

export const Status = z.enum(['auto-checked', 'needs-review', 'approved']);

/** A segment: [arabic token, English gloss, optional part of speech]. */
export const Seg = z.union([
  z.tuple([arabic, latinOnly]),
  z.tuple([arabic, latinOnly, z.string()]),
]);
export type Seg = z.infer<typeof Seg>;

export const Example = z.object({ ar: arabic, en: latinOnly });

export const Letter = z.object({
  id: z.string(),
  char: arabic,
  name: latinOnly,
  nameAr: arabic,
  tr: latinOnly,
  ipa: z.string(),
  sun: z.boolean(),
  day: z.number().int(),
  sound: rich,
  example: Example,
});
export type Letter = z.infer<typeof Letter>;

export const Pos = z.enum([
  'noun', 'verb', 'adj', 'adverb', 'pronoun', 'particle', 'prep', 'question', 'phrase', 'number', 'name', 'demonstrative',
]);

export const Vocab = z.object({
  id: z.string(),
  ar: arabic,
  en: latinOnly,
  pos: Pos,
  gender: z.enum(['m', 'f']).optional(),
  plural: arabic.optional(),
  forms: z.array(z.object({ label: latinOnly, ar: arabic })).optional(),
  tr: latinOnly.optional(),
  ipa: z.string().optional(),
  emoji: z.string(),
  example: Example,
  topic: z.string(),
  level: z.number().int().min(0).max(12),
  note: rich.optional(),
});
export type Vocab = z.infer<typeof Vocab>;

export const Sentence = z.object({
  id: z.string(),
  ar: arabic,
  en: latinOnly,
  literal: latinOnly.optional(),
  segs: z.array(Seg).min(1),
  grammar: z.array(z.string()),
  mistakes: z.array(z.object({ wrong: z.string(), right: z.string(), why: rich })).optional(),
  speak: arabic.optional(),
});
export type Sentence = z.infer<typeof Sentence>;

export const Speaker = z.object({ key: z.string(), name: latinOnly, nameAr: arabic });
export const DialogueLine = z.object({ id: z.string(), sp: z.string(), ar: arabic, en: latinOnly, segs: z.array(Seg).min(1) });
export type DialogueLine = z.infer<typeof DialogueLine>;

export const Dialogue = z.object({
  title: latinOnly,
  speakers: z.array(Speaker).min(2),
  lines: z.array(DialogueLine).min(10),
  culture: rich.optional(),
});

export const Question = z.object({
  id: z.string(),
  prompt: rich,
  ar: arabic.optional(),
  options: z.array(z.string()).min(2),
  answer: z.number().int().min(0),
  explain: rich.optional(),
});
export type Question = z.infer<typeof Question>;

export const Reading = z.object({ title: latinOnly, ar: arabic, en: latinOnly, segs: z.array(Seg).min(1) });

export const Day = z
  .object({
    day: z.number().int().min(1).max(90),
    week: z.number().int().min(1).max(13),
    phase: z.number().int().min(1).max(7),
    level: z.number().int().min(0).max(12),
    title: latinOnly,
    titleAr: arabic,
    titleSegs: z.array(Seg).min(1),
    emoji: z.string(),
    summary: rich,
    intro: z.string(),
    objectives: z.array(rich).min(2),
    realLife: z.object({ emoji: z.string(), title: latinOnly, story: z.string() }),
    letters: z.array(z.string()),
    newWords: z.array(z.string()).min(4),
    grammar: z.array(z.string()).min(1),
    pronunciation: z.array(z.string()),
    sentences: z.array(Sentence).min(3),
    dialogue: Dialogue,
    reading: Reading,
    review: z.array(z.string()),
    quiz: z.array(Question).min(5),
    completion: z.string(),
    status: Status,
    reviewer: z.string().optional(),
  })
  .superRefine((d, ctx) => {
    if (d.status === 'approved' && !d.reviewer)
      ctx.addIssue({ code: 'custom', message: 'status "approved" needs a named human reviewer' });
    for (const q of d.quiz)
      if (q.answer >= q.options.length) ctx.addIssue({ code: 'custom', message: `quiz ${q.id}: answer out of range` });
  });
export type Day = z.infer<typeof Day>;

export const OutlineDay = z.object({ day: z.number().int(), title: latinOnly });

export const Week = z.object({
  week: z.number().int().min(1).max(13),
  phase: z.number().int().min(1).max(7),
  levels: z.array(z.number().int()),
  title: latinOnly,
  titleAr: arabic,
  titleSegs: z.array(Seg).min(1),
  topics: z.array(latinOnly).min(1),
  days: z.array(OutlineDay).min(1),
  test: z.array(Question),
});
export type Week = z.infer<typeof Week>;

export const Course = z.object({
  title: latinOnly,
  weeks: z.array(Week).length(13),
  levels: z.array(z.object({ level: z.number().int(), name: latinOnly, cefr: latinOnly, extension: z.boolean() })),
});
export type Course = z.infer<typeof Course>;

export const Grammar = z.object({
  id: z.string(),
  title: rich,
  titleAr: arabic,
  summary: rich,
  formula: z.string(),
  explanation: z.string(),
  table: z.object({ head: z.array(z.string()), rows: z.array(z.array(z.string())) }),
  examples: z.array(Example).min(2),
  firstDay: z.number().int(),
});
export type Grammar = z.infer<typeof Grammar>;

export const Pronunciation = z.object({
  id: z.string(),
  title: rich,
  category: latinOnly,
  ipa: z.array(z.string()),
  letters: z.array(arabic),
  tip: rich,
  diagram: rich,
  error: rich,
  examples: z.array(Example).min(2),
  pairs: z.array(z.tuple([Example, Example])).optional(),
});
export type Pronunciation = z.infer<typeof Pronunciation>;

export const Scenario = z.object({
  id: z.string(),
  title: latinOnly,
  emoji: z.string(),
  intro: z.string(),
  dialogue: Dialogue,
  mistakes: z.array(z.object({ wrong: z.string(), right: z.string(), why: rich })),
  quiz: z.array(Question).min(3),
  status: Status,
});
export type Scenario = z.infer<typeof Scenario>;

export const GlossEntry = z.record(z.string(), latinOnly);
