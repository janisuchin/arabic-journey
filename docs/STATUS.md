# Status — Arabic Journey

Updated 2026-11-10. Branch `main`. All work runs on the owner's PC (no cloud session), like Français Journey.
Main prompt: `Arabic_Reference/PROMPT_B_Nihongo-based.md` (phases A–F, checklist Z).

## Done
- Phase A/B (v0.1.0): Expo SDK 58 RTL skeleton, Journey base, tabs, profiles, settings, transliteration (ALA-LC + simple),
  numbers engine, language pack `src/lang/ar/tap.ts`, readings layer, auto glossary, validator.
- Phase C/D content: days 1–77 (weeks 1–11), merged from the `arabic-weeks` branch on 2026-11-10 (commit 8b06731).
  `npm run check` green: 77 days, 688 words, 74 grammar rules, 31 letters, 22 scenarios, validator errors 0, 48 tests.
  Dialogues 12–16 lines, density above the Prompt B targets. All content `needs-review`.
- `.gitattributes` (LF) so Windows checkouts pass `format:check`; local `core.autocrlf=false`.

## Left (against Prompt B checklist Z)
1. Days 78–90 (weeks 12–13; outlined in `content/course/course.json`) + week tests 12–13, cumulative test, final exam.
2. Scenarios: 22 of 27.
3. Missing screens/labs: Sentence explorer, Placards, Explore (culture chapters), Time lab, Speaking lab,
   number calculator check, Onboarding/placement check, Report, real-life photo card per day.
4. Photos (Wikimedia Commons, credited), 5,000-word dictionary check.
5. Audit tools: `scripts/audit/` (audit-dump, chunk, dialogue-stats.py, scan) and the two-reviewer + reconciler audit.
6. `tools/build-android.ps1` (build in its own folder, e.g. C:\m\a / C:\m\au), e2e + layout sweep on the PC.
7. First deploy (Workers `ar-journey`, `ar-journey-unlocked`; never deployed yet) and release v1.0.0 by the
   Journey release-folder rule.

## Decisions
- Never mark content `approved` without a named human reviewer.
- Edit lesson JSON as text; rebuild `readings:build` → `glossary:auto` → `check` after content changes.
