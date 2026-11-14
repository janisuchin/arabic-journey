// Language checks on top of the zod schemas. Pure: returns a list of errors.

import { FATHA, DAMMA, KASRA, FATHATAN, DAMMATAN, KASRATAN, SUKUN, SHADDA, DAGGER_ALIF } from '../core/arabic';
import { arabicWords } from '../lang/ar/tap';
import {
  contentIssues,
  culture,
  days,
  grammarById,
  placards,
  roleplayByScenario,
  roleplays,
  scenarios,
  scenes,
  course,
  vocabById,
  wordPhotos,
} from './index';
import { CULTURE_PHOTO_FILES, WORD_PHOTO_FILES } from './culture.generated';
import { findGlossGaps } from './gloss-gaps';
import type { Roleplay, Seg } from './schema';

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

/**
 * A role-play graph: every node reachable from the start through right replies, no loop, a way to finish, at least one
 * real branch (two right replies leading to different nodes), a wrong reply in every node, and the other person (never
 * the learner) speaking a scenario speaker's line.
 */
export function checkRoleplay(rp: Roleplay, speakers: string[], errs: ValidationError[]) {
  const w = `roleplay ${rp.scenario}`;
  const byId = new Map(rp.nodes.map((n) => [n.id, n]));
  if (byId.size !== rp.nodes.length) errs.push({ where: w, message: 'two nodes share an id' });
  if (!byId.has(rp.start)) errs.push({ where: w, message: `start "${rp.start}" is not a node` });
  let branches = false;
  let ends = false;
  for (const n of rp.nodes) {
    const at = `${w} ${n.id}`;
    checkSegs(`${at} npc`, n.npc.ar, n.npc.segs, errs);
    if (!speakers.includes(n.npc.sp)) errs.push({ where: at, message: `speaker "${n.npc.sp}" is not a speaker of the scenario` });
    if (n.npc.sp === 'daniel') errs.push({ where: at, message: 'the other person speaks here, not the learner' });
    const oks = n.choices.filter((c) => c.ok);
    if (!oks.length) errs.push({ where: at, message: 'no right reply' });
    if (oks.length === n.choices.length) errs.push({ where: at, message: 'no wrong reply to learn from' });
    if (new Set(oks.map((c) => c.next)).size > 1) branches = true;
    if (new Set(n.choices.map((c) => c.ar)).size !== n.choices.length) errs.push({ where: at, message: 'two replies are the same' });
    n.choices.forEach((c, i) => {
      checkSegs(`${at} choice ${i}`, c.ar, c.segs, errs);
      if (!c.ok && c.next !== null) errs.push({ where: `${at} choice ${i}`, message: 'a wrong reply does not move on (next: null)' });
      if (c.ok && c.next === null) ends = true;
      if (c.ok && c.next !== null && !byId.has(c.next)) errs.push({ where: `${at} choice ${i}`, message: `next "${c.next}" is not a node` });
    });
  }
  if (!branches) errs.push({ where: w, message: 'no branch: one node needs two right replies that lead to different nodes' });
  if (!ends) errs.push({ where: w, message: 'no right reply ends the role-play (next: null)' });
  // reachable through right replies, and no loop (a conversation always moves forward)
  const state = new Map<string, 1 | 2>();
  const visit = (id: string, path: string[]): void => {
    if (state.get(id) === 1) {
      errs.push({ where: w, message: `loop: ${[...path, id].join(' → ')}` });
      return;
    }
    if (state.get(id) === 2 || !byId.has(id)) return;
    state.set(id, 1);
    for (const c of byId.get(id)!.choices) if (c.ok && c.next) visit(c.next, [...path, id]);
    state.set(id, 2);
  };
  visit(rp.start, []);
  for (const n of rp.nodes) if (!state.has(n.id)) errs.push({ where: `${w} ${n.id}`, message: 'not reachable from the start' });
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
  const scenarioIds = new Set(scenarios.map((sc) => sc.id));
  for (const sc of scenarios) {
    const rp = roleplayByScenario.get(sc.id);
    if (!rp) errs.push({ where: `scenario ${sc.id}`, message: 'no role-play (content/course/roleplays.json)' });
    else
      checkRoleplay(
        rp,
        sc.dialogue.speakers.map((s) => s.key),
        errs,
      );
  }
  for (const rp of roleplays) {
    if (!scenarioIds.has(rp.scenario)) errs.push({ where: `roleplay ${rp.scenario}`, message: 'no scenario with this id' });
    if (roleplays.filter((x) => x.scenario === rp.scenario).length > 1)
      errs.push({ where: `roleplay ${rp.scenario}`, message: 'more than one role-play for this scenario' });
  }
  for (const s of scenes) {
    const w = `scene ${s.scenario}`;
    if (!scenarioIds.has(s.scenario)) errs.push({ where: w, message: 'no scenario with this id' });
    if (scenes.filter((x) => x.scenario === s.scenario).length > 1) errs.push({ where: w, message: 'more than one scene for this scenario' });
    for (const sp of s.spots) for (const word of arabicWords(sp.ar)) if (isUnvocalised(word)) errs.push({ where: `${w} spot ${sp.en}`, message: `unvocalised word "${word}"` });
  }
  // Word photos: one per vocabulary id, for nouns only, file bundled, no file or Commons photo used twice.
  const photoTitles = new Map<string, string>();
  for (const p of wordPhotos) {
    const w = `word photo ${p.vocab}`;
    const v = vocabById.get(p.vocab);
    if (!v) errs.push({ where: w, message: 'no vocabulary item with this id' });
    else if (v.pos !== 'noun') errs.push({ where: w, message: `"${v.en}" is a ${v.pos}, word photos are for concrete nouns` });
    if (p.file !== `${p.vocab}.jpg`) errs.push({ where: w, message: `file should be ${p.vocab}.jpg` });
    if (!WORD_PHOTO_FILES.includes(p.file)) errs.push({ where: w, message: `photo file "${p.file}" is not in assets/words` });
    if (wordPhotos.filter((x) => x.vocab === p.vocab).length > 1) errs.push({ where: w, message: 'more than one photo for this word' });
    const other = photoTitles.get(p.credit.title);
    if (other) errs.push({ where: w, message: `Commons photo ${p.credit.title} is also used by ${other}` });
    photoTitles.set(p.credit.title, w);
  }
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
