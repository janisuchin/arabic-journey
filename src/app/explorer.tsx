// Sentence explorer: every glossed sentence in the course (lesson sentences, dialogue lines and
// scenario lines), searchable in Arabic (with or without vowel marks), transliteration or English.
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { AppText, Button, Pill, Row, Screen } from '@/components/ui';
import { days, grammarById, scenarios } from '@/content';
import type { Sentence } from '@/content/schema';
import { normaliseAnswer } from '@/core/answer';
import { translit } from '@/core/translit';
import { SearchBox } from '@/features/search';
import { SentenceCard } from '@/features/lesson';

type Kind = 'lesson' | 'dialogue' | 'scenario';
interface Entry {
  key: string;
  kind: Kind;
  s: Sentence;
  day?: number;
  scenario?: { id: string; title: string };
  /** Arabic (no vowel marks) + English + word glosses, normalised */
  hay: string;
}

const KINDS: { kind: Kind | null; label: string }[] = [
  { kind: null, label: 'All' },
  { kind: 'lesson', label: 'Lesson sentences' },
  { kind: 'dialogue', label: 'Dialogues' },
  { kind: 'scenario', label: 'Scenarios' },
];
const PAGE = 30;

function buildEntries(): Entry[] {
  const out: Entry[] = [];
  const add = (e: Omit<Entry, 'hay'>) =>
    out.push({ ...e, hay: normaliseAnswer([e.s.ar, e.s.en, ...e.s.segs.map((x) => x[1])].join(' | ')) });
  for (const d of days) {
    for (const s of d.sentences) add({ key: s.id, kind: 'lesson', s, day: d.day });
    for (const l of d.dialogue.lines)
      add({ key: l.id, kind: 'dialogue', s: { id: l.id, ar: l.ar, en: l.en, segs: l.segs, grammar: [] }, day: d.day });
  }
  for (const sc of scenarios)
    for (const l of sc.dialogue.lines)
      add({
        key: `${sc.id}-${l.id}`,
        kind: 'scenario',
        s: { id: `${sc.id}-${l.id}`, ar: l.ar, en: l.en, segs: l.segs, grammar: [] },
        scenario: { id: sc.id, title: sc.title },
      });
  return out;
}

let ENTRIES: Entry[] | null = null;
/** Content is static: build the list once per app run. */
const entries = () => (ENTRIES ??= buildEntries());

export default function Explorer() {
  const params = useLocalSearchParams<{ q?: string; grammar?: string }>();
  const [q, setQ] = useState(params.q ?? '');
  const [kind, setKind] = useState<Kind | null>(null);
  const [rule, setRule] = useState<string | null>(params.grammar ?? null);
  const [limit, setLimit] = useState(PAGE);
  const all = entries();
  // transliteration is only needed for Latin-letter searches; built once, on demand
  const [trCache] = useState(() => new Map<string, string>());
  const trOf = (e: Entry) => {
    let t = trCache.get(e.key);
    if (t === undefined) {
      t = normaliseAnswer(`${translit(e.s.ar, { style: 'simple' })} ${translit(e.s.ar)}`);
      trCache.set(e.key, t);
    }
    return t;
  };

  const list = useMemo(() => {
    const n = normaliseAnswer(q);
    const latin = /[a-z]/.test(n);
    return all.filter(
      (e) =>
        (!kind || e.kind === kind) &&
        (!rule || e.s.grammar.includes(rule)) &&
        (!n || e.hay.includes(n) || (latin && trOf(e).includes(n))),
    );
    // trOf only reads a cache keyed by entry
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, q, kind, rule]);

  const change = (f: () => void) => {
    f();
    setLimit(PAGE);
  };

  return (
    <Screen title="Sentence explorer" testID="explorer">
      <AppText muted>
        {`${all.length} sentences from the lessons, dialogues and scenarios, every word glossed by hand. Tap a word for its meaning, transliteration and sound.`}
      </AppText>
      <SearchBox value={q} onChange={(s) => change(() => setQ(s))} />
      <Row wrap gap={6}>
        {KINDS.map((k) => (
          <Pill
            key={k.label}
            label={k.label}
            off={kind !== k.kind}
            onPress={() => change(() => setKind(k.kind))}
            testID={`explorer-kind-${k.kind ?? 'all'}`}
          />
        ))}
      </Row>
      {rule && (
        <Row wrap gap={6}>
          <AppText size={14} muted>
            Grammar rule:
          </AppText>
          <Pill
            label={`📘 ${grammarById.get(rule)?.title ?? rule}  ✕`}
            onPress={() => change(() => setRule(null))}
            testID="explorer-clear-rule"
          />
        </Row>
      )}
      <AppText size={14} muted testID="explorer-count">
        {list.length} {list.length === 1 ? 'sentence' : 'sentences'}
      </AppText>
      {list.slice(0, limit).map((e) => (
        <View key={e.key} style={{ gap: 4 }}>
          <Row wrap gap={6}>
            {e.day !== undefined && (
              <Pill
                label={`Day ${e.day} · ${e.kind === 'lesson' ? 'sentence' : 'dialogue'}`}
                onPress={() => router.push({ pathname: '/day/[day]', params: { day: String(e.day) } })}
              />
            )}
            {e.scenario && (
              <Pill
                label={`Scenario · ${e.scenario.title}`}
                onPress={() => router.push({ pathname: '/scenarios/[id]', params: { id: e.scenario!.id } })}
              />
            )}
          </Row>
          <SentenceCard s={e.s} />
        </View>
      ))}
      {list.length > limit && (
        <Button
          kind="secondary"
          label={`Show more (${list.length - limit} left)`}
          onPress={() => setLimit(limit + PAGE)}
          testID="explorer-more"
        />
      )}
      {list.length === 0 && <AppText muted>No sentence matches. Try fewer letters or an English word.</AppText>}
    </Screen>
  );
}
