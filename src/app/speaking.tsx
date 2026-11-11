// Speaking lab (Prompt B sections K–L): say course sentences and dialogue lines aloud — listen to the model, speak,
// optionally let the browser's recogniser check the words (after consent), record yourself and compare, then
// check yourself. Speaking practice never counts towards quiz or test scores.
import { useMemo, useState } from 'react';

import { SpeakPractice, type SpeakResult } from '@/components/speak';
import { AppText, Button, Card, Pill, Row, Screen } from '@/components/ui';
import { days } from '@/content';
import type { Seg } from '@/content/schema';
import { useProgressInput } from '@/state/hooks';

type Source = 'sentences' | 'dialogue' | 'starter';
interface Item {
  id: string;
  ar: string;
  en: string;
  segs: Seg[];
  audio?: string;
  day: number;
}

const SOURCES: { key: Source; label: string }[] = [
  { key: 'sentences', label: 'My sentences' },
  { key: 'dialogue', label: 'My dialogue lines' },
  { key: 'starter', label: 'Starter (days 1–3)' },
];

export default function Speaking() {
  const progress = useProgressInput();
  const [source, setSource] = useState<Source>('sentences');
  const [i, setI] = useState(0);
  const [tally, setTally] = useState({ clear: 0, again: 0 });

  const { items, fallback } = useMemo(() => {
    const sentenceItems = (ds: typeof days): Item[] =>
      ds.flatMap((d) => d.sentences.map((s) => ({ id: s.id, ar: s.ar, en: s.en, segs: s.segs, audio: s.speak, day: d.day })));
    const learned = days.filter((d) => progress.completedDays.has(d.day));
    const starter = sentenceItems(days.filter((d) => d.day <= 3));
    if (source === 'starter') return { items: starter, fallback: false };
    const list =
      source === 'sentences'
        ? sentenceItems(learned)
        : learned.flatMap((d) => d.dialogue.lines.map((l): Item => ({ id: l.id, ar: l.ar, en: l.en, segs: l.segs, day: d.day })));
    return list.length ? { items: list, fallback: false } : { items: starter, fallback: true };
  }, [progress.completedDays, source]);

  const k = items.length ? i % items.length : 0;
  const item = items[k];
  const done = (r: SpeakResult) => {
    setTally((t) => ({ ...t, [r]: t[r] + 1 }));
    setI((x) => x + 1);
  };

  return (
    <Screen title="Speaking lab" testID="speaking">
      <AppText muted>
        Listen to the model, say the sentence aloud, then check yourself. Speaking practice is never part of your quiz or test
        scores.
      </AppText>
      <Card>
        <AppText weight="800">Honest feedback</AppText>
        <AppText size={14}>
          Speech recognition (where your browser has it, and only if you allow it) shows which words it wrote down. It does not
          measure individual sounds, and it can be wrong for learners&apos; accents or quiet speech. Your own ear, comparing your
          recording with the model, is a good judge. The model voice is your device&apos;s text-to-speech, not a native-speaker
          recording.
        </AppText>
      </Card>
      <Row wrap>
        {SOURCES.map((s) => (
          <Pill
            key={s.key}
            label={s.label}
            off={source !== s.key}
            onPress={() => {
              setSource(s.key);
              setI(0);
            }}
            testID={`speak-src-${s.key}`}
          />
        ))}
      </Row>
      {fallback && (
        <AppText size={13} muted testID="speak-fallback">
          You haven&apos;t finished a day yet, so here are the starter sentences from days 1–3.
        </AppText>
      )}
      {item ? (
        <>
          <AppText size={13} muted testID="speak-position">
            Day {item.day} · {k + 1} of {items.length}
          </AppText>
          <SpeakPractice
            key={`${source}-${item.id}`}
            ar={item.ar}
            en={item.en}
            segs={item.segs}
            audio={item.audio}
            onDone={done}
          />
          <Row wrap>
            <Button
              kind="ghost"
              icon="play-skip-forward-outline"
              label="Skip"
              onPress={() => setI((x) => x + 1)}
              testID="speak-skip"
            />
          </Row>
          <AppText size={13} muted testID="speak-tally">
            This session: {tally.clear} said clearly · {tally.again} to practise again
          </AppText>
        </>
      ) : (
        <AppText muted>No sentences are available yet.</AppText>
      )}
    </Screen>
  );
}
