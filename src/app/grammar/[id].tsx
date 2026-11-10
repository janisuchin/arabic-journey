import { router, useLocalSearchParams } from 'expo-router';

import { AppText, Button, Screen } from '@/components/ui';
import { days, grammarById } from '@/content';
import { GrammarBody } from '@/features/grammar';

const sentencesFor = (id: string) => days.reduce((n, d) => n + d.sentences.filter((s) => s.grammar.includes(id)).length, 0);

export default function GrammarPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const g = grammarById.get(id);
  return (
    <Screen title="Grammar" testID="grammar-page">
      {g ? <GrammarBody g={g} /> : <AppText>Unknown grammar rule.</AppText>}
      {g && sentencesFor(g.id) > 0 && (
        <Button
          kind="secondary"
          icon="git-branch-outline"
          label={`See ${sentencesFor(g.id)} course sentences with this rule`}
          onPress={() => router.push({ pathname: '/explorer', params: { grammar: g.id } })}
          testID="grammar-explorer"
        />
      )}
    </Screen>
  );
}
