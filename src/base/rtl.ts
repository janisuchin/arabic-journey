// Right-to-left setup. The whole app reads right to left: layout is mirrored (rows flow from the
// right, start/end instead of left/right, arrows and progress bars mirrored). Arabic text is
// tagged dir="rtl" lang="ar"; English runs are isolated as dir="ltr" lang="en" so their
// punctuation and numbers stay in place inside the mirrored layout.

import { I18nManager, Platform, type TextStyle } from 'react-native';

export const IS_RTL = true;

/** Call once at startup. Native needs a reload for forceRTL; the expo-localization plugin
 *  (forcesRTL: true in app.json) makes builds start in RTL from the first launch. */
export function setupRtl() {
  if (Platform.OS === 'web') {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    }
    return;
  }
  try {
    I18nManager.allowRTL(true);
    if (!I18nManager.isRTL) I18nManager.forceRTL(true);
  } catch {
    /* ignore */
  }
}

/** Physical side where text starts in this RTL app. */
export const START: TextStyle['textAlign'] = 'right';

/** Arrows: "next" points left in RTL, "back" points right. */
export const NEXT_ICON = 'arrow-back' as const;
export const BACK_ICON = 'arrow-forward' as const;
export const ROW_CHEVRON = 'chevron-back' as const;

/** Web-only DOM attributes (react-native-web forwards dir and lang to the element). */
export function webLang(lang: 'ar' | 'en' | 'ar-Latn', dir: 'rtl' | 'ltr'): Record<string, string> {
  return Platform.OS === 'web' ? { lang, dir } : {};
}
