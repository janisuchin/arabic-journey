// Placards: quick-reference cards for revision (open one for a large view to print or share).
import { router } from 'expo-router';
import { View } from 'react-native';

import { TapText } from '@/components/tap';
import { AppText, Card, Icon, Row, Screen, type IconName } from '@/components/ui';
import { placards } from '@/content';

export default function Placards() {
  return (
    <Screen title="Placards" testID="placards">
      <AppText muted>
        Quick-reference cards for revision. Every Arabic word can be tapped to hear it and see its meaning. Open a card for a
        large view you can print or share.
      </AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {placards.map((p) => (
          <Card
            key={p.id}
            onPress={() => router.push({ pathname: '/placards/[id]', params: { id: p.id } })}
            label={`${p.title}. ${p.description}`}
            testID={`placard-${p.id}`}
            style={{ width: '47%', minWidth: 150, flexGrow: 1, gap: 4 }}>
            <Row>
              <Icon name={p.icon as IconName} size={26} />
              <AppText weight="800" style={{ flex: 1 }}>
                {p.title}
              </AppText>
            </Row>
            <TapText text={p.titleAr} segs={p.titleSegs} size={20} interactive={false} />
            <AppText size={13} muted numberOfLines={3}>
              {`${p.items.length ? `${p.items.length} items` : 'Table'}${p.table && p.items.length ? ' + table' : ''}`}
            </AppText>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
