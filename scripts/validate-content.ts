/// <reference types="node" />
// npm run content:validate — zod schemas + language checks + gloss gaps. Exit 1 on any error.
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { culture, days, scenarios, vocabulary, grammar, letters, placards } from '../src/content';
import { validateAll } from '../src/content/validate';

const errs = validateAll();
// Photo files (Node only: the app-side validator cannot touch the file system).
const root = join(__dirname, '..');
const seen = new Map<string, string>();
for (const d of days) {
  const f = d.realLife.photo.file;
  if (!existsSync(join(root, 'assets/real-life', f)))
    errs.push({ where: `day ${d.day}`, message: `missing photo assets/real-life/${f}` });
  if (seen.has(f)) errs.push({ where: `day ${d.day}`, message: `photo ${f} is also used by ${seen.get(f)}` });
  seen.set(f, `day ${d.day}`);
}
for (const ch of culture)
  for (const p of [ch.hero, ...ch.sections.map((s) => s.photo)])
    if (p && !existsSync(join(root, 'assets/culture', p.file)))
      errs.push({ where: `culture ${ch.id}`, message: `missing photo assets/culture/${p.file}` });
console.log(
  `content: ${days.length} days, ${vocabulary.length} words, ${grammar.length} grammar rules, ` +
    `${letters.length} letters, ${scenarios.length} scenarios, ${placards.length} placards, ${culture.length} culture chapters`,
);
for (const e of errs) console.log(`  ✗ ${e.where}: ${e.message}`);
console.log(`errors: ${errs.length}`);
process.exit(errs.length ? 1 : 0);
