"""Check every fix-plan expectation against a fresh export (npx tsx scripts/audit/audit-dump.ts first).

    python -I -X utf8 scripts/audit/verify-plans.py docs/review/round-3

A check passes when its `expect` text occurs in audit/<area>.txt (glossary checks also accept the export's
"word = gloss" spacing). Writes <round>/VERIFY.md and exits 1 if any check fails.
"""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
AREA = {'vocabulary-1': 'vocabulary', 'vocabulary-2': 'vocabulary'}


def text_of(area: str) -> str:
    area = AREA.get(area, area)
    names = [area] + (['glossary-mistakes'] if area == 'glossary-hand' else [])
    return '\n'.join((ROOT / 'audit' / f'{n}.txt').read_text(encoding='utf8') for n in names if (ROOT / 'audit' / f'{n}.txt').exists())


def main() -> None:
    round_dir = ROOT / sys.argv[1]
    cache: dict[str, str] = {}
    ok, bad = [], []
    for p in sorted(round_dir.glob('plan-*.json')):
        for c in json.loads(p.read_text(encoding='utf8')).get('checks', []):
            area = c['area']
            t = cache.setdefault(area, text_of(area))
            e = c['expect']
            hit = e in t or e.replace('=', ' = ', 1) in t or e.replace(' = ', '=', 1) in t
            (ok if hit else bad).append((p.stem, c.get('chunk'), c.get('ids'), area, e))
    lines = [f'# {round_dir.name}: fix verification against the fresh export', '',
             f'{len(ok)} of {len(ok) + len(bad)} checks found in the new export.', '']
    if bad:
        lines += ['## Not found', '', '| Plan | Finding | Area | Expected |', '|---|---|---|---|']
        lines += [f'| {a} | {b} {c} | {d} | {e} |' for a, b, c, d, e in bad]
    (round_dir / 'VERIFY.md').write_text('\n'.join(lines) + '\n', encoding='utf8', newline='\n')
    print(f'{len(ok)} ok, {len(bad)} not found')
    for b in bad:
        print(' ', b)
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
