// UI kit shared by every screen. Layout is mirrored for RTL: rows flow from the right and
// spacing uses start/end. Arabic text uses Noto Naskh Arabic (full contextual shaping).

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BACK_ICON, START, webLang } from '../base/rtl';
import { stripHarakat } from '../core/arabic';
import { useFs, usePalette, useSettings } from '../state/hooks';

export const AR_FONT = 'NotoNaskhArabic_400Regular';
export const AR_FONT_BOLD = 'NotoNaskhArabic_700Bold';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export function Icon({ name, size = 22, color, label }: { name: IconName; size?: number; color?: string; label?: string }) {
  const c = usePalette();
  return <Ionicons name={name} size={size} color={color ?? c.accent} accessibilityLabel={label} />;
}

interface AppTextProps {
  children: ReactNode;
  size?: number;
  weight?: TextStyle['fontWeight'];
  muted?: boolean;
  color?: string;
  center?: boolean;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  testID?: string;
}

/** English text: an isolated left-to-right run, aligned to the start (right) of the RTL layout. */
export function AppText({ children, size = 16, weight, muted, color, center, style, numberOfLines, testID }: AppTextProps) {
  const c = usePalette();
  const fs = useFs();
  return (
    <Text
      {...webLang('en', 'ltr')}
      testID={testID}
      numberOfLines={numberOfLines}
      style={[
        { color: color ?? (muted ? c.textMuted : c.text), fontSize: fs(size), lineHeight: fs(size) * 1.45, fontWeight: weight },
        { writingDirection: 'ltr', textAlign: center ? 'center' : START },
        style,
      ]}>
      {children}
    </Text>
  );
}

interface ArTextProps {
  children: string;
  size?: number;
  bold?: boolean;
  color?: string;
  center?: boolean;
  style?: StyleProp<TextStyle>;
  selectable?: boolean;
}

/** Arabic text: dir="rtl" lang="ar", Naskh font, harakat shown unless the learner turned them off. */
export function ArText({ children, size = 24, bold, color, center, style, selectable }: ArTextProps) {
  const c = usePalette();
  const fs = useFs();
  const { showHarakat } = useSettings();
  return (
    <Text
      {...webLang('ar', 'rtl')}
      selectable={selectable}
      style={[
        {
          color: color ?? c.text,
          fontSize: fs(size),
          lineHeight: fs(size) * 1.9,
          fontFamily: bold ? AR_FONT_BOLD : AR_FONT,
          writingDirection: 'rtl',
          textAlign: center ? 'center' : START,
        },
        style,
      ]}>
      {showHarakat ? children : stripHarakat(children)}
    </Text>
  );
}

/** Transliteration line: gold, italic, semi-bold, straight after the script line. */
export function TrText({
  children,
  size = 15,
  center,
  style,
}: {
  children: ReactNode;
  size?: number;
  center?: boolean;
  style?: StyleProp<TextStyle>;
}) {
  const c = usePalette();
  const fs = useFs();
  return (
    <Text
      {...webLang('ar-Latn', 'ltr')}
      style={[
        { color: c.translit, fontStyle: 'italic', fontWeight: '600', fontSize: fs(size), lineHeight: fs(size) * 1.4 },
        { writingDirection: 'ltr', textAlign: center ? 'center' : START },
        style,
      ]}>
      {children}
    </Text>
  );
}

export function Caption({ children, style, testID }: { children: ReactNode; style?: StyleProp<TextStyle>; testID?: string }) {
  const c = usePalette();
  return (
    <AppText
      testID={testID}
      size={12}
      weight="700"
      color={c.accent}
      style={[{ letterSpacing: 1.2, textTransform: 'uppercase' }, style]}>
      {children}
    </AppText>
  );
}

export function Card({
  children,
  style,
  onPress,
  label,
  testID,
  accent,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  label?: string;
  testID?: string;
  accent?: boolean;
}) {
  const c = usePalette();
  const base: ViewStyle = {
    backgroundColor: accent ? c.accentSoft : c.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: c.border,
    gap: 8,
  };
  if (!onPress)
    return (
      <View style={[base, style]} testID={testID}>
        {children}
      </View>
    );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [base, { opacity: pressed ? 0.85 : 1 }, style]}>
      {children}
    </Pressable>
  );
}

export function Row({
  children,
  gap = 8,
  style,
  wrap,
}: {
  children: ReactNode;
  gap?: number;
  style?: StyleProp<ViewStyle>;
  wrap?: boolean;
}) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap, flexWrap: wrap ? 'wrap' : 'nowrap' }, style]}>
      {children}
    </View>
  );
}

export function Button({
  label,
  onPress,
  kind = 'primary',
  icon,
  iconAfter,
  disabled,
  testID,
  style,
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'secondary' | 'ghost';
  icon?: IconName;
  iconAfter?: IconName;
  disabled?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const c = usePalette();
  const bg = kind === 'primary' ? c.accent : kind === 'secondary' ? c.accentSoft : 'transparent';
  const fg = kind === 'primary' ? c.accentText : c.accent;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: 48,
          paddingHorizontal: 18,
          borderRadius: 14,
          backgroundColor: bg,
          borderWidth: kind === 'ghost' ? 1 : 0,
          borderColor: c.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        },
        style,
      ]}>
      {icon && <Ionicons name={icon} size={20} color={fg} />}
      <AppText weight="700" color={fg} center>
        {label}
      </AppText>
      {iconAfter && <Ionicons name={iconAfter} size={20} color={fg} />}
    </Pressable>
  );
}

export function IconButton({
  icon,
  label,
  onPress,
  size = 22,
  testID,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  size?: number;
  testID?: string;
}) {
  const c = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => ({
        minWidth: 44,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
        backgroundColor: pressed ? c.accentSoft : 'transparent',
      })}>
      <Ionicons name={icon} size={size} color={c.accent} />
    </Pressable>
  );
}

/** Progress bar. In RTL the fill grows from the right (the start of the layout). */
export function ProgressBar({ value, height = 8, label }: { value: number; height?: number; label?: string }) {
  const c = usePalette();
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? 'progress'}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
      style={{ height, borderRadius: height, backgroundColor: c.cardAlt, overflow: 'hidden', flexDirection: 'row' }}>
      <View style={{ width: `${pct}%`, backgroundColor: c.accent, borderRadius: height }} />
    </View>
  );
}

export function Pill({
  label,
  color,
  onPress,
  testID,
}: {
  label: string;
  color?: string;
  onPress?: () => void;
  testID?: string;
}) {
  const c = usePalette();
  const inner = (
    <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, backgroundColor: color ?? c.accentSoft }}>
      <AppText size={12} weight="700" color={color ? '#fff' : c.accent}>
        {label}
      </AppText>
    </View>
  );
  if (!onPress) return inner;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      testID={testID}
      hitSlop={8}
      style={{ minHeight: 44, justifyContent: 'center' }}>
      {inner}
    </Pressable>
  );
}

export function SectionTitle({ children, icon }: { children: ReactNode; icon?: IconName }) {
  return (
    <Row style={{ marginTop: 12, marginBottom: 4 }}>
      {icon && <Icon name={icon} size={20} />}
      <AppText size={18} weight="800" style={{ flexShrink: 1 }}>
        {children}
      </AppText>
    </Row>
  );
}

export function Screen({
  children,
  title,
  back = true,
  scroll = true,
  right,
  testID,
}: {
  children: ReactNode;
  title?: string;
  back?: boolean;
  scroll?: boolean;
  right?: ReactNode;
  testID?: string;
}) {
  const c = usePalette();
  const header =
    title || back ? (
      <Row style={styles.header}>
        {back && (
          <IconButton
            icon={BACK_ICON}
            label="Back"
            testID="back"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          />
        )}
        {title ? (
          <AppText size={18} weight="800" style={{ flex: 1 }} numberOfLines={1}>
            {title}
          </AppText>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        {right}
      </Row>
    ) : null;
  const body = <View style={styles.inner}>{children}</View>;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={['top', 'left', 'right']} testID={testID}>
      {header}
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {body}
        </ScrollView>
      ) : (
        <View style={[styles.scroll, { flex: 1 }]}>{body}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 8, paddingTop: 4, minHeight: 52, maxWidth: 760, width: '100%', alignSelf: 'center' },
  scroll: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8 },
  inner: { width: '100%', maxWidth: 720, alignSelf: 'center', gap: 12 },
});
