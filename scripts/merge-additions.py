"""Merge per-day additions.json files into the shared Arabic Journey content files — append-only text inserts.
Usage: python -I -X utf8 merge.py <repo> <additions-root> <week> [--dry]
Existing text is never re-serialised: new entries are inserted before the closing bracket/brace, and the
week test replaces that week's empty `"test": []`. Files are written with LF (repo .gitattributes eol=lf)."""
import json, sys, glob, os, re

repo, root, week = sys.argv[1], sys.argv[2], int(sys.argv[3])
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

paths = {'vocab': P('course', 'vocabulary.json'), 'grammar': P('course', 'grammar.json'),
         'hand': P('glossary', 'hand.json'), 'course': P('course', 'course.json')}
raws, objs = {}, {}
for k, p in paths.items():
    raws[k], objs[k] = read(p)

vids = {e['id']: e for e in objs['vocab']}
gids = {e['id'] for e in objs['grammar']}
hand = dict(objs['hand'])
new_v, new_g, new_h, week_test, report = [], [], [], None, []
for f in sorted(glob.glob(os.path.join(root, 'day*', 'additions.json'))):
    day = os.path.basename(os.path.dirname(f))
    add = json.load(open(f, encoding='utf8'))
    for e in add.get('vocabulary', []):
        if e['id'] in vids:
            old = vids[e['id']]
            report.append(f'{day}: vocab {e["id"]} exists ' + ('(same word, skipped)' if old['ar'] == e['ar'] else f'(DIFFERENT word {old["ar"]} vs {e["ar"]})'))
            continue
        vids[e['id']] = e; new_v.append('  ' + json.dumps(e, ensure_ascii=False))
    for g in add.get('grammar', []):
        if g['id'] in gids:
            report.append(f'{day}: grammar {g["id"]} exists, skipped'); continue
        gids.add(g['id'])
        new_g.append('\n'.join('  ' + l for l in json.dumps(g, ensure_ascii=False, indent=2).split('\n')))
    for k, v in add.get('hand', {}).items():
        if k in hand:
            if hand[k] != v: report.append(f'{day}: hand "{k}" differs, kept existing')
            continue
        hand[k] = v; new_h.append('  ' + json.dumps(k, ensure_ascii=False) + ': ' + json.dumps(v, ensure_ascii=False))
    if add.get('weekTest'):
        week_test = add['weekTest']; report.append(f'{day}: week {week} test ({len(week_test)} questions)')

out = {'vocab': append(raws['vocab'], ']', new_v), 'grammar': append(raws['grammar'], ']', new_g),
       'hand': append(raws['hand'], '}', new_h), 'course': raws['course']}
if week_test:
    m = re.search(r'"week": %d,.*?"test": \[\]' % week, out['course'], re.S)
    assert m and '"week": %d,' % (week + 1) not in m.group(0), 'week test slot not found'
    ind = ' ' * (len(m.group(0)) - len(m.group(0).rstrip()) + 0)
    test_txt = json.dumps(week_test, ensure_ascii=False, indent=1).replace('\n', '\n  ')
    out['course'] = out['course'][:m.end() - 2] + test_txt + out['course'][m.end():]
for k in out:
    json.loads(out[k])  # still valid JSON
print('\n'.join(report) or 'no conflicts')
print(f'new vocab {len(new_v)}, new grammar {len(new_g)}, new hand {len(new_h)}, week test {bool(week_test)}')
if not dry:
    for k, p in paths.items():
        if out[k] != raws[k] or True:
            open(p, 'w', encoding='utf8', newline='').write(out[k])
