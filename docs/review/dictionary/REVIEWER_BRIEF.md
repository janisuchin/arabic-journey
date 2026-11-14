# Dictionary review brief (5,000-word MSA dictionary)

The app's learner dictionary is built by `scripts/build-dictionary.py` from English Wiktionary (kaikki.org) Arabic
entries, ranked by an OpenSubtitles frequency list. The ranking maps unvocalised subtitle words to lemmas
automatically, so the candidate pool contains junk: rare Classical verbs whose inflected forms look like common
words, wrong first meanings (Lane-style "to enter upon morning" for أَصْبَحَ), obscure homographs, non-lemmas.
The 809 course words are already reviewed and are not in the pool. Your job: one chunk of ~350 candidates.

Learners are English speakers learning **Modern Standard Arabic**. The owner wants genuine, correct Arabic.

## For every row decide

- **keep** — a real, current MSA word a learner could need among the ~5,000 most useful words, with a correct
  vocalised headword and a correct, modern English meaning. Most rows with a sensible word should be kept.
- **drop** — any of:
  - obscure, archaic, Classical-only or Quranic-only word or sense (e.g. لَاكَ "to chew", آنَ "to be at rest",
    وَنَى "to be weak", بِيه "bey"), or a word that only got in because it is spelled like a common word;
  - a non-lemma that duplicates another word (a plural, a feminine form, a bound pronoun such as ـني);
  - a proper name, a foreign-script artefact (كَانَا "kana"), a Bible-book name, a chemical symbol sense;
  - vulgar or sexual slang, slurs; dialect-only words (not MSA);
  - a duplicate of another row in your chunk with the same word and meaning (keep the better one).
  If the *word* is common but Wiktionary gave an obscure meaning, do **not** drop: **fix** the meaning.
- **fix** — the word belongs but a field is wrong. Give only the fields that change:
  - `en`: 1–3 short common meanings, most common first, separated by "; " (max ~50 characters, English only,
    no Arabic script, no transliteration). E.g. أَصْبَحَ → "to become; to start the morning"; رَأَى → "to see";
    مَاتَ → "to die"; بَنَى → "to build"; جَيِّد → "good"; كَيْف (noun) → drop or fix only if a real noun use.
  - `ar`: fully vocalised headword in house style (below) when vowels/hamza/shadda are wrong or missing.
  - `gender` (`m`/`f`/`""`), `plural` (fully vocalised; the usual MSA plural), `present` (verbs: vocalised
    he-form present, e.g. يَكْتُبُ), `pos` (noun/verb/adj/adverb/prep/pronoun/conj/interj/number/particle/phrase).

## House style for headwords

- Every letter vocalised as in a learner's dictionary; shadda written; hamza on its correct seat (أ إ ؤ ئ ء).
- Verbs: past tense he-form ending in fatha (كَتَبَ, اِسْتَقْبَلَ); hamzat al-waṣl written as bare ا with kasra (اِنْتَهَى)
  like the existing rows. `present` ends in damma (يَكْتُبُ) or is a weak form (يَمْشِي, يَدْعُو).
- Nouns/adjectives: no case ending and no final sukūn (كِتَاب, مَدْرَسَة); nisba ـِيّ (عَرَبِيّ); adverbs keep
  tanwīn -an (أَيْضًا). Function words keep their final vowel/sukūn (مِنْ, لَمْ, هُوَ).
- Do not change a spelling that is correct just to match your taste.

## Output

Write **one JSON file** to the path you were given, exactly this shape (no comments):

```json
{"chunk": 7, "checked": 350, "drop": [{"key": "<key>", "why": "obscure Classical verb"}],
 "fix": [{"key": "<key>", "en": "to see", "why": "modern meaning"}]}
```

- `key` is copied **exactly** from the row (`"<ar>|<pos>"`). Rows you keep are not listed.
- Be decisive and consistent; aim for real errors, not stylistic nitpicks. Expect roughly 10–30 % drops in
  late chunks and many meaning fixes in early chunks (frequent words have the most senses).
- Do not edit any other file. Do not run the build.
