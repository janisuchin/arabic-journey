/// <reference types="node" />
// npm run glossary:auto — builds content/glossary/auto.json from the curated segment glosses:
// unvocalised word -> gloss, kept only when every occurrence agrees (unambiguous).
// Hand entries (content/glossary/hand.json) always win and are not repeated here.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { stripHarakat } from '../src/core/arabic';
import { days, scenarios, course, handGlossary } from '../src/content';
import type { Seg } from '../src/content/schema';

const segs: Seg[] = [];
for (const d of days) {
  segs.push(...d.titleSegs, ...d.reading.segs);
  d.sentences.forEach((s) => segs.push(...s.segs));
  d.dialogue.lines.forEach((l) => segs.push(...l.segs));
}
scenarios.forEach((s) => s.dialogue.lines.forEach((l) => segs.push(...l.segs)));
course?.weeks.forEach((w) => segs.push(...w.titleSegs));

const glosses = new Map<string, Set<string>>();
for (const [t, g] of segs) {
  const k = stripHarakat(t);
  if (!glosses.has(k)) glosses.set(k, new Set());
  glosses.get(k)!.add(g);
}
const out: Record<string, string> = {};
let ambiguous = 0;
for (const [k, set] of [...glosses].sort(([a], [b]) => a.localeCompare(b, 'ar'))) {
  if (handGlossary[k]) continue;
  if (set.size === 1) out[k] = [...set][0];
  else ambiguous++;
}
writeFileSync(join(__dirname, '../content/glossary/auto.json'), JSON.stringify(out, null, 1) + '\n');
console.log(`glossary:auto: ${Object.keys(out).length} entries, ${ambiguous} ambiguous forms left to the segment glosses`);
