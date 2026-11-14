import { NotoNaskhArabic_400Regular, NotoNaskhArabic_700Bold, useFonts } from '@expo-google-fonts/noto-naskh-arabic';
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useSyncExternalStore } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { IS_RTL, setupRtl, webLang } from '@/base/rtl';
import { setPreferredVoice, tts } from '@/services/tts';
import { usePalette } from '@/state/hooks';
import { loadLearner, useLearner, useProfiles } from '@/state/store';

setupRtl();
SplashScreen.preventAutoHideAsync().catch(() => undefined);

function useProfilesHydrated() {
  return useSyncExternalStore(
    (cb) => useProfiles.persist.onFinishHydration(cb),
    () => useProfiles.persist.hasHydrated(),
    () => false,
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ NotoNaskhArabic_400Regular, NotoNaskhArabic_700Bold });
  const profilesHydrated = useProfilesHydrated();
  const currentId = useProfiles((s) => s.currentId);
  const learnerHydrated = useLearner((s) => s.hydrated);
  const c = usePalette();
  const pathname = usePathname();
  // speech never follows the learner to another screen (a dialogue's Play all, a long example)
  useEffect(() => tts.stop(), [pathname]);
  const voiceId = useLearner((s) => s.settings.voiceId);
  useEffect(() => setPreferredVoice(voiceId), [voiceId]);

  useEffect(() => {
    if (profilesHydrated) loadLearner(currentId);
  }, [currentId, profilesHydrated]);

  const ready = (fontsLoaded || !!fontError) && profilesHydrated && learnerHydrated;
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: c.bg }} {...webLang(IS_RTL ? 'ar' : 'en', IS_RTL ? 'rtl' : 'ltr')}>
        <StatusBar style={c.dark ? 'light' : 'dark'} />
        {ready ? (
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }} />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={c.accent} />
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
}
