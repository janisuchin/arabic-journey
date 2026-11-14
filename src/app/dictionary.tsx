import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText, Row, Screen, SectionTitle } from '@/components/ui';
import { vocabulary } from '@/content';
import type { Vocab } from '@/content/schema';
import { normaliseAnswer } from '@/core/answer';
import { translit } from '@/core/translit';
import { SearchBox } from '@/features/search';
import { WordCard } from '@/features/lesson';
import { usePalette } from '@/state/hooks';

const topicLabel = (t: string) => t.replace(/[-_]/g, ' ').replace(/^./, (x) => x.toUpperCase());

/**
 * Two views of the course words: Dictionary (one searchable A–Z list) and Vocabulary (?view=course: the same words
 * grouped by topic, with a topic filter), as in the other Journey apps.
 */
export default function Dictionary() {
  const params = useLocalSearchParams<{ q?: string; view?: string }>();
  const byTopic = params.view === 'course';
  const c = usePalette();
  const [q, setQ] = useState(params.q ?? '');
  const [topic, setTopic] = useState<string | null>(null);
  const results = useMemo(() => {
    const n = normaliseAnswer(q);
    const found = !n
      ? vocabulary
      : vocabulary.filter((v) => {
          const fields = [
            v.ar,
            v.en,
            translit(v.ar, { style: 'simple', sentence: false }),
            translit(v.ar, { sentence: false }),
            v.plural ?? '',
          ];
          return fields.some((f) => normaliseAnswer(f).includes(n));
        });
    return byTopic ? found : [...found].sort((a, b) => a.en.localeCompare(b.en, 'en'));
  }, [q, byTopic]);
  const topics = useMemo(() => {
    const m = new Map<string, Vocab[]>();
    for (const v of results) {
      const t = v.topic ?? 'other';
      m.set(t, [...(m.get(t) ?? []), v]);
    }
    return [...m.entries()];
  }, [results]);
  const shown = topic ? topics.filter(([t]) => t === topic) : topics;
  return (
    <Screen title={byTopic ? 'Vocabulary by topic' : 'Dictionary'} testID="dictionary">
      <SearchBox value={q} onChange={setQ} />
      <AppText muted testID="dict-count">
        {results.length} of {vocabulary.length} course words{byTopic ? ` · ${topics.length} topics` : ' · A–Z by meaning'}
      </AppText>
      {byTopic ? (
        <>
          <Row wrap gap={6}>
            {[null, ...topics.map(([t]) => t)].map((t) => (
              <Pressable
                key={t ?? 'all'}
                accessibilityRole="button"
                accessibilityState={{ selected: topic === t }}
                onPress={() => setTopic(t)}
                style={{
                  minHeight: 36,
                  paddingHorizontal: 10,
                  justifyContent: 'center',
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: topic === t ? c.accent : c.border,
                  backgroundColor: topic === t ? c.accentSoft : c.card,
                }}>
                <AppText size={13}>{t ? `${topicLabel(t)} (${topics.find(([x]) => x === t)![1].length})` : 'All topics'}</AppText>
              </Pressable>
            ))}
          </Row>
          {shown.map(([t, words]) => (
            <View key={t} style={{ gap: 8 }} testID={`topic-${t}`}>
              <SectionTitle icon="pricetag-outline">{`${topicLabel(t)} · ${words.length}`}</SectionTitle>
              {words.map((v) => (
                <WordCard key={v.id} v={v} compact />
              ))}
            </View>
          ))}
        </>
      ) : (
        results.map((v) => <WordCard key={v.id} v={v} compact />)
      )}
      <AppText size={12} muted>
        This version contains the course vocabulary only. The larger 5,000-word dictionary is planned next.
      </AppText>
    </Screen>
  );
}
