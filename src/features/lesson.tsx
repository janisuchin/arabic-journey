// Lesson building blocks assembled from content + engines: word cards, sentence boxes,
// dialogue bubbles and the quiz.

import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Speech from 'expo-speech';

import { TTS_LOCALE } from '../base/config';
import { START, webLang } from '../base/rtl';
import { seededShuffle, score as scoreOf } from '../core/answer';
import { hasScript, stripHarakat } from '../core/arabic';
import { grammarById } from '../content';
import type { DialogueLine, Question, Sentence, Vocab } from '../content/schema';
import { namesSet, translitLine, wordToken, type WordInfo } from '../lang/ar/tap';
import { tts } from '../services/tts';
import { useFs, usePalette, useSettings } from '../state/hooks';
import { useLearner } from '../state/store';
import { RichText, TapText, WordBox } from '../components/tap';
import { AR_FONT, AppText, ArText, Button, Card, IconButton, Pill, Row, TrText } from '../components/ui';

const POS_COLOURS: Record<string, string> = {
  noun: '#2F80ED',
  verb: '#D9480F',
  adj: '#2B8A3E',
  pronoun: '#7048E8',
  particle: '#868E96',
  prep: '#868E96',
  question: '#C2255C',
  name: '#0B7285',
  number: '#E67700',
  phrase: '#5F3DC4',
  demonstrative: '#7048E8',
  adverb: '#2B8A3E',
};

// ------------------------------------------------------------------ word card

export function WordCard({ v, compact }: { v: Vocab; compact?: boolean }) {
  const c = usePalette();
  const settings = useSettings();
  const [open, setOpen] = useState<WordInfo | null>(null);
  const colour = v.gender === 'f' ? '#C2255C' : v.gender === 'm' ? '#1C7ED6' : (POS_COLOURS[v.pos] ?? c.text);
  const tr = v.tr ?? translitLine(v.ar, settings.translitStyle);
  return (
    <Card
      testID={`word-card-${v.id}`}
      label={`${tr}, ${v.en}`}
      onPress={() => {
        if (settings.readAloudOnTap) tts.speak(v.ar, { rate: settings.speechRate });
        setOpen(wordToken(v.ar, settings.translitStyle, tr));
      }}>
      <Row style={{ alignItems: 'flex-start' }} gap={12}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            backgroundColor: c.cardAlt,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{ fontSize: 30 }}>{v.emoji}</Text>
        </View>
        <View style={{ flex: 1, gap: 0 }}>
          <ArText size={compact ? 24 : 28} bold color={colour}>
            {v.ar}
          </ArText>
          {settings.showTranslit && <TrText>{tr}</TrText>}
          <AppText weight="700">{v.en}</AppText>
          {!compact && (
            <Row wrap gap={6} style={{ marginTop: 4 }}>
              {v.gender && <Pill label={v.gender === 'm' ? 'masculine' : 'feminine'} />}
              <Pill label={v.pos} />
            </Row>
          )}
        </View>
      </Row>
      {!compact && v.plural && (
        <Row gap={6}>
          <AppText size={13} muted>
            plural:
          </AppText>
          <ArText size={18}>{v.plural}</ArText>
          {settings.showTranslit && <TrText size={13}>{translitLine(v.plural, settings.translitStyle)}</TrText>}
        </Row>
      )}
      {!compact &&
        v.forms?.map((f) => (
          <Row gap={6} key={f.label}>
            <AppText size={13} muted>
              {f.label}:
            </AppText>
            <ArText size={18}>{f.ar}</ArText>
            {settings.showTranslit && <TrText size={13}>{translitLine(f.ar, settings.translitStyle)}</TrText>}
          </Row>
        ))}
      {!compact && (
        <View style={{ borderTopWidth: 1, borderColor: c.border, paddingTop: 6 }}>
          <TapText text={v.example.ar} size={20} interactive={false} />
          {settings.showTranslations && <AppText size={14}>{v.example.en}</AppText>}
        </View>
      )}
      {!compact && v.note && (
        <Row style={{ alignItems: 'flex-start' }}>
          <Text>💡</Text>
          <View style={{ flex: 1 }}>
            <RichText text={v.note} size={14} muted />
          </View>
        </Row>
      )}
      {open && <WordBox info={open} floating onClose={() => setOpen(null)} />}
    </Card>
  );
}

export function GenderLegend() {
  return (
    <Row wrap gap={12}>
      <AppText size={13} color="#1C7ED6" weight="700">
        ■ masculine
      </AppText>
      <AppText size={13} color="#C2255C" weight="700">
        ■ feminine
      </AppText>
      <AppText size={13} muted>
        other words are coloured by type
      </AppText>
    </Row>
  );
}

// ------------------------------------------------------------------ sentence

export function SentenceCard({ s }: { s: Sentence }) {
  const c = usePalette();
  const fs = useFs();
  const settings = useSettings();
  const [open, setOpen] = useState<WordInfo | null>(null);
  const trs = useMemo(() => {
    const names = new Set(namesSet());
    s.segs.forEach((x) => x[2] === 'name' && names.add(x[0]));
    return translitLine(s.ar, settings.translitStyle, names);
  }, [s, settings.translitStyle]);
  return (
    <Card testID={`sentence-${s.id}`}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {s.segs.map(([t, g, pos], i) => (
          <Pressable
            key={i}
            accessibilityRole="button"
            accessibilityLabel={g}
            onPress={() => {
              if (settings.readAloudOnTap) tts.speak(t, { rate: settings.speechRate });
              setOpen(wordToken(t, settings.translitStyle, undefined, g));
            }}
            style={{
              alignItems: 'center',
              paddingHorizontal: 8,
              paddingTop: 2,
              paddingBottom: 4,
              borderRadius: 10,
              backgroundColor: c.cardAlt,
              borderBottomWidth: 3,
              borderBottomColor: POS_COLOURS[pos ?? ''] ?? c.border,
              minHeight: 44,
            }}>
            <Text
              {...webLang('ar', 'rtl')}
              style={{ fontFamily: AR_FONT, fontSize: fs(22), lineHeight: fs(22) * 1.8, color: c.text }}>
              {settings.showHarakat ? t : stripHarakat(t)}
            </Text>
            <Text {...webLang('en', 'ltr')} style={{ fontSize: fs(11), color: c.textMuted, maxWidth: 120, textAlign: 'center' }}>
              {g}
            </Text>
          </Pressable>
        ))}
      </View>
      {settings.showTranslit && <TrText size={15}>{trs}</TrText>}
      <Row>
        <IconButton
          icon="volume-high"
          label="Play sentence"
          onPress={() => tts.speak(s.speak ?? s.ar, { rate: settings.speechRate })}
        />
        {settings.showTranslations && (
          <AppText weight="700" style={{ flex: 1 }}>
            {s.en}
          </AppText>
        )}
      </Row>
      {s.literal && (
        <AppText size={13} muted>
          Word for word: {s.literal}
        </AppText>
      )}
      {s.mistakes?.map((m, i) => (
        <View key={i} style={{ backgroundColor: c.cardAlt, borderRadius: 10, padding: 8, gap: 2 }}>
          <AppText size={13} color={c.bad} weight="700">
            Common mistake
          </AppText>
          <RichText text={`✗ ${m.wrong}`} size={14} />
          <RichText text={`✓ ${m.right}`} size={14} />
          <RichText text={m.why} size={13} muted />
        </View>
      ))}
      <Row wrap gap={6}>
        {s.grammar.map((g) => (
          <Pill
            key={g}
            label={`📘 ${grammarById.get(g)?.title ?? g}`}
            onPress={() => router.push({ pathname: '/grammar/[id]', params: { id: g } })}
          />
        ))}
      </Row>
      {open && <WordBox info={open} floating onClose={() => setOpen(null)} />}
    </Card>
  );
}

// ------------------------------------------------------------------ dialogue

export function Dialogue({
  lines,
  speakers,
  culture,
}: {
  lines: DialogueLine[];
  speakers: { key: string; name: string; nameAr: string }[];
  culture?: string;
}) {
  const c = usePalette();
  const settings = useSettings();
  const [hideEn, setHideEn] = useState(false);
  const [playing, setPlaying] = useState<number | null>(null);
  const order = speakers.map((s) => s.key);
  const playFrom = (i: number) => {
    if (i >= lines.length) return setPlaying(null);
    setPlaying(i);
    try {
      Speech.speak(lines[i].ar, {
        language: TTS_LOCALE,
        rate: settings.speechRate,
        onDone: () => playFrom(i + 1),
        onError: () => setPlaying(null),
        onStopped: () => setPlaying(null),
      });
    } catch {
      setPlaying(null);
    }
  };
  return (
    <View style={{ gap: 10 }}>
      <Row wrap>
        <Button
          kind="secondary"
          icon={playing === null ? 'play' : 'stop'}
          label={playing === null ? 'Play all' : 'Stop'}
          onPress={() => {
            if (playing === null) playFrom(0);
            else {
              tts.stop();
              setPlaying(null);
            }
          }}
        />
        <Button
          kind="ghost"
          icon={hideEn ? 'eye-outline' : 'eye-off-outline'}
          label={hideEn ? 'Show English' : 'Hide English'}
          onPress={() => setHideEn(!hideEn)}
          testID="toggle-english"
        />
      </Row>
      {lines.map((l, i) => {
        const sp = speakers.find((s) => s.key === l.sp);
        // speakers alternate sides: the first speaker starts at the right (the start in RTL)
        const startSide = order.indexOf(l.sp) % 2 === 0;
        return (
          <View key={l.id} style={{ alignItems: startSide ? 'flex-start' : 'flex-end' }} testID={`line-${l.id}`}>
            <View
              style={{
                maxWidth: '88%',
                backgroundColor: startSide ? c.card : c.accentSoft,
                borderWidth: playing === i ? 2 : 1,
                borderColor: playing === i ? c.accent : c.border,
                borderRadius: 16,
                borderTopRightRadius: startSide ? 4 : 16,
                borderTopLeftRadius: startSide ? 16 : 4,
                padding: 10,
                gap: 2,
              }}>
              <Row gap={6}>
                <AppText size={12} weight="800" color={c.accent}>
                  {sp?.name}
                </AppText>
                {sp && (
                  <ArText size={13} color={c.textMuted}>
                    {sp.nameAr}
                  </ArText>
                )}
                <View style={{ flex: 1 }} />
                <IconButton
                  icon="volume-medium-outline"
                  size={18}
                  label={`Play line ${i + 1}`}
                  onPress={() => tts.speak(l.ar, { rate: settings.speechRate })}
                />
              </Row>
              <TapText text={l.ar} segs={l.segs} size={21} floating />
              {settings.showTranslations && !hideEn && <AppText size={14}>{l.en}</AppText>}
            </View>
          </View>
        );
      })}
      {culture && (
        <Card accent>
          <AppText weight="800">🌍 Culture note</AppText>
          <RichText text={culture} size={14} />
        </Card>
      )}
    </View>
  );
}

// ------------------------------------------------------------------ quiz

export function QuizRunner({
  questions,
  seed,
  passMark,
  onFinish,
  skill = 'quiz',
}: {
  questions: Question[];
  seed: number;
  passMark: number;
  onFinish: (score: number) => void;
  skill?: string;
}) {
  const c = usePalette();
  const logAnswer = useLearner((s) => s.logAnswer);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const shuffled = useMemo(
    () =>
      questions.map((q, k) =>
        seededShuffle(
          q.options.map((o, idx) => ({ o, idx })),
          seed * 31 + k,
        ),
      ),
    [questions, seed],
  );
  if (questions.length === 0) return <AppText muted>No questions yet.</AppText>;
  if (done) {
    const sc = scoreOf(correct, questions.length);
    const ok = sc >= passMark;
    return (
      <Card testID="quiz-result">
        <AppText size={22} weight="800" center>
          {ok ? '🎉 Passed!' : 'Not quite yet'}
        </AppText>
        <AppText size={18} center testID="quiz-score">
          {correct} / {questions.length} correct ({Math.round(sc * 100)}%)
        </AppText>
        <AppText muted center>
          You need {Math.round(passMark * 100)}% to pass.
        </AppText>
        {!ok && (
          <Button
            label="Try again"
            icon="refresh"
            onPress={() => {
              setI(0);
              setPicked(null);
              setCorrect(0);
              setDone(false);
            }}
          />
        )}
      </Card>
    );
  }
  const q = questions[i];
  const opts = shuffled[i];
  return (
    <View style={{ gap: 10 }} testID="quiz">
      <AppText muted>
        Question {i + 1} of {questions.length}
      </AppText>
      <RichText text={q.prompt} size={18} />
      {q.ar && (
        <Card>
          <TapText text={q.ar} size={30} center />
        </Card>
      )}
      {opts.map(({ o, idx }, k) => {
        const isAnswer = idx === q.answer;
        const chosen = picked === k;
        const bg = picked === null ? c.card : isAnswer ? c.good : chosen ? c.bad : c.card;
        const fg = picked !== null && (isAnswer || chosen) ? '#fff' : c.text;
        return (
          <Pressable
            key={k}
            accessibilityRole="button"
            accessibilityLabel={`Answer ${k + 1}`}
            testID={`option-${k}`}
            disabled={picked !== null}
            onPress={() => {
              setPicked(k);
              if (isAnswer) setCorrect((n) => n + 1);
              logAnswer(skill, isAnswer);
            }}
            style={{
              minHeight: 52,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: bg,
              paddingHorizontal: 14,
              paddingVertical: 8,
              justifyContent: 'center',
            }}>
            {hasScript(o) ? (
              <View pointerEvents="none">
                <OptionArabic text={o} color={fg} />
              </View>
            ) : (
              <AppText weight="600" color={fg}>
                {o}
              </AppText>
            )}
          </Pressable>
        );
      })}
      {picked !== null && (
        <View style={{ gap: 6 }}>
          <AppText weight="800" color={opts[picked].idx === q.answer ? c.good : c.bad} testID="quiz-feedback">
            {opts[picked].idx === q.answer ? '✓ Correct!' : '✗ Not this one. The right answer is highlighted.'}
          </AppText>
          {q.explain && <RichText text={q.explain} size={14} muted />}
          <Button
            label={i + 1 < questions.length ? 'Next question' : 'See result'}
            testID="quiz-next"
            onPress={() => {
              if (i + 1 < questions.length) {
                setI(i + 1);
                setPicked(null);
              } else {
                setDone(true);
                onFinish(scoreOf(correct, questions.length));
              }
            }}
          />
        </View>
      )}
    </View>
  );
}

/** Arabic inside an answer option: shows the transliteration, but the press reaches the option. */
function OptionArabic({ text, color }: { text: string; color: string }) {
  const settings = useSettings();
  return (
    <View>
      <ArText size={22} color={color}>
        {text}
      </ArText>
      {settings.showTranslit && (
        <TrText size={13} style={{ textAlign: START }}>
          {translitLine(text, settings.translitStyle, namesSet())}
        </TrText>
      )}
    </View>
  );
}
