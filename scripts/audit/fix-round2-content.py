# python -I -X utf8 scripts/audit/fix-round2-content.py
# Accuracy review round 2 (docs/review/round-2): content errors and hand glosses confirmed by the reviewers.
# Text edits only, every replacement counted (shared content files have mixed layouts). The tap mechanism
# fixes of round 2 (form glosses, names, elatives, grammar-page day, tanwīn) are in src/lang/ar/tap.ts.
import json
import re
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[2] / 'content'
files: dict[str, str] = {}


def text(f):
    if f not in files:
        files[f] = (root / f).read_text(encoding='utf8')
    return files[f]


def rep(f, old, new, n):
    s = text(f)
    if s.count(old) != n:
        sys.exit(f'{f}: expected {n}x {old!r}, found {s.count(old)}')
    files[f] = s.replace(old, new)


def rx(f, pattern, new, n):
    s = text(f)
    found = len(re.findall(pattern, s))
    if found != n:
        sys.exit(f'{f}: expected {n}x /{pattern}/, found {found}')
    files[f] = re.sub(pattern, new, s)


def after(f, anchor, old, new):
    s = text(f)
    if s.count(anchor) != 1:
        sys.exit(f'{f}: anchor {anchor!r} found {s.count(anchor)}x')
    a = s.index(anchor)
    i = s.find(old, a)
    if i < 0 or i - a > 4000:
        sys.exit(f'{f}: {old!r} not found after {anchor!r}')
    files[f] = s[:i] + new + s[i + len(old):]


# --- the -ayni / -īna rule: the object of a verb or after a preposition, never just "after a verb" --------
rep('course/grammar.json', 'After a verb or a preposition the ending is ـَيْنِ', 'As the object of a verb or after a preposition the ending is ـَيْنِ', 1)
rep('days/day20.json', 'After a verb or a preposition the ending is ـَيْنِ', 'As the object of a verb or after a preposition the ending is ـَيْنِ', 1)
rep('days/day20.json', 'After a verb (here: the object of أُرِيدُ) the dual ending is -ayni', 'As the object of a verb (here: of أُرِيدُ) the dual ending is -ayni', 1)
rep('course/scenarios.json', '"why": "After a verb the dual ends in -ayni, not -āni."', '"why": "As the object of a verb the dual ends in -ayni, not -āni."', 1)
rep('course/scenarios.json', '"why": "After a verb the dual ends in -ayni: tadhkiratayni."', '"why": "As the object of a verb the dual ends in -ayni: tadhkiratayni."', 1)
rep('course/vocabulary.json', 'After a verb or preposition the dual is صَدِيقَيْنِ.', 'As an object or after a preposition the dual is صَدِيقَيْنِ.', 1)
rep('course/vocabulary.json', 'plural after a preposition or verb', 'plural as an object or after a preposition', 1)
# numbers: the singular accusative follows 11-99 only; after mi'a and alf the noun is genitive
rep('course/grammar.json', 'From 11 upwards the singular follows, with the ending ـَةً: عِشْرُونَ سَنَةً.',
    'From 11 to 99 the singular follows, with the ending ـَةً: عِشْرُونَ سَنَةً (after مِئَة and أَلْف it takes -in: مِئَةُ سَنَةٍ).', 1)
rep('days/day34.json', 'From 11 upwards the singular سَنَةً follows', 'From 11 to 99 the singular سَنَةً follows', 1)
rep('days/day34.json', 'From 11 upwards the counted word is singular', 'From 11 to 99 the counted word is singular', 1)
rep('course/grammar.json', 'مَنْ never changes and always takes a singular verb', 'مَنْ never changes and normally takes a singular verb', 1)
rep('days/day77.json', 'man (whoever) always takes a singular verb, even when it means many people.', 'man (whoever) normally takes a singular verb, even when it means many people.', 1)
rep('days/day40.json', 'said far back in the throat?', 'made at the very back of the mouth?', 1)
rep('course/pronunciation.json', 'pulled down and back', 'pulled up and back', 1)

# --- Arabic -----------------------------------------------------------------------------------------
for f, n in [('course/placards.json', 3), ('course/vocabulary.json', 2), ('days/day09.json', 6), ('days/day10.json', 6)]:
    rep(f, 'الاِ', 'الِا', n)  # the helping kasra of al- + a hamzat-waṣl noun goes on the lām
rx('days/day17.json', 'مَحْشِي(?![ً-ْ])', 'مَحْشِيّ', 2)
rx('course/scenarios.json', 'مَحْشِي(?![ً-ْ])', 'مَحْشِيّ', 8)
rep('days/day28.json', 'تَقْتَرِحُونَ', 'تَقْتَرِحَانِ', 2)  # Daniel asks two friends: the dual
rep('days/day28.json', '"you suggest (to several people)"', '"you suggest (to two people)"', 1)
rep('days/day54.json', 'وَتَكُونُ حَارَّة وَفِيهَا', 'وَتَكُونُ حَارَّةً وَفِيهَا', 1)
after('days/day54.json', 'وَتَكُونُ حَارَّةً وَفِيهَا', '"حَارَّة"', '"حَارَّةً"')
rep('days/day88.json', 'أَيَّ الْحُرُوفِ', 'أَيُّ الْحُرُوفِ', 1)
after('days/day88.json', 'أَيُّ الْحُرُوفِ', '"أَيَّ"', '"أَيُّ"')
rep('course/scenarios.json', 'أَيَّهُمَا لِلْوَرَقَة', 'أَيُّهُمَا لِلْوَرَقَة', 1)
after('course/scenarios.json', 'أَيُّهُمَا لِلْوَرَقَة', '"أَيَّهُمَا"', '"أَيُّهُمَا"')
rep('days/day86.json', 'الْمُشْكِلَةَ الْأَكْبَرَ', 'الْمُشْكِلَةَ الْكُبْرَى', 1)
after('days/day86.json', 'الْمُشْكِلَةَ الْكُبْرَى', '"الْأَكْبَرَ"', '"الْكُبْرَى"')
rep('course/grammar.json', 'أَدَاة التَّعْرِيف', 'أَدَاةُ التَّعْرِيف', 1)
rep('course/pronunciation.json', '"ar": "حَار"', '"ar": "حَارّ"', 1)
rep('course/scenarios.json', 'صَبَاحَ الْخَيْر', 'صَبَاحُ الْخَيْر', 2)
rep('course/scenarios.json', 'صَبَاحَ النُّور', 'صَبَاحُ النُّور', 2)
rx('course/scenarios.json', '"صَبَاحَ"', '"صَبَاحُ"', 4)
rep('course/scenarios.json', 'مَحْفَظَ', 'مِحْفَظَ', 4)  # the course spells wallet مِحْفَظَة everywhere else
rep('course/scenarios.json', 'iḥtafiẕ', 'iḥtafiẓ', 1)
rep('course/vocabulary.json', '"ar": "انْظُرُوا إِلَى', '"ar": "اُنْظُرُوا إِلَى', 1)  # sentence-initial u-imperative
rep('culture/places.json', 'أَطْوَلُ بُرْج فِي', 'أَطْوَلُ بُرْجٍ فِي', 1)
rep('culture/places.json', 'أَقْدَمُ مَكَان زُرْتُهُ', 'أَقْدَمُ مَكَانٍ زُرْتُهُ', 2)
rep('days/day64.json', 'مُدِيرَةُ الشَّرِكَة اِسْمُهَا', 'مُدِيرَةُ الشَّرِكَة اسْمُهَا', 1)
# الْوَاحِدَة is the cardinal 'one' (one o'clock); 'the first' is الْأُولَى
rep('course/scenarios.json', "the first (f): one o'clock", "one (f): one o'clock", 4)
rep('days/day10.json', "the first (f): one o'clock", "one (f): one o'clock", 2)
rep('days/day64.json', "the first ('one o'clock')", "one ('one o'clock')", 1)
rep('days/day89.json', "the first ('one')", "one (f)", 1)

# --- translations -------------------------------------------------------------------------------------
rep('days/day03.json', 'big and very beautiful family', 'big and beautiful family', 1)
rep('days/day01.json', 'I really love the Arabic', 'I love the Arabic', 1)

for f, s in files.items():
    (root / f).write_text(s, encoding='utf8', newline='\n')

# --- hand glossary: one gloss per exact vocalised form, true in every line where that form appears -----
HAND = {
    # particles whose sense depends on the next word: every sense, so no line gets a wrong one
    'مَا': "what; not (before a past verb); how (in 'how …!')",
    'لَا': "no; not (before a present verb); don't (before a short verb form)",
    'مِنْ': 'from; than (after a comparative); of, one of',
    'مِنَ': 'from; than (after a comparative); of',
    'مَنْ': 'who; whoever',
    'إِنَّ': "indeed (starts a statement); that (after qāla, 'said')",
    'وَإِنَّ': 'and indeed',
    'هُنَاكَ': 'there; there is, there are',
    'هٰذِهِ': 'this (f); these (for things)',
    'لِـ': 'for, to; in order to (before a verb)',
    'تَ': 'ta- (present-tense prefix: you, she)',
    'يَ': 'ya- (present-tense prefix: he, they)',
    'نَ': 'na- (present-tense prefix: we)',
    'ـًا': '-an (ending: an indefinite object; also adverbs like shukran)',
    # words whose only course gloss was one sentence's sense or person
    'طَوِيل': 'long; tall',
    'يَنْزِلُ': 'gets off, gets out; goes down',
    'مُسَافِر': 'traveller (m)',
    'مِلْيُونَ': 'million (object form, or after a number)',
    'حِمَايَةُ': 'protection, protecting (of)',
    'اِكْتَشَفَ': '(he) discovered',
    'صَنَعَ': '(he) made',
    'شَابَّة': 'young woman',
    'زَارَنَا': '(he) visited us',
    'يَصُومُ': '(he) fasts',
    'سَيَخْرُجُ': '(he) will go out',
    'تَأْتِي': 'you come (to a man); she comes',
    'تُكَرِّرَ': 'you repeat (to a man); she repeats (form after an)',
    'تَصِلُ': 'you arrive (to a man); she arrives',
    'تَكْتُبُ': 'you write (to a man); she writes',
    'تَشْرَبُ': 'you drink (to a man); she drinks',
    'كَانُوا': 'they were',
    'يَحْضُرُ': '(he) attends, comes',
    'شَرِيحَة': 'SIM card; slide, slice',
    'الشَّرِيحَة': 'the SIM card; the slide',
    'شَرَائِح': 'SIM cards; slides',
    'سَادَة': 'plain (coffee, without sugar); gentlemen (plural of sayyid)',
    'الْوَاحِدَة': "one (f); one o'clock",
    'الْوَاحِدَةِ': "one (f); one o'clock",
    # round-2 corrections of hand glosses
    'ـُ': '-u (case ending: the subject and the predicate)',
    'أَبُوهُ': 'his father (subject form; as an object: abāhu)',
}
MISTAKES = {
    'طَبَقَانِ': 'two dishes (wrong as an object — correct: ṭabaqayni)',
    'تَذْكِرَتَانِ': 'two tickets (wrong as an object — correct: tadhkiratayni)',
    'لِأَدْعُو': 'to invite (wrong here — correct: li-adʿuwaka, to invite you)',
}


def set_entries(path, entries):
    p = root / path
    s = p.read_text(encoding='utf8')
    data = json.loads(s)
    out, done = [], set()
    for line in s.splitlines(keepends=True):
        m = re.match(r'\s*("(?:[^"\\]|\\.)*")\s*:', line)
        key = json.loads(m.group(1)) if m else None
        if key in entries:
            comma = ',' if line.rstrip().endswith(',') else ''
            line = f'  {json.dumps(key, ensure_ascii=False)}: {json.dumps(entries[key], ensure_ascii=False)}{comma}\n'
            done.add(key)
        out.append(line)
    s = ''.join(out).rstrip().rstrip('}').rstrip()
    new = [k for k in entries if k not in done]
    if new:
        s += ',\n' + ',\n'.join(f'  {json.dumps(k, ensure_ascii=False)}: {json.dumps(entries[k], ensure_ascii=False)}' for k in new)
    s += '\n}\n'
    json.loads(s)
    p.write_text(s, encoding='utf8', newline='\n')
    print(f'{path}: {len(done)} updated, {len(new)} added (was {len(data)})')


set_entries('glossary/hand.json', HAND)
set_entries('glossary/mistakes.json', MISTAKES)
print(f'round-2 content fixes written to {len(files)} files')
