// Licensed Wikimedia Commons photos with a small © badge (from Nihongo Journey). The licences (CC BY / CC BY-SA)
// need the author credited: tapping © shows a credit strip over the photo that links to the Commons page.
// Every photo is also listed on the Credits page.
import { Image } from 'expo-image';
import { useState, type ReactNode } from 'react';
import { Linking, Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { CULTURE_IMAGES, REAL_LIFE_IMAGES, SCENE_IMAGES } from '@/content/culture-images.generated';
import type { Photo } from '@/content/schema';
import { usePalette } from '@/state/hooks';

import { RichText } from './tap';

export function PhotoFrame({
  photo,
  aspectRatio = 3 / 2,
  style,
  children,
}: {
  photo: Photo;
  aspectRatio?: number;
  style?: StyleProp<ViewStyle>;
  /** Overlays drawn on the photo (scene outlines), under the credit strip and the © badge. */
  children?: ReactNode;
}) {
  const c = usePalette();
  const [open, setOpen] = useState(false);
  const src = CULTURE_IMAGES[photo.file] ?? REAL_LIFE_IMAGES[photo.file] ?? SCENE_IMAGES[photo.file];
  if (!src) return null;
  return (
    <View style={{ gap: 4 }}>
      <View style={[{ width: '100%', aspectRatio, borderRadius: 16, overflow: 'hidden', backgroundColor: c.cardAlt }, style]}>
        <Image
          source={src}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          accessibilityLabel={photo.alt}
          transition={200}
        />
        {children}
        {open && (
          <Pressable
            onPress={() => void Linking.openURL(photo.credit.source)}
            accessibilityRole="link"
            accessibilityLabel="Open the photo page on Wikimedia Commons"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              paddingVertical: 6,
              paddingHorizontal: 36,
              backgroundColor: 'rgba(20,18,15,0.75)',
            }}>
            <Text style={{ color: '#fff', fontSize: 11 }} numberOfLines={2}>
              Photo: {photo.credit.author} · {photo.credit.license} · Wikimedia Commons ↗
            </Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => setOpen(!open)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={open ? 'Hide photo credit' : 'Show photo credit'}
          testID="photo-credit"
          style={{
            position: 'absolute',
            right: 6,
            bottom: 6,
            width: 24,
            height: 24,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(20,18,15,0.6)',
          }}>
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', lineHeight: 19 }}>©</Text>
        </Pressable>
      </View>
      {photo.caption ? <RichText text={photo.caption} size={13} muted /> : null}
    </View>
  );
}
