# python -I -X utf8 scripts/audit/fix-round2b-content.py
# Round 2, rows left open at the first pass (docs/STATUS.md Left 2). Counted text replacements.
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[2] / 'content'


def after(f, anchor, old, new):
    p = root / f
    s = p.read_text(encoding='utf8')
    if s.count(anchor) != 1:
        sys.exit(f'{f}: anchor {anchor!r} found {s.count(anchor)}x')
    a = s.index(anchor)
    i = s.find(old, a)
    if i < 0 or i - a > 1500:
        sys.exit(f'{f}: {old!r} not found after {anchor!r}')
    p.write_text(s[:i] + new + s[i + len(old):], encoding='utf8', newline='\n')


# day 40 quiz 2: bayda mā akalnā is also correct MSA, so mā cannot be a wrong option
after('days/day40.json', '"id": "d40q2"', '"مَا"', '"عَنْ"')
# day 53: the wrong side must read differently from the right side (khamsatu ≠ khamsu)
after('days/day53.json', '"wrong": "سَتَكُونُ دَرَجَةُ الْحَرَارَة خَمْسَة دَرَجَات"', 'خَمْسَة دَرَجَات', 'خَمْسَةُ دَرَجَات')
# day 82: the bi- is the set phrase of formal letters, not a rule without which Arabic 'sounds broken'
after('days/day82.json', '"why": "atasharrafu always takes bi-',
      'atasharrafu always takes bi-: bi-an + a verb (bi-an ataqaddama). Without bi- the phrase sounds broken.',
      'In a formal letter the set phrase is atasharrafu bi-an + a verb (bi-an ataqaddama): keep the bi-.')
print('round-2b content fixes written')
