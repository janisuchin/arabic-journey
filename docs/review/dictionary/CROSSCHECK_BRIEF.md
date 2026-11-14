# Dictionary cross-check brief

First-pass reviewers (brief: `REVIEWER_BRIEF.md`, same folder; read its house-style section) proposed fixes to
the 5,000-word MSA dictionary. You check the riskiest ones: every fix that changes Arabic text (headword `ar`,
`plural`, `present`) or the part of speech. Each input row has `before` (the Wiktionary row) and `fix` (the
fields the reviewer wants to change; fields not listed stay as in `before`).

For each row decide:
- **ok: true** — the fixed row is correct MSA: right vowels, shadda, hamza seat; the plural is a real, usual
  plural of that word; the present tense has the right stem vowel (كَتَبَ يَكْتُبُ, ذَهَبَ يَذْهَبُ, جَلَسَ يَجْلِسُ);
  the part of speech fits the English meaning; the English matches the new headword.
- **ok: false + use** — the fix is wrong or half-right; give the corrected fields in `use` (same field names).
  Use this also when the headword change is right but the English, plural or present no longer match it.
- **ok: false, no use** — the original `before` values were better; the fix should not change Arabic/pos.

Be strict on real errors, relaxed on taste. Do not change spellings that are correct.

Output one JSON file at the path you were given:

```json
{"file": 3, "checked": 85, "verdicts": [{"key": "<key>", "ok": false, "use": {"plural": "أَقْلَام"}, "why": "usual plural"}]}
```

List only rows with `ok: false` in `verdicts` (rows not listed count as ok). Copy `key` exactly. Do not edit
other files, do not run the build.
