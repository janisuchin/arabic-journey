import { Linking } from 'react-native';

import { AppText, Card, Screen, SectionTitle } from '@/components/ui';
import { culture } from '@/content';
import type { Photo } from '@/content/schema';

const SOURCES: [string, string][] = [
  ['Noto Naskh Arabic (Arabic text font)', 'Google / Noto project — SIL Open Font License 1.1'],
  ['Ionicons (interface icons)', 'Ionic — MIT License'],
  ['Expo, React Native, expo-router', 'Expo / Meta — MIT License'],
  ['zustand, zod', 'MIT License'],
  ['Course content', 'Arabic Journey — CC BY-NC 4.0'],
  ['App code', 'MIT License'],
];

export default function Credits() {
  const photos = culture.flatMap((ch) =>
    [ch.hero, ...ch.sections.map((s) => s.photo)].filter((p): p is Photo => !!p).map((p) => ({ p, chapter: ch.title })),
  );
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
          : 'Lessons use emoji tiles; the culture chapters will show credited photos here.'}
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
