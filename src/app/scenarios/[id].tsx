import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { PhotoScene } from '@/components/scene';
import { RichText } from '@/components/tap';
import { AppText, Card, Screen, SectionTitle } from '@/components/ui';
import { sceneByScenario, scenarios } from '@/content';
import { Dialogue, QuizRunner } from '@/features/lesson';
import { usePalette, useSettings, useStudyTimer } from '@/state/hooks';

export default function ScenarioScreen() {
  useStudyTimer();
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = scenarios.find((x) => x.id === id);
  const scene = s ? sceneByScenario.get(s.id) : undefined;
  const c = usePalette();
  const { passMark } = useSettings();
  if (!s)
    return (
      <Screen title="Scenario">
        <AppText>Unknown scenario.</AppText>
      </Screen>
    );
  return (
    <Screen title={`${s.emoji} ${s.title}`} testID="scenario">
      <Card accent>
        <RichText text={s.intro} />
      </Card>
      {scene && (
        <>
          <SectionTitle icon="image-outline">The scene</SectionTitle>
          <Card>
            <PhotoScene scene={scene} />
          </Card>
        </>
      )}
      <SectionTitle icon="chatbubbles-outline">{s.dialogue.title}</SectionTitle>
      <Dialogue lines={s.dialogue.lines} speakers={s.dialogue.speakers} culture={s.dialogue.culture} />
      <SectionTitle icon="warning-outline">Common mistakes</SectionTitle>
      {s.mistakes.map((m, i) => (
        <Card key={i}>
          <RichText text={`✗ ${m.wrong}`} />
          <RichText text={`✓ ${m.right}`} />
          <AppText size={14} color={c.textMuted}>
            {m.why}
          </AppText>
        </Card>
      ))}
      <SectionTitle icon="help-circle-outline">Quiz</SectionTitle>
      <View>
        <QuizRunner questions={s.quiz} seed={s.id.length} passMark={passMark} skill="scenarios" onFinish={() => undefined} />
      </View>
    </Screen>
  );
}
