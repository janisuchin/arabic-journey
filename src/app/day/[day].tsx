// The day chapter: the same page sequence every day (blueprint section H).
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { NEXT_ICON, BACK_ICON } from '@/base/rtl';
import { TOTAL_DAYS } from '@/base/config';
import { GlossLine, RichText, TapText } from '@/components/tap';
import {
  AppText,
  ArText,
  Button,
  Caption,
  Card,
  IconButton,
  Pill,
  ProgressBar,
  Row,
  Screen,
  SectionTitle,
  TrText,
} from '@/components/ui';
import {
  dayByNumber,
  grammarById,
  letterById,
  pronunciationById,
  pronunciation as allPron,
  vocabById,
  validDays,
} from '@/content';
import type { Day } from '@/content/schema';
import { isDayUnlocked } from '@/core/progress';
import { ColouredWord, LetterTile } from '@/features/script';
import { Dialogue, GenderLegend, QuizRunner, SentenceCard, WordCard } from '@/features/lesson';
import { GrammarBody } from '@/features/grammar';
import { translitLine } from '@/lang/ar/tap';
import { tts } from '@/services/tts';
import { usePalette, useProgressInput, useSettings } from '@/state/hooks';
import { useLearner } from '@/state/store';

type PageId =
  'start' | 'pron' | 'letters' | 'words' | 'grammar' | 'sentences' | 'dialogue' | 'reading' | 'review' | 'quiz' | 'done';
const PAGE_NAMES: Record<PageId, string> = {
  start: 'Start',
  pron: 'Pronunciation',
  letters: 'Letters',
  words: 'New words',
  grammar: 'Grammar',
  sentences: 'Sentences',
  dialogue: 'Dialogue',
  reading: 'Reading',
  review: 'Review',
  quiz: 'Quiz',
  done: 'Done',
};

function pagesFor(d: Day): PageId[] {
  const p: PageId[] = ['start', 'pron'];
  if (d.letters.length) p.push('letters');
  p.push('words', 'grammar', 'sentences', 'dialogue', 'reading');
  if (d.review.length) p.push('review');
  p.push('quiz', 'done');
  return p;
}

/** Sound of the day: the lesson's own topic, else one whose letters the day's words contain. */
function soundOfTheDay(d: Day) {
  const own = d.pronunciation.length ? pronunciationById.get(d.pronunciation[0]) : undefined;
  if (own) return own;
  const words = d.newWords.map((w) => vocabById.get(w)?.ar ?? '').join('');
  const rotated = [...allPron.slice((d.day - 1) % allPron.length), ...allPron.slice(0, (d.day - 1) % allPron.length)];
  return rotated.find((p) => p.letters.some((l) => words.includes(l))) ?? rotated[0];
}

export default function DayScreen() {
  const params = useLocalSearchParams<{ day: string; p?: string }>();
  const dayNum = Number(params.day);
  const d = dayByNumber.get(dayNum);
  const progress = useProgressInput();
  const setLastPage = useLearner((s) => s.setLastPage);
  const [page, setPage] = useState(Number(params.p ?? 0) || 0);

  useEffect(() => {
    if (d) setLastPage(d.day, page);
  }, [d, page, setLastPage]);

  if (!d)
    return (
      <Screen title="Lesson">
        <Card>
          <AppText weight="800">This day is not available yet.</AppText>
          <AppText muted>Its lesson is outlined in the course plan but has not been written and checked yet.</AppText>
        </Card>
      </Screen>
    );
  if (!isDayUnlocked(d.day, progress))
    return (
      <Screen title={`Day ${d.day}`}>
        <Card testID="locked">
          <AppText size={18} weight="800">
            🔒 This day is locked
          </AppText>
          <AppText muted>
            Finish the previous day first (and the week test at 80% for a new week), or turn on “Unlock all chapters” in Settings.
          </AppText>
        </Card>
      </Screen>
    );
  return <Chapter d={d} page={page} setPage={setPage} />;
}

function Chapter({ d, page, setPage }: { d: Day; page: number; setPage: (n: number) => void }) {
  const pages = useMemo(() => pagesFor(d), [d]);
  const id = pages[Math.min(page, pages.length - 1)];
  const next = pages[page + 1];
  const go = (n: number) => setPage(Math.max(0, Math.min(pages.length - 1, n)));
  return (
    <Screen title={`Day ${d.day} · ${d.title}`}>
      <Caption testID="page-caption">
        {PAGE_NAMES[id]} · {page + 1} / {pages.length}
      </Caption>
      <ProgressBar value={(page + 1) / pages.length} label="lesson progress" />
      <PageBody d={d} id={id} onPassed={() => go(pages.indexOf('done'))} />
      {next && id !== 'quiz' && (
        <Button label={`Next: ${PAGE_NAMES[next]}`} iconAfter={NEXT_ICON} testID="next-page" onPress={() => go(page + 1)} />
      )}
      {page > 0 && (
        <Button
          kind="ghost"
          label={`Previous: ${PAGE_NAMES[pages[page - 1]]}`}
          icon={BACK_ICON}
          testID="prev-page"
          onPress={() => go(page - 1)}
        />
      )}
    </Screen>
  );
}

function PageBody({ d, id, onPassed }: { d: Day; id: PageId; onPassed: () => void }) {
  switch (id) {
    case 'start':
      return <StartPage d={d} />;
    case 'pron':
      return <PronPage d={d} />;
    case 'letters':
      return <LettersPage d={d} />;
    case 'words':
      return <WordsPage ids={d.newWords} />;
    case 'grammar':
      return <GrammarPage d={d} />;
    case 'sentences':
      return (
        <View style={{ gap: 10 }}>
          {d.sentences.map((s) => (
            <SentenceCard key={s.id} s={s} />
          ))}
        </View>
      );
    case 'dialogue':
      return (
        <View style={{ gap: 8 }}>
          <AppText size={20} weight="800">
            💬 {d.dialogue.title}
          </AppText>
          <Dialogue lines={d.dialogue.lines} speakers={d.dialogue.speakers} culture={d.dialogue.culture} />
        </View>
      );
    case 'reading':
      return <ReadingPage d={d} />;
    case 'review':
      return (
        <View style={{ gap: 10 }}>
          <AppText muted>Words from earlier days. Tap each card to hear it again.</AppText>
          <WordsPage ids={d.review} compact />
        </View>
      );
    case 'quiz':
      return <QuizPage d={d} onPassed={onPassed} />;
    case 'done':
      return <DonePage d={d} />;
  }
}

function StartPage({ d }: { d: Day }) {
  const c = usePalette();
  const words = d.newWords.length;
  return (
    <View style={{ gap: 12 }}>
      <Caption>
        Day {d.day} · Week {d.week} · Phase {d.phase} · Level {d.level}
      </Caption>
      <AppText size={26} weight="800" testID="day-title">
        {d.emoji} {d.title}
      </AppText>
      <GlossLine text={d.titleAr} segs={d.titleSegs} size={30} />
      <AppText muted>{d.summary}</AppText>
      <Card accent>
        <AppText weight="800">Today you will be able to…</AppText>
        {d.objectives.map((o, i) => (
          <Row key={i} style={{ alignItems: 'flex-start' }}>
            <Text>🎯</Text>
            <View style={{ flex: 1 }}>
              <RichText text={o} />
            </View>
          </Row>
        ))}
      </Card>
      <Card>
        <AppText weight="800">📖 Introduction</AppText>
        <RichText text={d.intro} />
      </Card>
      <Card testID="real-life">
        <Row>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              backgroundColor: c.cardAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{ fontSize: 36 }}>{d.realLife.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Caption>In real life</Caption>
            <AppText weight="800">{d.realLife.title}</AppText>
          </View>
        </Row>
        <RichText text={d.realLife.story} />
      </Card>
      {d.letters.length > 0 && (
        <Card>
          <AppText weight="800">New letters</AppText>
          <Row wrap gap={8}>
            {d.letters.map((l) => {
              const letter = letterById.get(l);
              return letter ? <LetterTile key={l} letter={letter} small /> : null;
            })}
          </Row>
        </Card>
      )}
      <AppText muted testID="counts-line">
        {words} new words · {d.sentences.length} example sentences · {d.quiz.length} quiz questions · Complete the quiz with 80%
        to finish the day.
      </AppText>
    </View>
  );
}

function PronPage({ d }: { d: Day }) {
  const c = usePalette();
  const settings = useSettings();
  const p = soundOfTheDay(d);
  if (!p) return <AppText muted>No sound for today.</AppText>;
  const todays = d.newWords.map((w) => vocabById.get(w)).filter((v) => v && p.letters.some((l) => v.ar.includes(l)));
  const examples = todays.length ? todays.map((v) => ({ ar: v!.ar, en: v!.en })) : p.examples;
  return (
    <View style={{ gap: 12 }}>
      <Caption>Sound of the day</Caption>
      <RichText text={p.title} size={22} />
      <Row wrap gap={6}>
        <Pill label={p.category} />
        {p.ipa.map((x) => (
          <Pill key={x} label={`/${x}/`} />
        ))}
      </Row>
      <Card accent>
        <AppText weight="800">💡 Tip</AppText>
        <RichText text={p.tip} />
      </Card>
      <Card>
        <AppText weight="800">How it is made</AppText>
        <RichText text={p.diagram} muted />
      </Card>
      <AppText weight="800">{todays.length ? "Today's words with this sound" : 'Examples'}</AppText>
      {examples.map((e, i) => (
        <Card key={i} onPress={() => tts.speak(e.ar, { rate: settings.speechRate })} label={e.en}>
          <ColouredWord word={e.ar} letters={p.letters} size={30} />
          {settings.showTranslit && <TrText>{translitLine(e.ar, settings.translitStyle)}</TrText>}
          <AppText>{e.en}</AppText>
        </Card>
      ))}
      <Card>
        <AppText weight="800" color={c.bad}>
          Most common error
        </AppText>
        <RichText text={p.error} />
      </Card>
      <Row wrap>
        <Button
          kind="secondary"
          icon="flask-outline"
          label="Open in the Pronunciation Lab"
          onPress={() => router.push({ pathname: '/pronunciation/[id]', params: { id: p.id } })}
        />
        <Button
          kind="ghost"
          icon="mic-outline"
          label="Say it yourself"
          onPress={() => tts.speak(examples[0].ar, { rate: settings.slowRate })}
        />
      </Row>
      <AppText size={12} muted>
        Say it yourself: listen to the slow model, then repeat it aloud. Recording and comparing is not available in this version.
      </AppText>
    </View>
  );
}

function LettersPage({ d }: { d: Day }) {
  return (
    <View style={{ gap: 10 }}>
      <AppText muted>Each letter changes shape depending on where it is in a word. Tap a letter to see all its forms.</AppText>
      {d.letters.map((l) => {
        const letter = letterById.get(l);
        return letter ? <LetterTile key={l} letter={letter} /> : null;
      })}
    </View>
  );
}

function WordsPage({ ids, compact }: { ids: string[]; compact?: boolean }) {
  return (
    <View style={{ gap: 10 }}>
      {!compact && <GenderLegend />}
      {ids.map((id) => {
        const v = vocabById.get(id);
        return v ? <WordCard key={id} v={v} compact={compact} /> : null;
      })}
    </View>
  );
}

function GrammarPage({ d }: { d: Day }) {
  return (
    <View style={{ gap: 16 }}>
      {d.grammar.map((g) => {
        const rule = grammarById.get(g);
        if (!rule) return null;
        const isNew = rule.firstDay === d.day;
        return (
          <View key={g} style={{ gap: 8 }}>
            <Caption>{isNew ? 'New grammar' : `Review — first taught on day ${rule.firstDay}`}</Caption>
            <GrammarBody g={rule} short={!isNew} />
          </View>
        );
      })}
    </View>
  );
}

function ReadingPage({ d }: { d: Day }) {
  const settings = useSettings();
  return (
    <View style={{ gap: 10 }}>
      <SectionTitle icon="book-outline">{d.reading.title}</SectionTitle>
      <Card>
        <TapText text={d.reading.ar} segs={d.reading.segs} size={24} />
        <Row>
          <IconButton
            icon="volume-high"
            label="Read aloud"
            onPress={() => tts.speak(d.reading.ar, { rate: settings.speechRate })}
          />
          {settings.showTranslations && <AppText style={{ flex: 1 }}>{d.reading.en}</AppText>}
        </Row>
      </Card>
    </View>
  );
}

function QuizPage({ d, onPassed }: { d: Day; onPassed: () => void }) {
  const { passMark } = useSettings();
  const completeDay = useLearner((s) => s.completeDay);
  return (
    <QuizRunner
      questions={d.quiz}
      seed={d.day}
      passMark={passMark}
      onFinish={(sc) => {
        if (sc >= passMark) {
          completeDay(d.day, sc, [...d.newWords]);
          onPassed();
        }
      }}
    />
  );
}

function DonePage({ d }: { d: Day }) {
  const progress = useProgressInput();
  const score = useLearner((s) => s.quizScores[d.day]);
  const nextDay = validDays.find((x) => x > d.day);
  const passed = progress.completedDays.has(d.day);
  return (
    <View style={{ gap: 12 }}>
      <Card accent testID="done">
        <AppText size={24} weight="800" center>
          {passed ? '🎉 Day complete!' : 'Almost there'}
        </AppText>
        {passed && score !== undefined && <AppText center>Quiz score: {Math.round(score * 100)}%</AppText>}
        <RichText text={passed ? d.completion : 'Pass the quiz with 80% to finish this day.'} center />
        <ArText center size={26}>
          أَحْسَنْتَ!
        </ArText>
        <TrText center>Aḥsanta! (Well done!)</TrText>
      </Card>
      <Button label="Back to Today" icon="home-outline" onPress={() => router.replace('/')} />
      {nextDay && passed && progress.weekOf(nextDay) === progress.weekOf(d.day) && (
        <Button
          kind="secondary"
          label={`Next: Day ${nextDay}`}
          iconAfter={NEXT_ICON}
          onPress={() => router.replace({ pathname: '/day/[day]', params: { day: String(nextDay) } })}
        />
      )}
      {passed && (!nextDay || progress.weekOf(nextDay) !== progress.weekOf(d.day)) && (
        <Button
          kind="secondary"
          label={`Next: Week ${d.week} test`}
          iconAfter={NEXT_ICON}
          onPress={() => router.replace({ pathname: '/week-test/[week]', params: { week: String(d.week) } })}
        />
      )}
      <AppText size={12} muted center>
        Day {d.day} of {TOTAL_DAYS}
      </AppText>
    </View>
  );
}
