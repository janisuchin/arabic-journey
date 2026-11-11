// Optional placement check (Prompt B section L): up to six stages of four questions from the week tests. It stops at
// the first stage below 3 of 4 and suggests a week. It never skips anything by itself: the learner may then take the
// week tests up to that week, one at a time, and each pass opens the next week.
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { AppText, Button, Card, ProgressBar, Screen } from '@/components/ui';
import { course } from '@/content';
import type { Question } from '@/content/schema';
import { buildPlacement, placementResult } from '@/core/placement';
import { OneQuestion } from '@/features/lesson';
import { useLearner } from '@/state/store';

type StageScore = { weeks: number[]; correct: number; total: number };

export default function Placement() {
  const stages = useMemo(() => buildPlacement<Question>(course?.weeks ?? []), []);
  const setPlacement = useLearner((s) => s.setPlacement);
  const [si, setSi] = useState(0);
  const [qi, setQi] = useState(0);
  const [scores, setScores] = useState<StageScore[]>([]);
  const [current, setCurrent] = useState({ correct: 0, total: 0 });
  const [result, setResult] = useState<number | null>(null);

  if (!stages.length)
    return (
      <Screen title="Placement check">
        <AppText>The placement check is not available. Start from Day 1.</AppText>
        <Button label="Start" onPress={() => router.replace('/')} />
      </Screen>
    );

  if (result !== null) {
    const total = scores.reduce((a, s) => a + s.total, 0);
    return (
      <Screen title="Placement check" testID="placement-result">
        <AppText size={22} weight="800">
          🧭 Your result
        </AppText>
        {result === 0 ? (
          <AppText testID="placement-advice">
            We suggest starting from Day 1. The first days go quickly if you already know some of the material.
          </AppText>
        ) : (
          <AppText testID="placement-advice">
            You answered most questions up to week {result} correctly. You may now take the week tests from week 1 to week{' '}
            {result}, one at a time: each test you pass opens the next week. Day 1 stays open whenever you want it.
          </AppText>
        )}
        <Card>
          <AppText size={14}>
            This is a short diagnostic ({total} questions), not an official level test. Starting from Day 1 is always allowed and
            never wasted: reviews of what you know are quick.
          </AppText>
        </Card>
        {scores.map((s) => (
          <View key={s.weeks.join('-')} style={{ gap: 4 }}>
            <AppText size={14}>
              Weeks {s.weeks[0]}–{s.weeks[s.weeks.length - 1]}: {s.correct} of {s.total}
            </AppText>
            <ProgressBar value={s.total ? s.correct / s.total : 0} height={6} label={`weeks ${s.weeks.join(', ')}`} />
          </View>
        ))}
        <Button label="Start from Day 1" icon="flag-outline" onPress={() => router.replace('/')} testID="placement-day1" />
        {result > 0 && (
          <Button
            kind="secondary"
            icon="trophy-outline"
            label="Take the week 1 test to skip ahead"
            onPress={() => router.replace({ pathname: '/week-test/[week]', params: { week: '1' } })}
            testID="placement-week1"
          />
        )}
      </Screen>
    );
  }

  const stage = stages[si];
  const q = stage.questions[qi];
  const advance = (ok: boolean) => {
    const cur = { correct: current.correct + (ok ? 1 : 0), total: current.total + 1 };
    if (qi + 1 < stage.questions.length) {
      setCurrent(cur);
      setQi(qi + 1);
      return;
    }
    const all = [...scores, { weeks: stage.weeks, ...cur }];
    setScores(all);
    setCurrent({ correct: 0, total: 0 });
    setQi(0);
    const failed = cur.correct / cur.total < 0.75;
    if (failed || si + 1 >= stages.length) {
      const week = placementResult(all);
      const n = all.reduce((a, s) => a + s.total, 0);
      setPlacement(week, n ? all.reduce((a, s) => a + s.correct, 0) / n : 0);
      setResult(week);
    } else setSi(si + 1);
  };

  return (
    <Screen title="Placement check" testID="placement">
      <AppText size={13} muted testID="placement-pos">
        STAGE {si + 1} OF {stages.length} · WEEKS {stage.weeks[0]}–{stage.weeks[stage.weeks.length - 1]} · QUESTION {qi + 1} OF{' '}
        {stage.questions.length}
      </AppText>
      <ProgressBar value={(si + qi / stage.questions.length) / stages.length} label="placement progress" />
      <OneQuestion key={`${si}-${qi}`} q={q} seed={si * 10 + qi} onNext={advance} testID="placement-q" />
      <Button kind="ghost" label="I don't know" onPress={() => advance(false)} testID="placement-skip" />
    </Screen>
  );
}
