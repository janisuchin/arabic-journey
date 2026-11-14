# Round-4 reviewer notes (2026-11-14)

STATUS "Left #2": the 124 notes in `docs/review/round-4/*-A.json` that round 4 did not count as errors. The lead
triaged every note (numbering below = order of the files, culture → weeks-tests), wrote `plan-N1.json` (119 ops) and
applied it with `scripts/audit/apply-plans.py` (`APPLIED.md`). `followup/plan-N2.json` holds 2 glosses that lost
their only source plus the validator fixes. No new AI review round was run; these are the reviewers' own suggestions.

## Applied (about 75 notes)
- **Story logic:** day 1 ends with "good evening" because the first school day runs into the evening (realLife says
  so); day 18 Yusuf is an old friend (تَذْكُرُ صَدِيقِي يُوسُف…؟ / طَبْعًا!, no تَشَرَّفْنَا, no "this week"); day 66/70
  internship timeline (a few weeks, بَعْدَ أَسَابِيع, فِي وَقْت قَصِير); the lost-phone scenario lives on Citadel Street
  (no hotel, as in the bank scenario); the ticket machine no longer takes the note "from my wallet"; three Hudas →
  classmate Maryam مَرْيَم (holiday-story), neighbour Suad سُعَاد (birthday-invitation), host mother stays Huda;
  day 38 "this past week".
- **Photo/story:** the lost-luggage scene caption and screen note now say the photo is an airport carousel and the
  station has an office instead. The Levant/Cairo photo swaps (#93) are left: each caption names the real place.
- **Facts:** Petra = one of the New Seven Wonders (day 62); flags "some or all of these colours" (day 14); Cairo
  pleasant in October and November (day 55, not May); kunya after the eldest son (day 71); recycling = making new
  things from old (day 78); digits are written left to right (day 7).
- **Endings (house style):** counted nouns after 3–10 now show -in like 11–99 shows -an: أَحْفَادٍ, أَشْخَاصٍ (days 34,
  39, 59), كَلِمَاتٍ (35), دَرَجَاتٍ (53), جُمَلٍ (54), ثَلَاثُ سَاعَاتٍ (59), دَرَجَةً (84); kāna predicate قَلِقَةً
  (day 46 reading); object قِصَّةً قَصِيرَةً (day 42); بِأَنَّنِي after أَشْعُرُ (days 46, 48); polite plural throughout
  the day-67 email (تَكُونُوا … رَدِّكُمْ).
- **Quiz hints that gave answers away:** hand glosses بَارِدُونَ, كَثِيرُونَ, جَمِيلُونَ are now "(m plural)", إِنَّ is
  "indeed; that" (the rules stay in the mistake notes shown after answering); day 74 quiz 1 option مَنْ → أَنْ.
- **Notes and wording:** "usually" on day 56 dates and day 84 idhā; day 81 بُنِيَتْ also for plurals of things; day 75
  "that would quote her own words"; scenario notes (afḍal as a comparative; "when a number ends in 11 to 99"); no fa-
  after ʿindamā (etiquette); نَشْرَةِ الطَّقْس (weather-plans); grammar: only خُذْ/كُلْ irregular, "careful style also
  uses إِنْ", comma spacing; day 29 written form بَارَكَ اللّٰهُ فِيكَ; day 30 -ihi/-ihim; placard notes (ـُوا (-ū), the
  ة (tāʾ marbūṭa), تَهَانِينَا); waṣl page says "written … but said …"; waṣl IPA adds ʔu; rāʾ page pair نَار / نَال
  (single r); vocabulary: snow note gives يَتَسَاقَطُ الثَّلْجُ too, ibn ʿamm example خَالِد اِبْنُ عَمِّي, mashrūʿ example
  نَعْمَلُ عَلَى مَشْرُوعٍ كَبِيرٍ, "big and very old" (day 51 + vocab); week 10 test key "at work"; culture prose without
  doubled transliteration (souq, coffee); day 6 "six everyday things"; day 37 English closer to the Arabic.
- **Glosses:** "pound/dinar/degree/month/guest (after 11–99)" everywhere instead of "(after a number)"; verb-first
  "(they) … (verb first: singular)" (places, ramadan, days 57, 58); لَمْ after idhā; حِذَاؤُكَ pair of shoes; مُذَكَّرَة;
  أَسْمَاءُ, التَّدْوِير, أَرَاضٍ, مُدَرِّسَة, أُولَى, ثَالِثَة, يُشَاهِدُ, تَبْدَا, نَال (hand); أَخَذَ default, سَتَأْتِي on
  the li-purpose card, letter names عَيْن/أَلِف, يْ glide, خَالَة as polite address, الْمَكْتَبَة bookshop, تَنْسَ/تَنْسَيْ,
  يَكُونُ, كَبِيرَة "old", يَسْكُنُ, الْجِبَال (scoped); mutabbal; tablecloth spelt الْمِفْرَش in both scenes. Dead scoped
  entry يَنْزِلُ @ grammar:weather-expressions removed.
- **Engine** (`src/lang/ar/tap.ts`, `src/core/translit.ts`, unit test "round-4 notes"): bi-/li- hyphen also when the
  gloss gives the meaning (bi-surʿa, bi-buṭʾ, bi-dūni, bi-jānibi, bi-taḥassun, bi-ʿumq, bi-kam, bi-anna, li-ʿāʾilatinā
  "of (lit. for …)"), a second clitic after wa-/fa- (wa-bi-kami, wa-bi-thamānīna, wa-li-kulli, wa-bi-ḥibrin), yā
  la-l-khasāra. Root letters still stay whole (biṭāqa, bilād). 160 export lines changed, all of these words.
- **Review export** (`scripts/audit/audit-dump.ts`): a line's own segs add its names, as the app does, so "Ismuka
  Karīm" is no longer printed in lower case (#1, #9 were export-only; the app was already right).

## Not changed (with reason)
- Marked by the reviewer as acceptable / not an error / house convention: #5, 6, 12, 15, 16, 17, 18, 29, 36, 48, 51,
  57, 63, 64, 67, 68, 105, 116, 123; waṣl kasra on mid-sentence اِبْنُ (#80, 109, 124) stays the course convention.
- Already done in round 4: #27 (lone أ reads ʾ), #44 (سَامِيَ after lākinna).
- Prose-echo cosmetics in the ⟶ line (#22 بَنْك, #56, #118): the engine keeps Arabic when the English already gives
  the reading; harmless.
- Middle dot in katabat·hu / zārat·hu (#35, #53): deliberate t+h separation; left.
- #20 آهْ: the validator requires the sukūn on an interjection with madda; kept.
- #38 one passport for two travellers: generic singular is correct; #110 عُيُونُهَا خَضْرَاء: the card teaches the
  plural; #115 جَذْر vs جِذْر: both attested, used consistently; #66 قَايْتْبَاي: name spelt the same everywhere;
  #78 أَبْرَدُ مِنَ الْقَاهِرَة: fine in speech and simpler; #122 week tests have no explain field.
- #87 placards export: a fresh export is complete (the reviewer's copy was cut by its reader).
- #91 polite ordering: STATUS Left #3.
- #113 "form of …" fallback glosses: the four named examples fixed; the rest stay (not wrong).

## Checks
Validator 0 errors, unit tests 117/117, typecheck/lint/format clean, e2e on port 4191 (see STATUS).
