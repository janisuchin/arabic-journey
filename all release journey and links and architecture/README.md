# Arabic Journey: releases, links and architecture

This folder is the one place for **every release** of Arabic Journey: every version and every download, with the
links and architecture notes that go with them. German, Nihongo, Russkiy, Mandarin and Français Journey use the
same layout.

## Latest version: v1.0.0 (13 Nov 2026, Expo SDK 58)

| What | Where |
|---|---|
| Web version | https://ar-journey.german-journey.workers.dev |
| Web version, unlocked (all chapters open) | https://ar-journey-unlocked.german-journey.workers.dev |
| Android app (APK) | `releases/v1.0.0 (2026-11-13, Expo SDK 58)/android/Arabic-Journey-v1.0.0.apk` |
| Android app, unlocked (APK, installs next to the normal app) | `releases/v1.0.0 (2026-11-13, Expo SDK 58)/android-unlocked/Arabic-Journey-v1.0.0-UNLOCKED.apk` |
| Expo SDK 58 source (exact code of this version) | `releases/v1.0.0 (2026-11-13, Expo SDK 58)/expo-sdk58-source/` |
| Offline web copies | `releases/v1.0.0 …/web/` and `…/web-unlocked/` (zip) |
| Store assets (Google Play listing, graphics, screenshots) | `releases/v1.0.0 …/store/` (master copies in the repo's `store/`) |
| GitHub (private, full history) | https://github.com/janisuchin/arabic-journey (tag `v1.0.0`) |

The APKs are built on this PC with `tools/build-android.ps1` and signed with the debug key: install them directly on
a phone (allow "install unknown apps"). They are not for Google Play; a Play AAB needs an EAS `production` build,
which has not been made yet (see `RELEASE_JOURNEY.md`).

**Content status:** all content is AI-authored and AI-reviewed. A native-speaker teacher has not reviewed it yet, so
nothing is marked "approved" (open points: `docs/STATUS.md` and `docs/review/` in the repo).

Older versions are never overwritten: each one keeps its own `releases/` folder and git tag. The two web links
always show the newest version.

You can double-click the `.url` shortcuts in this folder to open these links.

## Files in this folder

| File | What it holds |
|---|---|
| `RELEASE_JOURNEY.md` | Every version: date, Expo SDK, what changed, which files and links were produced |
| `prompt/` | PROMPT B – Nihongo-based (non-Latin scripts), the blueprint this app was built from (md, html, pdf). The master copies are in `CLAUDE FOR LANGUAGE\JOURNEY PROMPTS\` |
| `ARCHITECTURE.md` | How the app is built: the shared "Journey base" and the Arabic language pack |
| `releases/<version> (<date>, Expo SDK <n>)/` | The downloads for that version: android, android-unlocked, web, web-unlocked, expo-sdk source, store, README.txt |

## Rule for every future release

1. Bump `version` in `app.json` and `package.json`, then build the four versions:
   - Android APK, normal: `tools/build-android.ps1 -Variant normal` (or EAS `preview`)
   - Android APK, unlocked: `tools/build-android.ps1 -Variant unlocked` (or EAS `unlocked`)
   - Web, normal and unlocked, both deployed: `npm run deploy:web` and `npm run deploy:web:unlocked`
   - The Expo SDK source zip: `git archive` of the version tag
2. Put them in a new `releases/v<x.y.z> (<date>, Expo SDK <n>)/` folder, laid out like the v1.0.0 folder.
3. Update the "Latest version" table above and add the version to `RELEASE_JOURNEY.md`.
4. Tag the version in git (`v<x.y.z>`) and push it to GitHub.

APKs and zips are too large for GitHub, so they are kept only in this folder (they are git-ignored). Every
version can be rebuilt from its git tag.
