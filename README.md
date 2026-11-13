# Arabic Journey

A structured, local-first 90-day **Modern Standard Arabic** course for English speakers, built from the
Nihongo-based Journey blueprint (`Arabic_Reference/PROMPT_B_Nihongo-based.md`). One Expo / React Native
codebase (Expo SDK 58, React Native 0.88, React 19.3, TypeScript) for Android, iOS and the web.

**Status (v1.0.0, 13 Nov 2026): all 90 days, 13 week tests, a final exam, 32 scenarios with outlined photos,
20 placard sets, 90 real-life photo cards, 202 word photos and Explore the Arab world (9 chapters).**
All content is AI-authored and AI-reviewed and marked `needs-review`: a native-speaker teacher has not checked it.
Releases, links and the architecture note live in `all release journey and links and architecture/`
(live: https://ar-journey.german-journey.workers.dev · unlocked https://ar-journey-unlocked.german-journey.workers.dev).

## Direction

The app shell uses the Journey left-to-right layout for English readers (`<html dir="ltr" lang="en">`); Arabic text
is always tagged `dir="rtl" lang="ar"` and set in **Noto Naskh Arabic** (full contextual shaping). `UI_DIR` in
`src/base/rtl.ts` holds the choice; `EXPO_PUBLIC_UI_DIR=rtl` restores the fully mirrored shell. Letter forms are drawn
with zero-width joiners so words are never split, and English/transliteration runs inside Arabic lines are bidi-isolated
so punctuation and numbers stay in place. Never hard-code `textAlign: 'right'`.

## Language engine

- `src/core/translit.ts` — transliteration of fully vocalised Arabic (ALA-LC style: ā ī ū, ḥ ṣ ḍ ṭ ẓ, ʿ ʾ),
  with sun-letter assimilation, hamzat al-wasl elision across words (ṣabāḥu n-nūr, mā smuk), shadda,
  tanwīn, tāʾ marbūṭa and long vowels. A “simple” style (aa, ii, ') is available. It never guesses a
  vowel the harakat do not show.
- `src/core/numbers.ts` — cardinals to 999,999, ordinals, clock times, Arabic-Indic digits, English.
- `src/lang/ar/tap.ts` — the language pack: token runs, per-word transliteration, meaning chain
  (hand glossary → curated segments → vocabulary → auto glossary → numbers → letters), syllables.

## Scripts

| Command | What it does |
|---|---|
| `npm run check` | typecheck, lint, format check, content validation, unit tests |
| `npm run content:validate` | zod schemas + segment joins + harakat + dialogue density + gloss gaps (must print `errors: 0`) |
| `npm run readings:build` / `npm run glossary:auto` | rebuild the offline readings layer and auto glossary after any content change |
| `npm run content:index` | regenerate the static list of day files |
| `npm run build:web` / `build:web:unlocked` | export the web editions to `dist/` and `dist-unlocked/` |
| `npm run e2e` | Playwright tests against `dist/` on port 4190 (build first); use 4191 when 4190 is busy |
| `npm run store:assets` / `npm run store:shots` | render the icon set + Play graphics; capture the 8 Play screenshots (serve `dist` on 4192 first) |
| `tools/build-android.ps1 -Variant normal\|unlocked` | build a debug-signed APK locally into the release folder |
| `python3 scripts/audit/dialogue-stats.py` | dialogue length and density per day |
| `npx tsx scripts/audit/audit-dump.ts` | export every lesson as shown (Arabic, transliteration, English) for review |

Deploys (`deploy:web`, `deploy:web:unlocked`) need Cloudflare credentials in the environment and are not
run automatically.

## Licences

Code: MIT (`LICENSE`). Content: CC BY-NC 4.0 (`LICENSE-CONTENT`). Noto Naskh Arabic: SIL OFL 1.1.
