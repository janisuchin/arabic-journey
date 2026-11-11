// Speaking practice: model audio (normal and slow), optional speech recognition (only after consent), record and
// compare, and a self-check. Honest by design: the recogniser's transcript shows which words it wrote down. It is not
// a pronunciation score, and the app never invents sound-by-sound scores.
import { useState } from 'react';
import { Platform, Text, View } from 'react-native';

import { TTS_LOCALE } from '@/base/config';
import { webLang } from '@/base/rtl';
import type { Seg } from '@/content/schema';
import { compareSpeech, type SpeechCheck } from '@/core/speech';
import { useRecorder } from '@/services/recorder';
import { getRecognizer, RecognitionError } from '@/services/speech-recognition';
import { tts } from '@/services/tts';
import { useFs, usePalette, useSettings } from '@/state/hooks';
import { useLearner } from '@/state/store';
import { TapText } from './tap';
import { AR_FONT_BOLD, AppText, Button, Card, Row } from './ui';

export type SpeakResult = 'clear' | 'again';

function Note({ children, tone, testID }: { children: React.ReactNode; tone?: 'warn'; testID?: string }) {
  const c = usePalette();
  return (
    <View
      testID={testID}
      style={{
        borderRadius: 12,
        borderWidth: 1,
        borderColor: tone === 'warn' ? c.bad : c.border,
        backgroundColor: c.card,
        padding: 12,
        gap: 6,
      }}>
      {children}
    </View>
  );
}

export function SpeakPractice({
  ar,
  en,
  segs,
  audio,
  onDone,
  testID = 'speak',
}: {
  ar: string;
  en: string;
  segs?: Seg[];
  /** text for the voice when it differs from the display (e.g. digits read as words) */
  audio?: string;
  onDone?: (r: SpeakResult) => void;
  testID?: string;
}) {
  const c = usePalette();
  const fs = useFs();
  const settings = useSettings();
  const update = useLearner((s) => s.updateSettings);
  const rec = getRecognizer();
  const recorder = useRecorder();
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState<{ transcript: string; check: SpeechCheck } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const listen = async () => {
    setError(null);
    setHeard(null);
    setListening(true);
    try {
      const r = await rec.listen({ lang: TTS_LOCALE });
      // the recogniser may offer several readings: show the one closest to the model
      const options = [r.transcript, ...r.alternatives].filter((t, i, a) => a.indexOf(t) === i);
      let best = { transcript: r.transcript, check: compareSpeech(ar, r.transcript) };
      for (const t of options) {
        const check = compareSpeech(ar, t);
        if (check.matched > best.check.matched) best = { transcript: t, check };
      }
      setHeard(best);
    } catch (e) {
      const code = e instanceof RecognitionError ? e.code : 'other';
      setError(
        code === 'not-allowed'
          ? 'Microphone access was denied. You can still listen, repeat and use the self-check below.'
          : code === 'no-speech'
            ? 'No speech was heard. Try again a little closer to the microphone.'
            : code === 'network'
              ? 'The speech service could not be reached (it needs an internet connection).'
              : code === 'unavailable'
                ? 'Speech recognition is not available here.'
                : 'Speech recognition did not work this time. Try again or use the self-check.',
      );
    } finally {
      setListening(false);
    }
  };

  return (
    <View testID={testID} style={{ gap: 12 }}>
      <Card accent>
        <TapText text={ar} segs={segs} size={28} center />
        <AppText center muted>
          {en}
        </AppText>
        <Row wrap style={{ justifyContent: 'center' }}>
          <Button
            kind="secondary"
            icon="volume-high"
            label="Hear it"
            testID={`${testID}-model`}
            onPress={() => tts.speak(audio ?? ar, { rate: settings.speechRate })}
          />
          <Button
            kind="ghost"
            icon="hourglass-outline"
            label="Slowly"
            testID={`${testID}-slow`}
            onPress={() => tts.speak(audio ?? ar, { rate: settings.slowRate })}
          />
        </Row>
        <AppText size={13} muted center>
          1. Listen (slowly first). 2. Say it aloud. 3. Check yourself.
        </AppText>
      </Card>

      {/* speech recognition, only with consent */}
      {rec.isAvailable() ? (
        settings.speakingConsent ? (
          <View style={{ gap: 8 }}>
            <Button
              label={listening ? 'Listening… speak now' : 'Speak and check the words'}
              icon="mic"
              disabled={listening}
              onPress={listen}
              testID={`${testID}-listen`}
            />
            {heard && (
              <Note testID={`${testID}-heard`}>
                <AppText size={13} muted>
                  The recogniser wrote:
                </AppText>
                <Text
                  {...webLang('ar', 'rtl')}
                  style={{ fontFamily: AR_FONT_BOLD, fontSize: fs(20), color: c.text, textAlign: 'center' }}>
                  {heard.transcript || '—'}
                </Text>
                <Text {...webLang('ar', 'rtl')} style={{ fontFamily: AR_FONT_BOLD, fontSize: fs(22), textAlign: 'center' }}>
                  {heard.check.parts.map((p, i) => (
                    <Text key={i} style={{ color: p.kind === 'same' ? c.good : c.bad }}>
                      {p.kind === 'extra' ? `(${p.text})` : p.kind === 'missing' ? `[${p.text}]` : p.text}{' '}
                    </Text>
                  ))}
                </Text>
                <AppText size={13} testID={`${testID}-matched`}>
                  {heard.check.matched} of {heard.check.total} words recognised.
                </AppText>
                <AppText size={12} muted>
                  Green = written down by the recogniser · [red] = not recognised · (red) = written instead. Harakat and spellings
                  like ة/ه are ignored. This checks words, not how native-like you sound, and it can be wrong with accents, quiet
                  speech or noise.
                </AppText>
              </Note>
            )}
            {error && (
              <Note tone="warn" testID={`${testID}-error`}>
                <AppText size={14}>{error}</AppText>
              </Note>
            )}
          </View>
        ) : (
          <Note testID={`${testID}-consent-box`}>
            <AppText size={14}>
              Optional: let your browser&apos;s speech recogniser check which words it hears. In Chrome and Edge your voice is
              sent to the browser maker&apos;s online service. Arabic Journey itself never stores or uploads your voice.
            </AppText>
            <Button
              kind="secondary"
              icon="mic-outline"
              label="Allow speech recognition"
              testID={`${testID}-consent`}
              onPress={() => update({ speakingConsent: true })}
            />
          </Note>
        )
      ) : (
        <AppText size={13} muted testID={`${testID}-no-recogniser`}>
          {Platform.OS === 'web'
            ? 'This browser has no speech recognition. Use record and compare, and the self-check below.'
            : 'Speech recognition is not included in this app build. Use record and compare, and the self-check below.'}
        </AppText>
      )}

      {/* record and compare */}
      <View style={{ gap: 8 }}>
        <AppText weight="800">Record and compare (stays on this device)</AppText>
        <Row wrap>
          {recorder.state === 'recording' ? (
            <Button icon="stop" label="Stop" onPress={recorder.stop} testID={`${testID}-rec-stop`} />
          ) : (
            <Button
              kind="secondary"
              icon="radio-button-on"
              label={recorder.uri ? 'Record again' : 'Record myself'}
              disabled={recorder.state === 'requesting'}
              onPress={recorder.start}
              testID={`${testID}-rec`}
            />
          )}
          {recorder.uri && <Button kind="secondary" icon="play" label="Play mine" onPress={recorder.play} />}
          {recorder.uri && (
            <Button
              kind="ghost"
              icon="volume-high"
              label="Model"
              onPress={() => tts.speak(audio ?? ar, { rate: settings.speechRate })}
            />
          )}
        </Row>
        {recorder.state === 'denied' && (
          <Note tone="warn">
            <AppText size={14}>
              The microphone was not allowed. That&apos;s fine: listen, repeat aloud and use the self-check. You can allow the
              microphone later in your device or browser settings.
            </AppText>
          </Note>
        )}
        {recorder.state === 'error' && (
          <Note tone="warn">
            <AppText size={14}>Recording is not available here. Use the self-check instead.</AppText>
          </Note>
        )}
      </View>

      {onDone && (
        <Row wrap>
          <Button icon="checkmark" label="I said it clearly" onPress={() => onDone('clear')} testID={`${testID}-self-ok`} />
          <Button
            kind="ghost"
            icon="refresh"
            label="I need more practice"
            onPress={() => onDone('again')}
            testID={`${testID}-self-again`}
          />
        </Row>
      )}
    </View>
  );
}
