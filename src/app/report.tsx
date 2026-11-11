// Progress report (Prompt B section K: Me → Report). Built only from what the learner answered in the app:
// course progress, accuracy by skill, the 13 week tests, study time and the placement check.
import { router } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { TOTAL_DAYS } from '@/base/config';
import { AppText, Button, Caption, Card, Pill, ProgressBar, Row, Screen, SectionTitle } from '@/components/ui';
import { course } from '@/content';
import { buildReport, skillLabel, SKILL_MIN_ANSWERS, type SkillLevel, type WeekTestStatus } from '@/core/report';
import { useCurrentLearner, usePalette, useSettings } from '@/state/hooks';
import { useLearner } from '@/state/store';

const pct = (v: number) => `${Math.round(v * 100)}%`;

export default function ReportScreen() {
  const c = usePalette();
  const learner = useCurrentLearner();
  const { passMark } = useSettings();
  const completedDays = useLearner((s) => s.completedDays);
  const quizScores = useLearner((s) => s.quizScores);
  const weekTests = useLearner((s) => s.weekTests);
  const cards = useLearner((s) => s.cards);
  const activity = useLearner((s) => s.activity);
  const answered = useLearner((s) => s.answered);
  const placement = useLearner((s) => s.placement);
  const finalExam = useLearner((s) => s.finalExam);
  const goal = useLearner((s) => s.goal);
  const studyMinutes = useLearner((s) => s.studyMinutes);

  const r = useMemo(
    () =>
      buildReport({
        weeks: (course?.weeks ?? []).map((w) => ({ week: w.week, title: w.title, days: w.days.map((d) => d.day) })),
        totalDays: TOTAL_DAYS,
        completedDays,
        quizScores,
        weekTests,
        passMark,
        cards,
        activity,
        answered,
        placement,
        finalExam,
        today: new Date().toISOString().slice(0, 10),
      }),
    [completedDays, quizScores, weekTests, passMark, cards, activity, answered, placement, finalExam],
  );

  // undefined = a neutral ("off") pill
  const levelColor: Record<SkillLevel, string | undefined> = {
    strong: c.good,
    developing: c.accent,
    'needs work': c.bad,
    'too early to say': undefined,
  };
  const statusColor: Record<WeekTestStatus, string | undefined> = {
    passed: c.good,
    'below pass mark': c.bad,
    'not taken': undefined,
  };
  const empty = r.daysDone === 0 && r.weekTestsTaken === 0 && r.skills.length === 0 && !r.placement;
  const finished = r.finished;
  const allDays = r.daysDone >= r.totalDays;

  return (
    <Screen title="Report" testID="report">
      <Card accent>
        <Caption>{learner?.name ?? 'Learner'} · progress report</Caption>
        <AppText size={22} weight="800" testID="report-title">
          {finished ? 'Final report' : allDays ? 'All days done' : 'Where you are'}
        </AppText>
        <AppText size={14} muted>
          Everything here is counted from what you answered in this app. It is a mirror of your practice, not a certificate: an
          official level comes only from a recognised exam.
        </AppText>
      </Card>

      {empty && (
        <Card testID="report-empty">
          <AppText weight="800">📊 Nothing to report yet</AppText>
          <AppText muted>Finish a day, take a quiz or try the placement check and your report fills in.</AppText>
          <Button label="Start Day 1" icon="flag-outline" onPress={() => router.replace('/')} />
        </Card>
      )}

      <SectionTitle icon="trending-up-outline">Progress</SectionTitle>
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <AppText weight="700">Course</AppText>
          <AppText muted testID="report-days">
            {r.daysDone} of {r.totalDays} days
          </AppText>
        </Row>
        <ProgressBar value={r.daysDone / r.totalDays} label="course progress" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
          {(
            [
              ['Quiz average', r.daysDone ? pct(r.quizAverage) : '–'],
              ['Words learned', `${r.words.learned}`],
              ['Words mastered', `${r.words.mastered}`],
              ['Week tests passed', `${r.weekTestsPassed} of ${r.weeks.length}`],
            ] as [string, string][]
          ).map(([k, v]) => (
            <View key={k} style={{ width: '45%', flexGrow: 1 }}>
              <AppText size={20} weight="800" color={c.accent}>
                {v}
              </AppText>
              <AppText size={12} muted>
                {k}
              </AppText>
            </View>
          ))}
        </View>
        <AppText size={13} muted>
          “Mastered” means recalled correctly at an interval of three weeks or more. The quiz average is the mean of your best
          score on each completed day.
        </AppText>
      </Card>

      <SectionTitle icon="time-outline">Study time</SectionTitle>
      <Card>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {(
            [
              ['Minutes in total', `${r.study.minutes}`],
              ['Last 7 days', `${r.study.last7Minutes} min`],
              ['Days with study', `${r.study.activeDays}`],
              ['Current streak', `${r.study.streak} ${r.study.streak === 1 ? 'day' : 'days'}`],
            ] as [string, string][]
          ).map(([k, v]) => (
            <View key={k} style={{ width: '45%', flexGrow: 1 }}>
              <AppText size={20} weight="800" color={c.accent}>
                {v}
              </AppText>
              <AppText size={12} muted>
                {k}
              </AppText>
            </View>
          ))}
        </View>
        <AppText size={13} muted>
          Your plan: about {studyMinutes} minutes a day{goal ? ` · goal: ${goal}` : ''}. Time is counted while lessons are open on
          this device.
        </AppText>
      </Card>

      <SectionTitle icon="analytics-outline">Accuracy by skill</SectionTitle>
      {r.skills.length === 0 ? (
        <AppText muted>Answer some quiz questions to see your accuracy by skill.</AppText>
      ) : (
        <Card testID="report-skills">
          {r.skills.map((s) => (
            <View key={s.skill} style={{ gap: 4 }}>
              <Row style={{ justifyContent: 'space-between' }} gap={8}>
                <AppText weight="700" style={{ flexShrink: 1 }}>
                  {skillLabel(s.skill)}
                </AppText>
                <Row gap={6}>
                  <AppText size={14} muted>
                    {s.correct} / {s.total}
                  </AppText>
                  <Pill
                    label={s.level === 'too early to say' ? 'too early' : `${pct(s.accuracy)} · ${s.level}`}
                    color={levelColor[s.level]}
                    off={!levelColor[s.level]}
                  />
                </Row>
              </Row>
              <ProgressBar value={s.accuracy} height={6} label={`${skillLabel(s.skill)} accuracy`} />
            </View>
          ))}
          <AppText size={13} muted>
            Weakest first. A skill is judged after {SKILL_MIN_ANSWERS} answers: 80% and above is strong, 60–79% developing, below
            60% needs work. Pronunciation and speaking are practised but not scored.
          </AppText>
        </Card>
      )}

      <SectionTitle icon="trophy-outline">Week tests</SectionTitle>
      <Card testID="report-weeks">
        {r.weeks.map((w) => (
          <View
            key={w.week}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}
            testID={`report-week-${w.week}`}>
            <View style={{ flex: 1 }}>
              <AppText weight="700" numberOfLines={1}>
                Week {w.week} · {w.title}
              </AppText>
              <AppText size={12} muted>
                {w.daysDone} of {w.daysTotal} days done
              </AppText>
            </View>
            <Pill
              label={w.score === null ? 'not taken' : `${pct(w.score)} · ${w.status}`}
              color={statusColor[w.status]}
              off={!statusColor[w.status]}
            />
          </View>
        ))}
        <AppText size={13} muted>
          Best score per test. Pass mark {pct(passMark)}: a passed test opens the next week.
        </AppText>
      </Card>

      <SectionTitle icon="school-outline">Final exam</SectionTitle>
      <Card testID="report-final">
        {r.finalExam ? (
          <>
            <Row style={{ justifyContent: 'space-between' }} gap={8}>
              <AppText weight="700">Best attempt</AppText>
              <Pill
                label={`${pct(r.finalExam.score)} · ${r.finalExam.passed ? 'passed' : 'below pass mark'}`}
                color={r.finalExam.passed ? c.good : c.bad}
              />
            </Row>
            <AppText size={14} muted>
              {r.finalExam.correct} of {r.finalExam.total} questions right on {new Date(r.finalExam.at).toLocaleDateString()} ·{' '}
              {r.finalExam.attempts} {r.finalExam.attempts === 1 ? 'attempt' : 'attempts'}.
              {r.finalExam.weakWeeks.length
                ? ` Worth another look: ${r.finalExam.weakWeeks.map((w) => `week ${w}`).join(', ')}.`
                : ' Every week at or above the pass mark.'}
            </AppText>
            <Button
              kind="secondary"
              icon="school-outline"
              label="Open the final exam"
              onPress={() => router.push('/final-exam')}
            />
          </>
        ) : (
          <>
            <AppText weight="700">Not taken</AppText>
            <AppText size={14} muted>
              A cumulative test over all 13 weeks, four questions from each. It opens after the week 13 test; passing it turns
              this page into your final report.
            </AppText>
            <Button
              kind="secondary"
              icon="school-outline"
              label="Open the final exam"
              onPress={() => router.push('/final-exam')}
            />
          </>
        )}
      </Card>

      <SectionTitle icon="compass-outline">Placement check</SectionTitle>
      <Card testID="report-placement">
        {r.placement ? (
          <>
            <AppText weight="700">
              {r.placement.week === 0
                ? 'Suggested start: Day 1'
                : `You may test into the week tests up to week ${r.placement.week}`}
            </AppText>
            <AppText size={14} muted>
              Taken on {new Date(r.placement.at).toLocaleDateString()} · {pct(r.placement.score)} of the diagnostic questions
              right. The check never skips anything by itself: only week tests you pass, in order, open later weeks.
            </AppText>
          </>
        ) : (
          <>
            <AppText weight="700">Not taken</AppText>
            <AppText size={14} muted>
              A short diagnostic of up to 24 week-test questions. It suggests where to start; Day 1 is always open.
            </AppText>
            <Button
              kind="secondary"
              icon="compass-outline"
              label="Take the placement check"
              onPress={() => router.push('/placement')}
            />
          </>
        )}
      </Card>

      {allDays && (
        <Card accent>
          <AppText weight="800">
            {finished ? '🎓 You have finished the 90 days and passed the final exam' : '🎓 You have finished the 90 days'}
          </AppText>
          {!finished && <AppText size={14}>Take the final exam to complete your final report.</AppText>}
          <AppText size={14}>
            Keep your daily reviews going, revisit the scenarios and placards, and use Arabic in real conversations. The
            dictionary and the sentence explorer stay with you.
          </AppText>
        </Card>
      )}
    </Screen>
  );
}
