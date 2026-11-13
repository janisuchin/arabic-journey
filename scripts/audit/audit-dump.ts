/// <reference types="node" />
// npx tsx scripts/audit/audit-dump.ts [outDir]
// Exports every piece of content exactly as the learner sees it, for the accuracy review (Prompt B, section N):
// one line per string, prefixed with its file and exact JSON path. Every Arabic string gets the app's own
// transliteration (⟶) and, when it is shown without curated segs, the tap meaning of each word (tap:), so that
// reviewers see the gloss the learner would get. Output: <outDir>/<area>.txt (default audit/, git-ignored).
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { hasScript } from '../../src/core/arabic';
import { arabicWords, grammarDay, meaningOf, namesSet, proseLine, translitLine, type GlossCtx } from '../../src/lang/ar/tap';

const root = join(__dirname, '..', '..');
const outDir = process.argv[2] ?? join(root, 'audit');
mkdirSync(outDir, { recursive: true });

const SKIP_KEYS = new Set([
  'credit',
  'file',
  'box',
  'width',
  'height',
  'emoji',
  'icon',
  'status',
  'accessed',
  'modified',
  'source',
  'licenseUrl',
  'alt',
]);
const names = namesSet();

function tr(s: string, path = '') {
  // English prose with Arabic inside (and a grammar formula) is read the way RichText reads it: run by run, no
  // sentence capital, letters named, a run whose reading the English already gives stays in Arabic
  const prose = /[A-Za-z]{2}/.test(s) || /(^|\.)formula$/.test(path);
  try {
    return prose ? proseLine(s, 'academic') : translitLine(s, 'academic', names);
  } catch {
    return '(no transliteration)';
  }
}
/** The tap context of the file being dumped: a day file is that lesson; a week test is the week's last day. */
let fileDay: number | undefined;
let weekTests = false;
/** The app's GlossPlace for the file being dumped (scenario:<id>, vocab:<id>…), as the screens set it. */
let filePlace: string | undefined;
function tapLine(s: string, path: string) {
  const words = arabicWords(s);
  if (!words.length) return '';
  const week = weekTests ? /^weeks\[(\d+)\]/.exec(path) : null;
  const ctx: GlossCtx = {
    day: week ? (Number(week[1]) + 1) * 7 : fileDay,
    mistake: /mistakes\[\d+\]\.wrong$/.test(path),
    place: week ? `week:${Number(week[1]) + 1}` : filePlace,
  };
  return words.map((w) => `${w}=${meaningOf(w, ctx) ?? '∅'}`).join(' · ');
}
const isSeg = (v: unknown): v is [string, string, string?] =>
  Array.isArray(v) && v.length >= 2 && v.length <= 3 && typeof v[0] === 'string' && typeof v[1] === 'string' && hasScript(v[0]);

function walk(v: unknown, path: string, out: string[], inSegs: boolean) {
  if (v === null || v === undefined) return;
  if (typeof v === 'string') {
    if (!v.trim()) return;
    if (hasScript(v)) {
      out.push(`${path}: ${v}`);
      out.push(`${' '.repeat(2)}⟶ ${tr(v, path)}`);
      if (!inSegs) {
        const t = tapLine(v, path);
        if (t) out.push(`${' '.repeat(2)}tap: ${t}`);
      }
    } else out.push(`${path}: ${v}`);
    return;
  }
  if (typeof v === 'number' || typeof v === 'boolean') {
    out.push(`${path}: ${v}`);
    return;
  }
  if (Array.isArray(v)) {
    if (v.length && v.every(isSeg)) {
      out.push(`${path}: ${v.map((s) => `[${s[0]} = ${s[1]}${s[2] ? ` · ${s[2]}` : ''}]`).join(' ')}`);
      return;
    }
    if (v.every((x) => typeof x === 'string' && !hasScript(x as string))) {
      out.push(`${path}: ${(v as string[]).join(' | ')}`);
      return;
    }
    v.forEach((x, i) => walk(x, `${path}[${i}]`, out, false));
    return;
  }
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    // keep a line's Arabic, English and segs together
    for (const [k, x] of Object.entries(o)) {
      if (SKIP_KEYS.has(k)) continue;
      const hasSegs = 'segs' in o && Array.isArray(o.segs) && (o.segs as unknown[]).length > 0;
      walk(x, path ? `${path}.${k}` : k, out, k === 'ar' && hasSegs);
    }
  }
}

function dumpFile(file: string, data: unknown, header: string) {
  const day = /days\/day(\d+)\.json$/.exec(file);
  const rule = file.includes('grammar.json') ? (data as { id?: string }).id : undefined;
  fileDay = day ? Number(day[1]) : rule ? grammarDay(rule) : undefined;
  weekTests = file.endsWith('course.json');
  const m = /^(scenario|scene photo spots for|grammar|letter|pronunciation|word|placard|culture) (\S+)/.exec(header);
  const kind =
    m && ({ 'scene photo spots for': 'scenario', pronunciation: 'pron', word: 'vocab' } as Record<string, string>)[m[1]];
  const d = data as { id?: string; scenario?: string };
  filePlace = m ? `${kind ?? m[1]}:${(m[1].startsWith('scene') ? d.scenario : d.id) ?? m[2]}` : undefined;
  const out: string[] = [`### ${header}`, `# source: ${file}`, ''];
  walk(data, '', out, false);
  out.push('');
  return out.join('\n');
}

const read = (p: string) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const written: [string, number][] = [];
const write = (name: string, text: string) => {
  writeFileSync(join(outDir, `${name}.txt`), text);
  written.push([name, Buffer.byteLength(text)]);
};

// Days in groups of 10
const dayFiles = readdirSync(join(root, 'content/days'))
  .filter((f) => /^day\d+\.json$/.test(f))
  .sort();
for (let i = 0; i < dayFiles.length; i += 10) {
  const group = dayFiles.slice(i, i + 10);
  const text = group.map((f) => dumpFile(`content/days/${f}`, read(`content/days/${f}`), f.replace('.json', ''))).join('\n');
  const a = String(i + 1).padStart(2, '0');
  const b = String(Math.min(i + 10, dayFiles.length)).padStart(2, '0');
  write(`days-${a}-${b}`, text);
}

// Weeks (tests) and levels
const course = read('content/course/course.json');
write('weeks-tests', dumpFile('content/course/course.json', course, 'course: weeks, week tests, levels'));

// Scenarios + their scenes, in two halves
const scenarios = read('content/course/scenarios.json');
const scenes = read('content/course/scenes.json');
const scList = Array.isArray(scenarios) ? scenarios : scenarios.scenarios;
const sceneList = Array.isArray(scenes) ? scenes : scenes.scenes;
const half = Math.ceil(scList.length / 2);
[scList.slice(0, half), scList.slice(half)].forEach((part, k) => {
  const text = part
    .map((sc: { id: string }, j: number) => {
      const idx = k * half + j;
      const scene = sceneList.find((s: { scenario: string }) => s.scenario === sc.id);
      return (
        dumpFile(`content/course/scenarios.json scenarios[${idx}]`, sc, `scenario ${sc.id}`) +
        (scene ? dumpFile(`content/course/scenes.json scene for ${sc.id}`, scene, `scene photo spots for ${sc.id}`) : '')
      );
    })
    .join('\n');
  write(`scenarios-${k + 1}`, text);
});

// Grammar, letters, pronunciation
write(
  'grammar',
  (read('content/course/grammar.json') as unknown[])
    .map((g, i) => dumpFile(`content/course/grammar.json [${i}]`, g, `grammar ${(g as { id: string }).id}`))
    .join('\n'),
);
write(
  'letters-pronunciation',
  (read('content/course/letters.json') as unknown[])
    .map((g, i) => dumpFile(`content/course/letters.json [${i}]`, g, `letter ${(g as { id: string }).id}`))
    .join('\n') +
    (read('content/course/pronunciation.json') as unknown[])
      .map((g, i) => dumpFile(`content/course/pronunciation.json [${i}]`, g, `pronunciation ${(g as { id: string }).id}`))
      .join('\n'),
);

// Vocabulary (+ word photo alts are skipped) and placards
write(
  'vocabulary',
  (read('content/course/vocabulary.json') as unknown[])
    .map((g, i) => dumpFile(`content/course/vocabulary.json [${i}]`, g, `word ${(g as { id: string }).id}`))
    .join('\n'),
);
write(
  'placards',
  (read('content/course/placards.json') as unknown[])
    .map((g, i) => dumpFile(`content/course/placards.json [${i}]`, g, `placard ${(g as { id: string }).id}`))
    .join('\n'),
);

// Culture chapters
const cultureFiles = readdirSync(join(root, 'content/culture'))
  .filter((f) => f.endsWith('.json'))
  .sort();
write(
  'culture',
  cultureFiles
    .map((f) => dumpFile(`content/culture/${f}`, read(`content/culture/${f}`), `culture ${f.replace('.json', '')}`))
    .join('\n'),
);

// Glossaries: word, transliteration, gloss
const hand = read('content/glossary/hand.json') as Record<string, string>;
const mistakes = read('content/glossary/mistakes.json') as Record<string, string>;
const auto = read('content/glossary/auto.json') as Record<string, string>;
write(
  'glossary-hand',
  [
    '### hand glossary (overrides the course glosses for exactly this vocalised form, app-wide)',
    '# source: content/glossary/hand.json',
    '',
    ...Object.entries(hand).map(([k, v]) => `${k} ⟶ ${tr(k)} = ${v}`),
  ].join('\n'),
);
write(
  'glossary-mistakes',
  [
    '### mistake notes (shown only on the wrong side of a mistake card, or for a non-word)',
    '# source: content/glossary/mistakes.json',
    '',
    ...Object.entries(mistakes).map(([k, v]) => `${k} ⟶ ${tr(k)} = ${v}`),
  ].join('\n'),
);
const autoLines = Object.entries(auto).map(([k, v]) => `${k} = ${v}`);
const perChunk = Math.ceil(autoLines.length / 2);
for (let i = 0; i < 2; i++)
  write(
    `glossary-auto-${i + 1}`,
    [
      '### auto glossary (vocalised keys: the meaning a tap shows outside a lesson, when the line has no curated gloss)',
      '# source: content/glossary/auto.json',
      '',
      ...autoLines.slice(i * perChunk, (i + 1) * perChunk),
    ].join('\n'),
  );

const total = written.reduce((s, [, n]) => s + n, 0);
for (const [n, b] of written) console.log(`${n}.txt  ${(b / 1024).toFixed(0)} KB`);
console.log(`audit-dump: ${written.length} files, ${(total / 1024 / 1024).toFixed(1)} MB → ${outDir}`);
