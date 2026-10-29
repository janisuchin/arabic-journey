// Journey colour themes. Every Journey app's accent is selectable; this app's own is the default.

import { ACCENT } from './config';

export const THEME_NAMES = ['Palm', 'Vermilion', 'Indigo', 'Ocean', 'Plum'] as const;
export type ThemeName = (typeof THEME_NAMES)[number];

const ACCENTS: Record<ThemeName, string> = {
  Palm: ACCENT,
  Vermilion: '#C23B22',
  Indigo: '#4B44D6',
  Ocean: '#0E6BA8',
  Plum: '#8E3B8E',
};

export interface Palette {
  bg: string;
  card: string;
  cardAlt: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  accentText: string;
  accentSoft: string;
  /** every transliteration line: gold, italic, semi-bold */
  translit: string;
  good: string;
  bad: string;
  highlight: string;
  shadow: string;
  dark: boolean;
}

function mix(hex: string, with_: string, t: number) {
  const a = parseInt(hex.slice(1), 16);
  const b = parseInt(with_.slice(1), 16);
  const ch = (v: number, s: number) => (v >> s) & 255;
  const m = (s: number) => Math.round(ch(a, s) * (1 - t) + ch(b, s) * t);
  return '#' + ((1 << 24) | (m(16) << 16) | (m(8) << 8) | m(0)).toString(16).slice(1);
}

export function paletteFor(name: ThemeName, isDark: boolean, highContrast: boolean): Palette {
  const accent = ACCENTS[name] ?? ACCENT;
  if (highContrast)
    return isDark
      ? {
          bg: '#000000',
          card: '#0D0D0D',
          cardAlt: '#1A1A1A',
          text: '#FFFFFF',
          textMuted: '#E6E6E6',
          border: '#FFFFFF',
          accent: mix(accent, '#FFFFFF', 0.45),
          accentText: '#000000',
          accentSoft: '#1F1F1F',
          translit: '#FFD54A',
          good: '#5CFF8A',
          bad: '#FF6B6B',
          highlight: '#5C4A00',
          shadow: '#000000',
          dark: true,
        }
      : {
          bg: '#FFFFFF',
          card: '#FFFFFF',
          cardAlt: '#F2F2F2',
          text: '#000000',
          textMuted: '#1A1A1A',
          border: '#000000',
          accent: mix(accent, '#000000', 0.35),
          accentText: '#FFFFFF',
          accentSoft: '#E8E8E8',
          translit: '#6B4A00',
          good: '#006B2E',
          bad: '#A30000',
          highlight: '#FFE680',
          shadow: '#000000',
          dark: false,
        };
  return isDark
    ? {
        bg: '#111614',
        card: '#1B2220',
        cardAlt: '#232C29',
        text: '#EEF2F0',
        textMuted: '#A9B5B0',
        border: '#2E3A36',
        accent: mix(accent, '#FFFFFF', 0.25),
        accentText: '#FFFFFF',
        accentSoft: mix(accent, '#111614', 0.75),
        translit: '#E5B842',
        good: '#4CC38A',
        bad: '#F07167',
        highlight: '#5A4A12',
        shadow: '#000000',
        dark: true,
      }
    : {
        bg: '#F6F4EF',
        card: '#FFFFFF',
        cardAlt: '#F0EDE6',
        text: '#1D2523',
        textMuted: '#5D6965',
        border: '#E2DDD3',
        accent,
        accentText: '#FFFFFF',
        accentSoft: mix(accent, '#FFFFFF', 0.88),
        translit: '#9A6B00',
        good: '#1E8E5A',
        bad: '#C2412D',
        highlight: '#FFE9A8',
        shadow: '#2A2A2A',
        dark: false,
      };
}
