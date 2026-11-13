# python -I -X utf8 scripts/audit/tap-diff.py <beforeDir> <afterDir> [word ...]
# Compares the tap glosses of two audit exports: how many changed, newly empty (∅) and newly filled,
# and prints every change for the given words (or a sample).
import sys
from pathlib import Path


def taps(d):
    out = {}
    for f in sorted(Path(d).glob('*.txt')):
        if f.stem.startswith('glossary'):
            continue
        path = None
        for line in f.read_text(encoding='utf8').splitlines():
            if line.startswith('  tap: '):
                for i, p in enumerate(line[7:].split(' · ')):
                    w, _, g = p.partition('=')
                    out[(f.stem, path, i)] = (w, g)
            elif not line.startswith('  '):
                path = line.split(': ', 1)[0]
    return out


a, b = taps(sys.argv[1]), taps(sys.argv[2])
words = set(sys.argv[3:])
changed = emptied = filled = 0
shown = 0
for k, (w, g) in a.items():
    if k not in b:
        continue
    g2 = b[k][1]
    if g == g2:
        continue
    changed += 1
    emptied += g2 == '∅'
    filled += g == '∅'
    if (words and w in words) or (not words and shown < 60 and k[2] == 0):
        shown += 1
        print(f'{k[0]} {k[1]}: {w}  {g}  →  {g2}')
print(f'tap glosses: {len(a)} before, {changed} changed, {emptied} now ∅, {filled} were ∅ and now filled')
