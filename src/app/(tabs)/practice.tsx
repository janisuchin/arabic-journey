import { router } from 'expo-router';
import { View } from 'react-native';

import { ROW_CHEVRON } from '@/base/rtl';
import { AppText, Card, Icon, Row, Screen, SectionTitle, type IconName } from '@/components/ui';
import { course } from '@/content';
import { isWeekTestUnlocked } from '@/core/progress';
import { useProgressInput } from '@/state/hooks';

function Entry({
  icon,
  title,
  sub,
  href,
  testID,
}: {
  icon: IconName;
  title: string;
  sub: string;
  href: string;
  testID?: string;
}) {
  return (
    <Card onPress={() => router.push(href as never)} label={title} testID={testID}>
      <Row gap={12}>
        <Icon name={icon} size={26} />
        <View style={{ flex: 1 }}>
          <AppText weight="800">{title}</AppText>
          <AppText size={14} muted>
            {sub}
          </AppText>
        </View>
        <Icon name={ROW_CHEVRON} size={20} />
      </Row>
    </Card>
  );
}

export default function Practice() {
  const progress = useProgressInput();
  const weeks = (course?.weeks ?? []).filter((w) => w.test.length > 0);
  return (
    <Screen back={false} title="Practice" testID="practice">
      <Entry icon="albums-outline" title="Daily review" sub="Words that are due today (spaced repetition)" href="/flashcards" />
      <Entry icon="copy-outline" title="Flashcards" sub="All the words you have learned" href="/flashcards?all=1" />
      <Entry
        icon="chatbubbles-outline"
        title="Scenario simulator"
        sub="Café, taxi and more real-life situations"
        href="/scenarios"
      />
      <SectionTitle icon="flask-outline">Labs</SectionTitle>
      <Entry icon="mic-outline" title="Pronunciation lab" sub="Every sound, with tips and minimal pairs" href="/pronunciation" />
      <Entry
        icon="text-outline"
        title="Letters lab"
        sub="All the letters and their four forms"
        href="/letters"
        testID="letters-lab"
      />
      <Entry icon="calculator-outline" title="Numbers lab" sub="Number calculator, digits and clock times" href="/numbers" />
      <Entry icon="school-outline" title="Grammar" sub="Every rule in the course" href="/grammar" />
      <SectionTitle icon="trophy-outline">Quiz centre</SectionTitle>
      {weeks.map((w) => {
        const open = isWeekTestUnlocked(
          w.week,
          w.days.map((d) => d.day),
          progress,
        );
        const sc = progress.weekTests[w.week];
        return (
          <Card
            key={w.week}
            label={`Week ${w.week} test`}
            onPress={open ? () => router.push({ pathname: '/week-test/[week]', params: { week: String(w.week) } }) : undefined}>
            <AppText weight="800">
              Week {w.week} test {open ? '' : '🔒'}
            </AppText>
            <AppText size={14} muted>
              {sc !== undefined
                ? `Best score ${Math.round(sc * 100)}%`
                : open
                  ? 'Ready when you are'
                  : 'Finish the week to open it'}
            </AppText>
          </Card>
        );
      })}
    </Screen>
  );
}
