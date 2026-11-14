/// <reference types="node" />
// npx tsx scripts/check-roleplays.ts <file.json> [...]
// Checks role-play drafts before they are merged into content/course/roleplays.json: the schema, the graph rules
// (reachable, no loop, a branch, a way to finish, a wrong reply per node), segs that join to the text, full
// vocalisation, speakers of the scenario. Prints every problem and exits 1 if there is any.
import { readFileSync } from 'node:fs';

import { scenarios } from '../src/content';
import { Roleplay } from '../src/content/schema';
import { checkRoleplay, type ValidationError } from '../src/content/validate';

const errs: ValidationError[] = [];
let n = 0;
for (const file of process.argv.slice(2)) {
  const raw = JSON.parse(readFileSync(file, 'utf8')) as unknown;
  for (const [i, item] of (Array.isArray(raw) ? raw : [raw]).entries()) {
    const r = Roleplay.safeParse(item);
    const id = String((item as { scenario?: string })?.scenario ?? i);
    if (!r.success) {
      for (const x of r.error.issues) errs.push({ where: `${file} ${id} ${x.path.join('.')}`, message: x.message });
      continue;
    }
    const sc = scenarios.find((s) => s.id === r.data.scenario);
    if (!sc) {
      errs.push({ where: `${file} ${id}`, message: 'no scenario with this id' });
      continue;
    }
    checkRoleplay(
      r.data,
      sc.dialogue.speakers.map((s) => s.key),
      errs,
    );
    n++;
  }
}
for (const e of errs) console.log(`  ✗ ${e.where}: ${e.message}`);
console.log(`check-roleplays: ${n} role-plays, ${errs.length} problems`);
process.exit(errs.length ? 1 : 0);
