import { router, useLocalSearchParams } from 'expo-router';

import { AppText, Card, Caption, Screen } from '@/components/ui';
import { course } from '@/content';

export default function LevelPage() {
  const { level } = useLocalSearchParams<{ level: string }>();
  const n = Number(level);
  const info = course?.levels.find((l) => l.level === n);
  const weeks = course?.weeks.filter((w) => w.levels.includes(n)) ?? [];
  return (
    <Screen title={`Level ${n}`} testID="level">
      <AppText size={20} weight="800">
        {info?.name}
      </AppText>
      <AppText muted>Approximate level: {info?.cefr}. This is a guide, not a certificate.</AppText>
      {weeks.map((w) => (
        <Card key={w.week} onPress={() => router.push('/path')} label={`Week ${w.week}`}>
          <Caption>Week {w.week}</Caption>
          <AppText weight="800">{w.title}</AppText>
          <AppText size={13} muted>
            {w.topics.join(' · ')}
          </AppText>
        </Card>
      ))}
    </Screen>
  );
}
