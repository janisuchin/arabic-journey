"""Apply the round's fix plans (docs/review/round-N/plan-*.json) in one pass.

    python -I -X utf8 scripts/audit/apply-plans.py docs/review/round-3 [--dry]

Ops: text (counted find-and-replace in the raw file, line endings untouched), scoped
(content/glossary/scoped.json), hand (content/glossary/hand.json, existing key replaced in place, new key appended).
Engine ops are listed, not applied. Any count mismatch or conflicting gloss stops the run before anything is written.
Writes <round>/APPLIED.md with every op and its result.
"""

import json
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def main() -> None:
    round_dir = ROOT / sys.argv[1]
    dry = '--dry' in sys.argv
    plans = sorted(round_dir.glob('plan-*.json'))
    ops = []
    for p in plans:
        data = json.loads(p.read_text(encoding='utf8'))
        for op in data.get('ops', []):
            op['_plan'] = p.stem
            ops.append(op)

    errors: list[str] = []
    files: dict[str, str] = {}

    def raw(rel: str) -> str:
        if rel not in files:
            with open(ROOT / rel, encoding='utf8', newline='') as f:
                files[rel] = f.read()
        return files[rel]

    # text ops, in plan order; each count is checked against the file as already changed by earlier ops
    log: list[str] = []
    for op in [o for o in ops if o['op'] == 'text']:
        rel = op['file'].replace('\\', '/')
        s = raw(rel)
        n = s.count(op['old'])
        if n != op['count']:
            errors.append(f"{op['_plan']} {op.get('chunk')} {op.get('ids')}: {rel} has {n}× old, plan says {op['count']}")
            continue
        files[rel] = s.replace(op['old'], op['new'])
        log.append(f"| {op['_plan']} | {op.get('chunk')} {op.get('ids')} | text | `{rel}` ×{n} |")

    # glossary ops: one gloss per (word, scope); identical duplicates are fine
    scoped_new: dict[str, dict[str, str]] = defaultdict(dict)
    hand_new: dict[str, str] = {}
    for op in ops:
        if op['op'] == 'scoped':
            prev = scoped_new[op['word']].get(op['scope'])
            if prev and prev != op['gloss']:
                errors.append(f"conflict scoped {op['word']} {op['scope']}: '{prev}' vs '{op['gloss']}' ({op['_plan']})")
            scoped_new[op['word']][op['scope']] = op['gloss']
            log.append(f"| {op['_plan']} | {op.get('chunk')} {op.get('ids')} | scoped | {op['word']} @ {op['scope']} = {op['gloss']} |")
        elif op['op'] == 'hand':
            prev = hand_new.get(op['word'])
            if prev and prev != op['gloss']:
                errors.append(f"conflict hand {op['word']}: '{prev}' vs '{op['gloss']}' ({op['_plan']})")
            hand_new[op['word']] = op['gloss']
            log.append(f"| {op['_plan']} | {op.get('chunk')} {op.get('ids')} | hand | {op['word']} = {op['gloss']} |")
        elif op['op'] == 'engine':
            log.append(f"| {op['_plan']} | {op.get('chunk')} {op.get('ids')} | engine | {op['note'][:160]} |")
        elif op['op'] != 'text':
            errors.append(f"unknown op {op['op']} in {op['_plan']}")

    if errors:
        print('NOT APPLIED:\n' + '\n'.join(errors))
        sys.exit(1)

    # scoped.json: merge, sorted keys, LF
    sp = ROOT / 'content/glossary/scoped.json'
    scoped = json.loads(sp.read_text(encoding='utf8'))
    for w, m in scoped_new.items():
        scoped.setdefault(w, {}).update(m)
    scoped_text = json.dumps(dict(sorted(scoped.items())), ensure_ascii=False, indent=2) + '\n'

    # hand.json: replace values in place, append new keys before the closing brace
    hp = 'content/glossary/hand.json'
    h = raw(hp)
    for w, g in hand_new.items():
        key = json.dumps(w, ensure_ascii=False)
        pat = re.compile(r'(\n\s*' + re.escape(key) + r'\s*:\s*)"(?:[^"\\]|\\.)*"')
        if pat.search(h):
            h = pat.sub(lambda m: m.group(1) + json.dumps(g, ensure_ascii=False), h, count=1)
        else:
            nl = '\r\n' if '\r\n' in h else '\n'
            i = h.rstrip().rfind('}')
            body = h[:i].rstrip()
            h = body + ',' + nl + '  ' + key + ': ' + json.dumps(g, ensure_ascii=False) + nl + h[i:]
    json.loads(h)  # still valid
    files[hp] = h

    if dry:
        print(f'dry run OK: {len(ops)} ops from {len(plans)} plans')
        return
    for rel, s in files.items():
        with open(ROOT / rel, 'w', encoding='utf8', newline='') as f:
            f.write(s)
    with open(sp, 'w', encoding='utf8', newline='\n') as f:
        f.write(scoped_text)
    counts = defaultdict(int)
    for o in ops:
        counts[o['op']] += 1
    head = [
        f'# {round_dir.name}: applied fix plans',
        '',
        f"{len(ops)} ops from {', '.join(p.stem for p in plans)}: " + ', '.join(f'{k} {v}' for k, v in sorted(counts.items())),
        'Engine ops are implemented in code (see the round summary).',
        '',
        '| Plan | Finding | Op | Detail |',
        '|---|---|---|---|',
    ]
    (round_dir / 'APPLIED.md').write_text('\n'.join(head + log) + '\n', encoding='utf8', newline='\n')
    print(f'applied {len(ops)} ops; files: {len(files)} + scoped.json')


if __name__ == '__main__':
    main()
