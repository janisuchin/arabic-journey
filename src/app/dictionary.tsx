import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { IconButton, AppText, ArText, Pill, Row, Screen, SectionTitle, TrText } from '@/components/ui';
import { vocabulary } from '@/content';
import { dictionary, searchDictionary, type DictWord } from '@/content/dictionary';
import type { Vocab } from '@/content/schema';
import { normaliseAnswer } from '@/core/answer';
import { translit } from '@/core/translit';
import { translitLine } from '@/lang/ar/tap';
import { tts } from '@/services/tts';
import { SearchBox } from '@/features/search';
import { WordCard, wordColour } from '@/features/lesson';
import { usePalette, useSettings } from '@/state/hooks';

const topicLabel = (t: string) => t.replace(/[-_]/g, ' ').replace(/^./, (x) => x.toUpperCase());

/**
 * Two views, as in the other Journey apps: Dictionary (5,000 common words, most frequent first, search in Arabic,
 * transliteration or English) and Vocabulary (?view=course: the course words grouped by topic).
 */
export default function Dictionary() {
  const params = useLocalSearchParams<{ q?: string; view?: string }>();
  return params.view === 'course' ? <CourseVocabulary q0={params.q} /> : <WordList q0={params.q} />;
}

const POS_NAMES: Record<string, string> = {
  adj: 'adjective',
  prep: 'preposition',
  conj: 'conjunction',
  interj: 'interjection',
};

/** Course words keep their full course card (photo, example, forms); verbs are matched by their past tense. */
let courseByForm: Map<string, Vocab> | null = null;
function courseCard(w: DictWord): Vocab | undefined {
  if (!courseByForm) {
    courseByForm = new Map();
    for (const v of vocabulary) {
      const past = v.pos === 'verb' ? v.forms?.find((f) => f.label === 'past')?.ar : undefined;
      for (const f of [past, v.ar]) if (f && !courseByForm.has(`${f}|${v.pos}`)) courseByForm.set(`${f}|${v.pos}`, v);
    }
  }
  return courseByForm.get(`${w.ar}|${w.pos}`);
}

function DictRow({ w }: { w: DictWord }) {
  const c = usePalette();
  const settings = useSettings();
  const style = settings.translitStyle;
  const colour = wordColour({ gender: w.gender || undefined, pos: w.pos } as Vocab, c.text);
  const say = () => tts.speak(w.present ? `${w.ar}، ${w.present}` : w.ar, { rate: settings.speechRate });
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${translitLine(w.ar, style)}, ${w.en}`}
      testID={`dict-word-${w.rank}`}
      onPress={() => settings.readAloudOnTap && say()}
      style={{
        flexDirection: 'row',
        gap: 10,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: c.border,
        alignItems: 'flex-start',
      }}>
      <View style={{ flex: 1 }}>
        <Row wrap gap={8} style={{ alignItems: 'baseline' }}>
          <ArText size={26} bold color={colour}>
            {w.ar}
          </ArText>
          {w.present ? <ArText size={20}>{w.present}</ArText> : null}
        </Row>
        {settings.showTranslit && (
          <TrText>
            {[w.ar, w.present]
              .filter(Boolean)
              .map((f) => translitLine(f, style))
              .join(' – ')}
          </TrText>
        )}
        <AppText weight="700">{w.en}</AppText>
        {w.plural ? (
          <Row gap={6}>
            <AppText size={13} muted>
              plural:
            </AppText>
            <ArText size={18}>{w.plural}</ArText>
            {settings.showTranslit && <TrText size={13}>{translitLine(w.plural, style)}</TrText>}
          </Row>
        ) : null}
        <Row wrap gap={6} style={{ marginTop: 4 }}>
          {w.gender ? <Pill label={w.gender === 'm' ? 'masculine' : 'feminine'} /> : null}
          <Pill label={POS_NAMES[w.pos] ?? w.pos} />
          {w.course ? <Pill label="in the course" /> : null}
        </Row>
      </View>
      <IconButton icon="volume-high" label={`Play ${translitLine(w.ar, style)}`} testID={`dict-play-${w.rank}`} onPress={say} />
    </Pressable>
  );
}

function WordList({ q0 }: { q0?: string }) {
  const [q, setQ] = useState(q0 ?? '');
  const [limit, setLimit] = useState(100);
  const total = dictionary().length;
  const list = useMemo(() => searchDictionary(q, q.trim() ? 100 : limit), [q, limit]);
  return (
    <Screen title="Dictionary" testID="dictionary" scroll={false}>
      <FlatList
        data={list}
        keyExtractor={(w) => String(w.rank)}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
        ListHeaderComponent={
          <View style={{ gap: 8, marginBottom: 6 }}>
            <SearchBox value={q} onChange={setQ} />
            <AppText muted testID="dict-count">
              {q.trim()
                ? `${list.length >= 100 ? 'First 100' : list.length} matches of ${total.toLocaleString('en')} words`
                : `${total.toLocaleString('en')} words · most frequent first`}
            </AppText>
          </View>
        }
        renderItem={({ item }) => {
          const v = item.course ? courseCard(item) : undefined;
          return v ? (
            <View style={{ paddingVertical: 4 }}>
              <WordCard v={v} compact />
            </View>
          ) : (
            <DictRow w={item} />
          );
        }}
        ListEmptyComponent={<AppText muted>No word found. Try a shorter search or another spelling.</AppText>}
        ListFooterComponent={
          <View style={{ gap: 8, paddingVertical: 12 }}>
            {!q.trim() && limit < total ? (
              <Pressable accessibilityRole="button" testID="dict-more" onPress={() => setLimit((n) => n + 200)}>
                <AppText weight="700" color={undefined}>
                  Show more words ▾
                </AppText>
              </Pressable>
            ) : null}
            <AppText size={12} muted>
              Words and meanings: English Wiktionary (kaikki.org), frequency: OpenSubtitles via FrequencyWords; CC BY-SA 4.0.
              Checked by AI review, not by a human teacher. Words marked “in the course” open their course card.
            </AppText>
          </View>
        }
        initialNumToRender={20}
        windowSize={7}
      />
    </Screen>
  );
}

/** Vocabulary: the course words grouped by topic, with a topic filter. */
function CourseVocabulary({ q0 }: { q0?: string }) {
  const c = usePalette();
  const [q, setQ] = useState(q0 ?? '');
  const [topic, setTopic] = useState<string | null>(null);
  const results = useMemo(() => {
    const n = normaliseAnswer(q);
    const found = !n
      ? vocabulary
      : vocabulary.filter((v) => {
          const fields = [
            v.ar,
            v.en,
            translit(v.ar, { style: 'simple', sentence: false }),
            translit(v.ar, { sentence: false }),
            v.plural ?? '',
          ];
          return fields.some((f) => normaliseAnswer(f).includes(n));
        });
    return found;
  }, [q]);
  const topics = useMemo(() => {
    const m = new Map<string, Vocab[]>();
    for (const v of results) {
      const t = v.topic ?? 'other';
      m.set(t, [...(m.get(t) ?? []), v]);
    }
    return [...m.entries()];
  }, [results]);
  const shown = topic ? topics.filter(([t]) => t === topic) : topics;
  return (
    <Screen title="Vocabulary by topic" testID="vocabulary">
      <SearchBox value={q} onChange={setQ} />
      <AppText muted testID="dict-count">
        {results.length} of {vocabulary.length} course words · {topics.length} topics
      </AppText>
      <>
        <Row wrap gap={6}>
          {[null, ...topics.map(([t]) => t)].map((t) => (
            <Pressable
              key={t ?? 'all'}
              accessibilityRole="button"
              accessibilityState={{ selected: topic === t }}
              onPress={() => setTopic(t)}
              style={{
                minHeight: 36,
                paddingHorizontal: 10,
                justifyContent: 'center',
                borderRadius: 18,
                borderWidth: 1,
                borderColor: topic === t ? c.accent : c.border,
                backgroundColor: topic === t ? c.accentSoft : c.card,
              }}>
              <AppText size={13}>{t ? `${topicLabel(t)} (${topics.find(([x]) => x === t)![1].length})` : 'All topics'}</AppText>
            </Pressable>
          ))}
        </Row>
        {shown.map(([t, words]) => (
          <View key={t} style={{ gap: 8 }} testID={`topic-${t}`}>
            <SectionTitle icon="pricetag-outline">{`${topicLabel(t)} · ${words.length}`}</SectionTitle>
            {words.map((v) => (
              <WordCard key={v.id} v={v} compact />
            ))}
          </View>
        ))}
      </>
    </Screen>
  );
}
