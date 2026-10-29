import { Pressable, Text, TextInput, View } from 'react-native';

import { webLang } from '../base/rtl';
import { AR_FONT, IconButton, Row } from '../components/ui';
import { usePalette } from '../state/hooks';

/** Letters that are awkward to type on an English keyboard. */
const SPECIAL_KEYS = ['ء', 'أ', 'إ', 'آ', 'ة', 'ى', 'ث', 'ح', 'خ', 'ذ', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ق'];

export function SearchBox({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (s: string) => void;
  onSubmit?: () => void;
}) {
  const c = usePalette();
  return (
    <View style={{ gap: 8 }}>
      <Row style={{ backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.border, paddingHorizontal: 6 }}>
        <TextInput
          testID="search-input"
          accessibilityLabel="Search in Arabic, English or transliteration"
          placeholder="Search: كِتَاب, book, kitab…"
          placeholderTextColor={c.textMuted}
          value={value}
          onChangeText={onChange}
          onSubmitEditing={onSubmit}
          style={{ flex: 1, minHeight: 48, color: c.text, fontSize: 17, textAlign: 'right', writingDirection: 'auto' as never }}
          {...webLang('ar', 'rtl')}
          {...({ dir: 'auto' } as object)}
        />
        {value.length > 0 && <IconButton icon="close-circle" label="Clear search" onPress={() => onChange('')} />}
      </Row>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
        {SPECIAL_KEYS.map((k) => (
          <Pressable
            key={k}
            accessibilityRole="button"
            accessibilityLabel={`type ${k}`}
            onPress={() => onChange(value + k)}
            style={{
              minWidth: 44,
              minHeight: 44,
              borderRadius: 10,
              backgroundColor: c.cardAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text {...webLang('ar', 'rtl')} style={{ fontFamily: AR_FONT, fontSize: 20, color: c.text }}>
              {k}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
