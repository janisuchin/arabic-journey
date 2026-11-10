// Language checks on top of the zod schemas. Pure: returns a list of errors.

import { FATHA, DAMMA, KASRA, FATHATAN, DAMMATAN, KASRATAN, SUKUN, SHADDA, DAGGER_ALIF } from '../core/arabic';
import { arabicWords } from '../lang/ar/tap';
import { contentIssues, culture, days, grammarById, placards, scenarios, course, vocabById } from './index';
import { CULTURE_PHOTO_FILES } from './culture.generated';
import { findGlossGaps } from './gloss-gaps';
import type { Seg } from './schema';

export interface ValidationError {
  where: string;
  message: string;
}

const MARKS = new Set([FATHA, DAMMA, KASRA, FATHATAN, DAMMATAN, KASRATAN, SUKUN, SHADDA, DAGGER_ALIF]);

/** A word of two or more letters with no harakat at all cannot be read without guessing. */
export function isUnvocalised(word: string) {
  const letters = [...word].filter((c) => /[\u0621-\u064A]/.test(c));
  return letters.length >= 2 && ![...word].some((c) => MARKS.has(c));
}

export function checkSegs(where: string, ar: string, segs: Seg[], errs: ValidationError[]) {
  const words = arabicWords(ar);
  const tokens = segs.map((s) => s[0]);
  if (words.join(' ') !== tokens.join(' '))
    errs.push({ where, message: `segments do not join to the text: [${tokens.join(' | ')}] vs [${words.join(' | ')}]` });
  for (const w of words) if (isUnvocalised(w)) errs.push({ where, message: `unvocalised word "${w}"` });
}

/** Dialogue density targets (English words per line), from the blueprint, section I. */
export function densityTarget(day: number) {
  if (day <= 15) return 6.5;
  if (day <= 30) return 7.5;
  if (day <= 60) return 9;
  if (day <= 75) return 9.5;
  return 10.5;
}

export const englishWords = (s: string) => s.split(/\s+/).filter((w) => /[A-Za-z]/.test(w)).length;

export function dialogueStats(lines: { en: string }[]) {
  const counts = lines.map((l) => englishWords(l.en));
  return {
    lines: lines.length,
    avg: counts.reduce((a, b) => a + b, 0) / Math.max(1, counts.length),
    short: counts.filter((c) => c <= 3).length,
  };
}

export function validateAll(): ValidationError[] {
  const errs: ValidationError[] = contentIssues.map((i) => ({ where: i.where, message: i.message }));
  if (!course) errs.push({ where: 'course', message: 'course.json failed to load' });
  for (const d of days) {
    const w = `day ${d.day}`;
    checkSegs(`${w} title`, d.titleAr, d.titleSegs, errs);
    checkSegs(`${w} reading`, d.reading.ar, d.reading.segs, errs);
    for (const s of d.sentences) checkSegs(`${w} ${s.id}`, s.ar, s.segs, errs);
    for (const l of d.dialogue.lines) checkSegs(`${w} ${l.id}`, l.ar, l.segs, errs);
    const st = dialogueStats(d.dialogue.lines);
    const [min, max] = d.day <= 7 ? [10, 16] : [12, 16];
    if (st.lines < min || st.lines > max) errs.push({ where: `${w} dialogue`, message: `${st.lines} lines (want ${min}–${max})` });
    if (st.avg < densityTarget(d.day))
      errs.push({ where: `${w} dialogue`, message: `density ${st.avg.toFixed(1)} < ${densityTarget(d.day)} English words/line` });
    if (st.short > 2) errs.push({ where: `${w} dialogue`, message: `${st.short} lines of 3 words or fewer (max 2)` });
    if (/\b(?!80%)\d{1,2}%/.test(d.completion + d.summary))
      errs.push({ where: w, message: 'lesson text mentions a pass mark other than 80%' });
  }
  for (const sc of scenarios)
    for (const l of sc.dialogue.lines) checkSegs(`scenario ${sc.id} ${l.id}`, l.ar, l.segs, errs);
  for (const p of placards) {
    checkSegs(`placard ${p.id} title`, p.titleAr, p.titleSegs, errs);
    [...p.items, ...(p.example ? [p.example] : [])].forEach((it, i) => checkSegs(`placard ${p.id} item ${i}`, it.ar, it.segs, errs));
    for (const g of p.grammar ?? []) if (!grammarById.has(g)) errs.push({ where: `placard ${p.id}`, message: `unknown grammar id "${g}"` });
    if (p.table?.rows.some((r) => r.length !== p.table!.head.length))
      errs.push({ where: `placard ${p.id} table`, message: 'a row has a different number of cells than the header' });
  }
  if (placards.length && new Set(placards.map((p) => p.id)).size !== placards.length)
    errs.push({ where: 'placards', message: 'duplicate placard id' });
  for (const ch of culture) {
    const w = `culture ${ch.id}`;
    checkSegs(`${w} title`, ch.titleAr, ch.titleSegs, errs);
    checkSegs(`${w} reading`, ch.reading.ar, ch.reading.segs, errs);
    ch.sections.forEach((s, i) => {
      if (s.titleAr || s.titleSegs) {
        if (!s.titleAr || !s.titleSegs) errs.push({ where: `${w} section ${i}`, message: 'titleAr and titleSegs go together' });
        else checkSegs(`${w} section ${i} title`, s.titleAr, s.titleSegs, errs);
      }
      for (const x of s.sentences) {
        checkSegs(`${w} ${x.id}`, x.ar, x.segs, errs);
        for (const g of x.grammar) if (!grammarById.has(g)) errs.push({ where: `${w} ${x.id}`, message: `unknown grammar id "${g}"` });
      }
    });
    ch.words.forEach((it, i) => checkSegs(`${w} word ${i}`, it.ar, it.segs, errs));
    for (const v of ch.vocab) if (!vocabById.has(v)) errs.push({ where: w, message: `unknown vocabulary id "${v}"` });
    const photos = [ch.hero, ...ch.sections.map((s) => s.photo)].filter((p): p is NonNullable<typeof p> => !!p);
    for (const p of photos) if (!CULTURE_PHOTO_FILES.includes(p.file)) errs.push({ where: w, message: `photo file "${p.file}" is not in assets/culture` });
  }
  const ids = culture.flatMap((c) => [c.id, ...c.sections.flatMap((s) => s.sentences.map((x) => x.id)), ...c.quiz.map((q) => q.id)]);
  if (new Set(ids).size !== ids.length) errs.push({ where: 'culture', message: 'duplicate chapter, sentence or question id' });
  if (new Set(culture.map((c) => c.n)).size !== culture.length) errs.push({ where: 'culture', message: 'duplicate chapter number' });
  for (const g of findGlossGaps()) errs.push({ where: g.where, message: `gloss gap: "${g.word}" has no English meaning` });
  return errs;
}
