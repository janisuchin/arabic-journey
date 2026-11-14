import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, Switch, View } from 'react-native';

import { DONATE_URL, VERSION } from '@/base/config';
import { THEME_NAMES, paletteFor } from '@/base/palette';
import { AppText, Button, Card, Row, Screen, SectionTitle } from '@/components/ui';
import { contentIssues } from '@/content';
import { arabicVoices, type ArabicVoice } from '@/services/tts';
import { useCurrentLearner, usePalette, useSettings } from '@/state/hooks';
import { useLearner, useProfiles, type Settings as S } from '@/state/store';

/** Arabic voices on this device, best first. Voices marked "Natural" / "Online" read the vowel marks properly. */
function VoicePicker({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const c = usePalette();
  const [voices, setVoices] = useState<ArabicVoice[] | null>(null);
  useEffect(() => {
    void arabicVoices().then(setVoices);
  }, []);
  const best = voices?.[0];
  return (
    <View style={{ gap: 6 }} testID="voice-picker">
      <AppText>Arabic voice</AppText>
      {voices === null ? (
        <AppText size={12} muted>
          Looking for Arabic voices…
        </AppText>
      ) : voices.length === 0 ? (
        <AppText size={12} muted>
          No Arabic voice is listed by this device. Install an Arabic voice in your system settings (on Windows: Settings › Time
          &amp; language › Speech), or use Microsoft Edge or Chrome, which offer online Arabic voices.
        </AppText>
      ) : (
        <>
          <Row wrap gap={6}>
            <Chip label={`Automatic${best ? ` (${best.name})` : ''}`} selected={!value} onPress={() => onChange(null)} c={c} />
            {voices.slice(0, 12).map((v) => (
              <Chip
                key={v.id}
                label={`${v.name} (${v.language})`}
                selected={value === v.id}
                onPress={() => onChange(v.id)}
                c={c}
              />
            ))}
          </Row>
          {best && best.rank < 10 && (
            <AppText size={12} muted>
              Only basic Arabic voices were found. They often skip the short vowels (بُنِيَتْ may sound like “bunī”). For clearer
              vowels, open the app in Microsoft Edge (Natural voices) or Chrome (Google voice).
            </AppText>
          )}
        </>
      )}
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
  c,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  c: ReturnType<typeof usePalette>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        minHeight: 40,
        paddingHorizontal: 12,
        justifyContent: 'center',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: selected ? c.accent : c.border,
        backgroundColor: selected ? c.accentSoft : c.card,
      }}>
      <AppText size={13} weight={selected ? '800' : '400'}>
        {label}
      </AppText>
    </Pressable>
  );
}

function Toggle({
  label,
  value,
  onChange,
  testID,
  note,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  testID?: string;
  note?: string;
}) {
  const c = usePalette();
  return (
    <View style={{ gap: 2 }}>
      <Row style={{ minHeight: 44 }}>
        <AppText style={{ flex: 1 }}>{label}</AppText>
        <Switch
          testID={testID}
          accessibilityLabel={label}
          value={value}
          onValueChange={onChange}
          trackColor={{ true: c.accent, false: c.border }}
          thumbColor="#fff"
        />
      </Row>
      {note && (
        <AppText size={12} muted>
          {note}
        </AppText>
      )}
    </View>
  );
}

function Choice<T extends string | number>({
  label,
  options,
  value,
  onChange,
  testID,
}: {
  label: string;
  options: { v: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  testID?: string;
}) {
  const c = usePalette();
  return (
    <View style={{ gap: 6 }}>
      <AppText>{label}</AppText>
      <Row wrap gap={6}>
        {options.map((o) => (
          <Pressable
            key={String(o.v)}
            testID={testID ? `${testID}-${o.v}` : undefined}
            accessibilityRole="button"
            accessibilityState={{ selected: o.v === value }}
            accessibilityLabel={`${label}: ${o.label}`}
            onPress={() => onChange(o.v)}
            style={{
              minHeight: 44,
              paddingHorizontal: 12,
              borderRadius: 12,
              justifyContent: 'center',
              backgroundColor: o.v === value ? c.accent : c.cardAlt,
            }}>
            <AppText weight="700" color={o.v === value ? c.accentText : c.text}>
              {o.label}
            </AppText>
          </Pressable>
        ))}
      </Row>
    </View>
  );
}

function Section({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return (
    <>
      <SectionTitle>{title}</SectionTitle>
      <Card testID={id}>{children}</Card>
    </>
  );
}

export default function SettingsScreen() {
  const s = useSettings();
  const update = useLearner((st) => st.updateSettings);
  const reset = useLearner((st) => st.resetProgress);
  const learner = useCurrentLearner();
  const setCurrent = useProfiles((st) => st.setCurrent);
  const set =
    <K extends keyof S>(k: K) =>
    (v: S[K]) =>
      update({ [k]: v } as Partial<S>);
  return (
    <Screen title="Settings" testID="settings">
      <Section title="Learner">
        <AppText weight="800">{learner?.name}</AppText>
        <Row wrap>
          <Button kind="secondary" label="Switch learner" icon="people-outline" onPress={() => router.push('/profiles')} />
          <Button
            kind="ghost"
            label="Log off"
            icon="log-out-outline"
            onPress={() => {
              setCurrent(null);
              router.replace('/profiles');
            }}
          />
        </Row>
      </Section>
      <Section title="Learning">
        <Toggle
          label="Unlock all chapters"
          value={s.unlockAll}
          onChange={set('unlockAll')}
          testID="unlock-all"
          note="Opens every available day for this learner only."
        />
        <AppText size={13} muted>
          Pass mark for quizzes and week tests: {Math.round(s.passMark * 100)}%
        </AppText>
      </Section>
      <Section title="Arabic text">
        <Toggle label="Show English translations" value={s.showTranslations} onChange={set('showTranslations')} />
        <Toggle label="Show transliteration" value={s.showTranslit} onChange={set('showTranslit')} testID="toggle-translit" />
        <Choice
          label="Transliteration style"
          value={s.translitStyle}
          onChange={set('translitStyle')}
          testID="translit-style"
          options={[
            { v: 'academic', label: 'Academic (ḥ, ā, ʿ)' },
            { v: 'simple', label: "Simple (h, aa, ')" },
          ]}
        />
        <Toggle
          label="Show vowel marks (harakat)"
          value={s.showHarakat}
          onChange={set('showHarakat')}
          testID="toggle-harakat"
          note="Most Arabic outside textbooks is written without them. Turn them off to practise real-world reading."
        />
      </Section>
      <Section title="Sound">
        <Toggle label="Read aloud on tap" value={s.readAloudOnTap} onChange={set('readAloudOnTap')} />
        <Choice
          label="Normal speed"
          value={s.speechRate}
          onChange={set('speechRate')}
          options={[
            { v: 0.75, label: '75%' },
            { v: 0.9, label: '90%' },
            { v: 1, label: '100%' },
          ]}
        />
        <Choice
          label="Slow speed"
          value={s.slowRate}
          onChange={set('slowRate')}
          options={[
            { v: 0.4, label: '40%' },
            { v: 0.55, label: '55%' },
            { v: 0.7, label: '70%' },
          ]}
        />
        <VoicePicker value={s.voiceId} onChange={set('voiceId')} />
        <AppText size={12} muted>
          The voice is your device&apos;s text-to-speech for Arabic: a computer-generated voice, not a native-speaker recording.
          If no Arabic voice is installed, nothing is heard.
        </AppText>
      </Section>
      <Section title="Speaking">
        <Toggle
          label="Allow speech recognition"
          value={s.speakingConsent}
          onChange={set('speakingConsent')}
          note="Speaking lab only, on web browsers that have it: the browser's recogniser (in Chrome and Edge an online service) writes down the words it hears. Off = never used. Recordings for record-and-compare stay on this device and are never uploaded."
        />
      </Section>
      <Section title="Display">
        <Choice
          label="Theme"
          value={s.theme}
          onChange={set('theme')}
          testID="theme"
          options={[
            { v: 'system', label: 'System' },
            { v: 'light', label: 'Light' },
            { v: 'dark', label: 'Dark' },
          ]}
        />
        <Choice
          label="Colour theme"
          value={s.colorTheme}
          onChange={set('colorTheme')}
          options={THEME_NAMES.map((n) => ({ v: n, label: n }))}
        />
        <Row wrap gap={6}>
          {THEME_NAMES.map((n) => (
            <View
              key={n}
              style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: paletteFor(n, false, false).accent }}
            />
          ))}
        </Row>
        <Choice
          label="Text size"
          value={s.textScale}
          onChange={set('textScale')}
          testID="text-size"
          options={[0.9, 1, 1.15, 1.3, 1.5].map((v) => ({ v, label: `${Math.round(v * 100)}%` }))}
        />
        <Toggle label="High contrast" value={s.highContrast} onChange={set('highContrast')} />
      </Section>
      <Section title="Reminders">
        <Toggle
          label="Daily reminder"
          value={s.reminders}
          onChange={set('reminders')}
          note="Reminder notifications are not available in this version."
        />
      </Section>
      <Section title="Privacy" id="privacy">
        <AppText size={14}>Everything stays on this device: no account, no tracking, no uploads.</AppText>
        <Button kind="ghost" label="Reset this learner's progress" icon="trash-outline" onPress={reset} />
      </Section>
      <Section title="About">
        <Row wrap>
          <Button kind="secondary" label="About" onPress={() => router.push('/about')} />
          <Button kind="secondary" label="Credits" onPress={() => router.push('/credits')} />
        </Row>
        {DONATE_URL && <Button label="Donate" onPress={() => undefined} />}
      </Section>
      <Section title="Advanced">
        <AppText size={13} muted>
          Version {VERSION} · content problems hidden from view: {contentIssues.length}
        </AppText>
      </Section>
    </Screen>
  );
}
