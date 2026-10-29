import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

import { webLang } from '@/base/rtl';
import { RichText, TapText } from '@/components/tap';
import { AR_FONT_BOLD, AppText, Button, Card, Pill, Row, Screen, TrText } from '@/components/ui';
import { letterById } from '@/content';
import { LetterForms, SunMoonBadge } from '@/features/script';
import { tts } from '@/services/tts';
import { usePalette, useSettings } from '@/state/hooks';

export default function LetterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const l = letterById.get(id);
  const c = usePalette();
  const settings = useSettings();
  if (!l)
    return (
      <Screen title="Letter">
        <AppText>Unknown letter.</AppText>
      </Screen>
    );
  return (
    <Screen title={`Letter ${l.name}`} testID="letter-detail">
      <Card style={{ alignItems: 'center' }}>
        <Text {...webLang('ar', 'rtl')} style={{ fontFamily: AR_FONT_BOLD, fontSize: 110, lineHeight: 190, color: c.accent }}>
          {l.char}
        </Text>
        <TapText text={l.nameAr} size={26} center />
        <Row wrap gap={6} style={{ justifyContent: 'center' }}>
          <Pill label={`/${l.ipa}/`} />
          <SunMoonBadge letter={l} />
          <Pill label={`Day ${l.day}`} />
        </Row>
        {settings.showTranslit && <TrText center>{l.tr}</TrText>}
        <Button
          kind="secondary"
          icon="volume-high"
          label="Hear the letter name"
          onPress={() => tts.speak(l.nameAr, { rate: settings.slowRate })}
        />
      </Card>
      <Card>
        <AppText weight="800">Sound</AppText>
        <RichText text={l.sound} />
      </Card>
      <Card>
        <AppText weight="800">Forms</AppText>
        <AppText size={13} muted>
          The forms are drawn by the font from the real joining rules: the letter is never cut out of a word by hand.
        </AppText>
        <LetterForms letter={l} size={44} />
      </Card>
      <Card>
        <AppText weight="800">Example</AppText>
        <TapText text={l.example.ar} size={30} />
        <AppText>{l.example.en}</AppText>
      </Card>
      <AppText size={12} muted>
        Stroke-order animation and tracing are not available in this version.
      </AppText>
    </Screen>
  );
}
