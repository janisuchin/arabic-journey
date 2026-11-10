# Brief: write one day of Arabic Journey, week N (see content/course/course.json for its title, phase and levels)

> Reusable brief (first used for week 12, 2026-11-10). The lead gives each writer: day, title, level, pronunciation id,
> grammar ids, its scratch folder. After all writers finish: `python -I -X utf8 scripts/merge-additions.py <repo> <scratch-root> <week>`,
> then content:index, readings:build, glossary:auto, check.

Repo (read-only for you, except your ONE day file): `C:\Users\DELL\Desktop\CLAUDE\CLAUDE FOR LANGUAGE\Arabic Journey`
App: 90-day Modern Standard Arabic course for English speakers. Earlier days exist (see content/days). You write ONE day.

## Read first
- `Arabic_Reference/PROMPT_B_Nihongo-based.md` sections G, H, I, J (format and dialogue standard).
- `src/content/schema.ts` (the zod `Day`, `Vocab`, `Grammar` schemas: field names and allowed values, e.g. `Pos`,
  what counts as `arabic` / `latinOnly` / `rich`) and `src/content/validate.ts` (the language checks: segment joins,
  harakat, dialogue density, gloss gaps). Your output must pass them.
- `content/days/day77.json` and `day76.json` as the model (same shape, same depth, same tone, ~38 KB).
  Skim days 71-75 for story continuity: recurring people are Mr Karim (teacher, key `karim`), Sami, Daniel
  (American learner from Chicago), Layla, Fatima, Omar; reuse their `speakers` objects exactly.
- `content/course/vocabulary.json` (ids) and `content/course/grammar.json` (ids) and
  `content/glossary/hand.json` (hand glossary format).

## What to write
1. `content/days/dayNN.json` (NN = your day): every field as in the latest days — day, week, phase and level from course.json (the lead gives the level per day)
   — title (given), titleAr + titleSegs, emoji, summary, intro, 4 objectives, realLife
   {emoji,title,story}, letters [], newWords (8-10 vocabulary ids), grammar ids (1-2), pronunciation [the id given
   to you], 5-6 sentences (id dNNs1…, ar, en, literal, segs, grammar, mistakes with wrong/right/why), dialogue
   (title, speakers, culture note, 14-16 lines id dNNl1…, dense: ≥ 10 English words per line on average, no more
   than 2 lines of ≤ 3 words, each line a complete natural thought, one coherent story fitting the title), reading
   (title, ar, en, segs; 30-45 segments), review (6 earlier vocabulary ids), quiz (7 questions id dNNq1…, 4 options,
   answer index; facts consistent with the dialogue/reading), completion, status "needs-review".
2. `<your scratch folder>/additions.json`:
   `{ "vocabulary": [ …new Vocab entries for newWords ids not already in vocabulary.json… ],
      "grammar": [ …new Grammar entries (firstDay = your day) if you introduce a new rule… ],
      "hand": { …hand-glossary entries, same format as hand.json, only if needed… } }`
   New vocabulary ids: plain transliteration like existing ones; if the id already exists for a different word,
   add a suffix `-wN` (N = week). New grammar ids end in `-wN`. Reuse existing grammar ids wherever a rule already exists.

## Arabic rules
- Fully vowelled MSA (harakat on every word as in day77), correct case endings where shown, pausal forms at the
  end of a phrase are fine (as in the existing days). Natural, correct, polite register.
- Every segment `[ar, english]` (optionally a 3rd pos element as in sentences); segments must join exactly to the
  `ar` text the way validate.ts checks it. Every word glossed in English — zero gaps.
- English fields: plain English only (no Arabic script in `latinOnly` fields; see schema).
- Use the day's new words and grammar; stay at A2 level; keep facts consistent within the day.

## Rules for you
- Write ONLY your day file and your scratch folder. Do not edit any other repo file, do not run npm scripts that
  write files (no readings:build, glossary:auto, content:index, format), do not git anything.
- Check your JSON parses (`python -I -X utf8 -c "import json;json.load(open(r'<file>',encoding='utf8'))"`) and
  re-read your Arabic once for harakat and agreement errors before finishing.
- Final reply (short): file paths written, new vocab ids, new grammar ids, anything you were unsure about.
