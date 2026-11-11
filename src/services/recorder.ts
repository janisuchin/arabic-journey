/**
 * Record-and-compare: the learner records themselves and plays the recording back next to
 * the model audio. Recordings stay on the device in a temporary file, are never uploaded,
 * and are discarded when the screen closes. Microphone permission is requested only when
 * the learner taps "Record", with an explanation first.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createAudioPlayer,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  type AudioPlayer,
} from 'expo-audio';

export type RecorderState = 'idle' | 'requesting' | 'denied' | 'recording' | 'recorded' | 'error';

export function useRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [state, setState] = useState<RecorderState>('idle');
  const [uri, setUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const player = useRef<AudioPlayer | null>(null);

  useEffect(
    () => () => {
      player.current?.remove();
      player.current = null;
    },
    [],
  );

  const start = useCallback(async () => {
    setError(null);
    setState('requesting');
    try {
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) {
        setState('denied');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setState('recording');
    } catch (e) {
      setError(String((e as Error)?.message ?? e));
      setState('error');
    }
  }, [recorder]);

  const stop = useCallback(async () => {
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      setUri(recorder.uri);
      setState(recorder.uri ? 'recorded' : 'error');
    } catch (e) {
      setError(String((e as Error)?.message ?? e));
      setState('error');
    }
  }, [recorder]);

  const play = useCallback(() => {
    if (!uri) return;
    player.current?.remove();
    player.current = createAudioPlayer(uri);
    player.current.play();
  }, [uri]);

  const discard = useCallback(() => {
    player.current?.remove();
    player.current = null;
    setUri(null);
    setState('idle');
  }, []);

  return { state, uri, error, start, stop, play, discard };
}
