/**
 * Speech recognition provider (replaceable).
 *
 * Web: the browser's Web Speech API (SpeechRecognition) with lang ar-SA. In Chrome the
 * audio is sent to a cloud service for recognition — the learner must consent first
 * (Speaking lab or Settings → Speaking). On iOS/Android builds no recogniser is bundled in this release;
 * the app falls back to record-and-compare (listen to yourself vs. the model).
 *
 * IMPORTANT: a transcript only shows which words were recognised. It is NOT a
 * pronunciation score, and the app never presents it as one.
 */
import { Platform } from 'react-native';

export interface RecognitionResult {
  transcript: string;
  alternatives: string[];
  confidence: number | null;
}

export interface RecognitionProvider {
  readonly name: string;
  /** may send audio to a third-party service */
  readonly cloud: boolean;
  isAvailable(): boolean;
  listen(opts: { lang: string; timeoutMs?: number }): Promise<RecognitionResult>;
  abort(): void;
}

type SR = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string; confidence: number }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function webCtor(): (new () => SR) | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export class RecognitionError extends Error {
  constructor(
    public code: 'not-allowed' | 'no-speech' | 'network' | 'unavailable' | 'aborted' | 'other',
    message: string,
  ) {
    super(message);
  }
}

class WebSpeechProvider implements RecognitionProvider {
  readonly name = 'Browser speech recognition (Web Speech API)';
  readonly cloud = true;
  private current: SR | null = null;
  isAvailable() {
    return !!webCtor();
  }
  listen({ lang, timeoutMs = 9000 }: { lang: string; timeoutMs?: number }): Promise<RecognitionResult> {
    const Ctor = webCtor();
    if (!Ctor) return Promise.reject(new RecognitionError('unavailable', 'Speech recognition is not supported in this browser.'));
    return new Promise((resolve, reject) => {
      const rec = new Ctor();
      this.current = rec;
      rec.lang = lang;
      rec.interimResults = false;
      rec.maxAlternatives = 3;
      rec.continuous = false;
      let done = false;
      const timer = setTimeout(() => rec.stop(), timeoutMs);
      rec.onresult = (e) => {
        done = true;
        clearTimeout(timer);
        const res = e.results[0];
        const alts = Array.from({ length: res.length }, (_, i) => res[i]);
        resolve({
          transcript: alts[0]?.transcript ?? '',
          alternatives: alts.map((a) => a.transcript),
          confidence: alts[0]?.confidence ?? null,
        });
      };
      rec.onerror = (e) => {
        done = true;
        clearTimeout(timer);
        const code =
          e.error === 'not-allowed' || e.error === 'service-not-allowed'
            ? 'not-allowed'
            : e.error === 'no-speech'
              ? 'no-speech'
              : e.error === 'network'
                ? 'network'
                : e.error === 'aborted'
                  ? 'aborted'
                  : 'other';
        reject(new RecognitionError(code, e.error));
      };
      rec.onend = () => {
        clearTimeout(timer);
        if (!done) reject(new RecognitionError('no-speech', 'No speech detected.'));
        this.current = null;
      };
      try {
        rec.start();
      } catch (err) {
        reject(new RecognitionError('other', String(err)));
      }
    });
  }
  abort() {
    this.current?.abort();
  }
}

class UnavailableProvider implements RecognitionProvider {
  readonly name = 'Not available on this device';
  readonly cloud = false;
  isAvailable() {
    return false;
  }
  listen(): Promise<RecognitionResult> {
    return Promise.reject(new RecognitionError('unavailable', 'Speech recognition is not available in this build.'));
  }
  abort() {}
}

let provider: RecognitionProvider = Platform.OS === 'web' ? new WebSpeechProvider() : new UnavailableProvider();

export function getRecognizer(): RecognitionProvider {
  return provider;
}
export function setRecognizer(p: RecognitionProvider) {
  provider = p;
}
