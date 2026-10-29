import { router } from 'expo-router';
import { Text } from 'react-native';

import { AppText, Card, Row, Screen } from '@/components/ui';
import { scenarios } from '@/content';

export default function Scenarios() {
  return (
    <Screen title="Scenarios" testID="scenarios">
      <AppText muted>Real-life situations with a dialogue, common mistakes and a short quiz.</AppText>
      {scenarios.map((s) => (
        <Card
          key={s.id}
          onPress={() => router.push({ pathname: '/scenarios/[id]', params: { id: s.id } })}
          label={s.title}
          testID={`scenario-${s.id}`}>
          <Row gap={12}>
            <Text style={{ fontSize: 34 }}>{s.emoji}</Text>
            <AppText size={18} weight="800" style={{ flex: 1 }}>
              {s.title}
            </AppText>
          </Row>
        </Card>
      ))}
      <AppText size={12} muted>
        {scenarios.length} of the 27 planned scenarios are available in this version.
      </AppText>
    </Screen>
  );
}
