# Release journey: Arabic Journey

The newest version is first. Each version has a git tag on https://github.com/janisuchin/arabic-journey and its own `releases/<version>/` folder here.

## v1.0.0: 13 Nov 2026, Expo SDK 58 (git tag `v1.0.0`)

The first release (PROMPT B, phase F), made after the photo layers (real-life cards, scenario scenes, word photos) closed on 13 Nov.

**What is in it**
- 90 daily lessons in 13 weekly modules, each week ending with a test (pass mark 80%), plus a final exam over all 13 weeks that feeds the Final report.
- Fully vowelled Modern Standard Arabic with an ALA-LC transliteration under every word, generated from the harakat (never guessed), and a "simple" style option.
- Letters lab (31 entries: the 28 letters, hamza, tāʾ marbūṭa, alif maqṣūra; isolated, initial, middle and final forms), pronunciation lab (30 sounds), numbers lab (cardinals to 999,999, ordinals, Arabic-Indic digits), time lab (clock and calendar), 78 grammar guides, sentence explorer, speaking lab (record and compare; browser speech recognition on the web, off until the learner agrees).
- 32 real-life scenarios, each with a licensed Commons photo and 6–15 outlined objects (367 spots); 20 placard sets; 90 real-life photo cards (one per day, the day's new words as chips); Explore the Arab world (9 chapters, 34 photos); 202 course nouns with a square photo. 358 credited photos in all (Credits screen).
- 809 course words with gender, plural and examples; glossary of 409 hand entries + 3,400 auto entries; 7,290 reading forms so every Arabic word shown has a meaning and a pronunciation guide.
- Onboarding with a placement check, per-learner profiles (name, age, PIN, colour), Report screen with study-time logging, flashcards with spaced repetition, mixed daily reviews.
- English (left-to-right) app layout for English readers; Arabic text always right-to-left in Noto Naskh Arabic. `EXPO_PUBLIC_UI_DIR=rtl` restores the mirrored shell.
- Two editions: normal (chapters unlock as you go) and unlocked (every chapter open, separate package id).

**How it was checked**
- Content validator (zod schemas, segment joins, harakat, dialogue density, gloss gaps, photo files and reuse): 0 errors.
- 76 unit tests (transliteration, numbers, time, SRS, placement, report, language pack); end-to-end 28/28 on the v1.0.0 web build, including the layout sweep (320×568, 344×882, 360×640, 360×800, 800×1280 at the largest text size: no off-screen text, no horizontal scroll) over 21 routes.
- Two-reviewer + reconciler audit of the lesson text (writers' open points in git history, 68d8cac); scene spots and word photos placed by writer agents and checked on rendered sheets.
- **Not yet reviewed by a native-speaker teacher.** All content stays `needs-review`; nothing is marked `approved`. Open points per culture chapter: `docs/review/culture-notes/*.md`; photo compromises and teacher items: `docs/STATUS.md` ("Left").

**Files and links produced**
- `android/Arabic-Journey-v1.0.0.apk`, `android-unlocked/Arabic-Journey-v1.0.0-UNLOCKED.apk`: built on this PC with `tools/build-android.ps1` (debug-key signed, for installing directly on a phone). Not yet checked on a device: forced RTL is off in this build and expo-audio recording in the Speaking lab needs a phone test.
- `web/` and `web-unlocked/`: shortcuts to the two live editions and offline zips of the exact build.
- `expo-sdk58-source/`: `git archive` of tag `v1.0.0`.
- `store/`: Google Play listing text, release notes, icon, feature graphic and 8 phone screenshots. The app icon set (ع speech bubble, green) was made for this release with `scripts/build-brand-assets.mjs`; before it the app used Expo's placeholder icon.
- Web: https://ar-journey.german-journey.workers.dev and https://ar-journey-unlocked.german-journey.workers.dev

**Not done (needs the owner)**
- No Google Play AAB: the app has no Play Console entry and no EAS project/upload key yet. When wanted: `npx eas-cli@latest build -p android --profile production` (creates the Expo project and the signing key), then upload with the listing in `store/`. A `/privacy` page should be added first.
- No iOS build.
- Device check of the two APKs (install, RTL text, Speaking-lab recording).
- Teacher review; owner glance at the real-life, scene and word photos (compromises listed in `docs/STATUS.md`).

**Checks:** `npm run check` (typecheck, lint, format, validator 0 errors, 76 unit tests) · end-to-end 28/28 (1.9 min, port 4191).

## Before v1.0.0 (development, Oct–Nov 2026)

Built phase by phase from PROMPT B (`prompt/`) on the Nihongo Journey base: v0.1.0 skeleton with the RTL Expo base, transliteration and numbers engines, readings and glossary layers and the validator; then all 90 days and 13 week tests, 28 scenarios, the sentence explorer and 20 placards; Explore the Arab world and the Time lab (9406070, 10 Nov); Speaking lab, onboarding and placement (e3b3c2b), Report screen (25baa23), Final exam (43be00a), the direction flip to an English layout (b592ec2), real-life photo cards (92a1f01, 11 Nov); scenario photo scenes and 4 more scenarios (ad04299, 12 Nov); word photos (6838b81, 13 Nov). The web editions have been live on workers.dev since 10 Nov and were redeployed after every phase. No downloadable builds were made before v1.0.0.
