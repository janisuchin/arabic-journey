// Final exam (Prompt B section L): a cumulative test over all 13 weeks, four questions per week from the week tests,
// in course order. It opens once the week 13 test is passed (or with unlock-all). The best attempt, with a per-week
// breakdown, feeds the Report's "Final report". Like everything else here it mirrors the learner's answers; it is not
// a certificate.
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { AppText, Button, Caption, Card, Pill, ProgressBar, Screen } from '@/components/ui';
import { course } from '@/content';
import type { Question } from '@/content/schema';
import { buildFinalExam, finalExamResult, type FinalExamResult } from '@/core/finalExam';
import { isFinalExamUnlocked } from '@/core/progress';
import { OneQuestion } from '@/features/lesson';
import { usePalette, useProgressInput, useSettings, useStudyTimer } from '@/state/hooks';
import { useLearner } from '@/state/store';

const pct = (v: number) => `${Math.round(v * 100)}%`;

export default function FinalExam() {
  const c = usePalette();
  const weeks = useMemo(() => course?.weeks ?? [], []);
  const exam = useMemo(() => buildFinalExam<Question>(weeks), [weeks]);
  const lastWeek = weeks.reduce((m, w) => (w.test.length > 0 ? Math.max(m, w.week) : m), 0);
  const progress = useProgressInput();
  const { passMark } = useSettings();
  const setFinalExam = useLearner((s) => s.setFinalExam);
  const best = useLearner((s) => s.finalExam);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<{ week: number; correct: boolean }[]>([]);
  const [result, setResult] = useState<FinalExamResult | null>(null);
  const [started, setStarted] = useState(false);
  useStudyTimer();

  if (exam.length === 0)
    return (
      <Screen title="Final exam">
        <AppText>The final exam is not available yet.</AppText>
      </Screen>
    );

  const open = isFinalExamUnlocked(lastWeek, progress);
  const weekCount = new Set(exam.map((x) => x.week)).size;
  const weekTitle = (n: number) => weeks.find((w) => w.week === n)?.title ?? '';

  if (!open)
    return (
      <Screen title="Final exam" testID="final-exam">
        <Caption>Cumulative test · weeks 1–{weekCount}</Caption>
        <AppText size={20} weight="800">
          Everything from the 90 days
        </AppText>
        <Card testID="final-locked">
          <AppText weight="800">🔒 Pass the week {lastWeek} test first.</AppText>
          <AppText muted>
            The final exam has {exam.length} questions, {exam.length / weekCount} from every week. It opens after the last week
            test.
          </AppText>
        </Card>
        <Button kind="ghost" label="Back to your path" icon="map-outline" onPress={() => router.replace('/path')} />
      </Screen>
    );

  if (result)
    return (
      <Screen title="Final exam" testID="final-exam-result">
        <Card accent>
          <AppText size={22} weight="800" center>
            {result.score >= passMark ? '🎓 Passed!' : 'Not quite yet'}
          </AppText>
          <AppText size={18} center testID="final-score">
            {result.correct} / {result.total} correct ({pct(result.score)})
          </AppText>
          <AppText muted center>
            You need {pct(passMark)} to pass.
            {best && best.attempts > 1 ? ` Best of ${best.attempts} attempts: ${pct(best.score)}.` : ''}
          </AppText>
        </Card>
        <Card testID="final-by-week">
          <AppText weight="800">By week</AppText>
          {Object.entries(result.byWeek).map(([wk, s]) => {
            const acc = s.total ? s.correct / s.total : 0;
            return (
              <View key={wk} style={{ gap: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                  <AppText size={14} weight="700" numberOfLines={1} style={{ flex: 1 }}>
                    Week {wk} · {weekTitle(Number(wk))}
                  </AppText>
                  <AppText size={14} muted>
                    {s.correct} / {s.total}
                  </AppText>
                </View>
                <ProgressBar value={acc} height={6} label={`week ${wk} result`} />
              </View>
            );
          })}
          {result.weakWeeks.length > 0 ? (
            <AppText size={14} muted>
              Worth another look: {result.weakWeeks.map((w) => `week ${w}`).join(', ')}. Revisit those days and take the week test
              again before you retry.
            </AppText>
          ) : (
            <AppText size={14} muted>
              Every week at or above the pass mark. Keep your daily reviews going.
            </AppText>
          )}
        </Card>
        <AppText size={13} muted>
          This result is a mirror of your answers in this app, not a certificate: an official level comes only from a recognised
          exam.
        </AppText>
        <Button
          label="See your report"
          icon="document-text-outline"
          onPress={() => router.replace('/report')}
          testID="final-report"
        />
        {result.score < passMark && (
          <Button
            kind="secondary"
            label="Try again"
            icon="refresh"
            onPress={() => {
              setI(0);
              setAnswers([]);
              setResult(null);
            }}
          />
        )}
        <Button kind="ghost" label="Back to Today" icon="home-outline" onPress={() => router.replace('/')} />
      </Screen>
    );

  if (!started)
    return (
      <Screen title="Final exam" testID="final-exam">
        <Caption>Cumulative test · weeks 1–{weekCount}</Caption>
        <AppText size={20} weight="800">
          Everything from the 90 days
        </AppText>
        <Card>
          <AppText>
            {exam.length} questions, {exam.length / weekCount} from every week, in course order. Pass with {pct(passMark)}. You
            see the right answer after each question; the result shows which weeks to revisit.
          </AppText>
          {best && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }} testID="final-best">
              <Pill
                label={`best ${pct(best.score)} · ${best.score >= passMark ? 'passed' : 'below pass mark'}`}
                color={best.score >= passMark ? c.good : c.bad}
              />
              <AppText size={13} muted>
                {best.attempts} {best.attempts === 1 ? 'attempt' : 'attempts'}
              </AppText>
            </View>
          )}
        </Card>
        <Button
          label={best ? 'Take it again' : 'Start the final exam'}
          icon="school-outline"
          onPress={() => setStarted(true)}
          testID="final-start"
        />
        <Button kind="ghost" label="Back to Today" icon="home-outline" onPress={() => router.replace('/')} />
      </Screen>
    );

  const item = exam[i];
  const advance = (ok: boolean) => {
    const all = [...answers, { week: item.week, correct: ok }];
    if (i + 1 < exam.length) {
      setAnswers(all);
      setI(i + 1);
      return;
    }
    const r = finalExamResult(all, passMark);
    setFinalExam({ score: r.score, correct: r.correct, total: r.total, byWeek: r.byWeek });
    setAnswers(all);
    setResult(r);
  };

  return (
    <Screen title="Final exam" testID="final-exam">
      <AppText size={13} muted testID="final-pos">
        QUESTION {i + 1} OF {exam.length} · WEEK {item.week}
      </AppText>
      <ProgressBar value={i / exam.length} label="final exam progress" />
      <OneQuestion key={i} q={item.q} seed={500 + i} onNext={advance} skill="final exam" testID="final-q" />
    </Screen>
  );
}
