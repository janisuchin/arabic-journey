// Text-to-speech behind a provider interface. Device TTS only: the app says so on About.
// Arabic voices differ a lot in quality: the older desktop voices ignore the vowel marks (بُنِيَتْ read "bunī"),
// while the online "Natural / Neural" voices read the harakat. The best Arabic voice on the device is chosen
// automatically; Settings lets the learner pick another one.
import * as Speech from 'expo-speech';

import { TTS_LOCALE } from '../base/config';
import { stripIsolates } from '../core/arabic';

export interface TtsProvider {
  speak(
    text: string,
    opts?: { rate?: number; voice?: string; onDone?: () => void; onStopped?: () => void; onError?: () => void },
  ): void;
  stop(): void;
}

export interface ArabicVoice {
  id: string;
  name: string;
  language: string;
  /** higher is better (neural / online voices first) */
  rank: number;
}

const clean = (text: string) => stripIsolates(text).replace(/‍/g, '').trim();

export const deviceTts: TtsProvider = {
  speak(text, opts) {
    const t = clean(text);
    if (!t) return;
    try {
      Speech.stop();
      Speech.speak(t, {
        language: TTS_LOCALE,
        voice: opts?.voice,
        rate: opts?.rate ?? 0.9,
        onDone: opts?.onDone,
        onStopped: opts?.onStopped,
        onError: opts?.onError,
      });
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

/** How well a voice reads vowelled Arabic: neural / online voices read the harakat, old desktop voices guess. */
export function voiceRank(name: string, language: string): number {
  let r = 0;
  if (/natural|neural|online|premium|enhanced|wavenet/i.test(name)) r += 10;
  if (/google/i.test(name)) r += 5;
  if (/^ar[-_](SA|EG|JO|AE)/i.test(language)) r += 1;
  return r;
}

let voiceCache: ArabicVoice[] | null = null;
let chosen: string | null = null;
let auto: string | undefined;

/** Arabic voices on this device, best first (web voices load lazily, so retry briefly). */
export async function arabicVoices(): Promise<ArabicVoice[]> {
  if (voiceCache?.length) return voiceCache;
  for (let i = 0; i < 6; i++) {
    try {
      const all = await Speech.getAvailableVoicesAsync();
      voiceCache = all
        .filter((v) => /^ar([-_]|$)/i.test(v.language))
        .map((v) => ({ id: v.identifier, name: v.name, language: v.language, rank: voiceRank(v.name, v.language) }))
        .sort((a, b) => b.rank - a.rank || a.name.localeCompare(b.name));
    } catch {
      voiceCache = [];
    }
    if (voiceCache.length) break;
    await new Promise((r) => setTimeout(r, 250));
  }
  auto = voiceCache?.[0]?.id;
  return voiceCache ?? [];
}

/** The learner's choice from Settings (null = automatic). */
export function setPreferredVoice(id: string | null) {
  chosen = id;
  if (!voiceCache) void arabicVoices();
}

let provider: TtsProvider = deviceTts;
export const setTtsProvider = (p: TtsProvider) => (provider = p);
export const tts = {
  speak: (text: string, opts?: { rate?: number; onDone?: () => void; onStopped?: () => void; onError?: () => void }) =>
    provider.speak(text, { ...opts, voice: chosen ?? auto }),
  stop: () => provider.stop(),
};
