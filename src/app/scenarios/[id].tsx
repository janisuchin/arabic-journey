import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { PhotoScene } from '@/components/scene';
import { GlossPlace, MistakeScope, RichText } from '@/components/tap';
import { AppText, Card, Screen, SectionTitle } from '@/components/ui';
import { roleplayByScenario, sceneByScenario, scenarios } from '@/content';
import { Dialogue, QuizRunner } from '@/features/lesson';
import { RoleplayRunner } from '@/features/roleplay';
import { usePalette, useSettings, useStudyTimer } from '@/state/hooks';

export default function ScenarioScreen() {
  useStudyTimer();
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = scenarios.find((x) => x.id === id);
  const scene = s ? sceneByScenario.get(s.id) : undefined;
  const roleplay = s ? roleplayByScenario.get(s.id) : undefined;
  // the learner plays the speaker the other person talks to (Faisal, or Layla where she is the customer)
  const learner = roleplay && s?.dialogue.speakers.find((sp) => !roleplay.nodes.some((n) => n.npc.sp === sp.key));
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
      <GlossPlace place={`scenario:${s.id}`}>
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
        {roleplay && (
          <>
            <SectionTitle icon="people-outline">Role-play: your turn</SectionTitle>
            <AppText size={14} color={c.textMuted}>
              {learner ? `You are ${learner.name}. ` : ''}Pick a reply: some lead the conversation a different way.
            </AppText>
            <RoleplayRunner key={s.id} roleplay={roleplay} speakers={s.dialogue.speakers} />
          </>
        )}
        <SectionTitle icon="warning-outline">Common mistakes</SectionTitle>
        {s.mistakes.map((m, i) => (
          <Card key={i}>
            <MistakeScope>
              <RichText text={`✗ ${m.wrong}`} />
            </MistakeScope>
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
      </GlossPlace>
    </Screen>
  );
}
