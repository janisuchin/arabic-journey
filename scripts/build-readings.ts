/// <reference types="node" />
// npm run readings:build — builds content/readings/readings.json offline: every Arabic word shown
// in the content -> [academic transliteration, 1 if its first vowel elides after a vowel].
// Words whose transliteration would contain Arabic script are rejected (never guess).
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { hasScript } from '../src/core/arabic';
import { translitWord } from '../src/core/translit';
import { allShownTexts } from '../src/content/gloss-gaps';
import { letters } from '../src/content';
import { arabicWords } from '../src/lang/ar/tap';
import { isUnvocalised } from '../src/content/validate';

const out: Record<string, [string, 0 | 1]> = {};
let rejected = 0;
for (const { text } of allShownTexts())
  for (const w of arabicWords(text)) {
    if (out[w]) continue;
    const letter = letters.find((l) => l.char === w);
    if (letter) {
      out[w] = [letter.tr, 0];
      continue;
    }
    const { text: tr, wasl } = translitWord(w);
    if (!tr || hasScript(tr) || (isUnvocalised(w) && w.length > 1)) {
      rejected++;
      continue;
    }
    out[w] = [tr, wasl ? 1 : 0];
  }
const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b, 'ar')));
writeFileSync(
  join(__dirname, '../content/readings/readings.json'),
  JSON.stringify(sorted, null, 0).replace(/\],"/g, '],\n"') + '\n',
);
console.log(
  `readings:build: ${Object.keys(sorted).length} words, ${rejected} without a safe reading (shown without transliteration)`,
);
