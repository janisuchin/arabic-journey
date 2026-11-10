// One culture chapter: hero photo, sections (prose, photos, model sentences), key-word cards, course words,
// a reading with questions and a chapter quiz.
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { PhotoFrame } from '@/components/photo';
import { GlossLine, RichText, TapText } from '@/components/tap';
import { AppText, Caption, Card, IconButton, Row, Screen, SectionTitle } from '@/components/ui';
import { cultureById, vocabById } from '@/content';
import type { PlacardItem } from '@/content/schema';
import { QuizRunner, SentenceCard, WordCard } from '@/features/lesson';
import { tts } from '@/services/tts';
import { useSettings } from '@/state/hooks';

function WordItem({ it, testID }: { it: PlacardItem; testID: string }) {
  const settings = useSettings();
  return (
    <Card style={{ paddingVertical: 10 }}>
      <Row gap={10}>
        <View style={{ flex: 1, gap: 2 }}>
          <TapText text={it.ar} segs={it.segs} size={24} testID={testID} />
          {settings.showTranslations && <AppText weight="700">{it.en}</AppText>}
          {it.note ? <RichText text={it.note} size={13} muted /> : null}
        </View>
        <IconButton icon="volume-high" label={`Play: ${it.en}`} onPress={() => tts.speak(it.ar, { rate: settings.speechRate })} />
      </Row>
    </Card>
  );
}

export default function CultureChapter() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ch = cultureById.get(id);
  const settings = useSettings();
  if (!ch)
    return (
      <Screen title="Explore">
        <AppText>Chapter not found.</AppText>
      </Screen>
    );
  const vocab = ch.vocab.map((v) => vocabById.get(v)).filter((v): v is NonNullable<typeof v> => !!v);
  return (
    <Screen title={ch.title} testID="culture-chapter">
      {ch.hero && <PhotoFrame photo={ch.hero} aspectRatio={16 / 9} />}
      <Caption>
        Explore the Arab world · chapter {ch.n} · from level {ch.level}
      </Caption>
      <AppText size={24} weight="800">
        {ch.emoji} {ch.title}
      </AppText>
      <GlossLine text={ch.titleAr} segs={ch.titleSegs} size={26} />
      <RichText text={ch.summary} />

      {ch.sections.map((s, i) => (
        <View key={i} style={{ gap: 10 }} testID={`culture-section-${i}`}>
          <SectionTitle>{s.title}</SectionTitle>
          {s.titleAr && s.titleSegs ? <GlossLine text={s.titleAr} segs={s.titleSegs} size={20} /> : null}
          {s.photo && <PhotoFrame photo={s.photo} />}
          {s.body.map((b, k) => (
            <RichText key={k} text={b} />
          ))}
          {s.sentences.map((x) => (
            <SentenceCard key={x.id} s={x} />
          ))}
        </View>
      ))}

      <SectionTitle icon="pricetags-outline">Key words</SectionTitle>
      {ch.words.map((it, i) => (
        <WordItem key={i} it={it} testID={`culture-word-${i}`} />
      ))}

      {vocab.length > 0 && (
        <>
          <SectionTitle icon="book-outline">Course words in this chapter</SectionTitle>
          {vocab.map((v) => (
            <WordCard key={v.id} v={v} compact />
          ))}
        </>
      )}

      <SectionTitle icon="reader-outline">{`Reading: ${ch.reading.title}`}</SectionTitle>
      <Card testID="culture-reading">
        <TapText text={ch.reading.ar} segs={ch.reading.segs} size={24} />
        <IconButton
          icon="volume-high"
          label="Play the reading"
          onPress={() => tts.speak(ch.reading.ar, { rate: settings.speechRate })}
        />
        {settings.showTranslations && <AppText muted>{ch.reading.en}</AppText>}
      </Card>
      <QuizRunner
        questions={ch.readingQuestions}
        seed={ch.n * 7}
        passMark={settings.passMark}
        skill="reading"
        onFinish={() => undefined}
      />

      <SectionTitle icon="help-circle-outline">Chapter quiz</SectionTitle>
      <View testID="culture-quiz">
        <QuizRunner
          questions={ch.quiz}
          seed={ch.n * 13}
          passMark={settings.passMark}
          skill="culture"
          onFinish={() => undefined}
        />
      </View>
      <AppText size={12} muted>
        Status: {ch.status === 'approved' ? 'reviewed' : 'written by the course author, waiting for a teacher review'}.
      </AppText>
    </Screen>
  );
}
