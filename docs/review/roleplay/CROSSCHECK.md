# Branching role-play: cross-check brief

New role-plays were written for the 32 scenarios (format and rules: `docs/review/roleplay/BRIEF.md`). You are a
fresh reviewer: check them as a careful MSA teacher would. Learners must meet **genuine, correct Arabic**. Do not
invent errors: a correct form reported as wrong costs a change that can damage the course. When unsure, say so.

## Check, for every node
- **npc line and right replies (`ok: true`)**: correct MSA (grammar, agreement in gender and number, verb forms,
  case where the house style shows it), full and correct vocalisation, natural for the situation, and the right
  reply really answers the line before it. Faisal (the learner) is a man; -ka/-ki must match the person addressed.
- **wrong replies (`ok: false`)**: the mistake is real and typical, every word is a real, correctly spelt Arabic word,
  and the feedback is true and gives the right form.
- **feedback** (English): true, clear, not misleading about a rule.
- **segs**: every gloss is a correct English meaning of that word in this sentence (names marked "name").
- **en**: a faithful translation.
- **story**: consistent with the scenario in `content/course/scenarios.json` (people, place, what happened).
- House style is NOT an error: pause form is allowed; endings are shown on adverbial -an, kāna/laysa predicates,
  inna/anna nouns, counted nouns, objects of taught verbs and fixed formulas (`docs/review/round-4/BRIEF-ROUND-4.md`).

## Output
Write `docs/review/roleplay/<your file>.json` (the name you are given) and edit no other file:
```
{ "reviewer": "<name>", "findings": [
  { "scenario": "cafe", "node": "r3", "where": "npc | choice 0 | choice 1 …", "field": "ar | en | segs | feedback",
    "severity": "error | improve", "problem": "what is wrong, with the reason",
    "old": "the exact current text (or the seg pair)", "new": "the exact replacement" } ],
  "summary": "one paragraph" }
```
`error` = wrong Arabic, a wrong key (a right reply that is wrong, or a wrong reply that is actually fine), a false
rule or a wrong gloss. `improve` = correct but clearly better another way. If an Arabic word changes in `ar`, give
the matching segs change too.
