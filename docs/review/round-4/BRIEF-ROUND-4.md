# Accuracy review round 4: addendum to REVIEW_BRIEF.md

Read `docs/review/REVIEW_BRIEF.md` first: its categories, severities, "do not report" list and output format all
apply. Round 4 is optional and was chosen by the owner on 2026-11-14 after the review was closed by owner decision
(`docs/review/round-final/`). It has **one fresh reviewer per chunk** (reviewer letter `A`), then **a cross-check**
by a different agent (letter `X`), exactly as in round 3 (`docs/review/round-3/BRIEF-ROUND-3.md`). Reviewers write
`docs/review/round-4/<chunk>-A.json` and edit no other file.

The owner's goal: learners must learn **genuine, correct Arabic**. Find what is still wrong. Do not invent errors:
a correct form reported as wrong costs a fix that can damage the course. When you are not sure, write a note.

## What changed since round 3

Read `docs/review/round-final/SUMMARY.md` (one page). In short: round 3F fixed R12-23/30/31 and the tap /
transliteration section F; the final round applied 338 area ops, 95 course-wide spelling ops and 12 new tap meanings
(owner decisions with AI recommendations, `docs/review/round-final/DECISIONS.md`).

## House style (decided by the owner: never report these as errors)

- **Pause form** mid-sentence and at phrase ends is allowed. Endings are shown on: adverbial -an, kāna/laysa
  predicates, inna/anna nouns, counted nouns, taught objects, fixed formulas (تَحِيَّةً طَيِّبَةً). A missing ending
  elsewhere is not an error.
- Spellings: عَلِيّ, أُرْدُنِّيّ, إِذًا, امْتِحَان, no final pause sukūn (شَاي), Hasan, Nour; يَا أُسْتَاذ (no ḍamma).
- لَازِم is labelled spoken; يَجِبُ أَنْ is the written form. Notes softened to "usually / better / less usual" where
  both forms are good are intended.
- Multi-sense hand glosses for particles (مَا، لَا، مِنْ، إِنَّ …) list every sense on purpose.
- Clitic style: wa-/fa-/bi-/li-/ka- hyphenated when glossed as clitic + word; بِخَيْر is *bi-khayr*.
- **Kept on purpose** (do not re-report): hal … am (R3-19), raqm (R3-84), simplified placards (R3-94/95), dual of
  kīlū (R12-17), نَشْرَةَ after إِلَيْكُمْ (R12-21), dual ظَهْرَيْهِمَا (R12-38), the cinema line (R12-40), الْخُوَارِزْمِيُّ
  (R12-51), سُوق masculine with a both-genders note (R12-52), أَمَل in `cul.family` taps as a name only.
- Known leftovers already listed for the owner (report only if you think they are worse than described): day 84
  reading past–past "if" sentence; polite ordering lines on days 15, 25, 28 keep "I would like".

If something in `DECISIONS.md` was decided and you believe the decision teaches **wrong** Arabic (not just a
different style), you may report it with `"problem"` starting "against decision:" and a strong reason.

## Your job

- Find errors that are **still there**, including anything rounds 1–3 and the final round missed. If a final-round
  fix introduced a new problem, report it and say "regression" in `problem`.
- Report **every** error you find (no cap), substantial ones first. Keep notes short: at most 8.
- Each error gets `"confidence": "high" | "medium"`. A low-confidence error is a note.
- Before reporting harakat or a case ending, re-read the whole sentence and decide the syntax (subject, predicate,
  object, after a preposition, after إِنَّ / كَانَ, idāfa, pause).
- `current` must be copied **exactly** from the export (it is a find-and-replace), with the file + JSON path from
  the export line.
- `summary`: how many tap glosses and how many Arabic strings you checked, and how many were wrong.

## Cross-check (second stage)

As round 3: `AGREE` (real, fix right) / `CHANGE` (real, fix must differ: give it) / `DISAGREE` (not an error, house
style, kept on purpose, or the fix makes it worse). Output `docs/review/round-4/<chunk>-X.json`:
`{"chunk": "...", "checker": "X4-n", "verdicts": [{"id": 1, "verdict": "...", "fix": "...", "scope": "...", "reason": "..."}], "summary": "..."}`.
**Only AGREE and CHANGE rows are applied.** A gloss for one sentence never becomes an app-wide gloss.
