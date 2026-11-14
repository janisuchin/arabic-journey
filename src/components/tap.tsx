// Tap-to-hear: every Arabic word can be tapped, heard and understood. A tap reads the word aloud,
// highlights it in both the script line and the transliteration line, and opens the word box.

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { Modal, Platform, Pressable, ScrollView, Text, View, type LayoutChangeEvent } from 'react-native';

import { AR_START, START, webLang } from '../base/rtl';
import { isolateLtr, isolateRtl, stripHarakat } from '../core/arabic';
import { wordPhotoByVocab } from '../content';
import { GENDER_LABEL, type Seg } from '../content/schema';
import {
  namesSet,
  pauseReading,
  proseParts,
  proseTranslit,
  syllables,
  tapTokens,
  translitLine,
  wordToken,
  type GlossCtx,
  type WordInfo,
} from '../lang/ar/tap';
import { tts } from '../services/tts';
import { useFs, usePalette, useSettings } from '../state/hooks';
import { useLearner } from '../state/store';
import { WordTile } from './photo';
import { AR_FONT, AR_FONT_BOLD, AppText, ArText, IconButton, Row, TrText } from './ui';

const NATIVE = Platform.OS !== 'web';
const isoR = (s: string) => (NATIVE ? isolateRtl(s) : s);
const isoL = (s: string) => (NATIVE ? isolateLtr(s) : s);

const POS_LABEL: Record<string, string> = {
  noun: 'noun',
  verb: 'verb',
  adj: 'adjective',
  adverb: 'adverb',
  pronoun: 'pronoun',
  particle: 'particle',
  prep: 'preposition',
  question: 'question word',
  phrase: 'phrase',
  number: 'number',
  name: 'name',
  demonstrative: 'demonstrative',
};

/** Where taps happen: the lesson day decides between a word's senses; mistake cards show exercise notes. */
export const GlossScope = createContext<GlossCtx>({});

/** Marks its children as the wrong side of a mistake card. */
export function MistakeScope({ children }: { children: ReactNode }) {
  const ctx = useContext(GlossScope);
  return <GlossScope.Provider value={{ ...ctx, mistake: true }}>{children}</GlossScope.Provider>;
}

/** Marks its children as a quiz question; until it is answered, a tapped mistake form shows no exercise note. */
export function QuestionScope({ answered, children }: { answered: boolean; children: ReactNode }) {
  const ctx = useContext(GlossScope);
  return <GlossScope.Provider value={{ ...ctx, unanswered: !answered }}>{children}</GlossScope.Provider>;
}

/** Names the part of the app its children belong to (scenario:<id>, vocab:<id>…), for scoped glosses. */
/** Read a whole sentence aloud (normal and slow): every example sentence has its own speaker, not only its words. */
export function ListenButtons({ text, label = 'sentence', testID }: { text: string; label?: string; testID?: string }) {
  const settings = useSettings();
  const say = text.replace(/‍/g, '');
  return (
    <Row gap={0} style={{ justifyContent: 'flex-start' }}>
      <IconButton
        icon="volume-high"
        label={`Play the ${label}`}
        testID={testID}
        onPress={() => tts.speak(say, { rate: settings.speechRate })}
      />
      <IconButton
        icon="walk-outline"
        label={`Play the ${label} slowly`}
        testID={testID && `${testID}-slow`}
        onPress={() => tts.speak(say, { rate: settings.slowRate })}
      />
    </Row>
  );
}

export function GlossPlace({ place, children }: { place: string; children: ReactNode }) {
  const ctx = useContext(GlossScope);
  return <GlossScope.Provider value={{ ...ctx, place }}>{children}</GlossScope.Provider>;
}

function useSpeakWord() {
  const { readAloudOnTap, speechRate } = useSettings();
  return (w: string) => readAloudOnTap && tts.speak(w, { rate: speechRate });
}

// ------------------------------------------------------------------ word box

export function WordBox({ info, onClose, floating }: { info: WordInfo; onClose: () => void; floating: boolean }) {
  const c = usePalette();
  const settings = useSettings();
  const favourites = useLearner((s) => s.favourites);
  const toggleFavourite = useLearner((s) => s.toggleFavourite);
  const sylls = useMemo(() => syllables(info.word, settings.translitStyle), [info.word, settings.translitStyle]);
  const v = info.vocab;
  const pause = useMemo(
    () => pauseReading(info.word, info.tr, settings.translitStyle),
    [info.word, info.tr, settings.translitStyle],
  );
  const facts: string[] = [];
  if (v) {
    facts.push(POS_LABEL[v.pos] ?? v.pos);
    if (v.gender) facts.push(GENDER_LABEL[v.gender]);
  }
  const content = (
    <View
      testID="word-box"
      accessibilityRole="summary"
      style={{ backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.accent, padding: 14, gap: 6 }}>
      <Row style={{ alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: 2 }}>
          <ArText size={34} bold>
            {info.word}
          </ArText>
          {settings.showHarakat && info.plain !== info.word && (
            <AppText size={12} muted>
              Written without vowel marks:{' '}
              <Text {...webLang('ar', 'rtl')} style={{ fontFamily: AR_FONT, fontSize: 16 }}>
                {isoR(info.plain)}
              </Text>
            </AppText>
          )}
          {settings.showTranslit && <TrText size={18}>{info.tr}</TrText>}
          {settings.showTranslit && pause && (
            <AppText size={12} muted testID="word-box-pause">
              Said on its own (pause): <TrText size={13}>{pause}</TrText>. A final short vowel is dropped at the end of a phrase,
              so the voice may stop there.
            </AppText>
          )}
          <AppText size={17} weight="700" testID="word-box-meaning">
            {info.en ?? 'meaning not listed yet'}
          </AppText>
        </View>
        <View>
          <IconButton icon="close" label="Close word box" onPress={onClose} testID="word-box-close" />
          {v && (
            <IconButton
              icon={favourites.includes(v.id) ? 'star' : 'star-outline'}
              label={favourites.includes(v.id) ? 'Remove from favourites' : 'Add to favourites'}
              onPress={() => toggleFavourite(v.id)}
            />
          )}
        </View>
      </Row>
      {v && wordPhotoByVocab.has(v.id) && (
        <View style={{ width: 150 }} testID="word-box-photo">
          <WordTile v={v} size={150} />
        </View>
      )}
      {facts.length > 0 && (
        <AppText size={13} muted>
          {facts.join(' · ')}
        </AppText>
      )}
      {v?.plural && <FormLine label="plural" ar={v.plural} />}
      {v?.forms?.map((f) => (
        <FormLine key={f.label} label={f.label} ar={f.ar} />
      ))}
      {sylls.length > 1 && (
        <Row wrap gap={6} style={{ marginTop: 4 }}>
          <AppText size={12} muted>
            Syllables:
          </AppText>
          {sylls.map((s, i) => (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={`syllable ${s.tr}`}
              onPress={() => tts.speak(s.ar.replace(/\u200D/g, ''), { rate: settings.slowRate })}
              style={{
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 8,
                backgroundColor: c.accentSoft,
                minHeight: 44,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                {...webLang('ar', 'rtl')}
                style={{ fontFamily: AR_FONT, fontSize: 20, color: c.text, writingDirection: 'rtl' }}>
                {s.ar}
              </Text>
              <Text style={{ fontSize: 11, color: c.translit, fontStyle: 'italic', fontWeight: '600' }}>{s.tr}</Text>
            </Pressable>
          ))}
        </Row>
      )}
      {info.example && info.example.ar !== info.word && (
        <View style={{ borderTopWidth: 1, borderColor: c.border, paddingTop: 6, gap: 2 }}>
          <AppText size={12} muted>
            Example
          </AppText>
          <ArText size={20}>{info.example.ar}</ArText>
          {settings.showTranslit && (
            <TrText size={14}>{translitLine(info.example.ar, settings.translitStyle, namesSet())}</TrText>
          )}
          {settings.showTranslations && <AppText size={14}>{info.example.en}</AppText>}
          <ListenButtons text={info.example.ar} label="example sentence" testID="word-example-play" />
        </View>
      )}
      <Row style={{ justifyContent: 'flex-start' }}>
        <IconButton
          icon="volume-high"
          label="Play the word"
          onPress={() => tts.speak(info.word, { rate: settings.speechRate })}
        />
        <IconButton
          icon="walk-outline"
          label="Play the word slowly"
          onPress={() => tts.speak(info.word, { rate: settings.slowRate })}
        />
        <AppText size={11} muted style={{ flex: 1 }}>
          Computer-generated voice, not a native-speaker recording.
        </AppText>
      </Row>
    </View>
  );
  if (!floating) return content;
  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <Pressable
        accessibilityLabel="Close word box"
        testID="word-box-backdrop"
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 16 }}>
        <Pressable
          onPress={() => undefined}
          style={{ width: '100%', maxWidth: 440, alignSelf: 'center', maxHeight: '85%' }}
          {...webLang('en', 'rtl')}>
          <ScrollView>{content}</ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function FormLine({ label, ar }: { label: string; ar: string }) {
  const { translitStyle, showTranslit } = useSettings();
  return (
    <Row gap={6} wrap>
      <AppText size={13} muted>
        {label}:
      </AppText>
      <ArText size={18}>{ar}</ArText>
      {showTranslit && <TrText size={13}>{translitLine(ar, translitStyle)}</TrText>}
    </Row>
  );
}

// ------------------------------------------------------------------ TapText

interface TapTextProps {
  text: string;
  size?: number;
  bold?: boolean;
  segs?: Seg[];
  center?: boolean;
  /** false inside buttons and pressable cards: shows the transliteration but lets the press through */
  interactive?: boolean;
  /** always open the word box as a floating card (narrow places: table cells, bubbles, chips) */
  floating?: boolean;
  showTranslit?: boolean;
  testID?: string;
}

export function TapText({
  text,
  size = 24,
  bold,
  segs,
  center,
  interactive = true,
  floating,
  showTranslit,
  testID,
}: TapTextProps) {
  const c = usePalette();
  const fs = useFs();
  const settings = useSettings();
  const speak = useSpeakWord();
  const [sel, setSel] = useState<number | null>(null);
  const [width, setWidth] = useState(0);
  const names = useMemo(() => {
    const n = new Set(namesSet());
    segs?.forEach((s) => s[2] === 'name' && n.add(s[0]));
    return n;
  }, [segs]);
  const tokens = useMemo(() => tapTokens(text, settings.translitStyle, names), [text, settings.translitStyle, names]);
  let arCount = 0;
  const indexed = tokens.map((t) => ({ ...t, k: t.kind === 'ar' ? arCount++ : -1 }));
  const gloss = (k: number) => segs?.[k]?.[1];
  const selected = sel !== null ? indexed.find((t) => t.k === sel) : undefined;
  const ctx = useContext(GlossScope);
  const info = selected ? wordToken(selected.text, settings.translitStyle, selected.tr, gloss(selected.k), ctx) : null;
  const tapWord = (k: number, word: string) => {
    setSel(k === sel ? null : k);
    if (k !== sel) speak(word);
  };
  const wantTranslit = showTranslit ?? settings.showTranslit;
  const align = center ? 'center' : START;
  const arAlign = center ? 'center' : AR_START;

  return (
    <View onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)} testID={testID} style={{ gap: 2 }}>
      <Text
        {...webLang('ar', 'rtl')}
        style={{
          fontFamily: bold ? AR_FONT_BOLD : AR_FONT,
          fontSize: fs(size),
          lineHeight: fs(size) * 1.9,
          color: c.text,
          writingDirection: 'rtl',
          textAlign: arAlign,
        }}>
        {indexed.map((t, i) =>
          t.kind === 'ar' ? (
            <Text
              key={i}
              testID={interactive ? `tap-word-${t.k}` : undefined}
              accessibilityRole={interactive ? 'button' : undefined}
              accessibilityLabel={interactive ? `${t.tr}${gloss(t.k) ? ', ' + gloss(t.k) : ''}` : undefined}
              onPress={interactive ? () => tapWord(t.k, t.text) : undefined}
              style={sel === t.k ? { backgroundColor: c.highlight, borderRadius: 4 } : undefined}>
              {settings.showHarakat ? t.text : stripHarakat(t.text)}
            </Text>
          ) : (
            <Text key={i}>{t.text}</Text>
          ),
        )}
      </Text>
      {wantTranslit && (
        <Text
          {...webLang('ar-Latn', 'ltr')}
          testID={testID ? `${testID}-translit` : undefined}
          style={{
            color: c.translit,
            fontStyle: 'italic',
            fontWeight: '600',
            fontSize: fs(Math.max(13, size * 0.62)),
            lineHeight: fs(Math.max(13, size * 0.62)) * 1.4,
            writingDirection: 'ltr',
            textAlign: align,
          }}>
          {indexed.map((t, i) => {
            if (t.kind === 'ar')
              return (
                <Text
                  key={i}
                  onPress={interactive ? () => tapWord(t.k, t.text) : undefined}
                  style={sel === t.k ? { backgroundColor: c.highlight, borderRadius: 4 } : undefined}>
                  {t.tr}
                </Text>
              );
            if (t.kind === 'punct')
              return <Text key={i}>{({ '،': ',', '؟': '?', '؛': ';' } as Record<string, string>)[t.text] ?? t.text}</Text>;
            return <Text key={i}>{t.tr}</Text>;
          })}
        </Text>
      )}
      {info && interactive && <WordBox info={info} floating={!!floating || width < 300} onClose={() => setSel(null)} />}
    </View>
  );
}

// ------------------------------------------------------------------ GlossLine

/** Heading: script line, transliteration line, then compact word chips "word · translit = meaning". */
export function GlossLine({ text, segs, size = 28, center }: { text: string; segs: Seg[]; size?: number; center?: boolean }) {
  const c = usePalette();
  const settings = useSettings();
  const speak = useSpeakWord();
  const [open, setOpen] = useState<WordInfo | null>(null);
  const names = new Set(segs.filter((s) => s[2] === 'name').map((s) => s[0]));
  const trs = useMemo(
    () =>
      tapTokens(text, settings.translitStyle, names)
        .filter((t) => t.kind === 'ar')
        .map((t) => t.tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, settings.translitStyle],
  );
  return (
    <View style={{ gap: 6 }}>
      <TapText text={text} segs={segs} size={size} bold center={center} />
      <Row wrap gap={6} style={center ? { justifyContent: 'center' } : undefined}>
        {segs.map((s, i) => (
          <Pressable
            key={i}
            accessibilityRole="button"
            accessibilityLabel={`${trs[i] ?? ''} means ${s[1]}`}
            testID={`chip-${i}`}
            onPress={() => {
              speak(s[0]);
              setOpen(wordToken(s[0], settings.translitStyle, trs[i], s[1]));
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 10,
              paddingVertical: 4,
              minHeight: 44,
              borderRadius: 12,
              backgroundColor: c.accentSoft,
            }}>
            <Text {...webLang('ar', 'rtl')} style={{ fontFamily: AR_FONT, fontSize: 18, color: c.text }}>
              {isoR(settings.showHarakat ? s[0] : stripHarakat(s[0]))}
            </Text>
            <Text {...webLang('en', 'ltr')} style={{ fontSize: 13, color: c.textMuted }}>
              {isoL('·')}
            </Text>
            {settings.showTranslit && (
              <Text
                {...webLang('ar-Latn', 'ltr')}
                style={{ fontSize: 13, color: c.translit, fontStyle: 'italic', fontWeight: '600' }}>
                {isoL(trs[i] ?? '')}
              </Text>
            )}
            <Text {...webLang('en', 'ltr')} style={{ fontSize: 13, color: c.text }}>
              {isoL(`= ${s[1]}`)}
            </Text>
          </Pressable>
        ))}
      </Row>
      {open && <WordBox info={open} floating onClose={() => setOpen(null)} />}
    </View>
  );
}

// ------------------------------------------------------------------ RichText

/**
 * English text with Arabic inside: each Arabic run is an isolated right-to-left span whose words
 * are tappable, followed by its transliteration in brackets.
 */
export function RichText({
  text,
  size = 16,
  muted,
  center,
  noTranslit,
  spoken,
}: {
  text: string;
  size?: number;
  muted?: boolean;
  center?: boolean;
  /** hide the readings (a quiz prompt whose reading would be the answer) */
  noTranslit?: boolean;
  /** readings as said, not the dictionary form: fi l-madīna, not fī l-madīna (the waṣl page) */
  spoken?: boolean;
}) {
  const c = usePalette();
  const fs = useFs();
  const settings = useSettings();
  const speak = useSpeakWord();
  const [open, setOpen] = useState<WordInfo | null>(null);
  const ctx = useContext(GlossScope);
  // consecutive Arabic words (with spaces/Arabic punctuation between) form one run
  const parts = proseParts(text);
  const color = muted ? c.textMuted : c.text;
  const children: ReactNode[] = parts.map((p, i) => {
    if (!p.ar) return <Text key={i}>{p.tokens.map((t) => t.text).join('')}</Text>;
    const runText = p.tokens.map((t) => t.text).join('');
    const after = parts
      .slice(i + 1)
      .flatMap((q) => q.tokens.map((t) => t.text))
      .join('');
    const before = parts
      .slice(0, i)
      .flatMap((q) => q.tokens.map((t) => t.text))
      .join('');
    const runTr = proseTranslit(runText, settings.translitStyle, after, before, spoken);
    return (
      <Text key={i}>
        <Text {...webLang('ar', 'rtl')} style={{ fontFamily: AR_FONT, fontSize: fs(size + 4), color }}>
          {NATIVE ? '\u2067' : ''}
          {p.tokens.map((t, j) =>
            t.kind === 'ar' ? (
              <Text
                key={j}
                accessibilityRole="button"
                onPress={() => {
                  speak(t.text);
                  setOpen(wordToken(t.text, settings.translitStyle, undefined, undefined, ctx));
                }}
                style={{ color: c.accent }}>
                {settings.showHarakat ? t.text : stripHarakat(t.text)}
              </Text>
            ) : (
              <Text key={j}>{t.text}</Text>
            ),
          )}
          {NATIVE ? '\u2069' : ''}
        </Text>
        {settings.showTranslit && !noTranslit && runTr !== '' && (
          <Text {...webLang('ar-Latn', 'ltr')} style={{ color: c.translit, fontStyle: 'italic', fontWeight: '600' }}>
            {isoL(` (${runTr})`)}
          </Text>
        )}
      </Text>
    );
  });
  return (
    <>
      <Text
        {...webLang('en', 'ltr')}
        style={{
          color,
          fontSize: fs(size),
          lineHeight: fs(size) * 1.6,
          writingDirection: 'ltr',
          textAlign: center ? 'center' : START,
        }}>
        {children}
      </Text>
      {open && <WordBox info={open} floating onClose={() => setOpen(null)} />}
    </>
  );
}
