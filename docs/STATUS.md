# Status — Arabic Journey

Updated 2026-11-13 (accuracy rounds 1–2 fixed). Branch `main`. All work runs on the owner's PC (no cloud session).
Main prompt: `Arabic_Reference/PROMPT_B_Nihongo-based.md`. Live (still v1.0.0 until redeployed):
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
- Checks at 74c3e0b: validator 0 errors, 100 unit tests, e2e 28/28 (port 4191).

## Left
1. **Deploy** the fixes: `npm run deploy:web` and `npm run deploy:web:unlocked` (the auto-mode classifier blocked the
   deploy in this session; the owner runs it or allows it). Then decide whether this is v1.0.1 (bump, release folder,
   APKs, tag) per the release rule.
2. Round-2 rows not applied (owner's call, in `docs/review/round-2/*-MERGED.md`): seg glosses that carry one
   sentence's person ("(they) …" for a singular verb, "you (to a man)" for she-forms) beyond the 40 fixed in hand;
   day 40 quiz (bayda mā also correct); day 81 atasharrafu card; day 5x khamsa wrong side; wa- hyphenation style;
   Eastern digits in ⟶ lines. The 124 round-2 + 416 round-1 notes are for the owner.
3. Round 3 (optional): re-export (`npx tsx scripts/audit/audit-dump.ts`), one reviewer per chunk with
   `docs/review/round-2/BRIEF-ROUND-2.md` updated, merge with `scripts/audit/merge-findings.py docs/review/round-3`.
4. Unchanged from v1.0.0: teacher review of culture notes and photo compromises; branching role-play (Prompt B L);
   device check of the APKs; Play upload needs an EAS AAB and a `/privacy` page.

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
Owner runs the deploy (Left 1) and says whether to release v1.0.1; then, if wanted, round 3 (Left 3).
