// Explore the Arab world: optional culture chapters with real photos.
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { View } from 'react-native';

import { GlossLine, RichText } from '@/components/tap';
import { AppText, Caption, Card, Screen } from '@/components/ui';
import { culture } from '@/content';
import { CULTURE_IMAGES } from '@/content/culture-images.generated';

export default function ExploreIndex() {
  return (
    <Screen title="Explore the Arab world" testID="culture">
      <Card accent>
        <RichText
          text="Optional chapters about life in the Arab world: hospitality, Ramadan, the script, markets, food, the desert, famous places, science and family. Open them any time; every Arabic word can be tapped for its meaning and sound."
          size={15}
        />
      </Card>
      {culture.length === 0 && <AppText muted>The culture chapters are being prepared.</AppText>}
      {culture.map((ch) => {
        const src = ch.hero ? CULTURE_IMAGES[ch.hero.file] : undefined;
        return (
          <Card
            key={ch.id}
            style={{ padding: 0, overflow: 'hidden' }}
            onPress={() => router.push({ pathname: '/culture/[id]', params: { id: ch.id } })}
            label={ch.title}
            testID={`culture-${ch.id}`}>
            {src ? (
              <Image
                source={src}
                style={{ width: '100%', aspectRatio: 2.2 }}
                contentFit="cover"
                accessibilityLabel={ch.hero!.alt}
              />
            ) : null}
            <View style={{ padding: 14, gap: 4 }}>
              <Caption>
                Chapter {ch.n} · from level {ch.level}
              </Caption>
              <AppText size={18} weight="800">
                {ch.emoji} {ch.title}
              </AppText>
              <GlossLine text={ch.titleAr} segs={ch.titleSegs} size={20} />
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}
