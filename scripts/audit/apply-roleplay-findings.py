"""Apply cross-check findings (docs/review/roleplay/X*.json) to content/course/roleplays.json.

    python -I -X utf8 scripts/audit/apply-roleplay-findings.py docs/review/roleplay/X1.json [...]

Each finding names scenario, node, where ("npc" | "choice N"), field (ar | en | segs | feedback), old and new.
Text fields: old must occur exactly once in the field. segs: old/new are JSON fragments of the segs list.
Any mismatch stops the run before anything is written.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
path = ROOT / 'content/course/roleplays.json'
data = json.loads(path.read_text(encoding='utf8'))
by = {r['scenario']: r for r in data}
extra = [a for a in sys.argv[1:] if a.startswith('--also=')]
errors, n = [], 0
for f in [a for a in sys.argv[1:] if not a.startswith('--')]:
    for x in json.loads((ROOT / f).read_text(encoding='utf8'))['findings']:
        node = next((nd for nd in by[x['scenario']]['nodes'] if nd['id'] == x['node']), None)
        if node is None:
            errors.append(f"{x['scenario']} {x['node']}: no node"); continue
        targets = [node['npc']] if x['where'] == 'npc' else [node['choices'][int(x['where'].split()[1])]]
        for t in targets:
            if x['field'] == 'segs':
                s = json.dumps(t['segs'], ensure_ascii=False)
                if s.count(x['old']) != 1:
                    errors.append(f"{x['scenario']} {x['node']} {x['where']} segs: old not found once"); continue
                t['segs'] = json.loads(s.replace(x['old'], x['new']))
            else:
                if t[x['field']].count(x['old']) != 1:
                    errors.append(f"{x['scenario']} {x['node']} {x['where']} {x['field']}: old not found once"); continue
                t[x['field']] = t[x['field']].replace(x['old'], x['new'])
            n += 1
if errors:
    print('NOT APPLIED:\n' + '\n'.join(errors)); sys.exit(1)
path.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n', encoding='utf8', newline='\n')
print(f'applied {n} edits')
