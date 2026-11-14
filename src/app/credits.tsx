import { Linking } from 'react-native';

import { AppText, Card, Screen, SectionTitle } from '@/components/ui';
import { culture, days, scenarios, scenes, vocabById, wordPhotos } from '@/content';
import type { Photo } from '@/content/schema';

const SOURCES: [string, string][] = [
  ['Noto Naskh Arabic (Arabic text font)', 'Google / Noto project — SIL Open Font License 1.1'],
  ['Ionicons (interface icons)', 'Ionic — MIT License'],
  ['Expo, React Native, expo-router', 'Expo / Meta — MIT License'],
  ['zustand, zod', 'MIT License'],
  ['Dictionary words and meanings', 'English Wiktionary contributors via kaikki.org / Wiktextract — CC BY-SA 3.0 / GFDL'],
  ['Dictionary word frequency', 'FrequencyWords by Hermit Dave (OpenSubtitles 2018) — CC BY-SA 4.0'],
  ['5,000-word dictionary (content/dictionary)', 'Derived from the two above — CC BY-SA 4.0'],
  ['Course content', 'Arabic Journey — CC BY-NC 4.0'],
  ['App code', 'MIT License'],
];

export default function Credits() {
  // Every bundled photo: the "In real life" photo of each day, the scenario scenes, the word photos, then the culture chapters.
  const photos = [
    ...days.map((d) => ({ p: d.realLife.photo, chapter: `Day ${d.day} · ${d.realLife.title}` })),
    ...scenes.map((s) => ({
      p: s as Photo,
      chapter: `Scenario · ${scenarios.find((x) => x.id === s.scenario)?.title ?? s.scenario}`,
    })),
    ...wordPhotos.map((p) => ({ p: p as Photo, chapter: `Word · ${vocabById.get(p.vocab)?.en ?? p.vocab}` })),
    ...culture.flatMap((ch) =>
      [ch.hero, ...ch.sections.map((s) => s.photo)].filter((p): p is Photo => !!p).map((p) => ({ p, chapter: ch.title })),
    ),
  ];
  return (
    <Screen title="Credits" testID="credits">
      {SOURCES.map(([what, who]) => (
        <Card key={what}>
          <AppText weight="800">{what}</AppText>
          <AppText size={14} muted>
            {who}
          </AppText>
        </Card>
      ))}
      <SectionTitle icon="images-outline">Photos</SectionTitle>
      <AppText size={14} muted>
        {photos.length
          ? `${photos.length} photos from Wikimedia Commons (public domain, CC0, CC BY or CC BY-SA), resized and re-encoded. Tap a photo credit to open its Commons page.`
          : 'No photos are bundled yet.'}
      </AppText>
      {photos.map(({ p, chapter }) => (
        <Card
          key={p.file}
          onPress={() => void Linking.openURL(p.credit.source)}
          label={`Photo credit: ${p.credit.title}`}
          testID={`credit-${p.file}`}>
          <AppText weight="700" size={14}>
            {p.credit.title.replace(/^File:/, '')}
          </AppText>
          <AppText size={13} muted>
            {p.credit.author} · {p.credit.license} · {chapter}
            {p.credit.modified ? ` · ${p.credit.modified}` : ''}
          </AppText>
        </Card>
      ))}
    </Screen>
  );
}
