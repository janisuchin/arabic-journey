# Accuracy review brief: Arabic Journey

You are one of two independent reviewers of one chunk of the course export. The owner's instruction: **find the
errors that make the Arabic learning incorrect.** Everything else is a note for the owner, not an error.

## What you are reading

`audit/<area>.txt` is the content exactly as the learner sees it. Each line is `file + JSON path: value`.
Under every Arabic string:
- `⟶` is the transliteration the app generates from the harakat (ALA-LC: ā ī ū, ḥ ṣ ḍ ṭ ẓ, ʿ ʾ; sun letters
  assimilated, waṣla elided after a vowel: *ṣabāḥu l-khayr*, *mā smuka*). The engine never guesses a vowel: if the
  harakat are wrong, the transliteration is wrong too, so report the Arabic, not the transliteration, unless the
  Arabic is right and the transliteration still wrong (then category `engine`).
- `segs` are the word glosses the learner gets by tapping that line: `[word = gloss · pos]`.
- `tap:` lists what the learner gets by tapping each word of a line that has no segs (quiz options, table cells,
  examples): `word=gloss`, `∅` = no meaning shown.

The course teaches **Modern Standard Arabic (fuṣḥā)** with full vocalisation, to English-speaking beginners.
Dialogues may use polite everyday MSA; a form is not wrong because a dialect would say it differently.

## Error (report these; they will be shown to the owner for a decision)

| Category | Examples |
|---|---|
| `arabic` | misspelt word, wrong or missing harakat that change the word or the case, wrong hamza seat, wrong tāʾ marbūṭa / hāʾ, wrong case ending for the syntax (nominative after إِنَّ, accusative subject of كَانَ…), wrong tanwīn, wrong sun/moon assimilation in the vocalisation |
| `agreement` | gender, number or definiteness agreement (adjective–noun, verb–subject, demonstrative), wrong person in a verb, dual/plural forms |
| `verb` | wrong conjugation, wrong form/pattern, wrong mood after لَنْ / لَمْ / أَنْ, wrong imperative |
| `translation` | the English does not mean what the Arabic says (including a wrong `literal`), a sentence translated as the wrong person/tense |
| `gloss` | a seg or tap gloss that is wrong or misleading for that word in that sentence; a `∅` on a word a beginner needs; a tap gloss that belongs to another sentence's sense |
| `answer-key` | the marked quiz/test answer is wrong, another option is also correct, the `right`/`wrong` pair in `mistakes` is wrong |
| `grammar-fact` | a grammar explanation, table cell, formula or note that teaches a wrong rule or wrong form |
| `script-sound` | wrong letter name, shape, join, sun/moon status, IPA, transliteration symbol, or a wrong pronunciation tip or minimal pair |
| `engine` | the Arabic is correct but the `⟶` transliteration or a tap gloss is systematically wrong (report once with 2–3 examples) |

Severity: `major` = a learner would learn something wrong (wrong word, wrong form, wrong meaning, wrong answer key, wrong rule); `minor` = an inconsistency or a missing harakat that does not change the word.

## Note (do NOT count as an error; list under "Notes for the owner")

Unnatural but correct Arabic; register choices (MSA vs colloquial); a better word or example; clumsy English;
culture, history or geography facts; photo choice or alt text; story logic; British/American spelling;
punctuation style; anything about the app's design.

## Do not report

Transliteration style choices (ALA-LC is the house style); the absence of final short vowels in pause (both
`الْمَدْرَسَة` and `الْمَدْرَسَةِ` are accepted at the end of a phrase); names' spellings when consistent.

## Output: `docs/review/round-N/<chunk>-<reviewer>.json`

```json
{
  "chunk": "days-01-10",
  "reviewer": "A",
  "errors": [
    {
      "file": "content/days/day03.json",
      "path": "dialogue.lines[2].ar",
      "current": "أَنَا طَالِبٌ جَدِيدَةٌ",
      "problem": "the speaker is Layla (f.) but the adjective is masculine-feminine mixed: طَالِبٌ with جَدِيدَةٌ",
      "category": "agreement",
      "severity": "major",
      "fix": "أَنَا طَالِبَةٌ جَدِيدَةٌ",
      "alsoChange": "segs[1] gloss → 'a student (f)'; transliteration follows automatically"
    }
  ],
  "notes": [{ "file": "…", "path": "…", "note": "…" }],
  "summary": "one paragraph: what you checked, how many errors, the patterns you saw"
}
```

Rules: quote `current` exactly as it appears in the export (it will be used as a find-and-replace); one finding per
problem; if the same mistake repeats, list every path in `path` separated by `; `; never propose a fix that
changes the meaning of the lesson; do not edit any file yourself.
