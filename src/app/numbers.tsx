import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { webLang } from '@/base/rtl';
import { TapText } from '@/components/tap';
import { AR_FONT, AppText, Card, IconButton, Row, Screen, SectionTitle, TrText } from '@/components/ui';
import { clockTime, describeNumber, ordinal, parseDigits } from '@/core/numbers';
import { translitLine } from '@/lang/ar/tap';
import { tts } from '@/services/tts';
import { usePalette, useSettings } from '@/state/hooks';

export default function Numbers() {
  const c = usePalette();
  const settings = useSettings();
  const [input, setInput] = useState('25');
  const n = parseDigits(input);
  const info = n !== null ? describeNumber(n, settings.translitStyle) : null;
  return (
    <Screen title="Numbers" testID="numbers">
      <Card>
        <AppText weight="800">Number calculator</AppText>
        <TextInput
          testID="number-input"
          accessibilityLabel="Type a number (Western or Arabic digits)"
          value={input}
          onChangeText={setInput}
          keyboardType="number-pad"
          style={{
            minHeight: 48,
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 12,
            paddingHorizontal: 12,
            fontSize: 20,
            color: c.text,
          }}
        />
        {info ? (
          <View style={{ gap: 4 }} testID="number-result">
            <Row gap={16}>
              <AppText size={28} weight="800">
                {info.digits}
              </AppText>
              <Text {...webLang('ar', 'rtl')} style={{ fontFamily: AR_FONT, fontSize: 32, color: c.accent }}>
                {info.arabicDigits}
              </Text>
              <IconButton
                icon="volume-high"
                label="Hear the number"
                onPress={() => tts.speak(info.ar, { rate: settings.speechRate })}
              />
            </Row>
            <TapText text={info.ar} size={26} />
            <AppText weight="700" testID="number-english">
              {info.en}
            </AppText>
          </View>
        ) : (
          <AppText color={c.bad}>Type a whole number from 0 to 999999.</AppText>
        )}
      </Card>

      <SectionTitle icon="grid-outline">0 to 10</SectionTitle>
      {Array.from({ length: 11 }, (_, i) => describeNumber(i, settings.translitStyle)).map((x) => (
        <Card key={x.digits} style={{ paddingVertical: 8 }}>
          <Row gap={12}>
            <Text
              {...webLang('ar', 'rtl')}
              style={{ fontFamily: AR_FONT, fontSize: 26, color: c.accent, width: 44, textAlign: 'center' }}>
              {x.arabicDigits}
            </Text>
            <View style={{ flex: 1 }}>
              <Text {...webLang('ar', 'rtl')} style={{ fontFamily: AR_FONT, fontSize: 24, color: c.text, textAlign: 'right' }}>
                {x.ar}
              </Text>
              {settings.showTranslit && <TrText size={14}>{`${x.translit} — ${x.digits} (${x.en})`}</TrText>}
            </View>
            <IconButton
              icon="volume-medium-outline"
              label={`Hear ${x.en}`}
              onPress={() => tts.speak(x.ar, { rate: settings.speechRate })}
            />
          </Row>
        </Card>
      ))}

      <SectionTitle icon="podium-outline">Ordinals</SectionTitle>
      <Card>
        {Array.from({ length: 10 }, (_, i) => ordinal(i + 1)).map((o) => (
          <Row key={o.en} gap={10}>
            <Text
              {...webLang('ar', 'rtl')}
              style={{ fontFamily: AR_FONT, fontSize: 22, color: c.text, minWidth: 80, textAlign: 'right' }}>
              {o.ar}
            </Text>
            {settings.showTranslit && <TrText size={14}>{translitLine(o.ar, settings.translitStyle)}</TrText>}
            <AppText size={14}>= {o.en}</AppText>
          </Row>
        ))}
      </Card>

      <SectionTitle icon="time-outline">Clock times</SectionTitle>
      {(
        [
          [1, 0],
          [3, 0],
          [5, 15],
          [7, 30],
          [11, 45],
        ] as const
      ).map(([h, m]) => {
        const t = clockTime(h, m);
        return (
          <Card key={`${h}${m}`} style={{ paddingVertical: 8 }}>
            <TapText text={t.ar} size={22} />
            <AppText size={14}>{t.en}</AppText>
          </Card>
        );
      })}
    </Screen>
  );
}
