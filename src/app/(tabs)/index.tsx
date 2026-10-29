import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { NEXT_ICON } from '@/base/rtl';
import { TOTAL_DAYS } from '@/base/config';
import { GlossLine, TapText } from '@/components/tap';
import { AppText, Button, Caption, Card, Icon, ProgressBar, Row, Screen, type IconName } from '@/components/ui';
import { course, dayByNumber, letters, weekByNumber } from '@/content';
import { isWeekTestUnlocked, nextDay } from '@/core/progress';
import { isDue } from '@/core/srs';
import { tts } from '@/services/tts';
import { useCurrentLearner, usePalette, useProgressInput, useSettings } from '@/state/hooks';
import { useLearner } from '@/state/store';

function greeting() {
  const h = new Date().getHours();
  return h < 12
    ? { ar: 'صَبَاحُ الْخَيْر', en: 'Good morning' }
    : { ar: 'مَسَاءُ الْخَيْر', en: h < 18 ? 'Good afternoon' : 'Good evening' };
}

const LABS: { title: string; icon: IconName; href: string }[] = [
  { title: 'Letters', icon: 'text-outline', href: '/letters' },
  { title: 'Pronunciation', icon: 'mic-outline', href: '/pronunciation' },
  { title: 'Numbers', icon: 'calculator-outline', href: '/numbers' },
  { title: 'Grammar', icon: 'school-outline', href: '/grammar' },
  { title: 'Scenarios', icon: 'chatbubbles-outline', href: '/scenarios' },
  { title: 'Dictionary', icon: 'book-outline', href: '/dictionary' },
];

export default function Today() {
  const c = usePalette();
  const learner = useCurrentLearner();
  const settings = useSettings();
  const progress = useProgressInput();
  const lastPage = useLearner((s) => s.lastPage);
  const cards = useLearner((s) => s.cards);
  const activity = useLearner((s) => s.activity);
  const g = greeting();
  const next = nextDay(progress);
  const d = next ? dayByNumber.get(next) : undefined;
  const [now] = useState(() => Date.now());
  const due = Object.values(cards).filter((cd) => isDue(cd, now)).length;
  const learnedLetters = letters.filter((l) => progress.completedDays.has(l.day)).length;
  const done = progress.completedDays.size;
  const todayMin = activity[new Date().toISOString().slice(0, 10)] ?? 0;

  // the week test that is open but not yet passed
  const pendingWeek = course?.weeks.find(
    (w) =>
      isWeekTestUnlocked(
        w.week,
        w.days.map((x) => x.day),
        { ...progress, unlockAll: false },
      ) &&
      (progress.weekTests[w.week] ?? 0) < settings.passMark &&
      w.test.length > 0,
  );
  const lastDay = lastPage ? dayByNumber.get(lastPage.day) : undefined;

  return (
    <Screen back={false} testID="today">
      <Card style={{ overflow: 'hidden' }} testID="greeting-card">
        <Text
          style={{
            position: 'absolute',
            end: -10,
            top: -30,
            fontSize: 160,
            color: c.accent,
            opacity: 0.07,
            fontFamily: 'NotoNaskhArabic_700Bold',
          }}>
          ع
        </Text>
        <Row>
          <View style={{ flex: 1 }}>
            <TapText text={g.ar} size={28} bold />
          </View>
          <Button kind="ghost" icon="volume-high" label="Hear" onPress={() => tts.speak(g.ar, { rate: settings.speechRate })} />
        </Row>
        <AppText size={20} weight="800" testID="greeting">
          {g.en}, {learner?.name ?? 'friend'}!
        </AppText>
      </Card>

      {settings.unlockAll && (
        <Card accent>
          <AppText weight="700">🔓 All chapters are unlocked for this learner.</AppText>
        </Card>
      )}

      {pendingWeek && (
        <Card
          onPress={() => router.push({ pathname: '/week-test/[week]', params: { week: String(pendingWeek.week) } })}
          label="Week test"
          testID="week-test-card">
          <Caption>Week {pendingWeek.week} test</Caption>
          <AppText weight="800">Pass with 80% to open Week {pendingWeek.week + 1}.</AppText>
        </Card>
      )}

      {lastDay && lastPage && !progress.completedDays.has(lastDay.day) && (
        <Card
          onPress={() => router.push({ pathname: '/day/[day]', params: { day: String(lastDay.day), p: String(lastPage.page) } })}
          label="Continue"
          testID="continue-card">
          <Caption>Continue where you left off</Caption>
          <AppText weight="800">
            Day {lastDay.day} · {lastDay.title}
          </AppText>
        </Card>
      )}

      {d ? (
        <Card testID="lesson-card">
          <Caption>
            Day {d.day} of {TOTAL_DAYS} · Week {d.week} · Level {d.level}
          </Caption>
          <AppText size={22} weight="800">
            {d.emoji} {d.title}
          </AppText>
          <GlossLine text={d.titleAr} segs={d.titleSegs} size={26} />
          <AppText muted>{d.summary}</AppText>
          <AppText size={14}>🎯 {d.objectives[0]}</AppText>
          <Button
            label="Start"
            iconAfter={NEXT_ICON}
            testID="start-lesson"
            onPress={() => router.push({ pathname: '/day/[day]', params: { day: String(d.day) } })}
          />
        </Card>
      ) : (
        <Card testID="lesson-card">
          <AppText weight="800">
            {pendingWeek ? 'Take the week test to continue.' : 'You have finished every lesson available in this version.'}
          </AppText>
          <AppText muted>More days are outlined on the Path and will be added in later versions.</AppText>
        </Card>
      )}

      <Row gap={12} style={{ alignItems: 'stretch' }}>
        <Card style={{ flex: 1 }} onPress={() => router.push('/flashcards')} label="Reviews">
          <Icon name="albums-outline" />
          <AppText weight="800">Reviews</AppText>
          <AppText muted>{due} due now</AppText>
        </Card>
        <Card style={{ flex: 1 }}>
          <Icon name="flag-outline" />
          <AppText weight="800">Today&apos;s goal</AppText>
          <AppText muted>{todayMin} / 15 min</AppText>
          <ProgressBar value={todayMin / 15} label="today's goal" />
        </Card>
      </Row>

      <Card onPress={() => router.push('/letters')} label="Letters">
        <AppText weight="800">Letters</AppText>
        <AppText muted>
          {learnedLetters} of {letters.length} letters and signs learned
        </AppText>
        <ProgressBar value={learnedLetters / letters.length} label="letters learned" />
      </Card>

      <AppText size={18} weight="800">
        Labs
      </AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {LABS.map((l) => (
          <Card key={l.href} style={{ width: '47%', flexGrow: 1 }} onPress={() => router.push(l.href as never)} label={l.title}>
            <Icon name={l.icon} />
            <AppText weight="700">{l.title}</AppText>
          </Card>
        ))}
      </View>

      <Card>
        <AppText weight="800">Your journey</AppText>
        <AppText muted>
          {done} of {TOTAL_DAYS} days · Week {weekByNumber(d?.week ?? 1)?.week ?? 1}
        </AppText>
        <ProgressBar value={done / TOTAL_DAYS} label="course progress" />
      </Card>
    </Screen>
  );
}
