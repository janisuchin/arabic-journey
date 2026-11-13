/// <reference types="node" />
// npm run content:validate — zod schemas + language checks + gloss gaps. Exit 1 on any error.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { culture, days, scenarios, scenes, vocabulary, grammar, letters, placards, wordPhotos } from '../src/content';
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
// Scene photos: one licensed photo per scenario, the file must exist and no photo may be used twice.
for (const s of scenes) {
  if (!existsSync(join(root, 'assets/scenes', s.file)))
    errs.push({ where: `scene ${s.scenario}`, message: `missing photo assets/scenes/${s.file}` });
  if (seen.has(s.file))
    errs.push({ where: `scene ${s.scenario}`, message: `photo ${s.file} is also used by ${seen.get(s.file)}` });
  seen.set(s.file, `scene ${s.scenario}`);
}
// Word photos: the file must exist, be a 360x360 square JPEG and not be used anywhere else.
function jpegSize(buf: Buffer): [number, number] | null {
  let i = 2;
  while (i + 9 < buf.length && buf[i] === 0xff) {
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker))
      return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
    i += 2 + len;
  }
  return null;
}
for (const p of wordPhotos) {
  const where = `word photo ${p.vocab}`;
  const path = join(root, 'assets/words', p.file);
  if (!existsSync(path)) errs.push({ where, message: `missing photo assets/words/${p.file}` });
  else {
    const size = jpegSize(readFileSync(path));
    if (!size || size[0] !== 360 || size[1] !== 360)
      errs.push({ where, message: `assets/words/${p.file} is ${size ? size.join('x') : 'not a JPEG'}, want 360x360` });
  }
  // word photos live in their own folder, so the key carries it (bank.jpg is both a scene and a word photo)
  const key = `words/${p.file}`;
  if (seen.has(key)) errs.push({ where, message: `photo ${key} is also used by ${seen.get(key)}` });
  seen.set(key, where);
}
const withoutScene = scenarios.filter((sc) => !scenes.some((s) => s.scenario === sc.id)).map((sc) => sc.id);
if (withoutScene.length) errs.push({ where: 'scenes', message: `scenarios without a scene photo: ${withoutScene.join(', ')}` });
console.log(
  `content: ${days.length} days, ${vocabulary.length} words, ${grammar.length} grammar rules, ` +
    `${letters.length} letters, ${scenarios.length} scenarios (${scenes.length} scene photos), ${wordPhotos.length} word photos, ${placards.length} placards, ` +
    `${culture.length} culture chapters`,
);
for (const e of errs) console.log(`  ✗ ${e.where}: ${e.message}`);
console.log(`errors: ${errs.length}`);
process.exit(errs.length ? 1 : 0);
