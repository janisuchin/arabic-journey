# python -I -X utf8 scripts/audit/fix-round1-content.py
# Accuracy review round 1, point 3: the Arabic, translation, rule and answer-key errors confirmed by the
# reviewers (docs/review/round-1). Text edits only (shared content files have mixed layouts): every
# replacement states how many times it must apply, and the script stops before writing if one does not.
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[2] / 'content'
files: dict[str, str] = {}


def text(f: str) -> str:
    if f not in files:
        files[f] = (root / f).read_text(encoding='utf8')
    return files[f]


def rep(f: str, old: str, new: str, n: int) -> None:
    """Replace every occurrence; there must be exactly n."""
    s = text(f)
    if s.count(old) != n:
        sys.exit(f'{f}: expected {n}× {old!r}, found {s.count(old)}')
    files[f] = s.replace(old, new)


def after(f: str, anchor: str, old: str, new: str) -> None:
    """Replace the first occurrence of old after the (unique) anchor, within 4000 characters."""
    s = text(f)
    if s.count(anchor) != 1:
        sys.exit(f'{f}: anchor {anchor!r} found {s.count(anchor)}×')
    a = s.index(anchor)
    i = s.find(old, a)
    if i < 0 or i - a > 4000:
        sys.exit(f'{f}: {old!r} not found after {anchor!r}')
    files[f] = s[:i] + new + s[i + len(old):]


# --- rules ------------------------------------------------------------------------------------------
# -īna / -ayni: the object of a verb or after a preposition (a subject after its verb keeps -ūna / -āni)
rep('days/day17.json', "After a preposition (here لِـ, 'to') and after a verb, -ūna becomes -īna.",
    "After a preposition (here لِـ, 'to') and as the object of a verb, -ūna becomes -īna.", 1)
rep('days/day20.json', 'Use ـَانِ as subject and ـَيْنِ after a verb or preposition',
    'Use ـَانِ as subject and ـَيْنِ as an object or after a preposition', 1)
rep('course/grammar.json', '"after a verb or preposition: + ـِينَ"', '"as an object or after a preposition: + ـِينَ"', 1)
rep('course/grammar.json', 'or ـَيْنِ (after a verb or preposition)', 'or ـَيْنِ (as an object or after a preposition)', 1)
rep('course/grammar.json', '"Dual (after a verb or preposition)"', '"Dual (as an object or after a preposition)"', 1)
rep('course/grammar.json', 'they end in ـِينَ after a verb or a preposition', 'they end in ـِينَ as an object or after a preposition', 1)
rep('course/vocabulary.json', '"dual after a verb or preposition"', '"dual as an object or after a preposition"', 1)
rep('course/vocabulary.json', '"label": "after a verb or preposition"', '"label": "as an object or after a preposition"', 3)
rep('course/vocabulary.json', 'and -īna after a verb or preposition', 'and -īna as an object or after a preposition', 1)
rep('course/scenarios.json', 'تَذْكِرَتَيْنِ (two tickets, after a verb)', 'تَذْكِرَتَيْنِ (two tickets, as the object of a verb)', 1)
s = text('course/grammar.json')
for old, new in [('After a verb or a preposition the ending becomes ـِينَ', 'As the object of a verb or after a preposition the ending becomes ـِينَ'),
                 ('after a verb or a preposition', 'as the object of a verb or after a preposition')]:
    files['course/grammar.json'] = files['course/grammar.json'].replace(old, new)
# time words on their own take the accusative: -an if indefinite, -a if definite or construct
rep('days/day38.json', 'Used on their own, without فِي, they take an -a ending: صَبَاحًا (in the morning), مَسَاءً (in the evening), يَوْمَ الْأَحَد (on Sunday).',
    'Used on their own, without فِي, they take the object ending: -an on an indefinite word, صَبَاحًا (in the morning), مَسَاءً (in the evening), and -a on a definite one, يَوْمَ الْأَحَد (on Sunday).', 1)
rep('days/day41.json', 'سَلَامَتُكَ to a man (salāmtik to a woman)', 'سَلَامَتُكَ to a man (سَلَامَتُكِ to a woman)', 1)
rep('days/day44.json', "take the 'you' form of the present, drop the ta- and the final vowel. تَفْتَحُ",
    "take the 'you' form of the present, drop the ta- and the final vowel, and put a helping i- (or u-) in front when the word would start with two consonants. تَفْتَحُ", 1)
rep('course/pronunciation.json', 'pull the back of the tongue down and back', 'pull the back of the tongue up and back', 1)
rep('course/pronunciation.json', 'Arabic never lets two consonants crash together across words.', 'Arabic never lets three consonants crash together across words.', 1)

# --- answer keys / mistake cards --------------------------------------------------------------------
rep('days/day79.json', "\"why\": \"After لَا meaning 'don't', the long ī at the end of تُعْطِي drops to a short i: lā tuʿṭi.\"",
    "\"why\": \"To a man, after لَا meaning 'don't', the long ī at the end of تُعْطِي drops to a short i: lā tuʿṭi. (To a woman it is lā tuʿṭī.)\"", 1)
rep('days/day90.json', '"wrong": "شَرِيكُ الْمُحَادَثَةِ"', '"wrong": "الشَّرِيكُ مُحَادَثَةٍ"', 1)
rep('days/day90.json', "\"why\": \"Without al- on the second word, the iḍāfa means 'a conversation partner', any one; with al- it means one particular partner.\"",
    "\"why\": \"The first word of an iḍāfa never takes al-: sharīku muḥādathatin is 'a conversation partner' (and sharīku l-muḥādathati 'the conversation partner').\"", 1)
rep('course/scenarios.json', '"wrong": "اِضْغَطِ الزِّرّ",\n        "right": "اِضْغَطْ عَلَى الزِّرّ",\n        "why": "In standard Arabic the verb ḍaghaṭa takes ʿalā: you press on the button, iḍghaṭ ʿalā z-zirr."',
    '"wrong": "اِضْغَطِي عَلَى الزِّرّ",\n        "right": "اِضْغَطْ عَلَى الزِّرّ",\n        "why": "To a man the order has no ending: iḍghaṭ ʿalā z-zirr (press the button). iḍghaṭī with -ī is for a woman."', 1)

# --- Arabic spelling and case --------------------------------------------------------------------------
rep('days/day16.json', 'مَقْهىً', 'مَقْهًى', 2)
rep('course/vocabulary.json', 'مَقْهىً', 'مَقْهًى', 1)
rep('days/day38.json', 'الْإِثْنَيْن', 'الِاثْنَيْن', 7)
rep('course/scenarios.json', 'الْإِثْنَيْن', 'الِاثْنَيْن', 2)
rep('days/day58.json', 'الاِسْتِقْبَال', 'الِاسْتِقْبَال', 3)
rep('course/vocabulary.json', 'الاِسْتِقْبَال', 'الِاسْتِقْبَال', 2)
rep('days/day64.json', 'اِجْتِمَاعًا', 'اجْتِمَاعًا', 2)
rep('course/vocabulary.json', '"ar": "انْتِبَاه"', '"ar": "اِنْتِبَاه"', 1)
rep('course/vocabulary.json', '"ar": "انْتِبَاه مِنْ فَضْلِكُمْ!"', '"ar": "اِنْتِبَاه مِنْ فَضْلِكُمْ!"', 1)
# Today is (the fifth / Thursday): a nominal sentence, so the subject is al-yawmu
rep('course/grammar.json', 'الْيَوْمَ الْخَامِسُ مِنْ نُوفَمْبِر', 'الْيَوْمُ الْخَامِسُ مِنْ نُوفَمْبِر', 1)
rep('course/vocabulary.json', 'الْيَوْمَ الْخَامِسُ مِنْ نُوفَمْبِر', 'الْيَوْمُ الْخَامِسُ مِنْ نُوفَمْبِر', 2)
rep('days/day56.json', 'الْيَوْمَ الْخَامِسُ مِنْ نُوفَمْبِر', 'الْيَوْمُ الْخَامِسُ مِنْ نُوفَمْبِر', 2)
after('days/day56.json', '"id": "d56s2"', '["الْيَوْمَ", "today", "adverb"]', '["الْيَوْمُ", "today (the day)", "noun"]')
rep('days/day72.json', 'مَسَاءُ الْخَيْر! الْيَوْمَ الْخَمِيس،', 'مَسَاءُ الْخَيْر! الْيَوْمُ الْخَمِيس،', 1)
after('days/day72.json', 'مَسَاءُ الْخَيْر! الْيَوْمُ الْخَمِيس،', '"الْيَوْمَ"', '"الْيَوْمُ"')
# iḍāfa first terms with their case vowel
rep('days/day61.json', 'عَمَّان مَدِينَة جِبَال،', 'عَمَّان مَدِينَةُ جِبَال،', 1)
after('days/day61.json', 'عَمَّان مَدِينَةُ جِبَال،', '["مَدِينَة", "city (of)"]', '["مَدِينَةُ", "city (of)"]')
rep('days/day65.json', 'مَا مَعْنَى كَلِمَة دِيوَان؟', 'مَا مَعْنَى كَلِمَةِ دِيوَان؟', 1)
after('days/day65.json', 'مَا مَعْنَى كَلِمَةِ دِيوَان؟', '["كَلِمَة", "word (of)"]', '["كَلِمَةِ", "word (of)"]')
rep('days/day68.json', 'وَأَيْضًا فِي كَلِمَة مَدْرَسَة،', 'وَأَيْضًا فِي كَلِمَةِ مَدْرَسَة،', 1)
after('days/day68.json', 'وَأَيْضًا فِي كَلِمَةِ مَدْرَسَة،', '"كَلِمَة",', '"كَلِمَةِ",')
# the superlative + indefinite singular in the genitive (akbaru madīnatin)
rep('culture/places.json', 'الْقَاهِرَة أَكْبَرُ مَدِينَة فِي مِصْر.', 'الْقَاهِرَة أَكْبَرُ مَدِينَةٍ فِي مِصْر.', 2)
after('culture/places.json', '"id": "pls4"', '["مَدِينَة", ', '["مَدِينَةٍ", ')
rep('culture/places.json', 'الْخَزْنَة أَشْهَرُ مَكَان فِي الْبَتْرَاء.', 'الْخَزْنَة أَشْهَرُ مَكَانٍ فِي الْبَتْرَاء.', 1)
after('culture/places.json', '"id": "pls5"', '["مَكَان", ', '["مَكَانٍ", ')
rep('culture/places.json', 'بُرْجُ خَلِيفَة أَطْوَلُ بُرْج فِي الْعَالَم.', 'بُرْجُ خَلِيفَة أَطْوَلُ بُرْجٍ فِي الْعَالَم.', 1)
after('culture/places.json', '"id": "pls11"', '["بُرْج", "tower", "noun"]', '["بُرْجٍ", "tower", "noun"]')
# the surname al-Miṣrī: MSA nisba of مِصْر, as the chapter's own quiz writes it
rep('culture/family.json', 'الْمَصْرِيّ', 'الْمِصْرِيّ', 3)
rep('culture/family.json', 'al-Masri', 'al-Misri', 3)
# a standalone quiz phrase is nominative
rep('course/scenarios.json', '"ar": "رَقْمِ التَّتَبُّع', '"ar": "رَقْمُ التَّتَبُّع', 1)
# objects with -an, like the others in the same line
rep('course/scenarios.json', 'خُذْ قُبَّعَة وَمَاءً كَثِيرًا', 'خُذْ قُبَّعَةً وَمَاءً كَثِيرًا', 1)
after('course/scenarios.json', 'خُذْ قُبَّعَةً وَمَاءً كَثِيرًا', '"قُبَّعَة",', '"قُبَّعَةً",')

# --- translations ---------------------------------------------------------------------------------
rep('days/day06.json', 'Yes, the pen is new, and my bag is new too.', 'Yes, the pen is new, and the bag is new too.', 1)
rep('days/day04.json', "You're welcome, Yusuf! Welcome to our class.", "You're welcome, Yusuf! Welcome to the class.", 1)
rep('days/day24.json', '"By bus and taxi"', '"By bus or taxi"', 1)
rep('course/course.json', 'By bus and taxi', 'By bus or taxi', 1)
rep('course/grammar.json', 'مِنْ أَعْلَى الْجِبَال (one of the highest hills)', 'مِنْ أَعْلَى الْجِبَال (one of the highest mountains)', 1)
rep('course/pronunciation.json', 'ḥāl (condition) and hāl (halo) sound different.', 'ḥāl (condition) and hāl (cardamom) sound different.', 1)
rep('course/pronunciation.json', '"en": "halo, cardamom"', '"en": "cardamom"', 1)
rep('course/pronunciation.json', '"en": "humble"', '"en": "lowly, humiliated"', 1)
rep('course/scenarios.json', 'Fifty pounds. The road is very crowded today.', 'Fifty pounds. The road is crowded today.', 1)

for f, s in files.items():
    (root / f).write_text(s, encoding='utf8')
print(f'round-1 content fixes written to {len(files)} files')
