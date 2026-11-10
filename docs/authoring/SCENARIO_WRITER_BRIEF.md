# Brief: write one real-life scenario for Arabic Journey

> Reusable brief (first used 2026-11-10 for scenarios 23–27). The lead gives each writer: scenario id, title, emoji,
> setting/story, and a scratch folder. After all writers finish: `python -I -X utf8 scripts/merge-scenarios.py <repo>
> <scratch-root>`, then `content:index`, `readings:build`, `glossary:auto`, `check`.

Repo (read-only for you): `C:\Users\DELL\Desktop\CLAUDE\CLAUDE FOR LANGUAGE\Arabic Journey`
App: 90-day Modern Standard Arabic course for English speakers. You write ONE scenario (a real-life situation page
with a dialogue, common mistakes and a quiz). Do not edit any repo file.

## Read first
- `src/content/schema.ts` — the zod `Scenario`, `Dialogue`, `DialogueLine`, `Question` schemas and what counts as
  `arabic` / `latinOnly` / `rich`.
- `src/content/validate.ts` (segment joins: segs must join exactly to the line's `ar`) and `src/content/gloss-gaps.ts`
  (every Arabic word anywhere in the scenario — intro, speaker names, lines, culture, mistakes, quiz `ar` and
  options — must have an English meaning).
- The last scenarios in `content/course/scenarios.json` (`airport-checkin` … `cinema`) as the model: same shape,
  depth and tone. Recurring people: Daniel (American learner from Chicago, key `daniel`), Layla, Sami, Fatima, Omar,
  Mr Karim (`karim`); reuse their `speakers` objects exactly as they appear in earlier scenarios/days.
- `content/glossary/hand.json` (hand glossary format).

## What to write — `<scratch folder>/scenario.json`
One object: `{ id, title, emoji, status: "needs-review", intro, dialogue: { title, speakers, culture, lines },
mistakes, quiz }`.
- `intro`: 2 sentences of English setting the scene, then "Useful phrases:" with 3 vowelled Arabic phrases and their
  English in brackets (as in `cinema`).
- `dialogue.lines`: 12–14 lines, ids `<id>-l1…`, alternating speakers naturally; dense (≥ 10 English words per line
  on average, at most 2 lines of ≤ 3 English words); each line a complete natural thought; one coherent story with
  a small problem that gets solved. Every line fully segmented `[ar, english]`, every word glossed.
- `culture`: 2–3 English sentences of real, accurate cultural information (Arabic words allowed in brackets, vowelled).
- `mistakes`: 2 entries `{ wrong, right, why }` — typical learner errors for this situation; `why` in plain English.
- `quiz`: 4 questions, ids `<id>-q1…`, 4 options each, `answer` index (vary the position); facts consistent with the
  dialogue; at least one question with an `ar` field ("What does this mean?").
- Level: A2–B1 (the learner has done the 90-day course); real MSA as used in the earlier scenarios.

## Optional — `<scratch folder>/hand.json`
`{ "<vowelled word>": "English", … }` only for Arabic words used in intro/culture/mistakes/quiz that do not appear
in your dialogue segs and are not already in `content/glossary/hand.json`.

## Arabic rules
- Fully vowelled MSA (harakat on every word as in `cinema`), correct agreement and case endings where shown; pausal
  forms at the end of a phrase are fine. Natural, polite register.
- Segments must join exactly to `ar` (same spaces, same punctuation placement as the existing scenarios).
- English fields (`title`, `dialogue.title`, line `en`) plain English only, no Arabic script.

## Rules for you
- Write ONLY inside your scratch folder. No npm scripts, no git.
- Check your JSON parses (`python -I -X utf8 -c "import json;json.load(open(r'<file>',encoding='utf8'))"`) and
  check segs join: for each line, `' '.join(s[0] for s in segs)` must equal `ar` with punctuation (، . ؟ ! : ,)
  removed and spaces normalised. Re-read your Arabic once for harakat and agreement errors.
- Final reply (short): file path(s) written, anything you were unsure about.
