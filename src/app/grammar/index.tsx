import { router } from 'expo-router';

import { RichText, TapText } from '@/components/tap';
import { AppText, Card, Screen } from '@/components/ui';
import { grammar } from '@/content';

export default function GrammarIndex() {
  return (
    <Screen title="Grammar" testID="grammar-index">
      {grammar.map((g) => (
        <Card key={g.id} onPress={() => router.push({ pathname: '/grammar/[id]', params: { id: g.id } })} label={g.id}>
          <RichText text={g.title} size={17} />
          <TapText text={g.titleAr} size={20} interactive={false} />
          <AppText size={13} muted>
            First taught on day {g.firstDay}
          </AppText>
        </Card>
      ))}
    </Screen>
  );
}
