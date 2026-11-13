/// <reference types="node" />
// npm run glossary:auto — writes content/glossary/auto.json: every vocalised word of the course with the
// meaning a tap shows OUTSIDE a lesson (no day context), as computed by meaningOf. It is a review list,
// not a lookup table: the app computes the same meanings at run time from the curated segment glosses
// and the vocabulary, keyed by the vocalised form (never the unvocalised spelling, which is ambiguous).
// Hand entries (content/glossary/hand.json) are not repeated here.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { hasScript } from '../src/core/arabic';
import { handGlossary } from '../src/content';
import { arabicWords, meaningOf } from '../src/lang/ar/tap';

const root = join(__dirname, '..');
const words = new Set<string>();
const collect = (v: unknown): void => {
  if (typeof v === 'string') {
    if (hasScript(v)) arabicWords(v).forEach((w) => words.add(w.replace(/‍/g, '')));
  } else if (Array.isArray(v)) v.forEach(collect);
  else if (v && typeof v === 'object') Object.values(v).forEach(collect);
};
for (const dir of ['content/days', 'content/course', 'content/culture'])
  for (const f of readdirSync(join(root, dir)).filter((x) => x.endsWith('.json')))
    collect(JSON.parse(readFileSync(join(root, dir, f), 'utf8')));

const out: Record<string, string> = {};
let none = 0;
for (const w of [...words].sort((a, b) => a.localeCompare(b, 'ar'))) {
  if (handGlossary[w]) continue;
  const m = meaningOf(w);
  if (m) out[w] = m;
  else none++;
}
writeFileSync(join(root, 'content/glossary/auto.json'), JSON.stringify(out, null, 1) + '\n');
console.log(`glossary:auto: ${Object.keys(out).length} vocalised forms, ${none} with no meaning (see gloss gaps)`);
