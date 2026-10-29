import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { GlossLine } from '@/components/tap';
import { AppText, Caption, Card, Pill, ProgressBar, Row, Screen } from '@/components/ui';
import { course, dayByNumber } from '@/content';
import { isDayUnlocked, isWeekTestUnlocked } from '@/core/progress';
import { usePalette, useProgressInput } from '@/state/hooks';

export default function Path() {
  const c = usePalette();
  const progress = useProgressInput();
  if (!course)
    return (
      <Screen back={false}>
        <AppText>Course plan unavailable.</AppText>
      </Screen>
    );
  const main = course.levels.filter((l) => !l.extension);
  const ext = course.levels.filter((l) => l.extension);
  return (
    <Screen back={false} title="Your path" testID="path">
      {course.weeks.map((w) => {
        const dayNums = w.days.map((d) => d.day);
        const done = dayNums.filter((d) => progress.completedDays.has(d)).length;
        const testOpen = w.test.length > 0 && isWeekTestUnlocked(w.week, dayNums, progress);
        const testScore = progress.weekTests[w.week];
        return (
          <Card key={w.week} testID={`week-${w.week}`}>
            <Caption>
              Phase {w.phase} · Week {w.week}
            </Caption>
            <Row wrap gap={6}>
              {w.levels.map((l) => (
                <Pill
                  key={l}
                  label={`Level ${l}`}
                  onPress={() => router.push({ pathname: '/level/[level]', params: { level: String(l) } })}
                />
              ))}
            </Row>
            <AppText size={18} weight="800">
              {w.title}
            </AppText>
            <GlossLine text={w.titleAr} segs={w.titleSegs} size={22} />
            <AppText size={13} muted>
              {w.topics.join(' · ')}
            </AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {w.days.map((od) => {
                const exists = dayByNumber.has(od.day);
                const open = exists && isDayUnlocked(od.day, progress);
                const complete = progress.completedDays.has(od.day);
                return (
                  <Pressable
                    key={od.day}
                    testID={`day-circle-${od.day}`}
                    accessibilityRole="button"
                    accessibilityLabel={`Day ${od.day}: ${od.title}${exists ? (open ? '' : ', locked') : ', coming in a later version'}`}
                    disabled={!open}
                    onPress={() => router.push({ pathname: '/day/[day]', params: { day: String(od.day) } })}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: complete ? c.accent : open ? c.accentSoft : c.cardAlt,
                      borderWidth: 1,
                      borderStyle: exists ? 'solid' : 'dashed',
                      borderColor: exists ? c.accent : c.border,
                    }}>
                    <AppText weight="800" center color={complete ? c.accentText : exists ? c.accent : c.textMuted}>
                      {od.day}
                    </AppText>
                  </Pressable>
                );
              })}
              {w.test.length > 0 && (
                <Pill
                  label={testScore !== undefined ? `Test ${Math.round(testScore * 100)}%` : 'Test'}
                  testID={`week-test-pill-${w.week}`}
                  onPress={
                    testOpen ? () => router.push({ pathname: '/week-test/[week]', params: { week: String(w.week) } }) : undefined
                  }
                />
              )}
            </View>
            <ProgressBar value={done / w.days.length} label={`week ${w.week} progress`} />
            {!w.days.some((d) => dayByNumber.has(d.day)) && (
              <AppText size={12} muted>
                Outline only: these lessons are planned and will be added in a later version.
              </AppText>
            )}
          </Card>
        );
      })}
      <Card onPress={() => router.push('/scenarios')} label="Explore">
        <AppText weight="800">🧭 Explore</AppText>
        <AppText muted>Real-life scenarios to practise what you know.</AppText>
      </Card>
      <Card>
        <AppText weight="800">Levels</AppText>
        {main.map((l) => (
          <AppText key={l.level} size={14}>
            Level {l.level}: {l.name} ({l.cefr})
          </AppText>
        ))}
        <AppText weight="800" style={{ marginTop: 6 }}>
          Extension (outline)
        </AppText>
        {ext.map((l) => (
          <AppText key={l.level} size={14} muted>
            Level {l.level}: {l.name} ({l.cefr})
          </AppText>
        ))}
      </Card>
    </Screen>
  );
}
