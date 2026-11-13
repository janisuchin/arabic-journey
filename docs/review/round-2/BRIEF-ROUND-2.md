# Accuracy review round 2: addendum to REVIEW_BRIEF.md

Read `docs/review/REVIEW_BRIEF.md` first: its categories, severities, "do not report" list and output format all
apply. Round 2 has **one fresh reviewer per chunk** (reviewer letter `A`). Write
`docs/review/round-2/<chunk>-A.json`. Do not edit any other file.

## What changed since round 1 (2026-11-13)

1. **Tap meanings** (`tap:` lines). A tapped word is now looked up by its *vocalised* form: مُدَرِّسَة and مَدْرَسَة,
   شَرِبْتُ and شَرِبْتَ are different keys. A form with other harakat lends its meaning only when the two are
   compatible (only a case/mood ending may differ, never -tu/-ta/-ti or -ka/-ki). When a form has several glosses,
   the lesson day decides, so the same word can show a different gloss on different days; judge each gloss
   against the line it is in. A bare letter in a letter list is named as a letter.
2. **Hand glossary** (`glossary-hand.txt`) no longer contains exercise notes. Notes like "wrong after inna" are in
   `glossary-mistakes.txt` and are shown only on the wrong side of a mistake card (`mistakes[i].wrong`), or for a
   word that exists only as a mistake. Review that file too: the note must describe the mistake correctly.
3. **Auto glossary** (`glossary-auto-*.txt`) is now a list of vocalised forms with the meaning a tap shows outside
   a lesson (no day context). Report a gloss there only if it is wrong for that exact vocalised form.
4. **Transliteration engine**: relative pronouns (alladhī), al- before hamzat-waṣl nouns (al-istifhām), two
   clitics before al- (wa-bi-l-), consonantal final y/w (shāy, raʾy, ḥulw), s·h separation (as·halu), tanwīn
   before ى (maqhan), مِائَة = miʾa, elision after tanwīn (jiddan l-yawma), names after a clitic (wa-Laylā), and
   Arabic inside English prose (no capital, bare letters named: tāʾ marbūṭa) were fixed.
5. **Content**: 43 round-1 errors were corrected (rules for -īna/-ayni, al-yawmu, hamzat waṣl spellings,
   mistake cards on days 79 and 90 and in the machines scenario, translations).

## Your job

Find the errors that are **still there**, and anything round 1 missed. Do not re-report a round-1 item that is
now fixed. If a round-1 fix introduced a new problem, report it. Keep notes (non-errors) short: at most 10.
Your `summary` must say how many tap glosses you checked and how many were wrong.
