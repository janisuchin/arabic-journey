import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { AppText, ArText, Button, Card, Row, Screen, TrText } from '@/components/ui';
import { vocabById } from '@/content';
import { isDue, type Grade } from '@/core/srs';
import { translitLine } from '@/lang/ar/tap';
import { tts } from '@/services/tts';
import { useSettings } from '@/state/hooks';
import { useLearner } from '@/state/store';

export default function Flashcards() {
  const { all } = useLocalSearchParams<{ all?: string }>();
  const settings = useSettings();
  const cards = useLearner((s) => s.cards);
  const gradeCard = useLearner((s) => s.gradeCard);
  const [startedAt] = useState(() => Date.now());
  const queue = useMemo(
    () =>
      Object.values(cards)
        .filter((c) => all === '1' || isDue(c, startedAt))
        .map((c) => c.id)
        .filter((id) => vocabById.has(id)),
    // the queue is fixed when the session starts
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [all, startedAt],
  );
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const v = vocabById.get(queue[i]);
  const grade = (g: Grade) => {
    if (!v) return;
    gradeCard(v.id, g);
    setShown(false);
    setI(i + 1);
  };
  return (
    <Screen title={all === '1' ? 'Flashcards' : 'Daily review'} testID="flashcards">
      {queue.length === 0 && (
        <Card>
          <AppText weight="800">Nothing to review right now.</AppText>
          <AppText muted>Words join your reviews when you finish a day.</AppText>
        </Card>
      )}
      {v ? (
        <>
          <AppText muted>
            Card {i + 1} of {queue.length}
          </AppText>
          <Card
            style={{ alignItems: 'center', minHeight: 220, justifyContent: 'center' }}
            onPress={() => tts.speak(v.ar, { rate: settings.speechRate })}
            label="Hear the word">
            <Text style={{ fontSize: 40 }}>{v.emoji}</Text>
            <ArText size={44} bold center>
              {v.ar}
            </ArText>
            {shown && (
              <View style={{ alignItems: 'center' }}>
                {settings.showTranslit && (
                  <TrText center size={18}>
                    {translitLine(v.ar, settings.translitStyle)}
                  </TrText>
                )}
                <AppText size={20} weight="800" center testID="card-meaning">
                  {v.en}
                </AppText>
              </View>
            )}
          </Card>
          {!shown ? (
            <Button label="Show answer" testID="show-answer" onPress={() => setShown(true)} />
          ) : (
            <Row wrap gap={8}>
              <Button kind="ghost" label="Again" onPress={() => grade('again')} style={{ flexGrow: 1 }} />
              <Button kind="secondary" label="Hard" onPress={() => grade('hard')} style={{ flexGrow: 1 }} />
              <Button label="Good" testID="grade-good" onPress={() => grade('good')} style={{ flexGrow: 1 }} />
              <Button kind="secondary" label="Easy" onPress={() => grade('easy')} style={{ flexGrow: 1 }} />
            </Row>
          )}
        </>
      ) : (
        queue.length > 0 && (
          <Card accent>
            <AppText weight="800">✓ Session complete. {queue.length} cards reviewed.</AppText>
          </Card>
        )
      )}
    </Screen>
  );
}
