# Arabic Journey

A structured, local-first 90-day **Modern Standard Arabic** course for English speakers, built from the
Nihongo-based Journey blueprint (`Arabic_Reference/PROMPT_B_Nihongo-based.md`). One Expo / React Native
codebase (Expo SDK 58, React Native 0.88, React 19.3, TypeScript) for Android, iOS and the web.

**Status (v0.1.0): Week 1 (days 1–7) is written; days 8–90 are outlined on the Path only.**
All lesson content is marked `needs-review`: it has not been checked by a native-speaker teacher.

## Right to left

Every screen reads right to left:

- Web: `<html dir="rtl" lang="ar">` (set at runtime and in the exported `index.html`) and a root
  `dir="rtl"` view, so react-native-web mirrors rows, `start`/`end` spacing and `textAlign`.
- Native: `I18nManager.allowRTL/forceRTL` plus the `expo-localization` plugin with
  `supportsRTL`/`forcesRTL` in `app.json`, so builds start mirrored from the first launch.
- Arabic text is tagged `dir="rtl" lang="ar"` and set in **Noto Naskh Arabic** (full contextual shaping).
  Words are never split: letter forms are drawn with zero-width joiners, and syllable chips keep their
  joins the same way.
- English and transliteration runs are isolated as `dir="ltr"` (web) or wrapped in Unicode bidi isolates
  (LRI/RLI…PDI, native), so punctuation and numbers stay in place in mixed lines.
- Arrows are mirrored (“Next” points left, “Back” points right) and progress bars fill from the right.

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
| `npm run e2e` | Playwright tests against `dist/` on port 4190 (build first) |
| `python3 scripts/audit/dialogue-stats.py` | dialogue length and density per day |
| `npx tsx scripts/audit/audit-dump.ts` | export every lesson as shown (Arabic, transliteration, English) for review |

Deploys (`deploy:web`, `deploy:web:unlocked`) need Cloudflare credentials in the environment and are not
run automatically.

## Licences

Code: MIT (`LICENSE`). Content: CC BY-NC 4.0 (`LICENSE-CONTENT`). Noto Naskh Arabic: SIL OFL 1.1.
