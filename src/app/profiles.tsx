import { router } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { NEXT_ICON } from '@/base/rtl';
import { TapText } from '@/components/tap';
import { AppText, Button, Card, IconButton, Row, Screen } from '@/components/ui';
import { usePalette } from '@/state/hooks';
import { useProfiles, type Learner } from '@/state/store';

export default function Profiles() {
  const c = usePalette();
  const learners = useProfiles((s) => s.learners);
  const currentId = useProfiles((s) => s.currentId);
  const addLearner = useProfiles((s) => s.addLearner);
  const setCurrent = useProfiles((s) => s.setCurrent);
  const removeLearner = useProfiles((s) => s.removeLearner);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [pin, setPin] = useState('');
  const [asking, setAsking] = useState<Learner | null>(null);
  const [pinTry, setPinTry] = useState('');
  const [error, setError] = useState('');
  const input = {
    minWidth: 0,
    minHeight: 48,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    color: c.text,
    backgroundColor: c.card,
    fontSize: 17,
  } as const;

  const choose = (l: Learner) => {
    if (l.pin) {
      setAsking(l);
      setPinTry('');
      setError('');
      return;
    }
    setCurrent(l.id);
    router.replace('/');
  };

  return (
    <Screen back={!!currentId} title="Learners" testID="profiles">
      <AppText size={24} weight="800">
        Who is learning Arabic?
      </AppText>
      <TapText
        text="مَنْ يَتَعَلَّمُ الْعَرَبِيَّة؟"
        segs={[
          ['مَنْ', 'who'],
          ['يَتَعَلَّمُ', 'is learning'],
          ['الْعَرَبِيَّة', 'Arabic (the language)'],
        ]}
        size={24}
      />
      {learners.map((l) => (
        <Card key={l.id} onPress={() => choose(l)} label={`Learner ${l.name}`} testID={`learner-${l.name}`}>
          <Row>
            <AppText size={18} weight="800" style={{ flex: 1 }}>
              {l.pin ? '🔒 ' : ''}
              {l.name}
              {l.id === currentId ? ' (current)' : ''}
            </AppText>
            <IconButton icon="trash-outline" label={`Remove ${l.name}`} onPress={() => removeLearner(l.id)} />
          </Row>
        </Card>
      ))}
      {asking && (
        <Card accent testID="pin-prompt">
          <AppText weight="800">Enter {asking.name}&apos;s PIN</AppText>
          <TextInput
            testID="pin-try"
            accessibilityLabel="PIN"
            value={pinTry}
            onChangeText={setPinTry}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            style={input}
          />
          {error ? <AppText color={c.bad}>{error}</AppText> : null}
          <Button
            label="Open"
            onPress={() => {
              if (pinTry === asking.pin) {
                setCurrent(asking.id);
                router.replace('/');
              } else setError('That PIN is not right.');
            }}
          />
        </Card>
      )}
      <Card>
        <AppText weight="800">Add a learner</AppText>
        <TextInput
          testID="learner-name"
          accessibilityLabel="Name"
          placeholder="Name"
          placeholderTextColor={c.textMuted}
          value={name}
          onChangeText={setName}
          style={input}
        />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            testID="learner-age"
            accessibilityLabel="Age (optional)"
            placeholder="Age (optional)"
            placeholderTextColor={c.textMuted}
            value={age}
            onChangeText={(t) => setAge(t.replace(/\D/g, '').slice(0, 3))}
            keyboardType="number-pad"
            style={[input, { flex: 1 }]}
          />
          <TextInput
            testID="learner-pin"
            accessibilityLabel="4-digit PIN (optional)"
            placeholder="PIN (optional)"
            placeholderTextColor={c.textMuted}
            value={pin}
            onChangeText={(t) => setPin(t.replace(/\D/g, '').slice(0, 4))}
            keyboardType="number-pad"
            secureTextEntry
            style={[input, { flex: 1 }]}
          />
        </View>
        <AppText size={12} muted>
          The PIN is only a privacy lock between learners on this device. Everything stays on this device.
        </AppText>
        <Button
          label="Start learning"
          iconAfter={NEXT_ICON}
          testID="add-learner"
          disabled={!name.trim() || (pin.length > 0 && pin.length !== 4)}
          onPress={() => {
            addLearner({ name: name.trim(), age: age ? Number(age) : undefined, pin: pin || undefined });
            setName('');
            setAge('');
            setPin('');
            router.replace('/');
          }}
        />
      </Card>
    </Screen>
  );
}
