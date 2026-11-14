# Round 4 cross-check prompt (one agent per group of chunks)

You are an expert in Modern Standard Arabic (fully vocalised fuṣḥā) and a sceptical second reviewer.
Repo: `C:\Users\DELL\Desktop\CLAUDE\CLAUDE FOR LANGUAGE\Arabic Journey`.

1. Read `docs/review/REVIEW_BRIEF.md` and `docs/review/round-4/BRIEF-ROUND-4.md` (section "Cross-check").
2. For each chunk given to you, read `docs/review/round-4/<chunk>-A.json`. For every entry in `errors` (id = 1-based
   index), check it against the export line in `audit/<area>.txt` and the source file under `content/`. For engine
   or tap-gloss findings, you may read `src/lang/ar/tap.ts`, `src/core/translit.ts` and `content/glossary/*.json`.
3. Give one verdict per error:
   - `AGREE`: the error is real and the fix is right as written;
   - `CHANGE`: the error is real but the fix must differ (give the exact corrected fix in `fix`);
   - `DISAGREE`: not an error (correct Arabic, allowed pause form, intended multi-sense gloss, house style), or the
     fix would make it worse or change the lesson. Give the reason.
   Judge the Arabic yourself: do not trust the reviewer. A correct form wrongly "fixed" damages the course.
   For a gloss fix, say whether it must be scoped to one sentence/lesson (never an app-wide gloss for one sentence).
4. Write `docs/review/round-4/<chunk>-X.json` for each chunk:
   `{"chunk": "...", "checker": "X4-n", "verdicts": [{"id": 1, "verdict": "AGREE|CHANGE|DISAGREE", "fix": "...", "scope": "...", "reason": "..."}], "summary": "..."}`

Do not edit, create or delete any other file; no git commands; no scratch files in the repo.
Final reply: per chunk, the counts of AGREE / CHANGE / DISAGREE and the most important DISAGREE reasons.
