"""Merge per-scenario writer output into the shared Arabic Journey content files — append-only text inserts.
Usage: python -I -X utf8 merge-scenarios.py <repo> <scratch-root> [--dry]
Reads <scratch-root>/*/scenario.json (and optional hand.json). New scenarios are appended to
content/course/scenarios.json (pretty-printed, 2-space indent) and new hand-glossary keys to content/glossary/hand.json.
Existing text is never re-serialised; files are written with LF (repo .gitattributes eol=lf)."""
import json, sys, glob, os

repo, root = sys.argv[1], sys.argv[2]
dry = '--dry' in sys.argv
P = lambda *a: os.path.join(repo, 'content', *a)


def read(path):
    raw = open(path, encoding='utf8', newline='').read().replace('\r\n', '\n')
    return raw, json.loads(raw)


def append(raw, closer, pieces):
    if not pieces:
        return raw
    body = raw.rstrip()
    assert body.endswith(closer), closer
    tail_nl = '\n' if raw.endswith('\n') else ''
    body = body[:-1].rstrip()
    return body + ''.join(',\n' + p for p in pieces) + '\n' + closer + tail_nl


sp, hp = P('course', 'scenarios.json'), P('glossary', 'hand.json')
(sraw, scen), (hraw, hand) = read(sp), read(hp)
ids = {s['id'] for s in scen}
new_s, new_h, report = [], [], []
for f in sorted(glob.glob(os.path.join(root, '*', 'scenario.json'))):
    s = json.load(open(f, encoding='utf8'))
    if s['id'] in ids:
        report.append(f'scenario {s["id"]} exists, skipped')
        continue
    ids.add(s['id'])
    new_s.append('\n'.join('  ' + l for l in json.dumps(s, ensure_ascii=False, indent=2).split('\n')))
    hf = os.path.join(os.path.dirname(f), 'hand.json')
    if os.path.exists(hf):
        for k, v in json.load(open(hf, encoding='utf8')).items():
            if k in hand:
                if hand[k] != v:
                    report.append(f'{s["id"]}: hand "{k}" differs, kept existing')
                continue
            hand[k] = v
            new_h.append('  ' + json.dumps(k, ensure_ascii=False) + ': ' + json.dumps(v, ensure_ascii=False))

out = {sp: append(sraw, ']', new_s), hp: append(hraw, '}', new_h)}
for p, t in out.items():
    json.loads(t)
    if not dry:
        open(p, 'w', encoding='utf8', newline='\n').write(t)
print('\n'.join(report))
print(f'new scenarios {len(new_s)} (total {len(ids)}), new hand {len(new_h)}' + (' [dry]' if dry else ''))
