# Branching role-play (2026-11-14)

STATUS "Left #4" (Prompt B section L): every scenario now has a branching role-play, modelled on German Journey.

## App
- `content/course/roleplays.json`: 32 role-plays (one per scenario), 190 nodes, 424 replies; schema `Roleplay` in
  `src/content/schema.ts`. The other person speaks (a dialogue line with segs); the learner picks one of 2–3 replies.
  A right reply moves on (two right replies may lead to different nodes); a wrong reply shows why and the learner
  tries again.
- Screen: section "Role-play: your turn" on each scenario page after the dialogue (`src/features/roleplay.tsx`):
  audio, tap glosses (wrong replies tap in mistake scope), feedback, summary at the end, "Play again".
- The learner plays the person spoken to: Faisal in most scenarios, Layla where she is the customer (taxi, bakery,
  directions, clothes-shop, doctor, job-interview), Sami in pharmacy-visit. The screen names who you are.
- Rules (`checkRoleplay` in `src/content/validate.ts`, also `scripts/check-roleplays.ts` for drafts): start exists,
  every node reachable, no loop, at least one real branch, a way to finish, a wrong reply in every node, wrong replies
  never move on, segs join to the text, full vocalisation, speakers of the scenario, never the learner as the other
  person. Role-play texts count for gloss gaps and readings; their segs feed the tap index. The review export now
  prints each scenario's role-play.

## Content method
- Café written by the lead as the model; 31 written by 4 writer agents (`BRIEF.md`, drafts in `drafts/`), reusing
  the scenario's reviewed lines and seg glosses where they fit.
- Cross-check by 2 fresh reviewers (`CROSSCHECK.md`, `X1.json`, `X2.json`): 3 errors (a wrong reply that was right
  on one path, a wrong key on لَيْسَ سَلَطَة in pause form, false feedback on نَعَم) and 6 improvements, all applied
  by `scripts/audit/apply-roleplay-findings.py` (26 edits). The etiquette wine reply stays a right reply (it is the
  scenario's story and leads to Layla's advice); its feedback now names the cultural slip.
- Also: morning-routine l12 لِأَنَّ الدَّرْسَ (inna-noun ending, house style).
- Status `needs-review`: AI-written and AI-checked, no human reviewer.

## Checks
check-roleplays 32/0, validator 0 errors, unit tests 119/119 (graph rules + every scenario has one), e2e 30/30
(new: wrong reply stays, right reply moves on, the other branch is another path).
