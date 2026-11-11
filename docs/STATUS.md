# Status — Arabic Journey

Updated 2026-11-11 (Real-life photo card done). Branch `main`. All work runs on the owner's PC (no cloud session).
Main prompt: `Arabic_Reference/PROMPT_B_Nihongo-based.md` (phases A–F, checklist Z).
Live: https://ar-journey.german-journey.workers.dev · unlocked https://ar-journey-unlocked.german-journey.workers.dev

## Done
- v0.1.0 base (RTL Expo SDK 58, Journey base, transliteration, numbers, readings, glossary, validator); all 90 days
  + 13 week tests; 28 scenarios; sentence explorer; 20 placards (see git log for per-phase commits).
- **Explore the Arab world** `/culture` (9406070): 9 chapters, 34 credited Commons photos in `assets/culture/`.
- **Time lab** `/time` (9406070), **Speaking lab** `/speaking`, **Onboarding** + **placement** (e3b3c2b),
  **Report** `/report` (25baa23), **Final exam** `/final-exam` (43be00a). Details in git log / those commits.
- **Direction flip** (b592ec2, owner decision): app shell is the Journey LTR layout for English readers
  (`<html dir="ltr" lang="en">`); Arabic text always `dir="rtl" lang="ar"`. Switch `UI_DIR` in `src/base/rtl.ts`
  (`EXPO_PUBLIC_UI_DIR=rtl` restores the mirror); `START` for English/transliteration, `AR_START` for Arabic lines.
- **Real-life photo card** (92a1f01, Prompt B H/L/M): every day's "In real life" card now has one licensed
  Wikimedia Commons photo (`assets/real-life/dayNN.jpg`, max side 960, PD/CC0/CC BY/CC BY-SA only) with the ©
  badge → credit strip → Commons page, the story, and the day's new words as tappable chips (hear + word box).
  `src/features/realLife.tsx`; schema `realLife.photo` (required `Photo`); Credits lists all 124 photos
  (90 real-life + 34 culture); validator checks every photo file exists and none is used twice.
  Tooling: `scripts/real_life_photos.py search|get|apply` + plan `scripts/real-life-plan.json` (query, chosen
  title, alt, credit per day). Alt texts were written from the pictures (contact sheets), not from file names.
- Checks (92a1f01): validator 0 errors, 76 unit tests, e2e 26/26 (port 4191), both editions deployed + 200 live.

## Left (against Prompt B checklist Z)
1. Teacher review of the culture chapters: open points per chapter in `docs/review/culture-notes/*.md`.
2. Owner glance at the 90 real-life photos (sheet: open any day's start page). Known compromises: days 8, 44, 48,
   58, 64–67, 70, 75, 85, 87, 90 are generic (not Egypt/Jordan) photos; day 32 is a Fayum portrait for "what does
   he look like"; day 35 is a 1930s Bedouin tent photo; days 4, 8, 27, 42, 89 show people's faces (public scenes).
   Swap any photo by editing its title in `scripts/real-life-plan.json`, deleting the jpg, removing the day's
   `"photo"` block, then `get` + `apply`.
3. Scenarios still missing school, machines, etiquette, dietary (28 ≥ 27); no photo scenes / branching role-play
   on scenario pages (Prompt B M scene photos with red outline boxes, `render-spots.py` not written yet).
4. Speaking lab: native speech recognition not bundled; expo-audio recording on Android untested until next APK.
5. Word photos (150–300) and the 5,000-word dictionary check.
6. Audit tools `scripts/audit/` + two-reviewer + reconciler audit (writers' open points in git history, 68d8cac).
7. `tools/build-android.ps1`, layout sweep, release v1.0.0 by the Journey release-folder rule; next APK must be
   checked on device (forced RTL is off).

## Decisions
- Never mark content `approved` without a named human reviewer.
- After content changes: `content:index` → `readings:build` → `glossary:auto` → `check`.
- Shared content files have mixed layouts: append only, never re-serialise (merge scripts and
  `real_life_photos.py apply` insert by text).
- Photos: Commons only via `python -I -X utf8 scripts/commons_photo.py` / `real_life_photos.py` (throttled,
  licence-filtered, credit JSON). Real-life card: one photo per day, no caption (the story is the caption), chips =
  the day's `newWords`. `content:index` writes `REAL_LIFE_IMAGES` next to `CULTURE_IMAGES` in
  `culture-images.generated.ts`; `PhotoFrame` looks in both.
- Culture: one writer agent per chapter with `docs/authoring/CULTURE_WRITER_BRIEF.md`; prose must NOT type
  transliterations (RichText adds one).
- Time phrases carry their own segs; 25/35 past = "half ∓ five".
- e2e: run on port 4191 (a French server may hold 4190): copy playwright.config.ts with 4190→4191 and
  `reuseExistingServer: false`, run `npx playwright test -c <copy>`, delete the copy.
- UI direction is LTR for English readers; Arabic text always RTL. Never hard-code `textAlign: 'right'`.
- One session at a time in this repo. Deploy: `npm run deploy:web` and `deploy:web:unlocked`.
- Onboarding: learners saved before it existed count as onboarded; placement never skips by itself.
- hand.json key أَحَد = "Sunday (wrong…)": write أَحَدٌ with tanwin when you mean "anyone".
- The Bash tool on this PC strips backslashes inside heredocs: write Python helpers to a file (Write tool) instead.

## Next step
Scenario photo scenes (Prompt B M): for each of the 28 scenarios one licensed Commons scene photo with up to 15
objects, each with a red outline box checked by a new `scripts/render-spots.py`; an object is shown on hover/touch
or when its word chip is tapped, on the same page, no numbers. Add the 4 missing scenarios (school, machines,
etiquette, dietary) first if time allows; then check, e2e (port 4191), deploy, commit and push.
