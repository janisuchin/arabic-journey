# days-21-30: round findings (merged A + B)

Reviewer A: I read the whole days-21-30 export (days 21 to 30: intros, sentences, mistake cards, dialogues, readings, quizzes) and checked the related entries in glossary-mistakes.txt (يَزُورُونَ, غُرْفَةِي, غُرْفَةُهُ: all correct). The Arabic is in very good shape. I found no wrong harakat or case endings. Number–noun agreement is correct everywhere (خَمْسُ دَقَائِق, سِتِّ سَاعَات, ثَمَانِيَة جُنَيْهَات, سَبْعَةُ آلَافِ, عَشَرَةِ أَيَّام, the hundreds after بِـ), and so are verb-first agreement, non-human plurals and the possessive endings. All quiz answer keys are correct, the mistake cards are right, and the translations are faithful. I found 4 errors, all minor: 3 tap glosses that show a sense other than the one the lesson teaches (يَنْزِلُ shown as 'falls', هُنَاكَ shown only as 'there is' where it is contrasted with 'here', هٰذِهِ shown only as 'this' with a plural), and 1 plural address to two people where the dual is needed (تَقْتَرِحُونَ → تَقْتَرِحَانِ). Tap glosses checked: 541 (on 278 tap lines). Wrong: 4 instances of 3 distinct glosses (يَنْزِلُ ×2, هُنَاكَ ×1 in objectives[2], هٰذِهِ ×1), plus 1 borderline (هُنَاكَ in day26 quiz[5].options[0], listed under the same finding).

Reviewer B: (missing: days-21-30-B.json)

**Errors: 4** (0 found by both reviewers, 4 by one), 0 major. Notes: 5.

| # | By | Sev | Category | File · path | Current | Problem | Proposed fix |
|---|---|---|---|---|---|---|---|
| 1 | A | minor | gloss | days/day24.json · `intro (tap); quiz[2].options[3] (tap)` | يَنْزِلُ | The tap gloss is 'falls, comes down', but on this day the verb means 'to get off' (the intro says so, and the quiz asks 'Which verb means to get off?'). When a learner taps the correct quiz answer they see 'falls', which is the wrong sense. The auto-glossary entry has the same problem. | يَنْزِلُ = gets off, gets out; comes down (he, it) |
| 2 | A | minor | gloss | days/day26.json · `objectives[2] (tap); quiz[5].options[0] (tap)` | هُنَاكَ | These items contrast هُنَا (here) with هُنَاكَ (there), but tapping هُنَاكَ only shows 'there is'. Next to 'here' the meaning is 'there'. The intro itself says هُنَاكَ means 'there'. | هُنَاكَ = there; there is, there are |
| 3 | A | minor | agreement | days/day28.json · `dialogue.lines[2].ar` | مَاذَا تَقْتَرِحُونَ؟ | Daniel is speaking to two people (Sami and Layla), so MSA needs the dual. The plural -ūna is used instead. The course teaches the dual imperatives تَفَضَّلَا / تَعَالَيَا / اُنْظُرَا for exactly this situation on the next day (day 29). | مَاذَا تَقْتَرِحَانِ؟ |
| 4 | A | minor | gloss | days/day28.json · `intro (tap)` | هٰذِهِ | In هٰذِهِ الْفَوَانِيس قَدِيمَة ('these lanterns are old') the tap shows only 'this (f)'. The point of the sentence is that هٰذِهِ means 'these' with plurals of things. The seg in sentences[4] and the day-27 taps already say 'this, these (f)'. | هٰذِهِ = this, these (f) |

## Notes for the owner (not counted as errors)

| By | File · path | Note |
|---|---|---|
| A | days/day21.json · `reading.ar / reading.en` | Story logic: 'Daniel pays seventy pounds, and the change is thirty'. In the dialogue he pays 100 for a 70-pound total. Possible fix: دَانْيَال يَدْفَعُ مِئَةَ جُنَيْه / 'pays a hundred pounds'. |
| A | days/day25.json · `dialogue.lines[8] vs dialogue.culture` | The guard says the second floor is فَوْقَنَا مُبَاشَرَةً ('right above us'), but the culture note says the second floor is two floors above street level. One of the two should change. |
| A | days/day27.json · `dialogue.lines[2].ar` | The seller says تَفَضَّلُوا to two customers (Layla and Daniel). This is acceptable as a general shop welcome, but strict MSA would use تَفَضَّلَا. The same applies to أَهْلًا بِكُمْ in day28 dialogue.lines[0] (Sami to two friends; strict: بِكُمَا). |
| A | days/day24.json · `dialogue.lines[9].segs / lines[14].segs` | جُنَيْهًا is glossed 'pounds (after a number)' here but 'pound (after 11–99)' on days 21 and 26. The meaning is right either way; making the gloss consistent would help. |
| A | days/day30.json · `quiz[4].options (transliteration)` | Suffix-only options are transliterated with a capital after the hyphen (-Unā, -Uhum). This is cosmetic; '-unā' would read better. |
