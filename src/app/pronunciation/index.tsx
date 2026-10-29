import { router } from 'expo-router';

import { RichText } from '@/components/tap';
import { AppText, Card, Pill, Row, Screen } from '@/components/ui';
import { pronunciation } from '@/content';

export default function PronunciationLab() {
  return (
    <Screen title="Pronunciation lab" testID="pron-lab">
      <AppText muted>Every sound in the course, with a tip, examples and the most common error.</AppText>
      {pronunciation.map((p) => (
        <Card key={p.id} onPress={() => router.push({ pathname: '/pronunciation/[id]', params: { id: p.id } })} label={p.id}>
          <RichText text={p.title} size={17} />
          <Row wrap gap={6}>
            <Pill label={p.category} />
            {p.ipa.map((x) => (
              <Pill key={x} label={`/${x}/`} />
            ))}
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
