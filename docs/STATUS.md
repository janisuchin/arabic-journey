# Status — Arabic Journey

Updated 2026-11-14 (5,000-word dictionary done, web deployed). Branch `main`. All work runs on the owner's PC.
Main prompt: `Arabic_Reference/PROMPT_B_Nihongo-based.md`. Live (dictionary build):
https://ar-journey.german-journey.workers.dev · unlocked https://ar-journey-unlocked.german-journey.workers.dev

## Done
- v1.0.0 released (8386d49, tag v1.0.0): 90 days, 13 week tests, 32 scenarios, culture, labs, report, final exam.
- Accuracy rounds 1, 2, 2b, 3, 3F, final round (review closed by owner decision, a5b2666).
- **Round 4** (f91e670, optional, `docs/review/round-4/SUMMARY.md`): 21 reviewers → 6 cross-checkers → 5 planners;
  58 findings, 56 applied (85 ops, verify 75/76, miss format-only), 2 rejected (مُنْطَاد stays; week-12 عَلَى).
  Main fixes: fa- after إِذَا (days 82, 87), jamal root note, house-style endings (inna nouns, kāna/laysa
  predicates, adverbial -an), day 74/39 quiz distractors, فَلُوكَة, tap glosses scoped per card. Engine: lone hamza
  seat = ʾ, ulāʾika, lone ؟/، kept in prose, letter lists comma-joined, bi- hyphens, li-ḥusni not a name.
- **Owner app round** (2026-11-14, after round 4): Arabic cast names (Daniel → Faisal فَيْصَل, Emma → Lubna لُبْنَى,
  ~800 places, same inflection); every example sentence has its own speaker (word cards, word box, grammar, letter
  page); dialogue "Play all" stops on Stop, on leaving the page, and all speech stops on any route change; "Say it
  yourself" steps through the day's words; best Arabic voice chosen automatically (Natural/Online/Google first) +
  voice picker in Settings; word box shows the pause form (ṭālibatān); letter forms say "same sound, only the shape
  changes"; quiz page lets a passed day walk on to Done; gender colours kept for gender only (question/noun/adverb
  colours changed, full legend, flashcards coloured); يَمِين/يَسَار m, مَلَابِس f; Vocabulary = course words by topic.
- **5,000-word dictionary** (cdcfd5f, 2026-11-14, `docs/review/dictionary/SUMMARY.md`): `content/dictionary/words.json`
  (CC BY-SA 4.0), 809 course words + 4,191 MSA words, most frequent first, all vocalised; from Wiktionary/kaikki
  (headword, gender, plural, present, meanings) ranked by OpenSubtitles FrequencyWords. 20 reviewers (1,469 drops,
  3,073 fixes) → 5 cross-checkers on 422 Arabic/pos fixes (18 overruled). Dictionary screen = 5,000 words (search
  Arabic with/without harakat, translit, English; speaker per word; course words open their course card; "Show
  more"); Vocabulary (?view=course) stays by topic. About/Credits/LICENSE-CONTENT updated.
- Checks: validator 0 errors, 116 unit tests, typecheck/lint/format clean, e2e 29/29 (port 4191). Both editions
  deployed 2026-11-14 and verified live (dictionary chunk served).

## Left
0. Dictionary limits: AI review only; rows were seen by one reviewer (only Arabic-changing fixes cross-checked);
   ranking is approximate (unvocalised subtitles share counts between homographs). Course verbs show their
   present-tense course card. Optional later: a second review pass on meanings, or tap-a-word → dictionary lookup.
- Pronunciation: audio is the device voice; AI reviewers cannot hear it. Quality depends on the voice (old desktop
  voices skip harakat, e.g. بُنِيَتْ → "bunī"; Edge Natural / Google voices read them). Pre-generated neural audio
  would need a paid TTS key (owner decision).
1. Content `status` is not `approved` anywhere: the schema needs a named human reviewer. Owner may choose to mark it
   approved under their own name (a deliberate owner call, not done automatically).
2. Round-4 reviewer notes (124, in `docs/review/round-4/*-A.json`): story logic (day 1 "good evening", day 12/18
   Yusuf, day 66/70 internship), photo/place mismatches in scenarios, counted nouns 3–10 in pause form, li-/bi-
   hyphen gaps (bidūni, bisurʿa), quiz hints that give answers (بَارِدُونَ, كَثِيرُونَ, إِنَّ "after qāla").
3. Small leftovers: day 84 reading past–past "if" sentence; polite ordering lines (days 15, 25, 28) keep
   "I would like"; سُوق gender field can only be m/f.
4. Branching role-play (Prompt B L) not built.
5. **No APK / version release** until all language modules are combined (owner, 2026-11-13). Web deploys only.

## Decisions
- Cast names are Arabic (owner): Faisal (American student from Chicago, internal speaker key still `daniel`), his
  sister Lubna (key `emma`). Never reintroduce English names in dialogues.
- All speech goes through `tts` (src/services/tts.ts): it applies the chosen voice; stop on route change is global.
- Colours: masculine #1C7ED6 and feminine #C2255C are for gender only (`wordColour` in features/lesson.tsx).
- Review closed by owner decision; record it as "owner decision with AI recommendations", never as a teacher review.
- Never mark content `approved` without a named human reviewer.
- House style: pause form mid-sentence; endings shown on adverbial -an, kāna/laysa predicates, inna/anna nouns
  (names too: سَامِيَ, دَانْيَالَ), counted nouns, taught objects, fixed formulas. Spellings: عَلِيّ, أُرْدُنِّيّ, إِذًا,
  امْتِحَان, فَلُوكَة, no final pause sukūn, Hasan, Nour. لَازِم spoken; يَجِبُ أَنْ written.
- Fixes go only where the app reads them: segs/content (counted text replace), `scoped.json` (one place), or
  `hand.json` (right everywhere; English only). Never `auto.json` (the app never reads it).
- `readings.json` is regenerated by `readings:build` from `translitWord`: a one-word reading fix goes in code
  (`SILENT_LETTER_TRANSLIT`/`FIXED_TRANSLIT` in translit.ts, `CLITIC_FORCE`/`NOT_NAMES` in tap.ts), not the layer.
- A gloss hint that names the form ("form after 'lam'") must not show on unanswered quiz options.
- A review round = findings → cross-check → fix plans → `apply-plans.py` → rebuild → re-export → `verify-plans.py`.
- After content changes: `content:index` → `readings:build` → `glossary:auto` → `check`.
- Many day files are CRLF: edit by counted text replacement, never re-serialise; build `old` strings from raw bytes.
- Bash heredocs break on Arabic: write Python scripts to the scratchpad and run them with `-I -X utf8`.
- e2e on port 4191: `npm run build:web`, copy playwright.config.ts with 4190→4191 and
  `reuseExistingServer: false` (literal replace), run, then delete the copy.
- UI is LTR for English readers; Arabic text always RTL. One session at a time in this repo.

- Dictionary: rebuild with `scripts/build-dictionary.py` (sources in git-ignored `.cache/dictionary/`, commands in
  its header); review decisions live in `docs/review/dictionary/decisions.json` (merge: `scripts/audit/
  dictionary-decisions.py`). Never hand-edit words.json; course rows always take course values.

## Next step
Owner's choice: the round-4 reviewer notes (Left #2), the small leftovers (Left #3), branching role-play (Left #4),
or move on to the next language module / combined app.
