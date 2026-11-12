# Brief: label the objects in one scenario's scene photo (Prompt B M)

> Reusable brief (first used 2026-11-12 for the 32 scene photos). The lead fetches the photos
> (`scripts/scene_photos.py get`) and gives each writer a list of scenario ids and a scratch folder. After all
> writers finish, the lead merges the fragments into `scripts/scene-plan.json`, runs `scene_photos.py apply`,
> `content:validate` (gloss gaps) and `render-spots.py --all` for the visual check.

Repo (read-only for you): `C:\Users\DELL\Desktop\CLAUDE\CLAUDE FOR LANGUAGE\Arabic Journey`
App: 90-day Modern Standard Arabic course for English speakers. Every scenario page gets one licensed photo of the
situation; the learner points at an object (hover/touch) or taps its word chip and a **red outline box** appears
around the object with the Arabic word, its transliteration and English. No numbers anywhere.

## What you do, per scenario id
1. Render the photo with a 10 % grid:
   `python -I -X utf8 scripts/scene_photos.py grid <id> <scratch>/<id>-grid.png` (run from the repo folder) and
   **look at it** (Read tool). The grid lines are labelled 10…90 in percent of width/height.
2. Choose **5–15 clearly visible objects** that a learner in this situation would want to name (things, signs,
   people by role, parts of the room). Prefer objects whose box is at least 4 % wide and 4 % high. Skip anything
   you cannot identify with confidence; never label a face as a named person.
3. For each object write `{ "box": {"x","y","w","h"}, "ar", "en", "note"? }`:
   - `box` in percent of the photo (x,y = top-left corner, w,h = size; x+w ≤ 100, y+h ≤ 100; whole numbers or
     one decimal). The box must sit **on the object** with a small margin, not on its neighbours. Boxes may
     overlap when one object is inside another (a cup on a table).
   - `ar`: the object's name in **fully vowelled MSA with the article** (الشَّاي, الْكُرْسِيّ, النَّادِل), one word
     when possible. Use the course's words where they exist (grep `content/course/vocabulary.json` and the
     dialogues in `content/course/scenarios.json`). A two-word iḍāfa or noun + adjective is allowed when the
     object has no one-word name (مَكْتَبُ الِاسْتِقْبَال); then list every word of it in `hand` (see 5) unless
     it already appears in `content/glossary/hand.json` or as a dialogue segment.
   - `en`: plain English with "the" ("the tea", "the chair"). No Arabic script in `en`.
   - `note` (optional, ≤ 1 sentence, plain English; Arabic allowed in brackets, vowelled): a useful fact or
     phrase ("Ask for it بِدُونِ سُكَّر, without sugar.").
   - No two spots with the same `ar`.
4. Write `alt` (one plain-English sentence describing the picture for screen readers, written from what you see,
   no Arabic) and an optional `caption` (≤ 2 sentences shown under the photo; Arabic words allowed, vowelled).
5. `hand` (optional): `{ "<vowelled word>": "English" }` for Arabic words in multi-word spots, notes or the
   caption that are not course vocabulary, not dialogue segments and not yet in `content/glossary/hand.json`.
   One-word spots are glossed by their own `en`; they need no hand entry.
6. Check your boxes visually:
   `python -I -X utf8 scripts/render-spots.py <id> <scratch>/<id>-check.png --plan-file <scratch>/scenes.json`
   then **look at the PNG** and move any box that is not on its object. Repeat until every outline is right.
   The script exits 1 for a box outside the photo or a duplicate word.

## Output — `<scratch>/scenes.json`
One JSON object keyed by scenario id:
```json
{ "cafe": { "alt": "...", "caption": "...", "spots": [ ... ], "hand": { ... } }, "taxi": { ... } }
```
Use `python -I -X utf8` for every Python call. Write only inside your scratch folder; do not run npm scripts or
git; do not edit repo files. Final reply (short): the file path, spots per scenario, anything you were unsure about.
