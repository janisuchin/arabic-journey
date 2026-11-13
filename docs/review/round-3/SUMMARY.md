# Round 3 summary (2026-11-13)

Round 3 = the final AI pass, run with a **cross-check** (French-style) for the first time on this course.
21 fresh reviewers (one per chunk; vocabulary split in two) wrote `<chunk>-A.json`; 10 cross-checkers (X3-1 … X3-10)
judged every finding (`<chunk>-X.json`: AGREE / CHANGE / DISAGREE); only AGREE and CHANGE rows were applied.
Six fix planners turned the agreed rows into exact ops (`plan-P1…P6.json`), applied in one pass by
`scripts/audit/apply-plans.py` (`APPLIED.md`) and proven in a fresh export by `scripts/audit/verify-plans.py`
(`VERIFY.md`: 230 of 230 checks found). Engine findings were fixed in code.

| Chunk | Errors | Major | Arabic/grammar/key | AGREE | CHANGE | DISAGREE | Notes |
|---|---|---|---|---|---|---|---|
| culture | 10 | 0 | 1 | 8 | 1 | 1 | 6 |
| days-01-10 | 2 | 0 | 0 | 2 | 0 | 0 | 5 |
| days-11-20 | 2 | 0 | 0 | 1 | 1 | 0 | 6 |
| days-21-30 | 1 | 0 | 0 | 1 | 0 | 0 | 8 |
| days-31-40 | 5 | 0 | 0 | 3 | 2 | 0 | 5 |
| days-41-50 | 5 | 0 | 0 | 4 | 1 | 0 | 6 |
| days-51-60 | 7 | 0 | 1 | 5 | 2 | 0 | 4 |
| days-61-70 | 9 | 0 | 2 | 8 | 1 | 0 | 7 |
| days-71-80 | 1 | 0 | 0 | 0 | 1 | 0 | 5 |
| days-81-90 | 14 | 1 | 2 | 12 | 2 | 0 | 7 |
| glossary-auto-1 | 12 | 0 | 1 | 9 | 2 | 1 | 5 |
| glossary-auto-2 | 3 | 0 | 0 | 2 | 1 | 0 | 6 |
| glossary-hand | 2 | 0 | 0 | 2 | 0 | 0 | 5 |
| grammar | 29 | 5 | 1 | 28 | 1 | 0 | 8 |
| letters-pronunciation | 5 | 0 | 0 | 4 | 1 | 0 | 7 |
| placards | 5 | 0 | 0 | 5 | 0 | 0 | 5 |
| scenarios-1 | 13 | 2 | 0 | 12 | 1 | 0 | 7 |
| scenarios-2 | 13 | 0 | 0 | 12 | 1 | 0 | 7 |
| vocabulary-1 | 17 | 5 | 0 | 14 | 3 | 0 | 8 |
| vocabulary-2 | 37 | 6 | 0 | 35 | 2 | 0 | 7 |
| weeks-tests | 10 | 0 | 0 | 10 | 0 | 0 | 6 |
| **total** | **202** | **19** | **8** | **177** | **23** | **2** | **130** |

## What round 3 found
- The Arabic text is clean: almost every error was a **tap gloss** (a meaning shown for the wrong sense, person or
  sentence) or the **transliteration engine**. The few content errors: the day 86 Form II rule, the day 89 kāna
  note, the day 53 mistake card (regression), الْيَوْمَ at clause start (days 64/65/68), إِنْجِلِيزِيَّة spelling
  (days 64/69), وَادِي رَمّ (day 62), construct case vowels so the -t is read (qiṭʿata kaʿk, scenarios), the
  age table "11–99".
- **Root cause of the "still unfixed" rows from rounds 1–2:** `content/glossary/auto.json` is a generated review
  list that the app never reads, so fixes written there never reached learners; and `hand.json` is app-wide, so a
  sentence-specific fix could not be made without breaking other places.

## What changed in the app
- **Scoped glosses** (`content/glossary/scoped.json`): a gloss per place (`day:N`, `week:N`, `scenario:<id>`,
  `culture:<id>`, `grammar:<id>`, `vocab:<id>`, `placard:<id>`, `letter:<id>`, `pron:<id>`) or a `*` default outside
  the lessons that teach another sense. Screens pass their place with `GlossPlace`; the review export uses the
  same keys, so the export shows exactly what the learner sees.
- **Engine**: one clitic style (wa-/fa-/bi-/li-/la-/ka- whenever the word is glossed as clitic + word, also on
  inflected stems; kamā, li-mādhā stay whole; bi-khayr as the course writes it), wa-li-Sāmī, "-hu" (no stray ·),
  Allāhu with its case vowel, names after titles and proper-noun names capitalised (al-ustādh Karīm, fī Miṣr;
  rajul karīm stays), no empty brackets or stray spaces where a named letter was, hamza seats and vowel signs named
  in prose, no repeated senses in two-reading glosses, a digit/letter quiz option shows no reading (no give-away).

## Decisions taken by the lead
- بِخَيْر is written **bi-khayr** (the course's own English writes it so); بِجَانِب stays whole.
- يَا أُسْتَاذ without ḍamma stays: it is the course's consistent house style (~85 uses) — culture #8 DISAGREE.
- auto.json mistake-form keys stay (by design) — glossary-auto-1 #12 DISAGREE.
- أَمَل in `cul.family` keeps the name-only tap: its quiz asks what the name means.

## Not errors
Reviewer notes (130) are in the `-A.json` files for the owner and the human teacher. AI review never reaches a
literal zero; the last gate is a human Arabic teacher.
