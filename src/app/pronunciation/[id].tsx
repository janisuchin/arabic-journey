import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { RichText } from '@/components/tap';
import { AppText, Card, Pill, Row, Screen, TrText } from '@/components/ui';
import { pronunciationById } from '@/content';
import { ColouredWord } from '@/features/script';
import { QuizRunner } from '@/features/lesson';
import { translitLine } from '@/lang/ar/tap';
import { tts } from '@/services/tts';
import { usePalette, useSettings } from '@/state/hooks';

export default function PronunciationTopic() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = pronunciationById.get(id);
  const c = usePalette();
  const settings = useSettings();
  if (!p)
    return (
      <Screen title="Sound">
        <AppText>Unknown sound.</AppText>
      </Screen>
    );
  const quiz = p.examples.slice(0, 3).map((e, i) => ({
    id: `${p.id}-q${i}`,
    prompt: 'What does this word mean?',
    ar: e.ar,
    options: [e.en, ...p.examples.filter((x) => x.en !== e.en).map((x) => x.en)].slice(0, 3),
    answer: 0,
  }));
  return (
    <Screen title="Pronunciation" testID="pron-topic">
      <RichText text={p.title} size={22} />
      <Row wrap gap={6}>
        <Pill label={p.category} />
        {p.ipa.map((x) => (
          <Pill key={x} label={`/${x}/`} />
        ))}
      </Row>
      <Card accent>
        <AppText weight="800">💡 Tip</AppText>
        <RichText text={p.tip} />
      </Card>
      <Card>
        <AppText weight="800">Mouth and tongue</AppText>
        <RichText text={p.diagram} muted />
      </Card>
      {p.examples.map((e, i) => (
        <Card key={i} onPress={() => tts.speak(e.ar, { rate: settings.speechRate })} label={e.en}>
          <ColouredWord word={e.ar} letters={p.letters} size={32} />
          {settings.showTranslit && <TrText>{translitLine(e.ar, settings.translitStyle)}</TrText>}
          <AppText>{e.en}</AppText>
        </Card>
      ))}
      {p.pairs && p.pairs.length > 0 && (
        <>
          <AppText size={18} weight="800">
            Minimal pairs
          </AppText>
          {p.pairs.map(([a, b], i) => (
            <Row key={i} gap={10} style={{ alignItems: 'stretch' }}>
              {[a, b].map((e, j) => (
                <Card key={j} style={{ flex: 1 }} onPress={() => tts.speak(e.ar, { rate: settings.slowRate })} label={e.en}>
                  <ColouredWord word={e.ar} letters={p.letters} size={28} />
                  {settings.showTranslit && <TrText size={13}>{translitLine(e.ar, settings.translitStyle)}</TrText>}
                  <AppText size={14}>{e.en}</AppText>
                </Card>
              ))}
            </Row>
          ))}
        </>
      )}
      <Card>
        <AppText weight="800" color={c.bad}>
          Most common error
        </AppText>
        <RichText text={p.error} />
      </Card>
      <View style={{ gap: 6 }}>
        <AppText size={18} weight="800">
          Mastery quiz
        </AppText>
        <QuizRunner questions={quiz} seed={7} passMark={settings.passMark} skill="pronunciation" onFinish={() => undefined} />
      </View>
      <AppText size={12} muted>
        Record-and-compare is not available in this version. Audio is a computer-generated voice, not a native-speaker recording.
      </AppText>
    </Screen>
  );
}
