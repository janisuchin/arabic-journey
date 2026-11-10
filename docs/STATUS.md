# Status — Arabic Journey

Updated 2026-11-10 (week 12 done). Branch `main`. All work runs on the owner's PC (no cloud session), like Français Journey.
Main prompt: `Arabic_Reference/PROMPT_B_Nihongo-based.md` (phases A–F, checklist Z).
Live (preview, v0.1.0 + content to day 84): https://ar-journey.german-journey.workers.dev ·
unlocked https://ar-journey-unlocked.german-journey.workers.dev

## Done
- Phase A/B (v0.1.0): Expo SDK 58 RTL skeleton, Journey base, tabs, profiles, settings, transliteration (ALA-LC +
  simple), numbers engine, language pack `src/lang/ar/tap.ts`, readings layer, auto glossary, validator.
- Days 1–77 merged from the `arabic-weeks` branch (8b06731); `.gitattributes` (LF) so Windows checkouts pass format.
- First deploy of both web editions (2026-11-10).
- Week 12 (7087659): days 78–84 (environment, technology, *if* = `conditional-w12`, passive = `passive-w12`, formal
  letter = `formal-letter-w12`, debate = `connectors-w12`, review) + week-12 test (8 questions). 67 new words,
  43 hand-glossary lines, readings + auto glossary rebuilt. Checks: validator 0 errors (84 days, 755 words, 78 rules),
  48 unit tests, e2e 16/16 (on port 4191, see Decisions). All content `needs-review`.
- Reusable authoring kit: `docs/authoring/DAY_WRITER_BRIEF.md` (one writer agent per day) +
  `scripts/merge-additions.py` (append-only merge of each writer's additions.json: vocab, grammar, hand glossary,
  week test).

## Left (against Prompt B checklist Z)
1. Week 13 = days 85–90 (listening/reading/speaking/writing review, final exam, next steps) + week-13 test;
   cumulative test and final exam.
2. Scenarios: 22 of 27.
3. Missing screens/labs: Sentence explorer, Placards, Explore (culture), Time lab, Speaking lab, Onboarding/
   placement check, Report, real-life photo card per day.
4. Photos (Wikimedia Commons, credited); 5,000-word dictionary check.
5. Audit tools `scripts/audit/` (audit-dump, chunk, dialogue-stats.py, scan) + two-reviewer + reconciler audit.
   Writers' open points to give the reviewers: d78l7 يَعْنِي vs تَعْنِي; d81 مَرْمَر "alabaster"; d83l12 "ambulances
   and taxis" wording; d82s3 mistake shown in transliteration; d80 "tomorrow, Friday" weekday continuity.
6. `tools/build-android.ps1` (own folders, e.g. C:\m\a / C:\m\au), layout sweep, release v1.0.0 by the Journey
   release-folder rule.
7. Owner to decide: the whole UI is mirrored right-to-left, so English text is right-aligned too (v0.1.0 choice).

## Decisions
- Never mark content `approved` without a named human reviewer.
- Edit lesson JSON as text; after content changes: `content:index` → `readings:build` → `glossary:auto` → `check`.
- Shared content files have mixed layouts: never re-serialise them; append only (the merge script does this).
- hand.json key أَحَد = "Sunday (wrong…)": write أَحَدٌ with tanwin when you mean "anyone".
- e2e port 4190: a French `e2e/serve.mjs` (another session) was answering on 4190 on 2026-11-10 and
  `reuseExistingServer` picked it up (16 false failures). If e2e fails at `learner-name`, check
  `curl localhost:4190` for "Français Journey" and run with a copy of the config on 4191.
- Deploy: `npm run deploy:web` and `npm run deploy:web:unlocked` (wrangler logged in). Wait a few seconds before
  checking the live site.

## Next step
Write week 13 (days 85–90 + week-13 test) with the authoring kit: 6 writers in parallel, then merge, rebuild,
check, e2e, deploy, commit and push.
