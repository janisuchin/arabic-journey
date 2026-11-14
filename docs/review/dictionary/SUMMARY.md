# 5,000-word dictionary — build and AI review (2026-11-14)

**Result:** `content/dictionary/words.json`, 5,000 rows, most frequent first. All 809 course words are in it, and
4,191 further MSA words. Every headword is fully vocalised. 2,500 rows have a gender, 1,829 a plural, and 1,317
verbs a present tense. Licence: CC BY-SA 4.0 (see LICENSE-CONTENT).

## Sources
- English Wiktionary Arabic entries via kaikki.org / Wiktextract (21,517 usable lemmas). Used for the headword,
  vowels, gender, plural, present tense, meanings and inflection tables.
- FrequencyWords (OpenSubtitles 2018 Arabic, 50k list). Used only for ranking. Each subtitle word, and the same
  word with clitics such as wa-, bi-, al- or -hu stripped, is mapped to the lemmas whose inflection tables contain
  it. Course words get priority on a matching word.

## Review (same pattern as the content rounds)
1. **Pool:** the top 7,000 non-course candidates, split into 20 chunks of 350.
2. **20 reviewers** (`REVIEWER_BRIEF.md`) decided keep, drop or fix for every row. They dropped 1,469 rows:
   obscure Classical homographs (لَاكَ, آنَ), non-lemmas, names, dialect, vulgar words and duplicates. They fixed
   3,073 rows, mostly with modern meanings (أَصْبَحَ "to become", فِرْصَة "opportunity" instead of the old senses),
   plus headwords, plurals, genders and parts of speech.
3. **5 cross-checkers** (`CROSSCHECK_BRIEF.md`) checked all 422 fixes that change Arabic text or part of speech,
   and overruled 18. Examples: شَمَال "north" (the reviewer kept شِمَال "left"), دُبّ "bear", سُلّ "tuberculosis",
   عَرُوس "bride", and plurals such as حَاسِبَات, هُجُومَات and حَوَامِض.
4. **Build:** `scripts/audit/dictionary-decisions.py` merges the review files into `decisions.json`.
   `scripts/build-dictionary.py` applies the decisions and skips 372 rows that duplicate a course word or an
   earlier row after a fix.

The review files themselves are in `audit/dictionary/` (git-ignored, like the other audit exports). The
decisions that matter are in `decisions.json`, so the build can be reproduced from it.

## Limits
- This is an AI review, not a teacher's. Rows below the top few thousand were seen by one reviewer each; only the
  Arabic-changing fixes were cross-checked.
- The frequency ranking is approximate: subtitles are unvocalised, so homographs share their counts.
- Course words keep their course values (e.g. course verbs show their present-tense card).
