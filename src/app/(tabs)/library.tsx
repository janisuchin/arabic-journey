import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText, Card, Icon, Row, Screen, SectionTitle, type IconName } from '@/components/ui';
import { vocabById } from '@/content';
import { SearchBox } from '@/features/search';
import { WordCard } from '@/features/lesson';
import { useLearner } from '@/state/store';

const SECTIONS: { title: string; icon: IconName; href: string }[] = [
  { title: 'Dictionary', icon: 'book-outline', href: '/dictionary' },
  { title: 'Letters', icon: 'text-outline', href: '/letters' },
  { title: 'Vocabulary', icon: 'list-outline', href: '/dictionary?view=course' },
  { title: 'Grammar', icon: 'school-outline', href: '/grammar' },
  { title: 'Pronunciation', icon: 'mic-outline', href: '/pronunciation' },
  { title: 'Scenarios', icon: 'chatbubbles-outline', href: '/scenarios' },
  { title: 'Numbers', icon: 'calculator-outline', href: '/numbers' },
  { title: 'Flashcards', icon: 'albums-outline', href: '/flashcards?all=1' },
];

export default function Library() {
  const [q, setQ] = useState('');
  const favourites = useLearner((s) => s.favourites);
  const recent = useLearner((s) => s.recent);
  return (
    <Screen back={false} title="Library" testID="library">
      <SearchBox value={q} onChange={setQ} onSubmit={() => router.push({ pathname: '/dictionary', params: { q } })} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {SECTIONS.map((s) => (
          <Card
            key={s.title}
            style={{ width: '47%', flexGrow: 1 }}
            onPress={() => router.push(s.href as never)}
            label={s.title}
            testID={`lib-${s.title}`}>
            <Row>
              <Icon name={s.icon} />
              <AppText weight="700" style={{ flex: 1 }}>
                {s.title}
              </AppText>
            </Row>
          </Card>
        ))}
      </View>
      <SectionTitle icon="star-outline">Favourites</SectionTitle>
      {favourites.length === 0 && <AppText muted>Tap ☆ in any word box to add a word here.</AppText>}
      {favourites.map((id) => {
        const v = vocabById.get(id);
        return v ? <WordCard key={id} v={v} compact /> : null;
      })}
      <SectionTitle icon="time-outline">Recently learned</SectionTitle>
      {recent.length === 0 && <AppText muted>Words from the days you finish appear here.</AppText>}
      {recent.slice(0, 8).map((id) => {
        const v = vocabById.get(id);
        return v ? <WordCard key={id} v={v} compact /> : null;
      })}
    </Screen>
  );
}
