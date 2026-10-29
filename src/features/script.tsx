// Script lab pieces: letter tiles, contextual forms and words with a sound's letters coloured.
// Forms are shown with zero-width joiners so the font draws the real joined glyphs; a word is
// never broken into separate letters.

import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { webLang } from '../base/rtl';
import { letterForms, stripHarakat } from '../core/arabic';
import type { Letter } from '../content/schema';
import { tts } from '../services/tts';
import { useFs, usePalette, useSettings } from '../state/hooks';
import { AR_FONT, AR_FONT_BOLD, AppText, Card, Pill, Row, TrText } from '../components/ui';

export function LetterTile({ letter, small }: { letter: Letter; small?: boolean }) {
  const c = usePalette();
  const settings = useSettings();
  return (
    <Card
      testID={`letter-${letter.id}`}
      label={`letter ${letter.name}`}
      onPress={() => {
        tts.speak(letter.nameAr, { rate: settings.slowRate });
        router.push({ pathname: '/letter/[id]', params: { id: letter.id } });
      }}
      style={small ? { padding: 8, minWidth: 72, alignItems: 'center', gap: 0 } : undefined}>
      <Row style={small ? { flexDirection: 'column' } : undefined} gap={small ? 0 : 14}>
        <Text
          {...webLang('ar', 'rtl')}
          style={{
            fontFamily: AR_FONT_BOLD,
            fontSize: small ? 34 : 48,
            lineHeight: small ? 60 : 84,
            color: c.accent,
            minWidth: 48,
            textAlign: 'center',
          }}>
          {letter.char}
        </Text>
        <View style={small ? { alignItems: 'center' } : { flex: 1 }}>
          <AppText weight="800" center={small}>
            {letter.name}
          </AppText>
          {settings.showTranslit && <TrText center={small}>{letter.tr}</TrText>}
          {!small && (
            <AppText size={14} muted>
              {letter.sound}
            </AppText>
          )}
        </View>
      </Row>
      {!small && <LetterForms letter={letter} />}
    </Card>
  );
}

export function LetterForms({ letter, size = 34 }: { letter: Letter; size?: number }) {
  const c = usePalette();
  const fs = useFs();
  const f = letterForms(letter.char);
  // in an RTL row the first cell (isolated) is on the right, as a reader would expect
  const cells: [string, string | null][] = [
    ['isolated', f.isolated],
    ['initial', f.initial],
    ['medial', f.medial],
    ['final', f.final],
  ];
  return (
    <View style={{ flexDirection: 'row', gap: 6 }} testID={`forms-${letter.id}`}>
      {cells.map(([label, glyph]) => (
        <View
          key={label}
          style={{ flex: 1, alignItems: 'center', backgroundColor: c.cardAlt, borderRadius: 10, paddingVertical: 4 }}>
          <Text
            {...webLang('ar', 'rtl')}
            style={{ fontFamily: AR_FONT, fontSize: fs(size), lineHeight: fs(size) * 1.8, color: glyph ? c.text : c.textMuted }}>
            {glyph ?? '—'}
          </Text>
          <AppText size={11} muted center>
            {label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

/**
 * A word with chosen letters in the accent colour. The word stays one text run (nested spans),
 * so the browser / OS still shapes and joins it as a single word.
 */
export function ColouredWord({ word, letters, size = 28 }: { word: string; letters: string[]; size?: number }) {
  const c = usePalette();
  const fs = useFs();
  const { showHarakat } = useSettings();
  const shown = showHarakat ? word : stripHarakat(word);
  // group each base letter with its marks
  const groups: string[] = [];
  for (const ch of shown) {
    if (/[\u064B-\u065F\u0670]/.test(ch) && groups.length) groups[groups.length - 1] += ch;
    else groups.push(ch);
  }
  return (
    <Text
      {...webLang('ar', 'rtl')}
      style={{
        fontFamily: AR_FONT_BOLD,
        fontSize: fs(size),
        lineHeight: fs(size) * 1.9,
        color: c.text,
        writingDirection: 'rtl',
        textAlign: 'right',
      }}>
      {groups.map((g, i) => (
        <Text key={i} style={letters.some((l) => g.includes(l)) ? { color: c.accent } : undefined}>
          {g}
        </Text>
      ))}
    </Text>
  );
}

export function SunMoonBadge({ letter }: { letter: Letter }) {
  return <Pill label={letter.sun ? '☀️ sun letter' : '🌙 moon letter'} />;
}
