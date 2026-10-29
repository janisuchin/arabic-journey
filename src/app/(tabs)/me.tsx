import { router } from 'expo-router';
import { View } from 'react-native';

import { ROW_CHEVRON } from '@/base/rtl';
import { TOTAL_DAYS } from '@/base/config';
import { AppText, Button, Card, Icon, ProgressBar, Row, Screen, SectionTitle, type IconName } from '@/components/ui';
import { isMastered } from '@/core/srs';
import { useCurrentLearner, usePalette, useProgressInput } from '@/state/hooks';
import { useLearner, useProfiles } from '@/state/store';

function MenuRow({ icon, label, href }: { icon: IconName; label: string; href: string }) {
  return (
    <Card onPress={() => router.push(href as never)} label={label} style={{ paddingVertical: 10 }}>
      <Row gap={12}>
        <Icon name={icon} />
        <AppText weight="700" style={{ flex: 1 }}>
          {label}
        </AppText>
        <Icon name={ROW_CHEVRON} size={18} />
      </Row>
    </Card>
  );
}

export default function Me() {
  const c = usePalette();
  const learner = useCurrentLearner();
  const progress = useProgressInput();
  const cards = useLearner((s) => s.cards);
  const scores = useLearner((s) => s.quizScores);
  const answered = useLearner((s) => s.answered);
  const activity = useLearner((s) => s.activity);
  const setCurrent = useProfiles((s) => s.setCurrent);
  const done = progress.completedDays.size;
  const words = Object.keys(cards).length;
  const mastered = Object.values(cards).filter(isMastered).length;
  const avg = Object.values(scores).length ? Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length : 0;
  const minutes = Object.values(activity).reduce((a, b) => a + b, 0);
  const tests = Object.values(progress.weekTests).filter((s) => s >= progress.passMark).length;
  const stats: [string, string][] = [
    ['Days done', `${done}`],
    ['Words learned', `${words}`],
    ['Words mastered', `${mastered}`],
    ['Quiz average', `${Math.round(avg * 100)}%`],
    ['Week tests passed', `${tests}`],
    ['Minutes studied', `${minutes}`],
  ];
  const achievements = [
    { got: done >= 1, label: 'First day finished' },
    { got: done >= 7, label: 'The whole alphabet' },
    { got: tests >= 1, label: 'First week test passed' },
    { got: words >= 50, label: '50 words' },
  ];
  return (
    <Screen back={false} title="Me" testID="me">
      <Card>
        <Row gap={12}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: c.accent,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <AppText size={24} weight="800" color={c.accentText} center>
              {(learner?.name ?? '?').slice(0, 1).toUpperCase()}
            </AppText>
          </View>
          <View style={{ flex: 1 }}>
            <AppText size={20} weight="800" testID="me-name">
              {learner?.name}
            </AppText>
            <AppText muted>
              {done} of {TOTAL_DAYS} days
            </AppText>
          </View>
        </Row>
        <ProgressBar value={done / TOTAL_DAYS} label="course progress" />
        <Row wrap>
          <Button
            kind="secondary"
            icon="people-outline"
            label="Switch learner"
            onPress={() => router.push('/profiles')}
            testID="switch-learner"
          />
          <Button
            kind="ghost"
            icon="log-out-outline"
            label="Log off"
            testID="log-off"
            onPress={() => {
              setCurrent(null);
              router.replace('/profiles');
            }}
          />
        </Row>
      </Card>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {stats.map(([k, v]) => (
          <Card key={k} style={{ width: '30%', flexGrow: 1, alignItems: 'center' }}>
            <AppText size={22} weight="800" center color={c.accent}>
              {v}
            </AppText>
            <AppText size={12} muted center>
              {k}
            </AppText>
          </Card>
        ))}
      </View>
      <SectionTitle icon="analytics-outline">Accuracy by skill</SectionTitle>
      {Object.keys(answered.bySkill).length === 0 && <AppText muted>Answer some quiz questions to see your accuracy.</AppText>}
      {Object.entries(answered.bySkill).map(([skill, s]) => (
        <View key={skill} style={{ gap: 4 }}>
          <AppText size={14}>
            {skill}: {s.correct} / {s.total}
          </AppText>
          <ProgressBar value={s.correct / Math.max(1, s.total)} label={`${skill} accuracy`} />
        </View>
      ))}
      <SectionTitle icon="menu-outline">More</SectionTitle>
      <MenuRow icon="settings-outline" label="Settings" href="/settings" />
      <MenuRow icon="shield-checkmark-outline" label="Privacy" href="/settings#privacy" />
      <MenuRow icon="information-circle-outline" label="About" href="/about" />
      <MenuRow icon="heart-outline" label="Credits" href="/credits" />
      <SectionTitle icon="ribbon-outline">Achievements</SectionTitle>
      {achievements.map((a) => (
        <AppText key={a.label} muted={!a.got}>
          {a.got ? '🏅' : '○'} {a.label}
        </AppText>
      ))}
    </Screen>
  );
}
