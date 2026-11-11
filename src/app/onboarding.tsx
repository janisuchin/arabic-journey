// First-run welcome (Prompt B section K): what the course is, honestly; goal and daily time; an audio check and
// privacy note; then start at Day 1 or take the optional placement check.
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { NEXT_ICON } from '@/base/rtl';
import { GlossLine } from '@/components/tap';
import { AppText, Button, Card, Pill, Row, Screen } from '@/components/ui';
import { tts } from '@/services/tts';
import { useCurrentLearner, useSettings } from '@/state/hooks';
import { useLearner } from '@/state/store';

const GOALS = [
  'Travel',
  'Living or working in the Arab world',
  'Family and friends',
  'Reading the Qur’an or classics later',
  'Study',
  'Just curious',
];
const MINUTES = [15, 30, 45] as const;
const WELCOME = 'أَهْلًا وَسَهْلًا!';
const WELCOME_SEGS: [string, string][] = [
  ['أَهْلًا', 'welcome (lit. family)'],
  ['وَسَهْلًا', 'and welcome (lit. and ease)'],
];
const CHECK = 'مَرْحَبًا! هٰذِهِ رِحْلَتُكَ إِلَى الْعَرَبِيَّة.';
const CHECK_SEGS: [string, string][] = [
  ['مَرْحَبًا', 'hello'],
  ['هٰذِهِ', 'this (f.)'],
  ['رِحْلَتُكَ', 'your journey'],
  ['إِلَى', 'to'],
  ['الْعَرَبِيَّة', 'Arabic (the language)'],
];

export default function Onboarding() {
  const learner = useCurrentLearner();
  const settings = useSettings();
  const complete = useLearner((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(GOALS[0]);
  const [minutes, setMinutes] = useState<(typeof MINUTES)[number]>(15);

  const finish = (placement: boolean) => {
    complete(goal, minutes);
    router.replace(placement ? '/placement' : '/');
  };

  return (
    <Screen back={false} testID="onboarding">
      <AppText size={13} muted testID="onb-step">
        Step {step + 1} of 3
      </AppText>
      {step === 0 && (
        <>
          <GlossLine text={WELCOME} segs={WELCOME_SEGS} size={34} center />
          <AppText size={22} weight="800" center>
            Welcome{learner ? `, ${learner.name}` : ''}!
          </AppText>
          <AppText>
            Arabic Journey is a 90-day course in Modern Standard Arabic: the letters and sounds first, then words, grammar,
            dialogues, reading and real-life situations — a little every day, right to left.
          </AppText>
          <Card accent>
            <AppText weight="800">What to expect, honestly</AppText>
            <AppText size={14}>
              • 90 days of 15–45 minutes build a solid A1 base and the core of A2 — if you practise regularly and review what you
              learn.{'\n'}• The app gives no official certificate and does not guarantee a level. Your results show what you can
              actually do.{'\n'}• The content is written carefully but is still waiting for review by a teacher; pages say so
              where that matters.{'\n'}• Everything works offline on this device. No account, no ads, no paywall.
            </AppText>
          </Card>
          <Button label="Let's start" icon={NEXT_ICON} onPress={() => setStep(1)} testID="onb-next-0" />
        </>
      )}

      {step === 1 && (
        <>
          <AppText size={20} weight="800">
            Why are you learning Arabic?
          </AppText>
          <Row wrap>
            {GOALS.map((g) => (
              <Pill key={g} label={g} off={goal !== g} onPress={() => setGoal(g)} testID={`onb-goal-${GOALS.indexOf(g)}`} />
            ))}
          </Row>
          <AppText size={20} weight="800">
            How much time per day?
          </AppText>
          <Row wrap>
            {MINUTES.map((m) => (
              <Pill key={m} label={`${m} minutes`} off={minutes !== m} onPress={() => setMinutes(m)} testID={`onb-min-${m}`} />
            ))}
          </Row>
          <AppText size={13} muted>
            15 minutes covers the day&apos;s lesson; 30 and 45 leave time for reviews, labs and scenarios.
          </AppText>
          <Row wrap>
            <Button kind="ghost" label="Back" onPress={() => setStep(0)} />
            <Button label="Next" icon={NEXT_ICON} onPress={() => setStep(2)} testID="onb-next-1" />
          </Row>
        </>
      )}

      {step === 2 && (
        <>
          <AppText size={20} weight="800">
            Check your audio
          </AppText>
          <Card>
            <GlossLine text={CHECK} segs={CHECK_SEGS} size={26} center />
            <AppText center muted>
              Hello! This is your journey to Arabic.
            </AppText>
            <View style={{ alignItems: 'center' }}>
              <Button
                kind="secondary"
                icon="volume-high"
                label="Play"
                testID="onb-audio"
                onPress={() => tts.speak(CHECK, { rate: settings.speechRate })}
              />
            </View>
          </Card>
          <AppText size={13} muted>
            The voice is your device&apos;s Arabic text-to-speech (computer-generated, not a native speaker). If you hear nothing,
            install an Arabic voice in your device&apos;s speech settings; everything else still works.
          </AppText>
          <Card>
            <AppText weight="800">🔒 Your privacy</AppText>
            <AppText size={14}>
              Your progress stays on this device. The microphone is used only if you choose to record yourself in speaking
              practice, and speech recognition only after you allow it.
            </AppText>
          </Card>
          <AppText size={20} weight="800">
            Where do you want to start?
          </AppText>
          <Button label="Start from Day 1 (recommended)" icon="flag-outline" onPress={() => finish(false)} testID="onb-start" />
          <Button
            kind="secondary"
            label="I know some Arabic: optional placement check"
            icon="compass-outline"
            onPress={() => finish(true)}
            testID="onb-placement"
          />
          <AppText size={13} muted>
            The placement check only suggests where to start. To skip ahead you still pass each week&apos;s test, one by one, so
            you never miss foundations you don&apos;t know yet.
          </AppText>
          <Button kind="ghost" label="Back" onPress={() => setStep(1)} />
        </>
      )}
    </Screen>
  );
}
