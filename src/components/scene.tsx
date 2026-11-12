// Scene photo on a scenario page (Prompt B M): one licensed Wikimedia Commons photo with up to 15 labelled
// objects. Each object has a red outline box that appears when you point at it (hover), touch it, or tap its word
// chip under the photo. The label (Arabic, transliteration, English, a note) shows on the same page, under the
// photo. No numbers anywhere: the word itself is the label.
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { PhotoFrame } from '@/components/photo';
import { AppText, ArText, Row, TrText } from '@/components/ui';
import type { Scene, SceneSpot } from '@/content/schema';
import { translitLine } from '@/lang/ar/tap';
import { tts } from '@/services/tts';
import { usePalette, useSettings } from '@/state/hooks';

import { RichText } from './tap';

const RED = '#E61E1E';

export function PhotoScene({ scene, testID = 'photo-scene' }: { scene: Scene; testID?: string }) {
  const c = usePalette();
  const settings = useSettings();
  const [selected, setSelected] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const spot: SceneSpot | null = selected !== null ? scene.spots[selected] : null;
  const tr = (sp: SceneSpot) => translitLine(sp.ar, settings.translitStyle);

  const pick = (i: number) => {
    const next = selected === i ? null : i;
    setSelected(next);
    setHover(null);
    if (next !== null && settings.readAloudOnTap) tts.speak(scene.spots[next].ar, { rate: settings.speechRate });
  };

  // Smaller boxes on top so a small object inside a large one can still be pointed at.
  const order = scene.spots.map((sp, i) => ({ sp, i })).sort((a, b) => b.sp.box.w * b.sp.box.h - a.sp.box.w * a.sp.box.h);

  return (
    <View testID={testID} style={{ gap: 10 }}>
      <AppText size={13} muted>
        Look around: point at an object or tap a word to see where it is.
      </AppText>
      <PhotoFrame photo={scene} aspectRatio={scene.width / scene.height}>
        {order.map(({ sp, i }) => {
          // the selected object always shows its outline; a hovered or touched one shows it too
          const on = selected === i || hover === i;
          return (
            <Pressable
              key={sp.ar}
              testID={`scene-box-${i}`}
              accessibilityRole="button"
              accessibilityLabel={`${sp.en}, ${tr(sp)}`}
              accessibilityState={{ selected: selected === i }}
              onPress={() => pick(i)}
              onPressIn={() => setHover(i)}
              onPressOut={() => setHover(null)}
              onHoverIn={() => setHover(i)}
              onHoverOut={() => setHover(null)}
              style={{
                position: 'absolute',
                left: `${sp.box.x}%`,
                top: `${sp.box.y}%`,
                width: `${sp.box.w}%`,
                height: `${sp.box.h}%`,
                borderWidth: on ? 3 : 0,
                borderColor: RED,
                borderRadius: 8,
                backgroundColor: on ? 'rgba(230,30,30,0.12)' : 'transparent',
              }}
            />
          );
        })}
      </PhotoFrame>
      {spot && (
        <View
          testID="scene-label"
          style={{
            borderRadius: 12,
            borderWidth: 2,
            borderColor: RED,
            backgroundColor: c.card,
            paddingHorizontal: 14,
            paddingVertical: 8,
            gap: 2,
          }}>
          <ArText size={30} bold>
            {spot.ar}
          </ArText>
          {settings.showTranslit && <TrText size={16}>{tr(spot)}</TrText>}
          <AppText size={17} weight="700" testID="scene-label-en">
            {spot.en}
          </AppText>
          {spot.note ? <RichText text={spot.note} size={14} muted /> : null}
        </View>
      )}
      <Row wrap gap={8}>
        {scene.spots.map((sp, i) => {
          const on = selected === i;
          return (
            <Pressable
              key={sp.ar}
              testID={`scene-chip-${i}`}
              accessibilityRole="button"
              accessibilityLabel={`${tr(sp)}, ${sp.en}`}
              accessibilityState={{ selected: on }}
              hitSlop={4}
              onPress={() => pick(i)}
              onHoverIn={() => setHover(i)}
              onHoverOut={() => setHover(null)}
              style={{ minHeight: 44, justifyContent: 'center' }}>
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 14,
                  borderWidth: on ? 2 : 1,
                  borderColor: on ? RED : c.border,
                  backgroundColor: on ? c.accentSoft : c.cardAlt,
                  alignItems: 'center',
                }}>
                <ArText size={20} bold color={on ? RED : c.text}>
                  {sp.ar}
                </ArText>
                {settings.showTranslit && <TrText size={12}>{tr(sp)}</TrText>}
              </View>
            </Pressable>
          );
        })}
      </Row>
    </View>
  );
}
