# Brief: write one "Explore the Arab world" culture chapter for Arabic Journey

> Reusable brief (first used 2026-11-10). The lead gives each writer: slug, chapter number `n`, title, level, topic
> notes. After all writers finish, the lead runs `npm run content:index`, `readings:build`, `glossary:auto`, `check`.

Repo (read-only for you, except your own files below): `C:\Users\DELL\Desktop\CLAUDE\CLAUDE FOR LANGUAGE\Arabic Journey`.
App: 90-day Modern Standard Arabic course for English speakers (A1 → B1). Culture chapters are optional reading
pages (Prompt B section L: "Explore — about 8–10 culture chapters with real photos").

## Read first
- `Arabic_Reference/PROMPT_B_Nihongo-based.md` sections B (honesty), J (content rules), M (photos).
- `src/content/schema.ts`: the zod `Culture`, `CultureSection`, `Photo`, `Sentence`, `PlacardItem`, `Reading`,
  `Question` schemas (field names; what counts as `arabic` / `latinOnly` / `rich`).
- A model of the Arabic style: `content/days/day60.json` (sentences, reading, quiz) and the first placard in
  `content/course/placards.json` (`items` = the `words` list here). Use the same vowelling and seg style.
- `content/course/vocabulary.json` for vocabulary ids (`vocab` field) and `content/course/grammar.json` for grammar ids.

## What to write
1. `content/culture/<slug>.json` — one chapter:
   - `id` `cul.<slug>`, `n`, `title` (given), `titleAr` + `titleSegs`, `emoji`, `level` (given), `summary`
     (2–3 sentences of English, may contain short Arabic runs), `status` `"needs-review"`.
   - `hero`: a photo (see Photos) — `file` `<slug>-1.jpg`.
   - `sections`: 4 sections. Each: `title` (English), `titleAr` + `titleSegs` (short Arabic heading), optional
     `photo` (aim for photos on 2–3 sections, files `<slug>-2.jpg`, `<slug>-3.jpg` …), `body` 2–3 paragraphs of
     clear English (60–110 words each) in which key Arabic words appear vowelled in Arabic script, e.g.
     `… a small cup called a فِنْجَان …` or `… say شُكْرًا ('thank you') …`. Do NOT type a transliteration:
     the app adds one after every Arabic run automatically (a typed one shows twice). Brackets may carry a
     meaning or a plural only. Then 2–3
     `sentences` — model MSA sentences a learner could say or read about the topic, same shape as a day sentence:
     `{id, ar, en, literal, segs, grammar: [existing grammar ids or []], mistakes?: [...]}`. Sentence ids:
     `<slugshort>s1`, `<slugshort>s2` … (unique across the chapter; the lead gives `slugshort`).
   - `words`: 8–12 key words as cards `{ar, en, segs, note?}`: single words or short phrases in pause form
     (no final case vowel, e.g. قَهْوَة), each `segs` glossing every word.
   - `vocab`: 4–10 ids of existing course vocabulary that this chapter uses (only ids that exist).
   - `reading`: `{title, ar, en, segs}` — a connected passage of 45–80 Arabic words at the chapter level,
     fully segmented.
   - `readingQuestions`: 3 questions on the reading (ids `<slugshort>r1…`), `quiz`: 6 questions on the chapter
     (ids `<slugshort>q1…`). Each `{id, prompt, ar?, options (4), answer (index), explain}`; answers must follow
     from the chapter text. Vary the correct index.
2. Photos into `assets/culture/` (only your own `<slug>-N.jpg` files).
3. A short notes file `C:\Users\DELL\AppData\Local\Temp\claude\culture-notes\<slug>.md`: open points for a teacher
   (anything you are unsure of: wording, facts, dates, regional variation).

## Photos (licensed Wikimedia Commons only)
- `python -I -X utf8 scripts/commons_photo.py search "<query>"` lists candidates with their licence (`OK` = allowed).
- `python -I -X utf8 scripts/commons_photo.py get "File:<exact title>" assets/culture/<slug>-N.jpg --max 1280`
  downloads, resizes and prints the JSON `{file, width, height, credit}`; copy `file` and `credit` into your
  Photo object, then add `alt` (plain English, what the photo shows) and an optional `caption`.
- Run these one at a time (the script throttles itself; other writers share the limit). 3–4 photos total.
- Open each downloaded file (Read tool) and check it really shows what your `alt` says. Prefer places, objects,
  food, landscapes, crowds at a distance. No close-up portraits of private people, nothing disrespectful (no
  photos inside a mosque during prayer, no religious figures depicted).

## Language rules
- Fully vowelled MSA on every Arabic word (harakat as in the days); the checker rejects unvowelled words.
- `segs` must join exactly to `ar` (the checker shows the mismatch). Punctuation (، . ؟) is not a token.
- Every Arabic word that appears in English prose (`summary`, `body`, captions, notes, quiz prompts/options,
  `explain`) must ALSO appear, spelled identically (same harakat), as a segment token somewhere in your chapter
  (a sentence, a word card, the reading or a title) — or be a course vocabulary word. Otherwise it is a gloss gap.
- English fields typed `latinOnly` must contain no Arabic script.
- Facts: correct, neutral and respectful; describe practice across the Arab world without generalising one
  country to all; say "many people" rather than "all Arabs". Prices, dates and numbers only if you are sure.
  Religious topics are described factually, as culture, not as instruction.

## Rules for you
- Write ONLY your chapter file, your photo files and your notes file. Do not edit any other repo file; do not run
  `content:index`, `readings:build`, `glossary:auto`, `format` or anything that writes; do not use git.
- Check your chapter: `npx tsx scripts/check-culture.ts content/culture/<slug>.json` until it prints `errors: 0`.
- Re-read your Arabic once for harakat, gender agreement and case before finishing.
- Final reply (short): files written, photos used (file → Commons title), the open points.
