# Status — Arabic Journey

Updated 2026-11-13 (accuracy rounds 1–2 fixed and deployed). Branch `main`. All work runs on the owner's PC.
Main prompt: `Arabic_Reference/PROMPT_B_Nihongo-based.md`. Live (web build of 26b43c1, deployed 2026-11-13):
https://ar-journey.german-journey.workers.dev · unlocked https://ar-journey-unlocked.german-journey.workers.dev

## Done
- v1.0.0 released (8386d49, tag v1.0.0): 90 days, 13 week tests, 32 scenarios with photo scenes, culture, labs,
  report, final exam, 358 credited photos, release folder + local APKs. Feature history: git log.
- **Accuracy round 1** (a36790a findings; fixes 00a957b, 502a050, 8b9507e): 443 rows.
  1. Root cause fixed: tap meanings are keyed by the VOCALISED form (`meaningOf` in `src/lang/ar/tap.ts`); a form
     with other harakat lends its meaning only if compatible (case/mood ending may differ, never -tu/-ta/-ti,
     -ka/-ki). `GlossScope` gives the lesson day (week test: last day; grammar page: day that teaches the rule).
     Exercise notes live in `content/glossary/mistakes.json` (shown only on a mistake card's wrong side).
  2. Engine (`src/core/translit.ts`): alladhī, al-istifhām, wa-bi-l-, shāy/raʾy/ḥulw, as·halu, maqhan, miʾa,
     names after clitics (wa-Laylā), prose runs (no capital, bare letters named once), unvocalised = no reading.
  3. 43 Arabic/translation/rule/answer-key fixes (`scripts/audit/fix-round1-content.py`).
- **Accuracy round 2** (0f788f4 findings, one fresh reviewer per chunk; fixes 74c3e0b): 260 rows, tap glosses
  ~1–4% wrong per chunk. Fixed: form glosses "form of 'X': label"; name/word and comparative/superlative show both
  readings; multi-sense particles (mā, lā, min, man, inna, hunāka…); tanwīn + waṣla = jiddani l-yawma; ~40 hand
  glosses; content fixes in `scripts/audit/fix-round2-content.py`.
- **Round 2b** (26b43c1): the open round-2 rows. One clitic style (wa-huwa, bi-khayr; only when the course glosses
  the word as clitic + word, so kalām/biṭāqa stay whole); Arabic digits ≤100 read as words in ⟶ lines; one-sentence
  glosses yield to plain ones outside their lesson; day 40 quiz, day 53 card, day 82 note
  (`scripts/audit/fix-round2b-content.py`). Web deployed, both editions serve the 26b43c1 bundle (checked).
- Checks at 26b43c1: validator 0 errors, 101 unit tests, e2e 28/28 (port 4191).

## Left
1. Round 3 (final AI check, optional): re-export (`npx tsx scripts/audit/audit-dump.ts`), one reviewer per chunk
   (write `docs/review/round-3/BRIEF-ROUND-3.md` from the round-2 addendum + rounds 2/2b changes), merge with
   `scripts/audit/merge-findings.py docs/review/round-3`, fix, deploy web. Expect tens of rows, mostly one-line
   glosses and style notes; AI review never reaches literal zero, so the last gate is a human Arabic teacher.
2. Owner notes (not errors): 416 round-1 + 124 round-2 in `docs/review/round-*/*-MERGED.md`.
3. Unchanged from v1.0.0: teacher review of culture notes and photo compromises; branching role-play (Prompt B L).
4. **No APK / version release** until all language modules are combined (owner, 2026-11-13). Web deploys only.

## Decisions
- Never mark content `approved` without a named human reviewer.
- After content changes: `content:index` → `readings:build` → `glossary:auto` → `check`.
- Shared content files have mixed layouts: edit by counted text replacement (see the fix scripts), never re-serialise.
- Tap meanings: never look up by the unvocalised spelling; a sentence-specific note never goes in `hand.json`
  (it overrides that form app-wide); exercise notes go in `mistakes.json`. `auto.json` is a review list only.
- When a particle's sense depends on the next word, the hand gloss lists every sense.
- Python on this PC writes CRLF unless `newline='\n'`; Bash heredocs strip backslashes: put scripts in files.
- e2e on port 4191: copy playwright.config.ts with 4190→4191 and `reuseExistingServer: false`, then delete it.
- UI is LTR for English readers; Arabic text always RTL. One session at a time in this repo.

## Next step
Round 3 (Left 1) if the owner wants a final AI pass; otherwise a human teacher review of the live web app.
