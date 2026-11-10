// One placard: table, word list with audio, example and related grammar. Large display mode and
// print (web) / share (phone).
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, Share, View } from 'react-native';

import { RichText, TapText } from '@/components/tap';
import { AppText, Button, Card, IconButton, Pill, Row, Screen } from '@/components/ui';
import { grammarById, placardById } from '@/content';
import type { PlacardItem } from '@/content/schema';
import { hasScript } from '@/core/arabic';
import { tts } from '@/services/tts';
import { usePalette, useSettings } from '@/state/hooks';

function ItemRow({ it, large, testID }: { it: PlacardItem; large: boolean; testID: string }) {
  const c = usePalette();
  const settings = useSettings();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: c.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: c.border,
        padding: large ? 16 : 12,
      }}>
      <View style={{ flex: 1, gap: 2 }}>
        <TapText text={it.ar} segs={it.segs} size={large ? 34 : 24} testID={testID} />
        {settings.showTranslations && (
          <AppText size={large ? 18 : 15} weight="700">
            {it.en}
          </AppText>
        )}
        {it.note ? <RichText text={it.note} size={13} muted /> : null}
      </View>
      <IconButton
        icon="volume-high"
        label={`Play: ${it.en}`}
        size={large ? 30 : 22}
        onPress={() => tts.speak(it.ar, { rate: settings.speechRate })}
      />
    </View>
  );
}

export default function PlacardPage() {
  const c = usePalette();
  const settings = useSettings();
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = placardById.get(id);
  const [large, setLarge] = useState(false);
  if (!p)
    return (
      <Screen title="Placard">
        <AppText>Placard not found.</AppText>
      </Screen>
    );
  const lines = [...p.items, ...(p.example ? [p.example] : [])];
  const asText = () =>
    [
      `${p.title} — ${p.titleAr}`,
      p.description,
      '',
      ...(p.table ? [p.table.head.join(' | '), ...p.table.rows.map((r) => r.join(' | ')), ''] : []),
      ...lines.map((it) => `${it.ar} — ${it.en}${it.note ? ` (${it.note})` : ''}`),
    ].join('\n');
  const exportCard = async () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') window.print();
    else await Share.share({ message: asText(), title: p.title });
  };
  return (
    <Screen title={p.title} testID="placard">
      <Row wrap>
        <Button
          kind="secondary"
          icon={large ? 'contract-outline' : 'expand-outline'}
          label={large ? 'Normal size' : 'Large display'}
          onPress={() => setLarge(!large)}
          testID="placard-large"
        />
        <Button
          kind="secondary"
          icon={Platform.OS === 'web' ? 'print-outline' : 'share-outline'}
          label={Platform.OS === 'web' ? 'Print' : 'Share / export'}
          onPress={exportCard}
        />
      </Row>
      <TapText text={p.titleAr} segs={p.titleSegs} size={large ? 34 : 28} bold />
      <RichText text={p.description} size={15} muted />
      {p.table && (
        <View style={{ gap: 6 }}>
          {p.table.caption ? <RichText text={p.table.caption} size={13} muted /> : null}
          <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, overflow: 'hidden' }} testID="placard-table">
            <View style={{ flexDirection: 'row', backgroundColor: c.accentSoft }}>
              {p.table.head.map((h, i) => (
                <View key={i} style={{ flex: 1, padding: 6 }}>
                  <AppText size={13} weight="800">
                    {h}
                  </AppText>
                </View>
              ))}
            </View>
            {p.table.rows.map((r, i) => (
              <View key={i} style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: c.border, backgroundColor: c.card }}>
                {r.map((cell, j) => (
                  <View key={j} style={{ flex: 1, padding: 6, justifyContent: 'center' }}>
                    {hasScript(cell) && !/[A-Za-z]/.test(cell) ? (
                      <TapText text={cell} size={large ? 28 : 22} floating showTranslit={false} />
                    ) : hasScript(cell) ? (
                      <RichText text={cell} size={14} />
                    ) : (
                      <AppText size={large ? 18 : 14} style={{ fontStyle: 'italic', color: c.translit }}>
                        {cell}
                      </AppText>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      )}
      <View style={{ gap: 8 }}>
        {p.items.map((it, i) => (
          <ItemRow key={i} it={it} large={large} testID={`placard-item-${i}`} />
        ))}
      </View>
      {p.example && (
        <Card accent testID="placard-example">
          <AppText weight="800">Example</AppText>
          <TapText text={p.example.ar} segs={p.example.segs} size={large ? 30 : 24} />
          {settings.showTranslations && <AppText weight="700">{p.example.en}</AppText>}
          {p.example.note ? <RichText text={p.example.note} size={13} muted /> : null}
          <IconButton
            icon="volume-high"
            label="Play the example"
            onPress={() => tts.speak(p.example!.ar, { rate: settings.speechRate })}
          />
        </Card>
      )}
      {p.grammar?.length ? (
        <Row wrap gap={6}>
          {p.grammar.map((g) => (
            <Pill
              key={g}
              label={`📘 ${grammarById.get(g)?.title ?? g}`}
              onPress={() => router.push({ pathname: '/grammar/[id]', params: { id: g } })}
            />
          ))}
        </Row>
      ) : null}
      <AppText size={12} muted>
        Status: {p.status === 'approved' ? 'reviewed' : 'written by the course author, waiting for a teacher review'}.
      </AppText>
    </Screen>
  );
}
