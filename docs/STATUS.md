# Status — Arabic Journey

Updated 2026-11-13 (round 3F: pack items that need no teacher fixed, web deployed). Branch `main`. All work runs
on the owner's PC. Main prompt: `Arabic_Reference/PROMPT_B_Nihongo-based.md`. Live (round-3F build):
https://ar-journey.german-journey.workers.dev · unlocked https://ar-journey-unlocked.german-journey.workers.dev

## Done
- v1.0.0 released (8386d49, tag v1.0.0): 90 days, 13 week tests, 32 scenarios, culture, labs, report, final exam.
- Accuracy rounds 1, 2, 2b, 3 (`docs/review/round-1|2|3/SUMMARY.md`). Round 3: cross-checked, 202 findings, 230/230
  verified; introduced `content/glossary/scoped.json` (gloss per place, see Decisions).
- **Teacher-review pack** `docs/review/TEACHER-REVIEW-PACK.md`: R3-n (round-3 notes, sections A–F) and R12-n
  (open rounds-1–2 notes). R12-23/30/31 and section F are now marked done in the pack.
- **Round 3F** (this commit; `docs/review/round-3f/SUMMARY.md`, `plan-F.json`): R12-23 (day 37 card, week 6 q3),
  R12-30 (nisba examples), R12-31 (-an said -ā in pause), and the section-F tap/⟶ notes: ~45 gloss/content ops
  (59/59 checks; round 3's 230 still pass). Engine: a reading the English already gives is not repeated
  ("سَـ (sa-)"); quiz prompts asking how quoted Arabic is said hide its reading (`promptGivesAway`); the export
  reads prose run by run like RichText (`proseParts`/`proseLine`). Skipped items and reasons are in the plan.
- Checks: validator 0 errors, 105 unit tests, e2e 28/28 (port 4191). Both editions deployed and verified live.

## Left
1. **Human Arabic teacher review**: owner sends the pack to a teacher (the last gate). Teacher replies by number
   (R3-n / R12-n: Keep / Change); apply as a normal fix round and record the reviewer's name.
   Open questions for the teacher include section F points 1–2 (R3-45 quiz mistake notes, R3-85 waṣl page) and
   the أُرْدُنِيّ / أُرْدُنِّيّ spelling (both are used in the course).
2. Optional round 4 (fresh reviewers + cross-check, prompts in `docs/review/round-3/`).
3. Unchanged from v1.0.0: teacher review of culture notes and photo compromises; branching role-play (Prompt B L).
4. **No APK / version release** until all language modules are combined (owner, 2026-11-13). Web deploys only.

## Decisions
- Never mark content `approved` without a named human reviewer.
- Fixes go only where the app reads them: segs/content (counted text replace), `scoped.json` (one place:
  `day:N`, `week:N`, `scenario:<id>`, `culture:<id>`, `grammar:<id>`, `vocab:<id>`, `placard:<id>`, `letter:<id>`,
  `pron:<id>`, or `*` default), or `hand.json` (only if right everywhere). Never `auto.json` (review list).
- The validator ignores place glosses: a new word in a lesson text needs a `hand.json` or seg gloss.
- A scoped gloss is keyed by the exact vocalised form (الرِّسَالَةَ ≠ الرِّسَالَة).
- A review round = reviewers → cross-check → fix plans → `apply-plans.py` → re-export → `verify-plans.py`.
- After content changes: `content:index` → `readings:build` → `glossary:auto` → `check`.
- Shared content files have mixed layouts and line endings (many day files are CRLF): edit by counted text
  replacement, never re-serialise; build multi-line `old` strings from the raw file (`newline=''`).
- بِخَيْر is written bi-khayr; يَا أُسْتَاذ without ḍamma is house style; mistake notes live in `mistakes.json`.
- Bash heredocs break on these scripts: write Python scripts to files (scratchpad) and run them.
- e2e on port 4191: copy playwright.config.ts with 4190→4191 and `reuseExistingServer: false`, then delete it.
- UI is LTR for English readers; Arabic text always RTL. One session at a time in this repo.

## Next step
Owner sends `docs/review/TEACHER-REVIEW-PACK.md` to an Arabic teacher. When the reply comes: apply it as a fix
round (plan file + apply/verify), record the reviewer's name, deploy web. Optional meanwhile: round 4.
