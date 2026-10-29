// Arabic numbers: counting-form cardinals (pausal, as said when counting), ordinals,
// clock times, Arabic-Indic digits and English. Pure and deterministic.

import { toArabicIndic } from './arabic';
import { translit, type TranslitStyle } from './translit';

const UNITS = [
  'صِفْر',
  'وَاحِد',
  'اِثْنَان',
  'ثَلَاثَة',
  'أَرْبَعَة',
  'خَمْسَة',
  'سِتَّة',
  'سَبْعَة',
  'ثَمَانِيَة',
  'تِسْعَة',
  'عَشَرَة',
];
// unit forms used before عَشَرَ in 13–19 (construct-like, ending in -ata)
const TEEN_UNITS = ['', '', '', 'ثَلَاثَةَ', 'أَرْبَعَةَ', 'خَمْسَةَ', 'سِتَّةَ', 'سَبْعَةَ', 'ثَمَانِيَةَ', 'تِسْعَةَ'];
const TENS = ['', '', 'عِشْرُون', 'ثَلَاثُون', 'أَرْبَعُون', 'خَمْسُون', 'سِتُّون', 'سَبْعُون', 'ثَمَانُون', 'تِسْعُون'];
const HUNDREDS = [
  '',
  'مِئَة',
  'مِئَتَان',
  'ثَلَاثُمِئَة',
  'أَرْبَعُمِئَة',
  'خَمْسُمِئَة',
  'سِتُّمِئَة',
  'سَبْعُمِئَة',
  'ثَمَانِيمِئَة',
  'تِسْعُمِئَة',
];
const THOUSANDS_PLURAL = 'آلَاف';
// unit forms before آلَاف (3–9 thousand): ثَلَاثَةُ آلَاف
const THOUSAND_UNITS = ['', '', '', 'ثَلَاثَةُ', 'أَرْبَعَةُ', 'خَمْسَةُ', 'سِتَّةُ', 'سَبْعَةُ', 'ثَمَانِيَةُ', 'تِسْعَةُ'];

const EN_UNITS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
];
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function below100(n: number): string {
  if (n <= 10) return UNITS[n];
  if (n === 11) return 'أَحَدَ عَشَرَ';
  if (n === 12) return 'اِثْنَا عَشَرَ';
  if (n < 20) return `${TEEN_UNITS[n - 10]} عَشَرَ`;
  const t = Math.floor(n / 10);
  const u = n % 10;
  if (u === 0) return TENS[t];
  return `${UNITS[u]} وَ${TENS[t]}`;
}

function below1000(n: number): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  if (h === 0) return below100(r);
  if (r === 0) return HUNDREDS[h];
  return `${HUNDREDS[h]} وَ${below100(r)}`;
}

/** Cardinal number 0–999,999 in the counting form, fully vocalised. */
export function numberToArabic(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 999_999) throw new RangeError(`Unsupported number: ${n}`);
  if (n < 1000) return below1000(n);
  const th = Math.floor(n / 1000);
  const r = n % 1000;
  let head: string;
  if (th === 1) head = 'أَلْف';
  else if (th === 2) head = 'أَلْفَان';
  else if (th <= 10) head = th === 10 ? 'عَشَرَةُ آلَاف' : `${THOUSAND_UNITS[th]} ${THOUSANDS_PLURAL}`;
  else head = `${below1000(th)} أَلْف`;
  return r === 0 ? head : `${head} وَ${below1000(r)}`;
}

export function numberToEnglish(n: number): string {
  if (n < 20) return EN_UNITS[n];
  if (n < 100) return EN_TENS[Math.floor(n / 10)] + (n % 10 ? '-' + EN_UNITS[n % 10] : '');
  if (n < 1000) return EN_UNITS[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' and ' + numberToEnglish(n % 100) : '');
  const th = Math.floor(n / 1000);
  const r = n % 1000;
  return numberToEnglish(th) + ' thousand' + (r ? (r < 100 ? ' and ' : ' ') + numberToEnglish(r) : '');
}

const ORD_M = ['', 'أَوَّل', 'ثَانٍ', 'ثَالِث', 'رَابِع', 'خَامِس', 'سَادِس', 'سَابِع', 'ثَامِن', 'تَاسِع', 'عَاشِر'];
const ORD_F = [
  '',
  'أُولَى',
  'ثَانِيَة',
  'ثَالِثَة',
  'رَابِعَة',
  'خَامِسَة',
  'سَادِسَة',
  'سَابِعَة',
  'ثَامِنَة',
  'تَاسِعَة',
  'عَاشِرَة',
];
const EN_ORD = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];

/** Ordinal 1–10, masculine or feminine (indefinite). */
export function ordinal(n: number, gender: 'm' | 'f' = 'm') {
  if (n < 1 || n > 10) throw new RangeError(`Ordinal out of range: ${n}`);
  return { ar: (gender === 'm' ? ORD_M : ORD_F)[n], en: EN_ORD[n] };
}

// "It is n o'clock": السَّاعَةُ + definite feminine ordinal (one o'clock uses الْوَاحِدَة)
const HOURS = [
  '',
  'الْوَاحِدَة',
  'الثَّانِيَة',
  'الثَّالِثَة',
  'الرَّابِعَة',
  'الْخَامِسَة',
  'السَّادِسَة',
  'السَّابِعَة',
  'الثَّامِنَة',
  'التَّاسِعَة',
  'الْعَاشِرَة',
  'الْحَادِيَةَ عَشْرَةَ',
  'الثَّانِيَةَ عَشْرَةَ',
];

export function clockTime(hour: number, minute: 0 | 15 | 30 | 45 = 0) {
  if (hour < 1 || hour > 12) throw new RangeError(`Hour out of range: ${hour}`);
  const extra = minute === 15 ? ' وَالرُّبْع' : minute === 30 ? ' وَالنِّصْف' : minute === 45 ? ' إِلَّا رُبْعًا' : '';
  const shownHour = minute === 45 ? (hour % 12) + 1 : hour;
  const enHour = numberToEnglish(shownHour);
  const en =
    minute === 0
      ? `${enHour} o'clock`
      : minute === 15
        ? `quarter past ${numberToEnglish(hour)}`
        : minute === 30
          ? `half past ${numberToEnglish(hour)}`
          : `quarter to ${enHour}`;
  return { ar: `السَّاعَةُ ${HOURS[shownHour]}${extra}`, en: `It is ${en}.` };
}

/** Parse Western or Arabic-Indic digits. */
export function parseDigits(s: string): number | null {
  const western = s.trim().replace(/[\u0660-\u0669]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  if (!/^\d{1,6}$/.test(western)) return null;
  return Number(western);
}

export function describeNumber(n: number, style: TranslitStyle = 'academic') {
  const ar = numberToArabic(n);
  return {
    digits: String(n),
    arabicDigits: toArabicIndic(n),
    ar,
    translit: translit(ar, { style, sentence: false }),
    en: numberToEnglish(n),
  };
}
