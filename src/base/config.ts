// App-wide configuration. The only place names, colours and links live.

export const APP_NAME = 'Arabic Journey';
export const LANGUAGE = 'Arabic';
export const LANGUAGE_NATIVE = 'الْعَرَبِيَّة';
export const LANG_CODE = 'ar';
/** BCP-47 tag for device text-to-speech (Modern Standard Arabic). */
export const TTS_LOCALE = 'ar-SA';
export const STORAGE_PREFIX = 'arabic-journey';
/** Donations are hidden while this is null. */
export const DONATE_URL: string | null = null;
/** Arabic Journey's own accent: palm green (Nihongo is vermilion, German is indigo). */
export const ACCENT = '#0B7A5C';
export const TOTAL_DAYS = 90;
export const UNLOCK_ALL_EDITION = process.env.EXPO_PUBLIC_UNLOCK_ALL === '1';
export const VERSION = '0.1.0';
