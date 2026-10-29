import { APP_NAME, VERSION } from '@/base/config';
import { TapText } from '@/components/tap';
import { AppText, Card, Screen } from '@/components/ui';
import { days, scenarios, vocabulary } from '@/content';

export default function About() {
  return (
    <Screen title="About" testID="about">
      <AppText size={22} weight="800">
        {APP_NAME} {VERSION}
      </AppText>
      <TapText
        text="رِحْلَة الْعَرَبِيَّة"
        segs={[
          ['رِحْلَة', 'journey'],
          ['الْعَرَبِيَّة', 'Arabic (the language)'],
        ]}
        size={26}
      />
      <AppText>
        A structured, local-first course in Modern Standard Arabic for English speakers. Everything reads right to left, every
        Arabic word can be tapped, heard and understood, and nothing leaves your device.
      </AppText>
      <Card>
        <AppText weight="800">What is in this version</AppText>
        <AppText size={14}>
          {days.length} of 90 days are written ({vocabulary.length} words, the whole alphabet). The other days are outlined on the
          Path. {scenarios.length} of 27 planned scenarios.
        </AppText>
      </Card>
      <Card>
        <AppText weight="800">Known limitations</AppText>
        {[
          'No certificates and no guaranteed level. Levels are an approximate guide.',
          'Audio is your device’s text-to-speech: a computer-generated voice, not a native-speaker recording.',
          'All lesson content is marked “needs review”. It was written and checked automatically and by AI, not yet by a native-speaker teacher.',
          'Days 8–90, most scenarios, culture chapters, photos, stroke animations, recording and the 5,000-word dictionary are not included yet.',
          'Transliteration follows ALA-LC conventions in pausal form; dialect pronunciation differs from Modern Standard Arabic.',
        ].map((t) => (
          <AppText key={t} size={14}>
            • {t}
          </AppText>
        ))}
      </Card>
    </Screen>
  );
}
