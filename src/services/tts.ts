// Text-to-speech behind a provider interface. Device TTS only: the app says so on About.
import * as Speech from 'expo-speech';

import { TTS_LOCALE } from '../base/config';
import { stripIsolates } from '../core/arabic';

export interface TtsProvider {
  speak(text: string, opts?: { rate?: number }): void;
  stop(): void;
}

export const deviceTts: TtsProvider = {
  speak(text, opts) {
    const clean = stripIsolates(text)
      .replace(/\u200D/g, '')
      .trim();
    if (!clean) return;
    try {
      Speech.stop();
      Speech.speak(clean, { language: TTS_LOCALE, rate: opts?.rate ?? 0.9 });
    } catch {
      // no voice on this device: stay silent rather than crash
    }
  },
  stop() {
    try {
      Speech.stop();
    } catch {
      /* ignore */
    }
  },
};

let provider: TtsProvider = deviceTts;
export const setTtsProvider = (p: TtsProvider) => (provider = p);
export const tts = {
  speak: (text: string, opts?: { rate?: number }) => provider.speak(text, opts),
  stop: () => provider.stop(),
};
