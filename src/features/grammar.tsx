import { View } from 'react-native';

import { hasScript } from '../core/arabic';
import type { Grammar } from '../content/schema';
import { RichText, TapText } from '../components/tap';
import { AppText, Card } from '../components/ui';
import { usePalette, useSettings } from '../state/hooks';

/** A grammar rule: pattern, summary card, formula, explanation, table and examples. */
export function GrammarBody({ g, short }: { g: Grammar; short?: boolean }) {
  const c = usePalette();
  const settings = useSettings();
  return (
    <View style={{ gap: 10 }} testID={`grammar-${g.id}`}>
      <RichText text={g.title} size={20} />
      <TapText text={g.titleAr} size={24} bold />
      <Card accent>
        <AppText weight="800">In short</AppText>
        <AppText>{g.summary}</AppText>
        <View style={{ backgroundColor: c.card, borderRadius: 10, padding: 8 }}>
          <RichText text={g.formula} size={15} />
        </View>
      </Card>
      {!short && (
        <Card>
          <RichText text={g.explanation} />
        </Card>
      )}
      <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, overflow: 'hidden' }} testID="grammar-table">
        <View style={{ flexDirection: 'row', backgroundColor: c.accentSoft }}>
          {g.table.head.map((h, i) => (
            <View key={i} style={{ flex: 1, padding: 6 }}>
              <AppText size={13} weight="800">
                {h}
              </AppText>
            </View>
          ))}
        </View>
        {g.table.rows.map((r, i) => (
          <View key={i} style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: c.border, backgroundColor: c.card }}>
            {r.map((cell, j) => (
              <View key={j} style={{ flex: 1, padding: 6 }} testID={`cell-${i}-${j}`}>
                {hasScript(cell) && !/[A-Za-z]/.test(cell) ? (
                  <TapText text={cell} size={19} floating />
                ) : hasScript(cell) ? (
                  <RichText text={cell} size={14} />
                ) : (
                  <AppText size={14}>{cell}</AppText>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
      {g.examples.map((e, i) => (
        <Card key={i}>
          <TapText text={e.ar} size={22} />
          {settings.showTranslations && <AppText>{e.en}</AppText>}
        </Card>
      ))}
    </View>
  );
}
