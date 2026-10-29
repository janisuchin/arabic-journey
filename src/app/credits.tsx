import { AppText, Card, Screen } from '@/components/ui';

const SOURCES: [string, string][] = [
  ['Noto Naskh Arabic (Arabic text font)', 'Google / Noto project — SIL Open Font License 1.1'],
  ['Ionicons (interface icons)', 'Ionic — MIT License'],
  ['Expo, React Native, expo-router', 'Expo / Meta — MIT License'],
  ['zustand, zod', 'MIT License'],
  ['Course content', 'Arabic Journey — CC BY-NC 4.0'],
  ['App code', 'MIT License'],
];

export default function Credits() {
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
      <Card>
        <AppText weight="800">Photos</AppText>
        <AppText size={14} muted>
          This version uses emoji tiles instead of photos, so there are no photo credits yet.
        </AppText>
      </Card>
    </Screen>
  );
}
