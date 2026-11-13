# Accuracy review round 3: addendum to REVIEW_BRIEF.md

Read `docs/review/REVIEW_BRIEF.md` first: its categories, severities, "do not report" list and output format all
apply. Round 3 has **one fresh reviewer per chunk** (reviewer letter `A`), then **a cross-check**: a second agent
re-judges every finding before anything is changed (see "Cross-check" below). Reviewers write
`docs/review/round-3/<chunk>-A.json` and edit no other file.

The owner's goal for this round: learners must learn **genuine, correct Arabic**. Find what is still wrong. Do not
invent errors: a correct form reported as wrong costs a fix that can damage the course. When you are not sure,
write a note, not an error.

## What changed since round 2 (2026-11-13)

1. **Form glosses**: a tapped inflected form shows `form of 'X': label` (e.g. `form of 'write': I wrote`).
2. **Two readings**: a word that is both a name and a common word (e.g. أَمَل), and comparative/superlative forms,
   show both readings in the gloss.
3. **Multi-sense particles** (مَا، لَا، مِنْ، مَنْ، إِنَّ، هُنَاكَ …): when the sense depends on the next word, the
   hand gloss lists every sense. That is intended, not an error.
4. **Engine**: tanwīn before hamzat waṣl is read with a helping kasra (*jiddani l-yawma*); Arabic digits ≤ 100
   are read as words in `⟶` lines.
5. **One clitic style**: a word glossed as clitic + word is transliterated with a hyphen (*wa-huwa*, *bi-khayr*);
   words the course glosses as whole words stay whole (*kalām*, *biṭāqa*).
6. **One-sentence glosses** (a gloss that fits only one lesson sentence) are used in that lesson only; elsewhere the
   plain gloss shows.
7. **Content**: about 85 round-1/2 content fixes (translations, harakat, answer keys, rules, the day 40 quiz, the
   day 53 card, the day 82 note) and ~40 hand glosses.

## Your job

- Find the errors that are **still there**, and anything rounds 1–2 missed. Do not re-report something that is now
  fixed. If a round-1/2 fix introduced a new problem, report it (say "regression" in `problem`).
- Report **every** error you find (no cap), substantial ones first. Keep notes short: at most 8.
- Each error also gets `"confidence": "high" | "medium"`. Do not report a low-confidence error: make it a note.
- Before reporting harakat or a case ending, re-read the whole sentence and decide the syntax (subject, predicate,
  object, after a preposition, after إِنَّ / كَانَ, idāfa, pause at the end of a phrase). Pause forms are allowed.
- `current` must be copied **exactly** from the export (it is used as a find-and-replace), with the
  file + JSON path from the export line.
- Your `summary` must say how many tap glosses and how many Arabic strings you checked, and how many were wrong.

## Cross-check (second stage, by a different agent)

The cross-checker reads each finding, the export line and the source file, and gives one verdict:
- `AGREE`: the error is real and the fix is right;
- `CHANGE`: the error is real but the fix must be different (gives the corrected fix);
- `DISAGREE`: not an error, or the fix would make it worse (gives the reason).

It writes `docs/review/round-3/<chunk>-X.json`:
`{"chunk": "...", "checker": "X3-n", "verdicts": [{"id": 1, "verdict": "AGREE|CHANGE|DISAGREE", "fix": "...", "reason": "..."}], "summary": "..."}`
where `id` is the 1-based index in the reviewer's `errors` list. **Only AGREE and CHANGE rows are applied.**
Every applied fix must stay inside its own context: a gloss for one sentence never becomes an app-wide gloss.
