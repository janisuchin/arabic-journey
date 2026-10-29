import { useLocalSearchParams } from 'expo-router';

import { AppText, Screen } from '@/components/ui';
import { grammarById } from '@/content';
import { GrammarBody } from '@/features/grammar';

export default function GrammarPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const g = grammarById.get(id);
  return (
    <Screen title="Grammar" testID="grammar-page">
      {g ? <GrammarBody g={g} /> : <AppText>Unknown grammar rule.</AppText>}
    </Screen>
  );
}
