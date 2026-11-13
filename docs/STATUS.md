# Status — Arabic Journey

Updated 2026-11-13 (accuracy round 3 done, web deployed). Branch `main`. All work runs on the owner's PC.
Main prompt: `Arabic_Reference/PROMPT_B_Nihongo-based.md`. Live (round-3 build, deployed 2026-11-13):
https://ar-journey.german-journey.workers.dev · unlocked https://ar-journey-unlocked.german-journey.workers.dev

## Done
- v1.0.0 released (8386d49, tag v1.0.0): 90 days, 13 week tests, 32 scenarios, culture, labs, report, final exam.
- Accuracy rounds 1, 2, 2b (443 / 260 rows; see `docs/review/round-1|2/SUMMARY.md`).
- **Accuracy round 3** (this commit; `docs/review/round-3/SUMMARY.md`): 21 reviewers + 10 cross-checkers
  (AGREE/CHANGE/DISAGREE, French-style). 202 findings (19 major, 8 in Arabic/grammar/answer keys), 200 agreed and
  applied, 2 rejected. 275 ops via `scripts/audit/apply-plans.py`; `scripts/audit/verify-plans.py` found 230/230
  fixes in the fresh export. The Arabic text is now clean; what remained was tap glosses and the engine.
  1. Root cause of rows that "stayed unfixed": `auto.json` is never read by the app, and `hand.json` is app-wide.
     New `content/glossary/scoped.json`: gloss per place (`day:N`, `week:N`, `scenario:<id>`, `culture:<id>`,
     `grammar:<id>`, `vocab:<id>`, `placard:<id>`, `letter:<id>`, `pron:<id>`) or `*` (default outside the lessons
     that teach another sense). Screens set the place with `GlossPlace`; the audit export uses the same keys.
  2. Engine: one clitic style (wa-/fa-/bi-/li-/la-/ka- on inflected stems too), wa-li-Sāmī, -hu without ·,
     Allāhu, names after titles / proper-noun names capitalised, no empty "()" or stray spaces after a named letter,
     hamza seats named, no repeated senses, digit/letter quiz options show no reading.
  3. Content: day 86 Form II rule, day 89 kāna note, day 53 card, الْيَوْمَ, إِنْجِلِيزِيَّة, وَادِي رَمّ, construct
     case vowels (qiṭʿata kaʿk), age table 11–99.
- Checks at this commit: validator 0 errors, 103 unit tests, e2e 28/28 (port 4191). Both editions verified live.

## Left
1. **Human Arabic teacher review** of the live web app (the last gate; AI review never reaches zero). Give them
   the reviewer notes: 130 in `docs/review/round-3/*-A.json` (`notes`), plus rounds 1–2 `*-MERGED.md`.
2. Optional round 4 (fresh reviewers + cross-check, same prompts in `docs/review/round-3/`) if the owner wants AI
   confidence closer to the French app; expect mostly tap-gloss rows.
3. Unchanged from v1.0.0: teacher review of culture notes and photo compromises; branching role-play (Prompt B L).
4. **No APK / version release** until all language modules are combined (owner, 2026-11-13). Web deploys only.

## Decisions
- Never mark content `approved` without a named human reviewer.
- Fixes go only where the app reads them: segs/content (counted text replace), `scoped.json` (one place), or
  `hand.json` (only if right in every place). Never `auto.json` (generated review list).
- A review round = reviewers → cross-check → fix plans → `apply-plans.py` → re-export → `verify-plans.py`.
- After content changes: `content:index` → `readings:build` → `glossary:auto` → `check`.
- Shared content files have mixed layouts and line endings: edit by counted text replacement, never re-serialise.
- بِخَيْر is written bi-khayr; يَا أُسْتَاذ without ḍamma is house style; mistake notes live in `mistakes.json`.
- Python on this PC writes CRLF unless `newline='\n'`; Bash heredocs mangle backslashes: put scripts in files.
- e2e on port 4191: copy playwright.config.ts with 4190→4191 and `reuseExistingServer: false`, then delete it.
- UI is LTR for English readers; Arabic text always RTL. One session at a time in this repo.

## Next step
Owner's choice: send the live web app to a human Arabic teacher (Left 1), or run optional round 4 (Left 2).
