/// <reference types="node" />
// npx tsx scripts/check-culture.ts content/culture/<slug>.json — checks ONE culture chapter on its own
// (schema, segment joins, harakat, vocabulary/grammar ids, photo files, every Arabic word has an English
// meaning from this chapter's segments or the course). Writes nothing. Exit 1 on any error.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { grammarById, vocabById } from '../src/content';
import { Culture } from '../src/content/schema';
import { checkSegs, type ValidationError } from '../src/content/validate';
import { arabicWords, meaningOf } from '../src/lang/ar/tap';

const file = process.argv[2];
if (!file) throw new Error('usage: tsx scripts/check-culture.ts content/culture/<slug>.json');
const r = Culture.safeParse(JSON.parse(readFileSync(file, 'utf8')));
if (!r.success) {
  for (const i of r.error.issues) console.log(`  ✗ schema ${i.path.join('.')}: ${i.message}`);
  process.exit(1);
}
const ch = r.data;
const errs: ValidationError[] = [];
const w = ch.id;
checkSegs(`${w} title`, ch.titleAr, ch.titleSegs, errs);
checkSegs(`${w} reading`, ch.reading.ar, ch.reading.segs, errs);
const own = new Set<string>();
const addSegs = (segs: [string, string, string?][] | undefined) => segs?.forEach((s) => own.add(s[0]));
addSegs(ch.titleSegs as never);
addSegs(ch.reading.segs as never);
ch.sections.forEach((s, i) => {
  if (s.titleAr && s.titleSegs)
    (checkSegs(`${w} section ${i} title`, s.titleAr, s.titleSegs, errs), addSegs(s.titleSegs as never));
  else if (s.titleAr || s.titleSegs) errs.push({ where: `${w} section ${i}`, message: 'titleAr and titleSegs go together' });
  for (const x of s.sentences) {
    checkSegs(`${w} ${x.id}`, x.ar, x.segs, errs);
    addSegs(x.segs as never);
    for (const g of x.grammar)
      if (!grammarById.has(g)) errs.push({ where: `${w} ${x.id}`, message: `unknown grammar id "${g}"` });
  }
});
ch.words.forEach((it, i) => {
  checkSegs(`${w} word ${i}`, it.ar, it.segs, errs);
  addSegs(it.segs as never);
});
for (const v of ch.vocab) if (!vocabById.has(v)) errs.push({ where: w, message: `unknown vocabulary id "${v}"` });
for (const p of [ch.hero, ...ch.sections.map((s) => s.photo)])
  if (p && !existsSync(join(__dirname, '../assets/culture', p.file)))
    errs.push({ where: w, message: `missing photo assets/culture/${p.file}` });
const texts: [string, string | undefined][] = [
  ['summary', ch.summary],
  ['hero caption', ch.hero?.caption],
  ...ch.sections.flatMap((s, i): [string, string | undefined][] => [
    [`section ${i} caption`, s.photo?.caption],
    ...s.body.map((b, j): [string, string] => [`section ${i} body ${j}`, b]),
    ...s.sentences.flatMap((x) =>
      (x.mistakes ?? []).flatMap((m): [string, string][] => [
        [`${x.id} wrong`, m.wrong],
        [`${x.id} right`, m.right],
        [`${x.id} why`, m.why],
      ]),
    ),
  ]),
  ...ch.words.map((it, i): [string, string | undefined] => [`word ${i} note`, it.note]),
  ...[...ch.readingQuestions, ...ch.quiz].flatMap((q): [string, string | undefined][] => [
    [`${q.id} prompt`, q.prompt],
    [`${q.id} ar`, q.ar],
    [`${q.id} explain`, q.explain],
    ...q.options.map((o, i): [string, string] => [`${q.id} option ${i}`, o]),
  ]),
];
for (const [where, t] of texts)
  if (t)
    for (const word of arabicWords(t))
      if (!own.has(word) && !meaningOf(word))
        errs.push({
          where: `${w} ${where}`,
          message: `gloss gap: "${word}" has no English meaning (use it in a segment of this chapter, exactly as written)`,
        });
const ids = [
  ...ch.sections.flatMap((s) => s.sentences.map((x) => x.id)),
  ...ch.readingQuestions.map((q) => q.id),
  ...ch.quiz.map((q) => q.id),
];
if (new Set(ids).size !== ids.length) errs.push({ where: w, message: 'duplicate sentence or question id' });
for (const e of errs) console.log(`  ✗ ${e.where}: ${e.message}`);
console.log(
  `${w}: ${ch.sections.length} sections, ${ch.words.length} words, ${ch.quiz.length} quiz questions — errors: ${errs.length}`,
);
process.exit(errs.length ? 1 : 0);
