# Round 4 fix planner prompt

You turn the agreed round-4 findings of your chunks into an exact, machine-applicable fix plan. You do **not** edit any
course file: the lead applies every plan with one script and verifies each fix in a fresh export.
Repo: `C:\Users\DELL\Desktop\CLAUDE\CLAUDE FOR LANGUAGE\Arabic Journey`.

## Inputs (per chunk)
- `docs/review/round-4/<chunk>-A.json`: the findings (`errors`, id = 1-based index).
- `docs/review/round-4/<chunk>-X.json`: the cross-check. Plan **only** `AGREE` (reviewer's fix) and `CHANGE` (checker's
  fix) rows. `DISAGREE` rows are skipped. Where the two differ, the checker wins.
- `audit/<area>.txt`: the export the findings quote (vocabulary-1/-2 both use `audit/vocabulary.txt`;
  glossary-hand also uses `audit/glossary-mistakes.txt`).

## How a tap gloss is chosen (src/lang/ar/tap.ts `meaningOf`)
1. inside a mistake card's wrong side: `content/glossary/mistakes.json`;
2. a bare letter: its name;
3. **`content/glossary/scoped.json`** for the place, then for `day:N` ;
4. **`content/glossary/hand.json`**: app-wide, wins over every lesson sense — use it only when the gloss is right in
   **every** place the form is tapped (check with grep over `audit/*.txt`);
5. scoped `"*"`: the default outside lessons, used when the current day has no seg sense of its own;
6. the course's own senses: segs of that lesson day, the vocabulary entry, else the most frequent plain seg.
`content/glossary/auto.json` is a generated review list: **the app never reads it — never plan a fix there.**

Place keys (`scoped.json`): a day file → `day:N`; week test → `week:N` (week = index + 1); scenario and its scene
spots → `scenario:<scenario id>`; culture → `culture:<chapter id>` (e.g. `cul.coffee`, the `id` in the JSON);
grammar card → `grammar:<id>`; vocabulary card (word, example, note) → `vocab:<id>`; placard → `placard:<id>`;
letter page → `letter:<id>`; pronunciation page → `pron:<id>`. Ids are the `id` fields in the source JSON (the export
headers `### scenario cafe`, `### word marhaban`… show them). One gloss per form per place: if one place needs two
senses of the same form, write one gloss that is right for both (e.g. "since, for; ago").

Seg glosses (`segs` arrays in content files) are curated per line: fix them with a `text` op on that file.

## Output: `docs/review/round-4/plan-<group>.json`
```json
{
  "group": "Q1",
  "ops": [
    {"chunk": "days-51-60", "ids": [1], "op": "text", "file": "content/days/day53.json",
     "old": "exact raw substring of the file", "new": "replacement", "count": 1},
    {"chunk": "days-51-60", "ids": [2], "op": "scoped", "word": "سَتَكُونُ", "scope": "day:53", "gloss": "(it) will be (f)"},
    {"chunk": "...", "ids": [3], "op": "hand", "word": "...", "gloss": "..."},
    {"chunk": "...", "ids": [5], "op": "engine", "note": "what the transliteration/tap engine must do, with 2-3 examples"}
  ],
  "checks": [{"chunk": "days-51-60", "ids": [2], "area": "days-51-60", "expect": "سَتَكُونُ=(it) will be (f)"}],
  "skipped": [{"chunk": "...", "id": 7, "reason": "DISAGREE / cannot be expressed / needs owner"}]
}
```
Rules:
- `text`: `old` must be an exact substring of the **raw file** (check with grep; Arabic is stored as raw UTF-8) and
  `count` the exact number of occurrences you intend to replace (all of them). Keep `old` long enough to hit only the
  intended places. Never re-serialise JSON. Change Arabic only where the agreed fix says so.
- `scoped`/`hand`: `word` is the exact vocalised form as tapped (as in the export's `tap:` line). Prefer `scoped`.
  A `hand` op replaces or adds that key app-wide.
- `engine`: anything that is the transliteration line (`⟶`) or a systematic engine behaviour (clitic hyphens, empty
  brackets after a letter name, "-·hu", names in lower case, duplicated senses like "more; more; the most", digits or
  letters giving away a quiz answer). One op per distinct problem; the lead implements these.
- Every planned non-engine op gets a `checks` entry: a substring the new export of that area must contain
  (`word=gloss` for a tap, the new Arabic/English for a text fix).
- Do not edit, create or delete any other file; no git; scratch files only outside the repo.

Final reply: counts of ops by type, skipped rows with reasons, and anything the lead must decide.
