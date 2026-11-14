# Branching role-play: writer brief

Prompt B section L asks for a **branching role-play** in every scenario. The app part is built
(`src/features/roleplay.tsx`, schema `Roleplay` in `src/content/schema.ts`, rules in `checkRoleplay` in
`src/content/validate.ts`). You write the content for your scenarios. The learners must meet **genuine, correct
Modern Standard Arabic**; a wrong form in a "right" reply teaches a mistake.

## Read first
1. The model: `content/course/roleplays.json` (the café role-play). Copy its shape and its level of care.
2. Your scenarios in `content/course/scenarios.json` (intro, speakers, dialogue lines with segs, mistakes, quiz).
3. House style: `docs/review/round-4/BRIEF-ROUND-4.md`, section "House style" (pause form allowed; endings shown on
   adverbial -an, kāna/laysa predicates, inna/anna nouns, counted nouns, objects of taught verbs, fixed formulas).

## Shape (one object per scenario)
```
{ "scenario": "<scenario id>", "status": "needs-review", "start": "r1", "nodes": [ … 4 to 6 nodes … ] }
node:   { "id": "r1", "npc": <dialogue line>, "choices": [ 2 or 3 replies ] }
npc:    { "id": "<scenario id>-rp1", "sp": "<speaker key>", "ar": "…", "en": "…", "segs": [["word","gloss"], …] }
reply:  { "ar": "…", "en": "…", "segs": [...], "ok": true|false, "feedback": "…", "next": "r2" | null }
```
- The other person speaks in `npc`; `sp` must be one of the scenario's speaker keys, never `daniel`.
- The learner is **Faisal** (speaker key `daniel`): an American man. His replies use masculine "I" forms and address
  the other person with the right gender (-ka to a man, -ki to a woman; check the speaker's name and the dialogue).
- A right reply (`ok: true`) moves on to `next`; `next: null` on a right reply ends the role-play.
- A wrong reply (`ok: false`) always has `next: null`: the app shows its feedback and the learner tries again.
- Every node: 2–3 replies, at least one right and at least one wrong.
- **Branching:** at least one node has two right replies that lead to different nodes (as café r1: tea → r2,
  coffee → r3). The paths may join again later. No loops: the conversation always moves forward.
- 4–6 nodes per scenario. Keep it short and natural, at the level of the scenario's own dialogue.

## Content rules
- **Reuse first.** Use the scenario's own dialogue lines (Arabic, English and segs copied exactly) for the other
  person and for right replies wherever they fit. Those lines were checked in five review rounds. New lines must use
  words from the scenario or the course and be just as simple.
- **Fully vocalised:** every Arabic word carries its harakat (the checker rejects an unvocalised word). Follow the
  scenario's spelling of each word (e.g. عَلِيّ, إِذًا, شَاي without final sukūn, يَا أُسْتَاذ).
- **segs** must join exactly to the Arabic words of `ar`, in order (punctuation is not a word). Glosses are
  **English only**: no Arabic script inside a gloss or inside `en` (the schema rejects it). Copy the gloss wording
  from the scenario's segs for the same word. Mark names with a third element `"name"`:
  `["فَيْصَل", "Faisal (first name)", "name"]`.
- **Wrong replies** show one real, typical learner mistake: -ka/-ki, a gender agreement (adjective, number, verb), a
  missing object -an where the course shows it, a yes/no answer to an either/or question, the wrong question word, a
  reply that does not fit what was asked, a register slip (an order without "please" to a stranger). Every word must
  be a **real Arabic word** spelt correctly: the mistake is in grammar, agreement or use, never a misspelling. Its
  `en` says what it means and, if the error is in the form, ends with "(wrong ending)" or similar.
- **feedback:** one or two short English sentences. For a right reply, say why it works (a point worth noticing).
  For a wrong reply, say what is wrong and give the right form. Arabic may be quoted in feedback (fully vocalised).
- Cast names are Arabic: Faisal (never Daniel), Lubna (never Emma), Sami, Layla, Karim, Yusuf … as in the scenario.
- Do not invent facts that contradict the scenario (place, people, what happened).

## Work and check
- Write your role-plays as one JSON array to `docs/review/roleplay/drafts/<your group>.json`, using the Write tool
  (Bash heredocs break Arabic text). Do not edit any other file.
- Check: `npx tsx scripts/check-roleplays.ts docs/review/roleplay/drafts/<your group>.json`, and fix until it prints
  0 problems. Do not run the app build or the test suite.
- Re-read every right reply as a careful teacher: is it correct MSA, does it agree in gender and number, does it
  answer the line before it? Re-read every wrong reply: is the mistake real and is the feedback right?
- Final message: the scenario ids you wrote, the checker result, and any line you are unsure about (with why).
