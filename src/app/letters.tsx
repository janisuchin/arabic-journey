import { View } from 'react-native';

import { AppText, Screen } from '@/components/ui';
import { letters } from '@/content';
import { LetterTile } from '@/features/script';

export default function Letters() {
  return (
    <Screen title="Letters" testID="letters">
      <AppText muted>
        Arabic is written from right to left. Most letters join the next letter and change shape: isolated, initial, medial and
        final. Six letters (ا د ذ ر ز و) never join the letter after them.
      </AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {letters.map((l) => (
          <View key={l.id} style={{ width: '31%', flexGrow: 1 }}>
            <LetterTile letter={l} small />
          </View>
        ))}
      </View>
    </Screen>
  );
}
