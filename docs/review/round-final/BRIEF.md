# Final round: planner brief

You turn the owner's decisions for your group into an exact, machine-applicable fix plan. You do **not** edit course
files. Repo: `C:\Users\DELL\Desktop\CLAUDE\CLAUDE FOR LANGUAGE\Arabic Journey`.

Read first:
- `docs/review/round-final/DECISIONS.md` — do only the rows whose group is yours (a row can list two groups; do
  your part only). The decision is final; do not re-argue it, but if it cannot be applied as written, apply the
  closest correct form and say so in `skipped`/`notesForLead`.
- `docs/review/TEACHER-REVIEW-PACK.md` — the full question (where exactly, quoted text).
- `docs/review/round-3/APPLY-PROMPT.md` — how taps are chosen, the plan format, op rules. Follow it exactly.
- `docs/review/round-3f/plan-F.json` — a real example plan.
- `audit/*.txt` — the current export (to find text); the raw files are under `content/`.

Output: `docs/review/round-final/plan-<GROUP>.json` with `group`, `ops`, `checks`, `skipped`, `notesForLead`.

Rules (in addition to APPLY-PROMPT):
- `old` must be an exact raw substring of the file. Many day files are CRLF: read the raw file in Python with
  `open(p, encoding='utf8', newline='')` and build multi-line `old` strings from it. Verify every op's count with a
  Python script (scratch files only in your own temp/scratch folder, not in the repo; run Python with `-I -X utf8`;
  bash heredocs break on Arabic — write scripts to files).
- When you change an Arabic sentence, change everything that belongs to it: the `segs` (word + gloss), the English
  line, the transliteration if stored, quiz options/keys and explanation text that quote it. A new vocalised form
  that is tapped needs a gloss (a seg gloss in that file, or a `scoped` op for the place).
- Keep house style: full vowel marks; pause form unless DECISIONS says an ending must show.
- Do **not** touch these course-wide spellings (another pass does them after you): عَلِي/عَلِيّ, أُرْدُنِي/أُرْدُنِّي,
  إِذَنْ/إِذًا, رَم/رَمّ, the امتحان waṣl kasra, final pause sukūn (شَايْ…), إلكتروني, "Hassan"/"Hasan", "Nur"/"Nour".
  Avoid `old` strings that contain them where you can; if you must, keep them unchanged inside `new`.
- Only your group's files may be in `ops` unless DECISIONS sends you elsewhere: G1 days 1–30; G2 days 31–60;
  G3 days 61–90 and `content/course/course.json` week tests (find where the week tests live); G4 scenarios.json,
  scenes.json, placards.json, word-photos.json, content/culture/*; G5 grammar.json, vocabulary.json, letters.json,
  pronunciation.json. Glossary ops (`scoped`/`hand`) are allowed for any group, for its own places.
- Every op gets a `checks` entry (a substring the new export of that area will contain).
- Before you finish, run `python -I -X utf8 scripts/audit/apply-plans.py docs/review/round-final --dry` only if it
  is safe: it reads all plans in the folder; if other plans conflict with yours, report it rather than editing theirs.
- No git, no edits to any file except your plan file.

Final reply (short): ops by type, every decision row you handled → done/skipped (reason), anything for the lead.
