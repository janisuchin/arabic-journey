// Text direction setup. UI_DIR decides the app shell: 'ltr' = Journey layout for English readers (rows flow
// from the left, English and transliteration left-aligned, arrows point right), 'rtl' = fully mirrored
// Arabic-native layout. Arabic text itself is ALWAYS right-to-left (dir="rtl" lang="ar"); AR_ALIGN decides
// which edge Arabic lines sit on inside the chosen layout. English runs are isolated as dir="ltr" lang="en".

import { I18nManager, Platform, type TextStyle } from 'react-native';

export const UI_DIR: 'ltr' | 'rtl' = (process.env.EXPO_PUBLIC_UI_DIR as 'ltr' | 'rtl') || 'ltr';
export const IS_RTL = UI_DIR === 'rtl';

/** Edge for Arabic lines. 'start' = same edge as the English (Nihongo style); 'right' = textbook column. */
const ARABIC_EDGE: 'start' | 'right' = (process.env.EXPO_PUBLIC_AR_EDGE as 'start' | 'right') || 'start';

/** Call once at startup. Native needs a reload for forceRTL; the expo-localization plugin
 *  (forcesRTL in app.json) makes builds start in the right direction from the first launch. */
export function setupRtl() {
  if (Platform.OS === 'web') {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('dir', UI_DIR);
      document.documentElement.setAttribute('lang', IS_RTL ? 'ar' : 'en');
    }
    return;
  }
  try {
    I18nManager.allowRTL(IS_RTL);
    if (I18nManager.isRTL !== IS_RTL) I18nManager.forceRTL(IS_RTL);
  } catch {
    /* ignore */
  }
}

/** Physical side where English and transliteration start. */
export const START: TextStyle['textAlign'] = IS_RTL ? 'right' : 'left';
/** Physical side where Arabic lines sit. */
export const AR_START: TextStyle['textAlign'] = IS_RTL || ARABIC_EDGE === 'right' ? 'right' : 'left';

/** Arrows: "next" points along the reading direction of the UI. */
export const NEXT_ICON = IS_RTL ? ('arrow-back' as const) : ('arrow-forward' as const);
export const BACK_ICON = IS_RTL ? ('arrow-forward' as const) : ('arrow-back' as const);
export const ROW_CHEVRON = IS_RTL ? ('chevron-back' as const) : ('chevron-forward' as const);

/** Web-only DOM attributes (react-native-web forwards dir and lang to the element). */
export function webLang(lang: 'ar' | 'en' | 'ar-Latn', dir: 'rtl' | 'ltr'): Record<string, string> {
  return Platform.OS === 'web' ? { lang, dir } : {};
}
