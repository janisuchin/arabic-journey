# Round 3F (2026-11-13): owner fixes from the teacher-review pack

Items the pack marked as "no teacher needed": R12-23, R12-30, R12-31 and the section-F tap/⟶ notes (R3-n).
Plan: `plan-F.json` (ops, checks, skipped with reasons), applied by `scripts/audit/apply-plans.py`;
`scripts/audit/verify-plans.py` found 59/59 checks in the fresh export (round 3's 230/230 still pass).

## Content (R12)
- **R12-23**: day 37 card now says مَا فَعَلْتَ is "not wrong, but unclear" (also 'you didn't do'); week 6 test q3
  no longer offers مَا as a wrong option (replaced by هَلْ).
- **R12-30**: nisba card: أَمْرِيكَا → أَمْرِيكِيّ, الْأُرْدُنّ → أُرْدُنِّيّ; لُبْنَان → لُبْنَانِيّ is "just add the ending".
- **R12-31**: accusative card: in pause -un/-in fall away, -an is said -ā (khubzā).

## Engine / app
- A reading is not repeated when the English right after the Arabic already gives it: "سَـ (sa-)", "أَبِي (abī)",
  "قَرَأْتُ (qaraʾtu, I read)", "بَيْت bayt, house" (R3-35, 86, 93, 112). `proseParts` is shared by RichText and the
  export; the export now reads prose run by run as the app does (a run the English already reads stays in Arabic).
- Quiz prompts that ask how quoted Arabic is said, with romanised options, hide the prompt's readings (R3-49).
- Grammar formulas are exported as the app shows them: "١ wāḥid", no doubled number words (R3-76).

## Glosses and small content (section F)
fāḍliki 'please', māʾan (object), pens / houses, ʿalā "to" on day 30 and "about" with qaliq, yara/tara/yarā
form labels, satʾtī two readings, verb-first singular labels, ashharu comparative, al-kitāba = writing, la-zaraʿtu,
ninety (-īna after anna), present verbs "he buys" not "to buy", wasāʾil on day 79, mistake notes (jawāzī
passport, al-wālidāni after ʿalā; dead جُمُعَة / إِنْتَرْنِت removed), maʿa anna = although, yanzilu (snow falls),
tantaẓiraka (it, f), sīn–ṣād diagram wording, bā/bū/bī, ʿamūd, saqf, siyāḥiyya, hiya = it (f), mitrū, al-ḥarāra,
tuwaffiru / yataghayyaru (it), anāma after lan, anna-hu, nuqṭa, law samaḥta, bika with ittaṣala, al-risāla.

## Not changed (see plan `skipped`)
R3-45 and R3-85 (teacher decides), R3-30 (ALA-LC), R3-47 (ids never shown), R3-60–69 (auto.json only; learner
taps already right), R3-75/97 (export only), R3-109. R3-72: غُرْفَةُهُ is a live quiz option, so its note stays.

Checks: validator 0 errors, 105 unit tests, e2e 28/28 (port 4191); both editions deployed and verified live.
