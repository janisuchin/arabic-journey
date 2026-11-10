# Status — Arabic Journey

Updated 2026-11-10 (Explore + Time lab done). Branch `main`. All work runs on the owner's PC (no cloud session).
Main prompt: `Arabic_Reference/PROMPT_B_Nihongo-based.md` (phases A–F, checklist Z).
Live: https://ar-journey.german-journey.workers.dev · unlocked https://ar-journey-unlocked.german-journey.workers.dev

## Done
- v0.1.0 base (RTL Expo SDK 58, Journey base, transliteration, numbers, readings, glossary, validator); all 90 days
  + 13 week tests; 28 scenarios; sentence explorer; 20 placards (see git log for per-phase commits).
- **Explore the Arab world** (9406070): 9 culture chapters in `content/culture/*.json` (coffee, ramadan,
  calligraphy, souq, food, desert, places, science, family): 4 sections each with prose, model sentences, word
  cards, course words, a reading + 3 questions, a 6–7 question quiz; 34 Wikimedia Commons photos in
  `assets/culture/` (credited, © badge, listed on Credits). Screens `/culture`, `/culture/[id]`; linked from
  Path, Practice, Library, Today labs. Schema `Culture` + validator + gloss coverage; all `needs-review`.
- **Time lab** `/time` (9406070): settable clock face, time in words in 5-minute steps (with part of day, word-by-word
  glosses), minutes table, generated practice quiz, today's date (Egypt/Gulf or Levant month names), Hijri date
  (Intl Umm al-Qura, hidden if the device can't), weekdays, three month sets, parts of the day. Engine
  `src/core/time.ts` + 7 unit tests; 33 hand-glossary lines for time words.
- Checks: validator 0 errors, 56 unit tests, e2e 21/21 (port 4191), both editions deployed and verified live.

## Left (against Prompt B checklist Z)
1. Teacher review of the culture chapters: open points per chapter in `docs/review/culture-notes/*.md`
   (facts like UNESCO years, Burj Khalifa "tallest", regional customs; family hero photo shows faces;
   ramadan hero credit author "Unknown").
2. Final exam screen (if needed); scenarios still missing school, machines, etiquette, dietary (28 ≥ 27);
   no photo scenes / branching role-play on scenario pages.
3. Missing screens: Speaking lab, Onboarding/placement check, Report, real-life photo card per day.
4. Word photos (150–300) and the 5,000-word dictionary check.
5. Audit tools `scripts/audit/` + two-reviewer + reconciler audit (writers' open points from weeks 12–13,
   scenarios and placards are in git history of this file, commit 68d8cac).
6. `tools/build-android.ps1`, layout sweep, release v1.0.0 by the Journey release-folder rule.
7. Owner to decide: English text is right-aligned in the mirrored RTL UI (v0.1.0 choice).

## Decisions
- Never mark content `approved` without a named human reviewer.
- After content changes: `content:index` → `readings:build` → `glossary:auto` → `check`.
- Shared content files have mixed layouts: append only, never re-serialise (merge scripts do this).
- Culture: one writer agent per chapter with `docs/authoring/CULTURE_WRITER_BRIEF.md`; each checks itself with
  `npx tsx scripts/check-culture.ts content/culture/<slug>.json`. Prose must NOT type transliterations (RichText
  adds one; brackets carry meanings only). Photos via `python -I -X utf8 scripts/commons_photo.py search|get`.
- `content:index` writes `culture.generated.ts` (chapters + photo names, Node-safe) and
  `culture-images.generated.ts` (image requires, app only — Node cannot require .jpg).
- Time phrases carry their own segs (generic lookup mis-glosses ظُهْرًا as "back"); 25/35 past = "half ∓ five".
- e2e: run on port 4191 (a French server may hold 4190): copy playwright.config.ts with 4190→4191 and
  `reuseExistingServer: false`, run `npx playwright test -c <copy>`, delete the copy.
- One session at a time in this repo. Deploy: `npm run deploy:web` and `deploy:web:unlocked`.
- hand.json key أَحَد = "Sunday (wrong…)": write أَحَدٌ with tanwin when you mean "anyone".

## Next step
Missing screens (Left 3): Speaking lab and Onboarding/placement check, then check, e2e (port 4191), deploy,
commit and push.
