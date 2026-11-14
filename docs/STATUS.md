# Status — Arabic Journey

Updated 2026-11-14 (final review round: review closed, web deployed). Branch `main`. All work runs on the owner's PC.
Main prompt: `Arabic_Reference/PROMPT_B_Nihongo-based.md`. Live (final-round build):
https://ar-journey.german-journey.workers.dev · unlocked https://ar-journey-unlocked.german-journey.workers.dev

## Done
- v1.0.0 released (8386d49, tag v1.0.0): 90 days, 13 week tests, 32 scenarios, culture, labs, report, final exam.
- Accuracy rounds 1, 2, 2b, 3, 3F (`docs/review/round-*/SUMMARY.md`).
- **Final review round — review CLOSED** (`docs/review/round-final/`): the owner decided (2026-11-13) there will be
  no outside teacher; every open question of `TEACHER-REVIEW-PACK.md` (A–F, R12-1…58) was decided by the owner with
  AI recommendations (`DECISIONS.md`). 338 area ops (G1–G5) + 95 course-wide spelling ops (`z/`) + 12 new tap
  meanings (`h/`), all verified in a fresh export. Engine: unanswered quiz questions hide the "wrong — correct" note
  on tap (R3-45); the waṣl page reads prose in the spoken form (R3-85, export too). Details: `SUMMARY.md`.
- Checks: validator 0 errors, 107 unit tests, typecheck/lint/format clean, e2e 28/28 (port 4191). Both editions
  deployed 2026-11-14 and verified live.

## Left
1. Content `status` is not `approved` anywhere: the schema needs a named human reviewer. Owner may choose to mark it
   approved under their own name (a deliberate owner call, not done automatically).
2. Optional round 4 (fresh reviewers + cross-check, prompts in `docs/review/round-3/`).
3. Small leftovers (not in the decisions): day 84 reading still has a past–past "if" sentence (R12-28 style);
   polite ordering lines (days 15, 25, 28) keep "I would like"; سُوق gender field can only be m/f.
4. Branching role-play (Prompt B L) not built.
5. **No APK / version release** until all language modules are combined (owner, 2026-11-13). Web deploys only.

## Decisions
- Review is closed by owner decision; record it as "owner decision with AI recommendations", never as a teacher review.
- Never mark content `approved` without a named human reviewer.
- House style: pause form mid-sentence; endings shown on adverbial -an, kāna/laysa predicates, inna/anna nouns,
  counted nouns, taught objects, fixed formulas (تَحِيَّةً طَيِّبَةً). Spellings: عَلِيّ, أُرْدُنِّيّ, إِذًا, امْتِحَان,
  no final pause sukūn, Hasan, Nour. لَازِم is spoken style; يَجِبُ أَنْ is the written form.
- Fixes go only where the app reads them: segs/content (counted text replace), `scoped.json` (one place), or
  `hand.json` (right everywhere; English only, no Arabic script). Never `auto.json`.
- The validator ignores place glosses: a new word in lesson text needs a `hand.json` or seg gloss.
- A scoped gloss is keyed by the exact vocalised form. `apply-plans.py` rewrites `scoped.json` from disk, so a text
  op on scoped.json is lost (use scoped ops; delete keys with a small script).
- A review round = decisions/findings → fix plans → `apply-plans.py` → re-export → `verify-plans.py`.
- After content changes: `content:index` → `readings:build` → `glossary:auto` → `check`.
- Many day files are CRLF: edit by counted text replacement, never re-serialise; build `old` strings from the raw file.
- Bash heredocs break on Arabic scripts: write Python scripts to files (scratchpad) and run them with `-I -X utf8`.
- e2e on port 4191: copy playwright.config.ts with 4190→4191 and `reuseExistingServer: false`, then delete it.
- UI is LTR for English readers; Arabic text always RTL. One session at a time in this repo.

## Next step
Owner's choice: (a) mark content approved under the owner's own name, (b) optional round 4, or (c) leave Arabic as
done and move to the next language module / the combined app.
