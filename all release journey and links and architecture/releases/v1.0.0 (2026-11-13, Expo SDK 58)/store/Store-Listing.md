# Google Play store listing

Paste these into Play Console → **Grow users → Store presence → Main store listing**. Graphics are in `store/graphics/`, and phone screenshots are in `store/screenshots/` (1080×1920). To regenerate them, run `node scripts/build-brand-assets.mjs`, then `npm run build:web`, `node scripts/serve-dist.mjs dist 4192` (in a second terminal) and `node scripts/store-screenshots.mjs`.

Not uploaded yet: Arabic Journey has no Play Console entry and no Play-signed AAB (see the release folder's `RELEASE_JOURNEY.md`, v1.0.0, "Not done").

## App name (30 characters max)

Arabic Journey

## Short description (80 characters max)

Modern Standard Arabic in 90 days: letters, lessons, speaking, real-life scenes.

## Full description (4000 characters max)

Learn Arabic step by step, from your first letter to handling everyday situations with confidence. Arabic Journey is a structured 90-day course in Modern Standard Arabic for English speakers, built around 15, 30 or 45 minutes a day.

A CLEAR 90-DAY PATH
• 90 daily lessons in 13 weekly modules, each ending with a test (pass with 80%), and a final exam over the whole course
• Starts from zero: the 28 letters and their joined forms, the short-vowel marks, greetings and numbers
• Builds up to everyday conversations about family, work, travel, health, shopping and more
• A placement check lets you skip what you already know; every lesson says what you will be able to do by the end

READ THE SCRIPT WITH CONFIDENCE
• Letters lab: every letter in its isolated, initial, middle and final shapes, with the sounds English does not have
• Fully vowelled Arabic throughout, with a pronunciation guide in English letters under every word (مَرْحَبًا → marḥaban)
• Pronunciation lab: 30 sounds, from ḥ and ʿayn to the emphatic letters and the long vowels

SPEAK AND LISTEN FROM DAY ONE
• Tap any Arabic word or sentence to hear it
• Speaking lab: record yourself and compare with the model line
• Numbers lab: Arabic and Arabic-Indic digits, prices, phone numbers, dates; Time lab: the clock and the calendar

UNDERSTAND THE GRAMMAR
• 78 short grammar guides with tables, examples and common mistakes
• Tap a word in any sentence to see its meaning, its root pattern and how it joins the sentence
• Sentence explorer: take a sentence apart piece by piece

REMEMBER WHAT YOU LEARN
• Flashcards with spaced repetition that schedule each review for when you are about to forget
• Mixed daily reviews of words, sentences and grammar
• Over 800 course words with gender, plural and example sentences, 200 of them with a real photo

REAL-LIFE SCENARIOS
• 32 situations: the café, the souk, the airport, the doctor, renting a flat, a job interview, an Eid visit and more
• Each scene is a real photograph with the objects outlined: tap a word to see where it is
• Every day ends with a real-life card: a licensed photo from the Arab world with the day's new words

EXPLORE THE ARAB WORLD
• 9 illustrated chapters: calligraphy, coffee, the desert, food, festivals, music, cities, hospitality and the Arabic-speaking world
• Real photographs, readings and quizzes

PRIVATE BY DESIGN
• No account, no ads and no tracking
• Works offline. Your progress stays on your phone. Several learners can share one phone, each with their own profile.
• Export or delete your data at any time; a Report screen shows your study time and progress

GOOD TO KNOW
• Audio uses your phone's built-in Arabic text-to-speech voice. It is computer-generated, not a native-speaker recording. If you hear no audio, install an Arabic voice in your phone's text-to-speech settings.
• The course teaches Modern Standard Arabic (the written and broadcast standard), with notes on everyday usage. The course was checked in rounds of AI review; a review by a native-speaker teacher is still to come.
• Photos are from Wikimedia Commons under free licences; every photo credits its author (Credits screen).

## Release notes 1.0.0 (500 characters max per language)

```
<en-GB>
First release of Arabic Journey: a 90-day Modern Standard Arabic course with 90 lessons, 13 weekly tests and a final exam, the letters lab, 32 real-life scenarios with outlined photos, a pronunciation lab, flashcards with spaced repetition, a speaking lab and Explore the Arab world. Works offline, no account, no ads.
</en-GB>
```

## Other Play Console answers

| Section | Answer |
|---|---|
| App category | Education |
| Tags | Language learning, Education |
| Contact email | your developer email (shown publicly) |
| Privacy policy URL | https://ar-journey.german-journey.workers.dev/settings (Privacy section) — a dedicated `/privacy` page should be added before a Play upload |
| Ads | No, the app contains no ads |
| App access | All functionality is available without special access |
| Content rating (IARC) | Category "Reference, News, or Educational". Answer No to violence, sexuality, language, drugs, gambling, user interaction, sharing location and purchases. |
| Target audience | 13+ recommended (adult learners). Choosing under-13 brings the Families policy requirements. |
| Data safety | Does your app collect or share any of the required user data types? **No.** All data is processed only on the device. Microphone recordings in the Speaking lab stay on the device. Encryption in transit: not applicable, because no data is transmitted. |
| Permissions | RECORD_AUDIO, used only when the learner taps Record in the Speaking lab |
| Government app / Financial features / Health | No |
