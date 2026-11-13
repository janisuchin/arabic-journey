# Status — Arabic Journey

Updated 2026-11-13 (v1.0.0 released). Branch `main`. All work runs on the owner's PC (no cloud session).
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
- **Scenario photo scenes + 32 scenarios** (ad04299, Prompt B L/M): school, machines, etiquette, dietary added
  (writers via `docs/authoring/SCENARIO_WRITER_BRIEF.md` + `merge-scenarios.py`). Every scenario page now has
  "The scene": one licensed Commons photo (`assets/scenes/<id>.jpg`) with 6–15 outlined objects (367 spots). An
  object shows a red outline on hover/touch or when its word chip is tapped; label (Arabic, translit, English,
  note) under the photo; no numbers. `src/components/scene.tsx`, schema `Scene`, `content/course/scenes.json`
  (generated from `scripts/scene-plan.json` by `scripts/scene_photos.py apply`), `scripts/render-spots.py`
  (box check), `docs/authoring/SCENE_SPOTS_BRIEF.md` (4 writer agents placed the boxes, all renders checked).
  Credits lists 156 photos.
- **Word photos** (6838b81, Prompt B M): 202 concrete nouns have a square 360×360 licensed Commons photo in
  `assets/words/<vocab-id>.jpg`; every other word keeps its emoji tile. `WordTile` (`src/components/photo.tsx`)
  shows it with the © badge on the dictionary/lesson word cards (56 px, badge opens the Commons page), the word
  box (150 px) and flashcards (160 px, credit strip); Credits lists all 358 photos. Content file
  `content/course/word-photos.json` (`{vocab, file, alt, credit}`) is written by `scripts/word_photos.py apply`
  from `scripts/word-plan.json` (query, optional `wd` Wikidata item, title, crop, alt). Search = Wikidata P18
  concept image, then Commons search; 57 first picks were replaced by hand from `candidates` sheets. Validator:
  noun only, one photo per vocab, file = `<id>.jpg`, bundled, 360×360, no Commons title or file used twice.
  Checks: validator 0 errors, 76 unit tests, e2e 28/28 (port 4191), both editions deployed + 200 live.
- **Release v1.0.0** (2026-11-13, tag `v1.0.0`, Prompt B P): version 1.0.0 in app.json/package.json; brand icon set
  (ع speech bubble, green; replaces Expo's placeholder) + Play graphics from `scripts/build-brand-assets.mjs`
  (`npm run store:assets`); 8 Play screenshots from `scripts/store-screenshots.mjs` (`npm run store:shots`, serve
  `dist` on 4192); `store/LISTING.md`; `tools/build-android.ps1` (work folders `C:\mr`, `C:\mru`); release
  folder `all release journey and links and architecture/` (README, RELEASE_JOURNEY, ARCHITECTURE, prompt/, .url
  shortcuts, `releases/v1.0.0 (2026-11-13, Expo SDK 58)/` with web zips, source zip, store copies, APKs, README.txt).
  Checks: `npm run check` green (validator 0 errors, 76 unit tests), e2e 28/28 incl. the 5-size layout sweep, both
  editions deployed and byte-identical to `dist/` / `dist-unlocked/`, live normal locks Day 2 and unlocked opens it.

## Left (against Prompt B checklist Z)
1. Teacher review of the culture chapters: open points per chapter in `docs/review/culture-notes/*.md`.
2. Owner glance at the 90 real-life photos (sheet: open any day's start page). Known compromises: days 8, 44, 48,
   58, 64–67, 70, 75, 85, 87, 90 are generic (not Egypt/Jordan) photos; day 32 is a Fayum portrait for "what does
   he look like"; day 35 is a 1930s Bedouin tent photo; days 4, 8, 27, 42, 89 show people's faces (public scenes).
   Swap any photo by editing its title in `scripts/real-life-plan.json`, deleting the jpg, removing the day's
   `"photo"` block, then `get` + `apply`.
3. Scenarios: branching role-play and practice (Prompt B L) not built. Scene photo compromises for the owner's
   glance: lost-luggage (airport carousel, dialogue is a train office), holiday-story (Petra, dialogue is
   Luxor), museum-info (Cairo museum, dialogue is Amman), machines (ticket windows, not a machine); non-Arab
   photos for appointment-time, renting-flat, lost-luggage, doctor, birthday, hotel, job-interview, office-phone,
   airport (Paphos), bank (New Orleans); faces in eid-visit, job-interview, office-phone, school is empty.
   Writers' word doubts are in the per-spot `note`s only; a teacher should glance at the spot words
   (e.g. الْمِرْطَبَان, الْعَرَبَة = trolley, dish names in restaurant/dietary).
4. Speaking lab: native speech recognition not bundled; expo-audio recording on Android untested until next APK.
5. Word photos: owner glance at `assets/words/` (sheets: `python -I -X utf8 scripts/word_photos.py sheet <dir>`).
   Known compromises: `ras` (head) is a silhouette, `kub` is an engraved stemmed glass, `qaima` and
   `bitaqa-baridiyya` are vintage PD items, `harf` is an alphabet graphic, `wajh` reuses a "woman" search hit;
   faces appear in people/job words (public or CC-licensed portraits). Then the 5,000-word dictionary check.
6. Audit tools `scripts/audit/` + two-reviewer + reconciler audit (writers' open points in git history, 68d8cac).
7. Device check of the v1.0.0 APKs (install both side by side, Arabic text with forced RTL off, expo-audio
   recording in the Speaking lab). Play upload needs an EAS production AAB and a `/privacy` page first.

## Decisions
- Never mark content `approved` without a named human reviewer.
- After content changes: `content:index` → `readings:build` → `glossary:auto` → `check`.
- Shared content files have mixed layouts: append only, never re-serialise (merge scripts and
  `real_life_photos.py apply` insert by text).
- Photos: Commons only via `python -I -X utf8 scripts/commons_photo.py` / `real_life_photos.py` /
  `scene_photos.py` / `word_photos.py` (throttled, licence-filtered, credit JSON). Swap a scene photo: delete
  the jpg, drop file/width/height/credit from its plan entry, set a new title, `get`, redo spots, `apply`.
  Swap a word photo: `word_photos.py candidates <dir> <id>` (new `query` in the plan first), look at
  `cand-<id>.png`, `choose <dir> <id>=N`, `get <id>`, write `alt`, `apply`, `content:index`; crop with
  `"crop": "top|bottom|left|right"` + `recrop <id>`. Word photos are keyed `words/<file>` in the validator's
  reuse map because scene and word files may share a name (bank.jpg).
- Scene spots: one word with the article where possible (a one-word spot is glossed by its own `en`); the hand
  glossary overrides every gloss app-wide, so never add a hand entry for a word the course already glosses.
  Selected box always shows; hovered box shows in addition. `render-spots.py --all <dir>` before deploying. Real-life card: one photo per day, no caption (the story is the caption), chips =
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
Owner's choice. Options in order: (a) device check of the two v1.0.0 APKs in the release folder (Left 7);
(b) teacher review hand-off of the culture notes and the photo compromises (Left 1, 2, 3, 5); (c) branching role-play
and practice for the scenarios (Prompt B L, Left 3); (d) audit tools + two-reviewer round (Left 6). Any content change
after v1.0.0 is a new version: bump, check, e2e (port 4191), deploy, new `releases/` folder, tag, push.
