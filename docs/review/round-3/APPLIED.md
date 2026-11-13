# round-3: applied fix plans

275 ops from plan-P1, plan-P2, plan-P3, plan-P4, plan-P5, plan-P6: engine 28, hand 11, scoped 211, text 25
Engine ops are implemented in code (see the round summary).

| Plan | Finding | Op | Detail |
|---|---|---|---|
| plan-P1 | days-51-60 [1] | text | `content/days/day53.json` ×1 |
| plan-P2 | days-61-70 [5] | text | `content/days/day64.json` ×1 |
| plan-P2 | days-61-70 [5] | text | `content/days/day64.json` ×1 |
| plan-P2 | days-61-70 [5] | text | `content/days/day65.json` ×1 |
| plan-P2 | days-61-70 [5] | text | `content/days/day65.json` ×1 |
| plan-P2 | days-61-70 [5] | text | `content/days/day68.json` ×1 |
| plan-P2 | days-61-70 [5] | text | `content/days/day68.json` ×1 |
| plan-P2 | days-61-70 [6] | text | `content/days/day64.json` ×2 |
| plan-P2 | days-61-70 [6] | text | `content/days/day69.json` ×12 |
| plan-P2 | days-81-90 [1] | text | `content/days/day86.json` ×1 |
| plan-P2 | days-81-90 [13] | text | `content/days/day89.json` ×1 |
| plan-P3 | grammar [18] | text | `content/course/grammar.json` ×2 |
| plan-P4 | glossary-auto-1 [11] | text | `content/days/day62.json` ×2 |
| plan-P4 | glossary-auto-1 [11] | text | `content/days/day62.json` ×2 |
| plan-P5 | scenarios-1 [12] | text | `content/course/scenarios.json` ×1 |
| plan-P5 | scenarios-1 [12] | text | `content/course/scenarios.json` ×1 |
| plan-P5 | scenarios-1 [12] | text | `content/course/scenarios.json` ×1 |
| plan-P5 | scenarios-1 [12] | text | `content/course/scenarios.json` ×1 |
| plan-P5 | scenarios-1 [12] | text | `content/course/scenarios.json` ×1 |
| plan-P5 | scenarios-1 [12] | text | `content/course/scenarios.json` ×1 |
| plan-P5 | scenarios-1 [12] | text | `content/course/scenarios.json` ×1 |
| plan-P5 | scenarios-1 [12] | text | `content/course/scenarios.json` ×1 |
| plan-P5 | scenarios-1 [12] | text | `content/course/scenarios.json` ×1 |
| plan-P5 | scenarios-2 [12] | text | `content/course/scenarios.json` ×1 |
| plan-P5 | culture [4] | text | `content/culture/food.json` ×1 |
| plan-P1 | days-11-20 [1] | scoped | عَلِي @ day:18 = Ali (first name): Umm Ali is a bread pudding |
| plan-P1 | days-11-20 [1] | scoped | عَلِي @ * = Ali (first name) |
| plan-P1 | days-31-40 [1] | scoped | مُنْذُ @ day:38 = since, for; ago |
| plan-P1 | days-41-50 [1] | scoped | مَرَّةً @ day:45 = once, one time |
| plan-P1 | days-51-60 [2] | scoped | سَتَكُونُ @ day:53 = (it) will be (f) |
| plan-P1 | days-51-60 [3] | scoped | بِخَيْر @ day:52 = well, in good health ('kullu ʿāmin wa-anta / wa-anti bi-khayr': many happy returns) |
| plan-P1 | days-51-60 [4] | scoped | نَشْتَرِيَ @ day:52 = we buy (after an or lan) |
| plan-P1 | days-01-10 [1] | engine | Quiz options that are a bare digit or a bare letter must not show a ⟶ line that gives the answer away (OptionArabic in src/features/lesson.tsx prints translitLi |
| plan-P1 | days-01-10 [2] | engine | proseTranslit (src/lang/ar/tap.ts, namedBefore rule): when a bare letter or mark is dropped because its name is written just before it, also drop the space befo |
| plan-P1 | days-11-20 [2] | engine | Clitic hyphen (cliticReading in src/lang/ar/tap.ts): hyphenate a one-letter proclitic wa-/fa-/bi-/li-/ka- whenever the line's seg (or tap) gloss for the word is |
| plan-P1 | days-31-40 [2] | engine | Double clitic before a name: وَلِسَامِي (seg 'and for Sami') prints 'wa-Lisāmī'; split both clitics and capitalise the name, not the clitic: 'wa-li-Sāmī' (day 3 |
| plan-P1 | days-31-40 [5] | engine | Names in lower case in ⟶: a word segged '· name' must be capitalised even when the form also has a common-word sense. شِيكَاغُو → 'fī Shīkāghū' (day 32 dialogue |
| plan-P1 | days-41-50 [4] | engine | FIXED_TRANSLIT for الله (src/core/translit.ts) drops a written case vowel mid-phrase: اللّٰهُ يُسَلِّمُكِ يَا لَيْلَى prints 'Allāh yusallimuki' (day 43 dialogu |
| plan-P1 | days-51-60 [6] | engine | The s·h / d·h / k·h / t·h separator dot (src/core/translit.ts) is inserted after a hyphen/tatweel, where no consonant precedes the h: the day 60 intro shows bar |
| plan-P2 | days-61-70 [1] | hand | أُسْتَاذَة = teacher (f); Mrs, madam (polite title) |
| plan-P2 | days-61-70 [2] | hand | مُسَافِر = travelling, away (m); traveller |
| plan-P2 | days-61-70 [3] | hand | أَغْلَى = more expensive; the most expensive (before a noun) |
| plan-P2 | days-61-70 [4] | hand | الْخَزْنَة = the Treasury (famous building in Petra) |
| plan-P2 | days-61-70 [3, 4] | engine | widen() in src/lang/ar/tap.ts appends a second sense that already contains the chosen one, giving duplicated glosses: أَغْلَى 'more expensive; more expensive; t |
| plan-P2 | days-61-70 [7] | engine | Transliteration (⟶) of English prose with a bare Arabic letter in brackets: when the letter renders as nothing, drop the empty brackets and the space before the |
| plan-P2 | days-61-70 [8] | engine | Clitic hyphen (src/lang/ar/tap.ts cliticReading): split a one-letter clitic (wa/fa/bi/li) when the line's seg gloss starts with the clitic sense even if the rem |
| plan-P2 | days-61-70 [9] | engine | Transliteration capitalisation: capitalise a word in a ⟶ line when that line's seg for it is tagged '· name' (not globally: كَرِيم is also the adjective 'genero |
| plan-P2 | days-71-80 [1] | engine | Clitic hyphen, extended (checker's CHANGE): (a) hyphenate a one-letter clitic also when the remainder is inflected and not a headword (same rule as days-61-70 # |
| plan-P2 | days-81-90 [2] | scoped | عَشَرَ @ day:81 = -teen (second part of a compound ordinal: 'twelfth', 'eighteenth', 'nineteenth') |
| plan-P2 | days-81-90 [3] | scoped | نَاحِيَةٍ @ day:83 = a side ('on the one hand' / 'on the other hand') |
| plan-P2 | days-81-90 [4] | scoped | الْعُنْوَان @ day:86 = the headline, the title; the address |
| plan-P2 | days-81-90 [5] | scoped | عُنْوَانُ @ day:86 = headline, title (of) |
| plan-P2 | days-81-90 [6] | scoped | مَقَالَة @ day:88 = essay; article |
| plan-P2 | days-81-90 [7] | scoped | عَلَامَات @ day:88 = marks, signs ('punctuation' with at-tarqīm) |
| plan-P2 | days-81-90 [8] | hand | الْخَطّ = handwriting, calligraphy; the (phone) line |
| plan-P2 | days-81-90 [9] | scoped | بَرِيدِيَّةً @ day:88 = postal (with biṭāqa: postcard) |
| plan-P2 | days-81-90 [10] | scoped | مِنُ @ day:85 = from (wrong helping vowel — correct: mina before al-) |
| plan-P2 | days-81-90 [11] | scoped | مُدِير @ day:82 = director, manager |
| plan-P2 | days-81-90 [12] | scoped | الَّذِي @ day:86 = who, which, that (m) |
| plan-P2 | days-81-90 [14] | engine | Bare Arabic letters in English prose / quiz options (⟶): when a bare letter follows its English name and renders as nothing, drop it together with the space bef |
| plan-P2 | weeks-tests [1] | scoped | حَارًّا @ week:8 = hot (-an after kāna / yakūnu) |
| plan-P2 | weeks-tests [2] | scoped | أَنَامَ @ week:8 = I sleep (form after an / lan) |
| plan-P2 | weeks-tests [3] | scoped | كُلَّ @ week:8 = every |
| plan-P2 | weeks-tests [4] | scoped | السَّاعَةُ @ week:13 = the hour, the time |
| plan-P2 | weeks-tests [5] | scoped | أَصْغَرُ @ week:13 = smaller; younger |
| plan-P2 | weeks-tests [6] | scoped | مِنِّي @ week:13 = than me (after a comparative); from me |
| plan-P2 | weeks-tests [7] | scoped | كُتِبَتْ @ week:13 = (it, f) was written |
| plan-P2 | weeks-tests [8] | scoped | يَسْتَيْقِظُ @ week:2 = he wakes up |
| plan-P2 | weeks-tests [9] | scoped | زَرَعْنَا @ week:12 = we planted |
| plan-P2 | weeks-tests [10] | hand | أَغْلَى = more expensive; the most expensive (before a noun) |
| plan-P3 | grammar [1] | scoped | إِنَّهُ @ grammar:inna = indeed he, it (m) ('he is'); that he (after qāla) |
| plan-P3 | grammar [2] | scoped | أَفْعَلَ @ grammar:verb-forms = afʿala (verb pattern, Form IV) |
| plan-P3 | grammar [3] | scoped | تَتَّصِلَ @ grammar:yumkin-an = you call (to a man; after an); she calls |
| plan-P3 | grammar [4] | scoped | تَكُونُ @ grammar:yakun-w8 = you are (to a man); she, it (f) is |
| plan-P3 | grammar [5] | scoped | سَتَكُونُ @ grammar:yakun-w8 = you will be (to a man); she, it (f) will be |
| plan-P3 | grammar [6] | scoped | تَجْلِسُ @ grammar:imperative = you sit (to a man); she sits |
| plan-P3 | grammar [7] | scoped | تَذْهَبُ @ grammar:present-tense = you go (to a man); she goes |
| plan-P3 | grammar [8] | scoped | حَاضِر @ grammar:active-participle = present (attending); also 'certainly!' (at your service) |
| plan-P3 | grammar [9] | scoped | بِي @ grammar:yumkin-an = me (bi- + -ī; ittaṣala bi- = call someone) |
| plan-P3 | grammar [10] | scoped | ـِي @ grammar:imperative = -ī (verb ending: to a woman) |
| plan-P3 | grammar [10] | scoped | ـِي @ grammar:negative-imperative = -ī (verb ending: to a woman) |
| plan-P3 | grammar [11] | scoped | اِ @ grammar:imperative = i- (helping vowel in front of an order: iftaḥ) |
| plan-P3 | grammar [11] | scoped | اُ @ grammar:imperative = u- (helping vowel in front of an order: urkuḍ) |
| plan-P3 | grammar [12] | scoped | مُـ @ grammar:active-participle = mu- (prefix of participles of the longer verb forms) |
| plan-P3 | grammar [13] | scoped | تَشْرَبُوا @ grammar:negative-imperative = drink (to a group; after lā: don't drink) |
| plan-P3 | grammar [14] | scoped | أَ @ grammar:colours = a- (first letter of the colour pattern aCCaC) |
| plan-P3 | grammar [15] | scoped | عَشَرَ @ grammar:numbers-11-100 = ten (second part of 11–19) |
| plan-P3 | grammar [16] | scoped | ذَهَب @ grammar:past-tense = dhahab- (the stem of ذَهَبَ 'went') |
| plan-P3 | grammar [17] | scoped | قَلِيل @ grammar:comparative = few, little |
| plan-P3 | grammar [18] | scoped | سَنَةً @ grammar:age = year (after 11–99) |
| plan-P3 | grammar [19] | scoped | هِيَ @ grammar:non-human-plural = she, it; they (for things) |
| plan-P3 | grammar [19] | scoped | هِيَ @ grammar:relative-pronouns = she, it; they (for things) |
| plan-P3 | grammar [20] | scoped | عِنْدَ @ grammar:inda-li = at; (with an ending) to have |
| plan-P3 | grammar [21] | scoped | لَهُ @ grammar:inda-li = he has, it has (lit. for him, for it) |
| plan-P3 | grammar [22] | scoped | طَوِيلًا @ grammar:laysa = tall, long (-an after laysa) |
| plan-P3 | grammar [23] | scoped | مُنْذُ @ grammar:time-expressions = since, for; ago (before a time) |
| plan-P3 | grammar [24] | scoped | الَّتِي @ grammar:relative-pronouns = who, which, that (f) |
| plan-P3 | grammar [24] | scoped | الَّذِي @ grammar:relative-pronouns = who, which, that (m) |
| plan-P3 | grammar [25] | scoped | نَاحِيَةٍ @ grammar:connectors-w12 = a side ('on the one hand'; with أُخْرَى 'on the other hand') |
| plan-P3 | grammar [26] | scoped | عَمِلَ @ grammar:masdar = (he) worked; also did, made |
| plan-P3 | grammar [27] | engine | Transliteration (⟶) of English prose drops unvocalised Arabic and converts ؟ to ?, losing the very example the sentence shows. Keep an unvocalised Arabic word i |
| plan-P3 | grammar [28] | engine | The s·h separator (·) is inserted after a tatweel / hyphen: bare object endings ـهُ ـهَا ـهُمْ come out -·hu, -·hā, -·hum. Insert · only after a real vowelless  |
| plan-P3 | grammar [29] | engine | One clitic style not applied everywhere: proclitics wa-/fa-/li-/la-/bi- stay joined in some words. Hyphenate consistently. Examples (grammar): وَجُبْنًا 'wajubn |
| plan-P3 | glossary-hand [1] | engine | Same problem as the grammar id 28 engine op (no separate work): do not insert the · separator when ه follows a tatweel or starts the fragment. ـهُ ⟶ -hu, ـهَا ⟶ |
| plan-P3 | glossary-hand [2] | hand | أَمِينُ = keeper (of) (with aṣ-ṣundūq: cashier) |
| plan-P4 | vocabulary-1 [1] | scoped | تَسْكُنُ @ vocab:amma = (she) lives |
| plan-P4 | vocabulary-1 [1] | scoped | تَسْكُنُ @ vocab:khala = (she) lives |
| plan-P4 | vocabulary-1 [1] | scoped | تَسْكُنُ @ vocab:zawj = (she) lives |
| plan-P4 | vocabulary-1 [2] | scoped | تَذْهَبُ @ vocab:maktaba = (she) goes |
| plan-P4 | vocabulary-1 [3] | scoped | الْإِشَارَة @ vocab:ishara = the traffic lights |
| plan-P4 | vocabulary-1 [4] | scoped | الْمَكْتَب @ vocab:misbah = the desk |
| plan-P4 | vocabulary-1 [5] | scoped | الْيَوْم @ vocab:marra = the day (fī l-yawm: a day, per day) |
| plan-P4 | vocabulary-1 [6] | scoped | سَلَطَةً @ vocab:salata = a salad (object) |
| plan-P4 | vocabulary-1 [7] | scoped | ثَانِيَة @ vocab:thani = second (f) |
| plan-P4 | vocabulary-1 [8] | scoped | لَهُ @ vocab:li = for him, for it |
| plan-P4 | vocabulary-1 [9] | scoped | تُشْبِهُ @ vocab:yushbihu = she looks like (also: you look like, to a man) |
| plan-P4 | vocabulary-1 [10] | scoped | تَجْلِسُ @ vocab:yajlisu = you sit (to a man); she sits |
| plan-P4 | vocabulary-1 [11] | scoped | وَصَلَ @ * = (he, it) arrived |
| plan-P4 | vocabulary-1 [12] | scoped | أَخَذَ @ vocab:yakhudhu = (he) took |
| plan-P4 | vocabulary-1 [12] | scoped | أَخَذَ @ vocab:eidiyya = (he) took, got |
| plan-P4 | vocabulary-1 [13] | scoped | خَرَجْتُ @ vocab:kharaja = I went out, I left |
| plan-P4 | vocabulary-1 [14] | scoped | عَمِلَ @ vocab:yamalu = (he) worked (also: did, made) |
| plan-P4 | vocabulary-1 [15] | scoped | صَيْدَلِيَّة @ vocab:saydali = pharmacist (f); also pharmacy |
| plan-P4 | vocabulary-1 [16] | scoped | الْمُتَوَسِّط @ vocab:bahr = the middle (m) |
| plan-P4 | vocabulary-1 [17] | engine | Clitic hyphen missing when the rest of the word is a tanwin -an form not in the gloss index: src/lang/ar/tap.ts cliticReading should also try the rest without t |
| plan-P4 | glossary-auto-1 [1] | scoped | انْتَهَتْ @ * = (she, it f) ended, is over; (they) ended, with a plural of things |
| plan-P4 | glossary-auto-1 [1] | scoped | تُعْطِيكَ @ * = (she, it f) gives you (to a man); (they) give you, with a plural of things |
| plan-P4 | glossary-auto-1 [1] | scoped | تُخْلَعُ @ * = (it, f) is taken off; (they) are taken off, with a plural of things |
| plan-P4 | glossary-auto-1 [1] | scoped | تَدْخُلَ @ * = (she, it f) enters; you enter (to a man) (form after an) |
| plan-P4 | glossary-auto-1 [1] | scoped | تُرْجِمَتْ @ * = (it, f) was translated; (they) were translated, with a plural of things |
| plan-P4 | glossary-auto-1 [1] | scoped | تَصِلَ @ * = (she, it f) arrives; you arrive (to a man) (form after an) |
| plan-P4 | glossary-auto-1 [1] | scoped | تُطْفَأُ @ * = (it, f) is switched off; (they) are switched off, with a plural of things |
| plan-P4 | glossary-auto-1 [1] | scoped | أُعْلِنَتِ @ * = (it, f) was announced; (they) were announced, with a plural of things (-i links to the next word) |
| plan-P4 | glossary-auto-1 [2] | scoped | حَرْب @ * = war; Harb (in the street name Talaat Harb) |
| plan-P4 | glossary-auto-1 [3] | scoped | دَوْرَةُ @ * = course, cycle, round (of) (dawratu l-miyāh: toilet) |
| plan-P4 | glossary-auto-1 [4] | scoped | الْجَبَل @ * = the mountain, the hill |
| plan-P4 | glossary-auto-1 [5] | scoped | الْمَلْعَبَ @ * = the pitch, the sports ground |
| plan-P4 | glossary-auto-1 [6] | scoped | إِنَّهَا @ * = indeed she / it (f) (starts a statement); that she / it (after qāla) |
| plan-P4 | glossary-auto-1 [6] | scoped | إِنَّهُ @ * = indeed he / it (starts a statement); that he / it (after qāla) |
| plan-P4 | glossary-auto-1 [6] | scoped | إِنَّكِ @ * = indeed you (to a woman); that you (after qāla) |
| plan-P4 | glossary-auto-1 [7] | scoped | أَرَاهَا @ * = I see her, I see it (f; also 'them' for things) |
| plan-P4 | glossary-auto-1 [7] | scoped | رَأَيْتُهَا @ * = I saw her, I saw it (f; also 'them' for things) |
| plan-P4 | glossary-auto-1 [7] | scoped | أَكْتُبْهَا @ * = I write it (f; also 'them' for things) (form after lam) |
| plan-P4 | glossary-auto-1 [7] | scoped | تَقْرَأْهَا @ * = you read it (f; also 'them' for things) (form after lam) |
| plan-P4 | glossary-auto-1 [8] | scoped | تَكْتُبِينَ @ * = you write (to a woman) |
| plan-P4 | glossary-auto-1 [8] | scoped | تَعْنِي @ * = it (f), she means; you mean (to a man) |
| plan-P4 | glossary-auto-1 [9] | scoped | تَسْتَمِرُّ @ * = you continue (to a man); she, it (f) continues |
| plan-P4 | glossary-auto-1 [10] | scoped | الْكُبْرَى @ * = the biggest, the greatest (f) |
| plan-P4 | glossary-auto-2 [1] | scoped | سَيُسَافِرُ @ * = he will travel |
| plan-P4 | glossary-auto-2 [1] | scoped | وَسَيَأْتِي @ * = and he will come |
| plan-P4 | glossary-auto-2 [1] | scoped | وَقَرَأَهَا @ * = and he read it (f), them (things) |
| plan-P4 | glossary-auto-2 [1] | scoped | وَقَرَأَهَا @ culture:cul.science = and (they) read them |
| plan-P4 | glossary-auto-2 [1] | scoped | قَالَهَا @ * = he said it (f), them (things) |
| plan-P4 | glossary-auto-2 [1] | scoped | يَقْرَؤُهَا @ * = he reads it (f), them (things) |
| plan-P4 | glossary-auto-2 [2] | scoped | مِنْهُ @ * = from him, from it (m) |
| plan-P4 | glossary-auto-2 [2] | scoped | مِنْهَا @ * = from her, from it (f); than it (after a comparative) |
| plan-P4 | glossary-auto-2 [3] | scoped | شَجَرَة @ * = tree |
| plan-P5 | scenarios-1 [1] | scoped | طَوِيلَةً @ scenario:holiday-story = long (f, after 'was') |
| plan-P5 | scenarios-1 [2] | scoped | الْإِشَارَة @ scenario:directions = the traffic light; the signal, sign |
| plan-P5 | scenarios-1 [3] | scoped | مَرَّةً @ scenario:pharmacy-visit = time(s) (after kam: 'how many times'); once |
| plan-P5 | scenarios-1 [4] | scoped | وَهُوَ @ scenario:birthday-invitation = and he |
| plan-P5 | scenarios-1 [5] | scoped | تَفَضَّلْ @ scenario:family-visit = please (come in / sit / go ahead); here you are (to a man) |
| plan-P5 | scenarios-1 [6] | scoped | تَفَضَّلْ @ scenario:appointment-time = please (come in / sit / go ahead); here you are (to a man) |
| plan-P5 | scenarios-1 [7] | scoped | تَفَضَّلِي @ scenario:doctor = please (come in / sit / go ahead); here you are (to a woman) |
| plan-P5 | scenarios-1 [8] | scoped | هُوَ @ scenario:restaurant = it (m), he |
| plan-P5 | scenarios-1 [9] | scoped | الْجَبَل @ scenario:holiday-story = the mountain |
| plan-P5 | scenarios-1 [9] | scoped | الْجَبَل @ scenario:weather-plans = the mountain |
| plan-P5 | scenarios-1 [10] | scoped | مَقْهَى @ scenario:cafe = café, coffeehouse |
| plan-P5 | scenarios-1 [11] | scoped | السَّاعَة @ scenario:family-visit = the clock; the hour, the time |
| plan-P5 | scenarios-1 [13] | engine | Clitic hyphen (round-3 change 5) is applied inconsistently in the ⟶ line: every word whose seg/gloss is clitic + word ('and …', 'with …', 'for …', 'to …') must  |
| plan-P5 | scenarios-2 [1] | scoped | الْمَكْتَب @ scenario:airport-checkin = the desk, the counter; the office |
| plan-P5 | scenarios-2 [1] | scoped | الْمَكْتَب @ scenario:bank = the desk, the counter; the office |
| plan-P5 | scenarios-2 [1] | scoped | الْمَكْتَب @ scenario:machines = the desk, the counter; the office |
| plan-P5 | scenarios-2 [1] | scoped | الْمَكْتَب @ scenario:school = the desk, the counter; the office |
| plan-P5 | scenarios-2 [2] | scoped | الْعَرَبَة @ scenario:airport-checkin = the trolley, the cart |
| plan-P5 | scenarios-2 [2] | scoped | الْعَرَبَة @ scenario:supermarket = the trolley, the cart |
| plan-P5 | scenarios-2 [3] | scoped | لِكُلِّ @ scenario:airport-checkin = for every, for each |
| plan-P5 | scenarios-2 [4] | scoped | هُوَ @ scenario:airport-checkin = he, it (m) |
| plan-P5 | scenarios-2 [4] | scoped | هُوَ @ scenario:dietary = he, it (m) |
| plan-P5 | scenarios-2 [5] | scoped | سَيِّدَات @ scenario:machines = ladies, women |
| plan-P5 | scenarios-2 [6] | scoped | السَّاعَة @ scenario:machines = the clock; the hour |
| plan-P5 | scenarios-2 [7] | scoped | طَابُور @ scenario:airport-checkin = queue |
| plan-P5 | scenarios-2 [8] | scoped | مُدِيرَة @ scenario:job-interview = manager, director (a woman) |
| plan-P5 | scenarios-2 [9] | scoped | خِزَانَةُ @ scenario:museum-info = cabinet, case (of) ('display case') |
| plan-P5 | scenarios-2 [9] | scoped | خِزَانَةُ @ scenario:phone-shop = cabinet, case (of) ('display case') |
| plan-P5 | scenarios-2 [10] | hand | أَغْلَى = more expensive; the most expensive (before a noun) |
| plan-P5 | scenarios-2 [11] | scoped | الْجَبَل @ scenario:lost-phone-help = the mountain |
| plan-P5 | scenarios-2 [13] | engine | Same problem as the scenarios-1 #13 engine op (clitic hyphen not applied to every clitic-glossed word). Verify on: 'aruzz wa-dajāj wakhuḍār wazabādī liʿashāʾi'  |
| plan-P5 | culture [1] | scoped | الْعَرَبِيَّة @ culture:cul.calligraphy = Arabic (f) |
| plan-P5 | culture [1] | scoped | الْعَرَبِيَّة @ culture:cul.coffee = Arabic (f) |
| plan-P5 | culture [2] | scoped | أَكْثَرُ @ culture:cul.desert = most (of); more |
| plan-P5 | culture [3] | scoped | الْأَكْبَر @ culture:cul.family = the eldest; the biggest |
| plan-P5 | culture [5] | scoped | أَكْثَر @ culture:cul.food = more |
| plan-P5 | culture [6] | scoped | نُور @ culture:cul.family = light; Nour (first name) |
| plan-P5 | culture [7] | hand | الْخَزْنَة = the Treasury (famous building in Petra) |
| plan-P5 | culture [9] | engine | Same problem as the scenarios-1 #13 engine op (clitic hyphen), plus: a clitic in front of a name is lower case and the name is capitalised, mid-sentence: 'fī Īr |
| plan-P5 | culture [10] | engine | Names in lower case: capitalise every token whose seg in its own line (or the name index) marks it as a name, in every inflected/clitic form, also after the art |
| plan-P5 | culture [5, 7] | engine | Duplicated senses in two-reading glosses: when a form's merged gloss repeats a sense (or one sense is a prefix of the other), drop the repeat. Examples: 'more;  |
| plan-P5 | placards [1] | scoped | ـكَ @ placard:pc.my-your = your (on a noun) / you (on a verb), to a man: -ka |
| plan-P5 | placards [1] | scoped | ـكِ @ placard:pc.my-your = your / you (to a woman: -ki) |
| plan-P5 | placards [1] | scoped | ـهُ @ placard:pc.my-your = his, its / him, it (-hu) |
| plan-P5 | placards [1] | scoped | ـهَا @ placard:pc.my-your = her, its / her, it (-hā) |
| plan-P5 | placards [1] | scoped | ـنَا @ placard:pc.my-your = our / us (-nā) |
| plan-P5 | placards [1] | scoped | ـكُمْ @ placard:pc.my-your = your / you (to several people: -kum) |
| plan-P5 | placards [1] | scoped | ـهُمْ @ placard:pc.my-your = their / them (-hum) |
| plan-P5 | placards [2] | scoped | كَتَبْـ @ placard:pc.past-tense = katab- (the past-tense stem of 'to write') |
| plan-P5 | placards [3] | hand | ـِيّ = -ī (adjective ending 'related to', m; also nationality) |
| plan-P5 | placards [3] | hand | ـِيَّة = -iyya (adjective ending 'related to', f; also nationality) |
| plan-P5 | placards [4] | engine | Stray s·h separator after a tatweel/hyphen: '-·hu', '-·hā', '-·hum' must be '-hu', '-hā', '-hum'. Likely src/core/translit.ts ~l.291: 'سكدت'.includes(prev.ch) i |
| plan-P5 | placards [5] | engine | Same problem as the scenarios-1 #13 engine op: وَظُرُوفُ (seg 'and adverbs (of)') must split even though ظُرُوفُ is not an index entry: 'Ḥurūfu l-jarri waẓurūfu |
| plan-P5 | letters-pronunciation [1] | scoped | خَيْر @ letter:kha = good, goodness |
| plan-P5 | letters-pronunciation [1] | scoped | خَيْر @ pron:kha = good, goodness |
| plan-P5 | letters-pronunciation [1] | scoped | خَيْر @ pron:ghayn = good, goodness |
| plan-P5 | letters-pronunciation [2] | scoped | نُور @ letter:nun = light; Nour (first name) |
| plan-P5 | letters-pronunciation [2] | scoped | نُور @ pron:vowels = light; Nour (first name) |
| plan-P5 | letters-pronunciation [3] | scoped | وْ @ pron:diphthongs = the letter wāw (with sukūn: the glide aw) |
| plan-P5 | letters-pronunciation [4] | engine | A bare letter or diacritic in brackets in prose prints '()' (or a bare consonant): 'ḥāʾ () versus hāʾ ()', 'jīm (J)', 'the sukūn () marks'. Either drop the brac |
| plan-P5 | letters-pronunciation [5] | engine | Seated hamzas in prose are unnamed: أ ؤ ئ print empty and إ prints 'i'/'I'. Name them like ء: 'hamza on alif', 'hamza under alif', 'hamza on wāw', 'hamza on yāʾ |
| plan-P6 | vocabulary-2 [1] | scoped | حَتَّى @ vocab:dafi = even |
| plan-P6 | vocabulary-2 [2] | scoped | اللَّيْلَة @ vocab:dinar = the night (here: per night) |
| plan-P6 | vocabulary-2 [3] | scoped | تُحِبُّ @ vocab:ughniya = she loves, she likes |
| plan-P6 | vocabulary-2 [4] | scoped | رِجَال @ vocab:rajul = men |
| plan-P6 | vocabulary-2 [5] | scoped | رِحْلَتُنَا @ vocab:shati = our trip |
| plan-P6 | vocabulary-2 [6] | scoped | السَّاعَةَ @ vocab:yuqalu = the clock (-a after inna) |
| plan-P6 | vocabulary-2 [7] | scoped | تَمَامًا @ vocab:jahiz = completely |
| plan-P6 | vocabulary-2 [8] | scoped | حَارًّا @ vocab:sayf = hot (-an after yakūnu) |
| plan-P6 | vocabulary-2 [9] | scoped | لَطِيفًا @ vocab:mayu = pleasant, nice (-an after yakūnu) |
| plan-P6 | vocabulary-2 [9] | scoped | لَطِيفًا @ vocab:uktubar = pleasant, nice (-an after yakūnu) |
| plan-P6 | vocabulary-2 [10] | scoped | عَشَرَ @ vocab:shahr = ten (second part of a number from 11 to 19) |
| plan-P6 | vocabulary-2 [10] | scoped | عَشَرَ @ vocab:buniya = ten (second part of a number from 11 to 19) |
| plan-P6 | vocabulary-2 [10] | scoped | عَشَرَ @ vocab:uktushifa = ten (second part of a number from 11 to 19) |
| plan-P6 | vocabulary-2 [10] | scoped | عَشَرَ @ vocab:qarn = ten (second part of a number from 11 to 19) |
| plan-P6 | vocabulary-2 [11] | scoped | أَوْزَان @ vocab:wazn = weights |
| plan-P6 | vocabulary-2 [12] | scoped | وَجَدَ @ vocab:yajidu = (he) found |
| plan-P6 | vocabulary-2 [12] | scoped | وَجَدَ @ vocab:wajada = (he) found (in the proverb man jadda wajada: succeeds) |
| plan-P6 | vocabulary-2 [13] | scoped | أَخَذَ @ vocab:eidiyya = (he) took, got |
| plan-P6 | vocabulary-2 [14] | scoped | الْعَرَبِيَّة @ vocab:musiqa = Arabic, Arab (f adjective) |
| plan-P6 | vocabulary-2 [14] | scoped | الْعَرَبِيَّة @ vocab:yastamiu = Arabic, Arab (f adjective) |
| plan-P6 | vocabulary-2 [15] | scoped | عَرَبِيٍّ @ vocab:katib = Arab |
| plan-P6 | vocabulary-2 [16] | scoped | قَرِيبًا @ vocab:yaruddu = soon |
| plan-P6 | vocabulary-2 [17] | scoped | تُقَدِّمُ @ vocab:yuqaddimu = (it, f) gives, presents |
| plan-P6 | vocabulary-2 [18] | scoped | سَجَّلَ @ vocab:tasjil = (he) recorded, registered |
| plan-P6 | vocabulary-2 [19] | scoped | الْإِعْلَانَ @ vocab:ilan = the announcement |
| plan-P6 | vocabulary-2 [20] | scoped | الْكِتَابَ @ vocab:safha = the book (object) |
| plan-P6 | vocabulary-2 [21] | scoped | عَلَامَات @ vocab:alamat-tarqim = marks, signs |
| plan-P6 | vocabulary-2 [23] | scoped | أَجْمَلَ @ vocab:ajmal = how beautiful (in mā ajmala …!) |
| plan-P6 | vocabulary-2 [24] | scoped | تَرَكَ @ vocab:yatruku = (he) left (something) |
| plan-P6 | vocabulary-2 [25] | scoped | يَوْمًا @ vocab:yasumu = days (after a number) |
| plan-P6 | vocabulary-2 [26] | scoped | كُلَّ @ vocab:mutadarrib = all (of) |
| plan-P6 | vocabulary-2 [26] | scoped | كُلَّ @ vocab:tafsil = all (of) |
| plan-P6 | vocabulary-2 [27] | scoped | هُوَ @ vocab:ajmal = it (m); he |
| plan-P6 | vocabulary-2 [27] | scoped | هُوَ @ vocab:ala-w9 = it (m); he |
| plan-P6 | vocabulary-2 [27] | scoped | هُوَ @ vocab:masrah = it (m); he |
| plan-P6 | vocabulary-2 [27] | scoped | هُوَ @ vocab:madkhal = it (m); he |
| plan-P6 | vocabulary-2 [27] | scoped | هُوَ @ vocab:maarid = it (m); he |
| plan-P6 | vocabulary-2 [27] | scoped | هُوَ @ vocab:talab = it (m); he |
| plan-P6 | vocabulary-2 [27] | scoped | هُوَ @ vocab:ihtiram = it (m); he |
| plan-P6 | vocabulary-2 [28] | scoped | هِيَ @ vocab:atwal = it (f); they (plural of things); she |
| plan-P6 | vocabulary-2 [28] | scoped | هِيَ @ vocab:asima = it (f); they (plural of things); she |
| plan-P6 | vocabulary-2 [28] | scoped | هِيَ @ vocab:haqiqa = it (f); they (plural of things); she |
| plan-P6 | vocabulary-2 [28] | scoped | هِيَ @ vocab:nahiya = it (f); they (plural of things); she |
| plan-P6 | vocabulary-2 [29] | scoped | عَلَى @ vocab:daawa = for (after shukran: thanks for) |
| plan-P6 | vocabulary-2 [29] | scoped | عَلَى @ vocab:bi-kulli-surur = for (after shukran: thanks for) |
| plan-P6 | vocabulary-2 [29] | scoped | عَلَى @ vocab:musaada = for (after shukran: thanks for) |
| plan-P6 | vocabulary-2 [30] | scoped | عَلَى @ vocab:kharif = to, over (ufaḍḍilu A ʿalā B: prefer A to B) |
| plan-P6 | vocabulary-2 [30] | scoped | عَلَى @ vocab:yufaddilu = to, over (ufaḍḍilu A ʿalā B: prefer A to B) |
| plan-P6 | vocabulary-2 [31] | scoped | عَنْ @ vocab:yabhathu = for (after yabḥathu: looks for); about |
| plan-P6 | vocabulary-2 [31] | scoped | عَنْ @ vocab:markaz = for (after yabḥathu: looks for); about |
| plan-P6 | vocabulary-2 [32] | scoped | مُسَافِرَة @ vocab:musafir = passenger, traveller (f) |
| plan-P6 | vocabulary-2 [33] | scoped | سَتَكُونُ @ vocab:daraja = (it, f) will be |
| plan-P6 | vocabulary-2 [34] | scoped | قَلِيل @ vocab:aqall = little, few |
| plan-P6 | vocabulary-2 [35] | scoped | يَصُومُ @ vocab:ramadan = (they) fast (verb first: singular) |
| plan-P6 | vocabulary-2 [36] | scoped | كُتِبَتْ @ vocab:kutiba = (it, f) was written; (things) were written |
| plan-P6 | vocabulary-2 [37] | scoped | بَرِيدِيَّةً @ vocab:bitaqa-baridiyya = postal ('a postcard') |
| plan-P6 | vocabulary-2 [22] | engine | src/lang/ar/tap.ts widen(): the 'two readings' merge repeats a sense the chosen gloss already contains. Do not append a reading whose senses are already in the  |
