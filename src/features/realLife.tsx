// The "In real life" card on a day's start page (Prompt B sections H, L and M): the day's story, one licensed
// Wikimedia Commons photo (© badge, listed on Credits) and the day's new words as tappable chips. Tapping a chip
// reads the word aloud and opens its word box, exactly like a word in a sentence.
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { PhotoFrame } from '@/components/photo';
import { RichText, WordBox } from '@/components/tap';
import { AppText, ArText, Caption, Card, Row, TrText } from '@/components/ui';
import { vocabById } from '@/content';
import type { Day, Vocab } from '@/content/schema';
import { translitLine, wordToken, type WordInfo } from '@/lang/ar/tap';
import { tts } from '@/services/tts';
import { usePalette, useSettings } from '@/state/hooks';

export function RealLifeCard({ d }: { d: Day }) {
  const c = usePalette();
  const settings = useSettings();
  const [open, setOpen] = useState<WordInfo | null>(null);
  const words = d.newWords.map((id) => vocabById.get(id)).filter((v): v is Vocab => !!v);
  return (
    <Card testID="real-life">
      <Row>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            backgroundColor: c.cardAlt,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{ fontSize: 32 }}>{d.realLife.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Caption>In real life</Caption>
          <AppText weight="800">{d.realLife.title}</AppText>
        </View>
      </Row>
      <View testID="real-life-photo">
        <PhotoFrame photo={d.realLife.photo} aspectRatio={3 / 2} />
      </View>
      <RichText text={d.realLife.story} />
      {words.length > 0 && (
        <>
          <AppText size={13} muted>
            Today&apos;s words · tap one to hear it
          </AppText>
          <Row wrap gap={8}>
            {words.map((v) => {
              const tr = v.tr ?? translitLine(v.ar, settings.translitStyle);
              const selected = open?.word === v.ar;
              return (
                <Pressable
                  key={v.id}
                  testID={`real-life-chip-${v.id}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${tr}, ${v.en}`}
                  accessibilityState={{ selected }}
                  hitSlop={4}
                  onPress={() => {
                    if (settings.readAloudOnTap) tts.speak(v.ar, { rate: settings.speechRate });
                    setOpen(wordToken(v.ar, settings.translitStyle, tr, v.en));
                  }}
                  style={{ minHeight: 44, justifyContent: 'center' }}>
                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: selected ? c.accent : c.border,
                      backgroundColor: selected ? c.accentSoft : c.cardAlt,
                      alignItems: 'center',
                    }}>
                    <ArText size={20} bold color={selected ? c.accent : c.text}>
                      {v.ar}
                    </ArText>
                    {settings.showTranslit && <TrText size={12}>{tr}</TrText>}
                  </View>
                </Pressable>
              );
            })}
          </Row>
        </>
      )}
      {open && <WordBox info={open} floating onClose={() => setOpen(null)} />}
    </Card>
  );
}
