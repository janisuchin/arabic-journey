# Final review round (2026-11-13): review closed

**Reviewer of record: the course owner (decision), with AI recommendations (Claude). No human Arabic teacher review
took place**; the owner decided on 2026-11-13 that the course will not go to an outside teacher and closed the review
with this round. Every open question of `docs/review/TEACHER-REVIEW-PACK.md` (sections A–F, R12-1…58) has a
decision in `DECISIONS.md`.

## How
Decisions → five planners by area (`plan-G1`…`plan-G5`, 338 ops) → `scripts/audit/apply-plans.py` → course-wide
spelling pass (`z/plan-Z.json`, 95 ops) → tap meanings for new words (`h/plan-H.json`, 12 hand glosses) → rebuild
(`content:index`, `readings:build`, `glossary:auto`) → fresh export → `verify-plans.py`.

Verification: round-final 341/343, Z 95/95, H 12/12 (checked by hand: the hand export prints `word ⟶ reading =
gloss`, which the checker's pattern does not match). The 2 misses are format-only: الزَّبَادِي shows "the yoghurt"
(auto spelling), and the lāzim card row is present (table rows carry no tap line). Older rounds: 3F 58/59, round 3
228/230; the 3 misses quote forms this round replaced on purpose (عَلِي, تُعْطِيكَ, يَنْزِلُ الثَّلْج).
Checks: validator 0 errors, 107 unit tests, typecheck/lint/format clean, e2e 28/28 (port 4191).

## What changed for the learner
- **Grammar notes softened where both forms are good** ("usually", "better", "less usual" instead of "wrong"):
  bi-an (day 82), plurals of things + masculine verb (day 89), istamaʿa li-/ilā (85), laysa + present (13),
  rakiba ʿalā (42), murfaq (82); lam + short form of the present (scenario, grammar card, week test).
- **Endings shown where the grammar needs them** (house style confirmed: pause form, with endings for adverbial -an,
  kāna/laysa predicates, inna/anna nouns, counted nouns, taught objects, fixed formulas): مَدِينَةً غَنِيَّةً,
  دَرَجَةً, صَيْدَلِيَّةً مَفْتُوحَةً, مَرَّةً وَاحِدَةً, لَيْلَةً وَاحِدَةً, قَصِيدَةً, تَحِيَّةً طَيِّبَةً (everywhere),
  كُلَّ شَخْصٍ, حَتَّى أَبِيكُمَا, تَعْنِي (f), تُعْطِيَانِكَ (dual), jussive مَنْ يَعْمَلْ … يَجِدِ, فَسَتَنْجَحُ, فَلَنْ تَنَامَ,
  سَأَتَّصِلُ بِكَ.
- **Register**: لَازِم labelled spoken; written forms يَجِبُ أَنْ / مِنَ اللَّازِمِ أَنْ / عَلَيْكَ أَنْ taught (day 48,
  card, week 7); مُتْعَب not تَعْبَان; أَنْتَ عَلَى حَقّ; dual welcomes to two people; أَعْدَدْتُ / تُوَلَّدُ;
  مُرْشِدَتُكُمُ; بِكُمْ فِي عَمَّان; يَحْتَاجُ إِلَى; تَمُّوز for the Lebanese speaker; فَازَ بِجَائِزَة; مُدِيرُونَ;
  بُلْدَان; يَتَسَاقَطُ الثَّلْجُ; مَشْيًا عَلَى الْأَقْدَامِ; أَشْعُرُ بِأَنَّنِي أَفْضَلُ; أَيُّ يَوْمٍ الْيَوْمَ؟ alongside.
- **Spelling, course-wide**: عَلِيّ, أُرْدُنِّيّ, إِذًا, امْتِحَان (one convention), no final pause sukūn (شَاي…),
  Hasan, Nour.
- **Facts and story logic**: Eid al-Adha date, digits by country, day 21 change, day 25 floors, day 54 Emma, day 57
  Gulf of ʿAqaba and 8:30 arrival, day 88 last week, school test time, photo captions name the real place,
  "working week".
- **Pronunciation pages**: emphatic vowel anchor (father / hot), ghayn velar, only ṭ unaspirated, long vowels,
  dahab example; alif/hamza "usually"; نِهَايَةٌ pause tip.
- **English closer to the Arabic** (R12-46, R3-8/11/27/101/117), "Congratulations!", "very delicious" everywhere.
- **Engine**: in an unanswered quiz question a tapped mistake form shows its meaning without the "wrong — correct"
  note (R3-45); the waṣl page reads prose in the spoken form, fi l-madīna (R3-85; export too).

## Kept on purpose
R3-19 (hal … am), R3-84 (raqm), R3-94/95 (simplified placards), R3-1 (pause style), R12-17 (dual of kīlū),
R12-21 (نَشْرَةَ after إِلَيْكُمْ), R12-38 (dual ظَهْرَيْهِمَا), R12-40 cinema line, R12-51 (الْخُوَارِزْمِيُّ).
R12-52: سُوق stays masculine with a note that both genders are used (the gender field takes only m/f).
Content `status` is **not** set to `approved`: the schema reserves that for a named human reviewer.
