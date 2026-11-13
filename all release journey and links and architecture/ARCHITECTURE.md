# Architecture: Arabic Journey (v1.0.0), on the shared "Journey base"

Arabic Journey is built from PROMPT B (Nihongo-based, non-Latin scripts) on the "Journey base" shared by the Journey language apps. Everything except the Arabic language pack, the engines' Arabic rules, the right-to-left text handling and the content is the same design as Nihongo and German Journey.

## Stack

| Concern | Choice |
|---|---|
| Framework | Expo SDK 58, React Native 0.88, React 19.3, TypeScript, expo-router (file-based screens in `src/app`) |
| Platforms | One code base for Android (APK built locally with `tools/build-android.ps1`, or with EAS), the web (Cloudflare Workers static assets, `wrangler.jsonc` / `wrangler.unlocked.jsonc`) and iOS (not built yet) |
| Data | Local-first. Each learner's state is in zustand, saved to AsyncStorage (localStorage on the web). There is no account and no server. |
| Content | JSON in `content/`, checked by zod schemas plus the Arabic checks (`npm run content:validate`: segment joins, harakat, dialogue density, gloss gaps, photo files and reuse) |
| Audio | Device text-to-speech (expo-speech, ar-SA); expo-audio to record yourself; optional browser speech recognition on the web (off until the learner agrees); nothing native bundled for recognition |
| Script | Noto Naskh Arabic (SIL OFL) bundled; Arabic runs tagged `dir="rtl" lang="ar"`; the app shell is left-to-right for English readers (`UI_DIR` in `src/base/rtl.ts`, `EXPO_PUBLIC_UI_DIR=rtl` mirrors it) |

## Layers

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ Screens (src/app)                                                             │
│   Who is learning? (profiles, PIN) → onboarding + placement → Tabs:           │
│   Today · Path · Practice · Library · Me                                      │
│   Day player (day/[day]), week tests, final exam, flashcards, report          │
│   Labs: letters, pronunciation, grammar, numbers, time, speaking, explorer    │
│   Scenarios (with scenes), placards, Explore the Arab world (culture),        │
│   dictionary, credits, settings, about                                        │
├───────────────────────────────────────────────────────────────────────────────┤
│ Features (src/features): lesson · grammar · realLife (photo card) · script    │
│   (letter forms) · search                                                     │
│ Components (src/components): tap (TapText, word box, gloss chips) · scene     │
│   (outlined photo spots) · photo (PhotoFrame, WordTile, © badge) · speak ·   │
│   ui kit                                                                      │
├───────────────────────────────────────────────────────────────────────────────┤
│ Journey base (src/base, src/state): same in every language app                │
│   profiles (name, age, PIN, colour) · per-learner storage · log off/resume    │
│   app-config (storage prefix, unlock flag) · colour themes · text size · rtl  │
├───────────────────────────────────────────────────────────────────────────────┤
│ Arabic language pack (src/lang/ar/tap.ts): the only Arabic-specific glue      │
│   token runs · per-word transliteration · meaning chain · syllables           │
├───────────────────────────────────────────────────────────────────────────────┤
│ Engines (src/core): deterministic and unit-tested                             │
│   translit (ALA-LC from harakat: sun letters, waṣla elision, shadda, tanwīn,  │
│   tāʾ marbūṭa) · arabic (letter forms, joins) · numbers (to 999,999,          │
│   ordinals, Arabic-Indic digits) · time · srs · answer · progress ·           │
│   placement · report · finalExam · speech                                     │
├───────────────────────────────────────────────────────────────────────────────┤
│ Services (src/services): speech recognition provider (web / unavailable)     │
├───────────────────────────────────────────────────────────────────────────────┤
│ Content (content/*.json) → validated → content index (generated)              │
│   days (90, each with dialogue, words, drills, real-life card + photo)        │
│   course: grammar (78) · letters (31) · pronunciation (30) · placards (20)    │
│   scenarios (32) + scenes (32 photos, 367 spots) · vocabulary (809)           │
│   word-photos (202) · culture (9 chapters, 34 photos)                         │
│   glossary: hand (409) + auto (3,400) · readings (7,290 forms)                │
│   assets: real-life/ (90) · scenes/ (32) · words/ (202) · culture/ (34)       │
└───────────────────────────────────────────────────────────────────────────────┘
```

## How a tapped word gets its meaning

The meaning chain in `src/lang/ar/tap.ts`, first hit wins:

1. The hand glossary `content/glossary/hand.json` (names, fixed phrases, forms the auto layer gets wrong; it overrides every gloss app-wide, so never add a hand entry for a word the course already glosses).
2. The curated segments of the sentence the word is in (each dialogue line carries its own `segs`).
3. The course vocabulary (`content/course/vocabulary.json`).
4. The auto glossary `content/glossary/auto.json` (built by `npm run glossary:auto`).
5. Engines that answer only when every part is known: numbers, letters, time phrases.

The readings layer (`content/readings/readings.json`, built by `npm run readings:build`) gives every shown Arabic form its transliteration. The validator fails on any Arabic word without a meaning ("gloss gaps"). After any content change: `content:index` → `readings:build` → `glossary:auto` → `check`.

## Photos

Every photo is from Wikimedia Commons under PD, CC0, CC BY or CC BY-SA, fetched and credited by the throttled tools `scripts/commons_photo.py`, `real_life_photos.py`, `scene_photos.py` and `word_photos.py` from their plan files (`scripts/*-plan.json`). The © badge on a photo opens the credit strip and the Commons page; the Credits screen lists all 358. The validator checks every photo file exists, has the right size (words 360×360, real-life max side 960) and that no Commons title or file is used twice.

## Editions and builds

- `APP_VARIANT=unlocked` + `EXPO_PUBLIC_UNLOCK_ALL=1` make the unlocked edition: its own name, package id `com.janisuchin.arabicjourney.unlocked` and Worker `ar-journey-unlocked`, so it installs and deploys next to the normal one.
- Web: `expo export --platform web` then `scripts/fix-web-assets.mjs` (sets `<html dir="ltr" lang="en">`, adds the manifest and icons).
- Android: `tools/build-android.ps1` copies the repo to `C:\m\ar` / `C:\m\aru`, runs `expo prebuild`, Gradle `assembleRelease` (arm64-v8a + armeabi-v7a) with the shared portable JDK/SDK, and files the APK in this folder.
- Brand assets (icon set, splash, Play graphics) come from one SVG design in `scripts/build-brand-assets.mjs`; Play screenshots from `scripts/store-screenshots.mjs`.

## Tests

- `npm run check`: typecheck, lint, prettier, content validator, 76 Jest unit tests.
- `npm run e2e` (Playwright, Pixel 7, against `dist/`): 23 app flows plus the layout sweep (5 sizes × 21 routes at the largest text size). Run on port 4191 when 4190 is busy.
