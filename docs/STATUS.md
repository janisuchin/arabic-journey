# Status — Arabic Journey

Updated 2026-11-11 (Final exam done). Branch `main`. All work runs on the owner's PC (no cloud session).
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
- **Speaking lab** `/speaking` (e3b3c2b): my sentences / my dialogue lines / starter set; model normal + slow;
  web speech recognition only after consent (`speakingConsent`), harakat-insensitive word diff `src/core/speech.ts`;
  record-and-compare (expo-audio, on device); self-check; not scored. Native builds: no recogniser (says so).
- **Onboarding** `/onboarding` + **placement** `/placement` (e3b3c2b): 3-step welcome (goal, minutes, audio, privacy);
  placement = 6 stages × 4 week-test questions (`src/core/placement.ts`), stops below 3/4, stores
  `placement.week`; week tests up to it open one at a time; a passed week test opens the next week (`progress.ts`).
- **Report** `/report` (25baa23, Prompt B K): progress (days, quiz average, words learned/mastered, week tests passed),
  study time (total, last 7 days, active days, streak), accuracy by skill (weakest first, judged after 5 answers:
  ≥80 strong, 60–79 developing, <60 needs work), all 13 week tests with best score + status, placement result,
  empty state, "Final report" heading at day 90. Engine `src/core/report.ts` + 5 tests. Me → "Full progress
  report" row (`me-report`). `useStudyTimer` (hooks.ts) logs 1 min/60 s on day, week-test, flashcards, scenario
  and culture screens (study minutes were always 0 before: nothing called `logActivity`).
- **Final exam** `/final-exam` (Prompt B L): cumulative test, 4 questions per week from the 13 week tests (52, fixed seed,
  course order), opens after the week 13 test is passed or with unlock-all (`isFinalExamUnlocked`). Start page shows the
  best attempt; result page scores by week and names the weak weeks (< pass mark, weakest first). Engine
  `src/core/finalExam.ts` + 6 tests; store `finalExam` (best attempt kept, attempts counted). Linked from Path card
  (`path-final-exam`, locked/open), Today card after week 13 (`final-exam-card`), Me row (`me-final-exam`), Report.
  Report: "Final exam" section (`report-final`); heading "Final report" now needs all 90 days AND a passed final exam
  ("All days done" in between). `OneQuestion` (features/lesson) is the shared single-question UI for placement + final
  exam (placement unchanged in behaviour, still not logged to skills; final exam logs skill "final exam").
- Fixed (e3b3c2b): switching learners saved a blank state over the previous learner's progress (writes now paused
  during `loadLearner`). Reading questions hide the transliteration that gave the answer away (`asksReading`).
- Checks: validator 0 errors, 76 unit tests, e2e 26/26 (port 4191), both editions deployed and verified live.

## Left (against Prompt B checklist Z)
1. Teacher review of the culture chapters: open points per chapter in `docs/review/culture-notes/*.md`
   (facts like UNESCO years, Burj Khalifa "tallest", regional customs; family hero photo shows faces;
   ramadan hero credit author "Unknown").
2. Scenarios still missing school, machines, etiquette, dietary (28 ≥ 27);
   no photo scenes / branching role-play on scenario pages.
3. Missing screen: real-life photo card per day. Speaking lab: native speech recognition not bundled;
   expo-audio recording on Android untested until the next APK build.
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
- Onboarding: learners saved before it existed count as onboarded (store `merge`); e2e `newLearner` goes through it.
- Placement never skips by itself: only week tests passed in order open later weeks.
- hand.json key أَحَد = "Sunday (wrong…)": write أَحَدٌ with tanwin when you mean "anyone".

## Next step
Final exam screen (Prompt B L: cumulative test over all 13 weeks, opened after week 13 or by unlock-all; result
feeds the Report "Final report"), then check, e2e (port 4191), deploy, commit and push.
