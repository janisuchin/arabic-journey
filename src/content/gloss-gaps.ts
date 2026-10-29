// Finds every Arabic word shown anywhere in the content that has no English meaning.
// Used by the validator and by the gloss-coverage test: a single gap fails the build.

import { days, grammar, letters, pronunciation, scenarios, vocabulary, course } from './index';
import { arabicWords, meaningOf } from '../lang/ar/tap';

export interface TextRef {
  where: string;
  text: string;
}

/** Every string in the content that is shown to learners and may contain Arabic. */
export function allShownTexts(): TextRef[] {
  const out: TextRef[] = [];
  const add = (where: string, text: string | undefined) => text && out.push({ where, text });
  for (const l of letters) {
    add(`letter ${l.id}`, l.char);
    add(`letter ${l.id} name`, l.nameAr);
    add(`letter ${l.id} sound`, l.sound);
    add(`letter ${l.id} example`, l.example.ar);
  }
  for (const v of vocabulary) {
    add(`vocab ${v.id}`, v.ar);
    add(`vocab ${v.id} plural`, v.plural);
    add(`vocab ${v.id} example`, v.example.ar);
    add(`vocab ${v.id} note`, v.note);
    v.forms?.forEach((f, i) => add(`vocab ${v.id} form ${i}`, f.ar));
  }
  for (const g of grammar) {
    for (const k of ['title', 'titleAr', 'summary', 'formula', 'explanation'] as const) add(`grammar ${g.id} ${k}`, g[k]);
    g.table.head.forEach((c, i) => add(`grammar ${g.id} head ${i}`, c));
    g.table.rows.forEach((r, i) => r.forEach((c, j) => add(`grammar ${g.id} cell ${i},${j}`, c)));
    g.examples.forEach((e, i) => add(`grammar ${g.id} example ${i}`, e.ar));
  }
  for (const p of pronunciation) {
    for (const k of ['title', 'tip', 'diagram', 'error'] as const) add(`pron ${p.id} ${k}`, p[k]);
    p.letters.forEach((l, i) => add(`pron ${p.id} letter ${i}`, l));
    p.examples.forEach((e, i) => add(`pron ${p.id} example ${i}`, e.ar));
    p.pairs?.forEach((pair, i) => pair.forEach((e, j) => add(`pron ${p.id} pair ${i}.${j}`, e.ar)));
  }
  for (const d of days) {
    const w = `day ${d.day}`;
    add(`${w} titleAr`, d.titleAr);
    add(`${w} intro`, d.intro);
    add(`${w} story`, d.realLife.story);
    d.objectives.forEach((o, i) => add(`${w} objective ${i}`, o));
    add(`${w} completion`, d.completion);
    for (const s of d.sentences) {
      add(`${w} ${s.id}`, s.ar);
      s.mistakes?.forEach((m, i) => {
        add(`${w} ${s.id} mistake ${i} wrong`, m.wrong);
        add(`${w} ${s.id} mistake ${i} right`, m.right);
        add(`${w} ${s.id} mistake ${i} why`, m.why);
      });
    }
    d.dialogue.speakers.forEach((s) => add(`${w} speaker ${s.key}`, s.nameAr));
    d.dialogue.lines.forEach((l) => add(`${w} ${l.id}`, l.ar));
    add(`${w} culture`, d.dialogue.culture);
    add(`${w} reading`, d.reading.ar);
    d.quiz.forEach((q) => {
      add(`${w} ${q.id} prompt`, q.prompt);
      add(`${w} ${q.id} ar`, q.ar);
      q.options.forEach((o, i) => add(`${w} ${q.id} option ${i}`, o));
    });
  }
  for (const sc of scenarios) {
    add(`scenario ${sc.id} intro`, sc.intro);
    sc.dialogue.speakers.forEach((s) => add(`scenario ${sc.id} speaker ${s.key}`, s.nameAr));
    sc.dialogue.lines.forEach((l) => add(`scenario ${sc.id} ${l.id}`, l.ar));
    add(`scenario ${sc.id} culture`, sc.dialogue.culture);
    sc.mistakes.forEach((m, i) => {
      add(`scenario ${sc.id} mistake ${i} wrong`, m.wrong);
      add(`scenario ${sc.id} mistake ${i} right`, m.right);
    });
    sc.quiz.forEach((q) => {
      add(`scenario ${sc.id} ${q.id} ar`, q.ar);
      q.options.forEach((o, i) => add(`scenario ${sc.id} ${q.id} option ${i}`, o));
    });
  }
  for (const wk of course?.weeks ?? []) {
    add(`week ${wk.week} titleAr`, wk.titleAr);
    wk.test.forEach((q) => {
      add(`week ${wk.week} ${q.id} ar`, q.ar);
      q.options.forEach((o, i) => add(`week ${wk.week} ${q.id} option ${i}`, o));
    });
  }
  return out;
}

export interface GlossGap {
  word: string;
  where: string;
}

export function findGlossGaps(): GlossGap[] {
  const seen = new Set<string>();
  const gaps: GlossGap[] = [];
  for (const { where, text } of allShownTexts())
    for (const w of arabicWords(text))
      if (!meaningOf(w) && !seen.has(w)) {
        seen.add(w);
        gaps.push({ word: w, where });
      }
  return gaps;
}
