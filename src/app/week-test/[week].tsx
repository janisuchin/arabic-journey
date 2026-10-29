import { router, useLocalSearchParams } from 'expo-router';

import { GlossLine } from '@/components/tap';
import { AppText, Button, Caption, Card, Screen } from '@/components/ui';
import { weekByNumber } from '@/content';
import { isWeekTestUnlocked } from '@/core/progress';
import { QuizRunner } from '@/features/lesson';
import { useProgressInput, useSettings } from '@/state/hooks';
import { useLearner } from '@/state/store';

export default function WeekTest() {
  const { week } = useLocalSearchParams<{ week: string }>();
  const w = weekByNumber(Number(week));
  const progress = useProgressInput();
  const { passMark } = useSettings();
  const setWeekTest = useLearner((s) => s.setWeekTest);
  if (!w || w.test.length === 0)
    return (
      <Screen title="Week test">
        <AppText>This week test is not available yet.</AppText>
      </Screen>
    );
  const open = isWeekTestUnlocked(
    w.week,
    w.days.map((d) => d.day),
    progress,
  );
  return (
    <Screen title={`Week ${w.week} test`} testID="week-test">
      <Caption>Week {w.week} · checkpoint</Caption>
      <AppText size={20} weight="800">
        {w.title}
      </AppText>
      <GlossLine text={w.titleAr} segs={w.titleSegs} size={22} />
      {open ? (
        <>
          <AppText muted>Pass with 80% to open the next week.</AppText>
          <QuizRunner
            questions={w.test}
            seed={100 + w.week}
            passMark={passMark}
            skill="week tests"
            onFinish={(sc) => setWeekTest(w.week, sc)}
          />
          <Button kind="ghost" label="Back to Today" icon="home-outline" onPress={() => router.replace('/')} />
        </>
      ) : (
        <Card>
          <AppText weight="800">🔒 Finish every day of this week first.</AppText>
        </Card>
      )}
    </Screen>
  );
}
