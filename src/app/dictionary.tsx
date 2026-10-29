import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';

import { AppText, Screen } from '@/components/ui';
import { vocabulary } from '@/content';
import { normaliseAnswer } from '@/core/answer';
import { translit } from '@/core/translit';
import { SearchBox } from '@/features/search';
import { WordCard } from '@/features/lesson';

export default function Dictionary() {
  const params = useLocalSearchParams<{ q?: string; view?: string }>();
  const [q, setQ] = useState(params.q ?? '');
  const results = useMemo(() => {
    const n = normaliseAnswer(q);
    if (!n) return vocabulary;
    return vocabulary.filter((v) => {
      const fields = [
        v.ar,
        v.en,
        translit(v.ar, { style: 'simple', sentence: false }),
        translit(v.ar, { sentence: false }),
        v.plural ?? '',
      ];
      return fields.some((f) => normaliseAnswer(f).includes(n));
    });
  }, [q]);
  return (
    <Screen title={params.view === 'course' ? 'Course vocabulary' : 'Dictionary'} testID="dictionary">
      <SearchBox value={q} onChange={setQ} />
      <AppText muted testID="dict-count">
        {results.length} of {vocabulary.length} course words
      </AppText>
      {results.map((v) => (
        <WordCard key={v.id} v={v} compact />
      ))}
      <AppText size={12} muted>
        This version contains the course vocabulary only. The planned 5,000-word dictionary is not included yet.
      </AppText>
    </Screen>
  );
}
