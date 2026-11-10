// Time lab engine: clock times in five-minute steps, parts of the day, weekdays, the three month-name sets
// (Egypt & Gulf, Levant & Iraq, Hijri), dates in words and the Hijri date. Every phrase comes with its own
// word-by-word glosses (segs), because generic word lookup cannot know that ظُهْرًا here means "at noon".
// Pure and deterministic, except hijriParts(), which asks the platform's Intl calendar and may return null.

import { toArabicIndic } from './arabic';
import { numberToEnglish } from './numbers';

export type TSeg = [string, string];
export interface Phrase {
  ar: string;
  en: string;
  segs: TSeg[];
}

const join = (segs: TSeg[]): Phrase['ar'] => segs.map((s) => s[0]).join(' ');

// السَّاعَةُ + definite feminine ordinal (one o'clock uses الْوَاحِدَة); 11 and 12 are two words.
const HOUR_SEGS: TSeg[][] = [
  [],
  [['الْوَاحِدَة', "one (o'clock)"]],
  [['الثَّانِيَة', "the second: two (o'clock)"]],
  [['الثَّالِثَة', "the third: three (o'clock)"]],
  [['الرَّابِعَة', "the fourth: four (o'clock)"]],
  [['الْخَامِسَة', "the fifth: five (o'clock)"]],
  [['السَّادِسَة', "the sixth: six (o'clock)"]],
  [['السَّابِعَة', "the seventh: seven (o'clock)"]],
  [['الثَّامِنَة', "the eighth: eight (o'clock)"]],
  [['التَّاسِعَة', "the ninth: nine (o'clock)"]],
  [['الْعَاشِرَة', "the tenth: ten (o'clock)"]],
  [
    ['الْحَادِيَةَ', 'the eleventh (part 1)'],
    ['عَشْرَةَ', "-teen (part 2): eleven (o'clock)"],
  ],
  [
    ['الثَّانِيَةَ', 'the twelfth (part 1)'],
    ['عَشْرَةَ', "-teen (part 2): twelve (o'clock)"],
  ],
];

/** How the minutes are said, by five-minute step (0–55). `next` = the phrase counts towards the next hour. */
const MINUTES: { segs: TSeg[]; en: (h: string, next: string) => string; next?: boolean }[] = [
  { segs: [], en: (h) => `${h} o'clock` },
  {
    segs: [
      ['وَخَمْسُ', 'and five'],
      ['دَقَائِق', 'minutes'],
    ],
    en: (h) => `five past ${h}`,
  },
  {
    segs: [
      ['وَعَشْرُ', 'and ten'],
      ['دَقَائِق', 'minutes'],
    ],
    en: (h) => `ten past ${h}`,
  },
  { segs: [['وَالرُّبْع', 'and a quarter']], en: (h) => `quarter past ${h}` },
  { segs: [['وَالثُّلْث', 'and a third (of an hour)']], en: (h) => `twenty past ${h}` },
  {
    segs: [
      ['وَالنِّصْفُ', 'and a half'],
      ['إِلَّا', 'minus'],
      ['خَمْسَ', 'five'],
      ['دَقَائِق', 'minutes'],
    ],
    en: (h) => `twenty-five past ${h}`,
  },
  { segs: [['وَالنِّصْف', 'and a half']], en: (h) => `half past ${h}` },
  {
    segs: [
      ['وَالنِّصْفُ', 'and a half'],
      ['وَخَمْسُ', 'and five'],
      ['دَقَائِق', 'minutes'],
    ],
    en: (_, n) => `twenty-five to ${n}`,
  },
  {
    segs: [
      ['إِلَّا', 'minus'],
      ['ثُلْثًا', 'a third (of an hour)'],
    ],
    en: (_, n) => `twenty to ${n}`,
    next: true,
  },
  {
    segs: [
      ['إِلَّا', 'minus'],
      ['رُبْعًا', 'a quarter'],
    ],
    en: (_, n) => `quarter to ${n}`,
    next: true,
  },
  {
    segs: [
      ['إِلَّا', 'minus'],
      ['عَشْرَ', 'ten'],
      ['دَقَائِق', 'minutes'],
    ],
    en: (_, n) => `ten to ${n}`,
    next: true,
  },
  {
    segs: [
      ['إِلَّا', 'minus'],
      ['خَمْسَ', 'five'],
      ['دَقَائِق', 'minutes'],
    ],
    en: (_, n) => `five to ${n}`,
    next: true,
  },
];
// 25 past is "half minus five" and 25 to is "half and five": in Arabic both keep the current hour.

export const PARTS_OF_DAY: { from: number; to: number; seg: TSeg[]; en: string }[] = [
  { from: 0, to: 3, seg: [['لَيْلًا', 'at night']], en: 'at night' },
  { from: 4, to: 11, seg: [['صَبَاحًا', 'in the morning']], en: 'in the morning' },
  { from: 12, to: 12, seg: [['ظُهْرًا', 'at noon, at midday']], en: 'at midday' },
  {
    from: 13,
    to: 14,
    seg: [
      ['بَعْدَ', 'after'],
      ['الظُّهْر', 'noon (midday)'],
    ],
    en: 'in the early afternoon',
  },
  { from: 15, to: 17, seg: [['عَصْرًا', 'in the (late) afternoon']], en: 'in the afternoon' },
  { from: 18, to: 20, seg: [['مَسَاءً', 'in the evening']], en: 'in the evening' },
  { from: 21, to: 23, seg: [['لَيْلًا', 'at night']], en: 'at night' },
];

export const roundTo5 = (m: number) => Math.round(m / 5) * 5;

/**
 * "It is …" for a 24-hour time. Minutes are rounded to the nearest five (how people say the time);
 * `exact` is false when rounding happened. withPart adds the part of the day (صَبَاحًا …).
 */
export function sayTime(h24: number, minute: number, withPart = true) {
  if (!Number.isInteger(h24) || h24 < 0 || h24 > 23 || minute < 0 || minute > 59)
    throw new RangeError(`Bad time ${h24}:${minute}`);
  let m = roundTo5(minute);
  let h = h24;
  if (m === 60) {
    m = 0;
    h = (h + 1) % 24;
  }
  const step = MINUTES[m / 5];
  const h12 = h % 12 || 12;
  const next12 = (h12 % 12) + 1;
  const spokenHour = step.next ? next12 : h12;
  const part = PARTS_OF_DAY.find((p) => h >= p.from && h <= p.to)!;
  const segs: TSeg[] = [
    ['السَّاعَةُ', "the hour: it is … (o'clock)"],
    ...HOUR_SEGS[spokenHour],
    ...step.segs,
    ...(withPart ? part.seg : []),
  ];
  const en = `It is ${step.en(numberToEnglish(h12), numberToEnglish(next12))}${withPart ? ` ${part.en}` : ''}.`;
  const digits = `${h}:${String(m).padStart(2, '0')}`;
  return {
    ar: join(segs),
    en,
    segs,
    digits,
    arabicDigits: `${toArabicIndic(h)}:${toArabicIndic(m).padStart(2, '٠')}`,
    exact: m === minute && h === h24,
  };
}

export const ASK_TIME: Phrase = {
  ar: 'كَمِ السَّاعَةُ',
  en: 'What time is it?',
  segs: [
    ['كَمِ', 'how much'],
    ['السَّاعَةُ', 'the hour (the time)'],
  ],
};

// ------------------------------------------------------------------ weekdays and months

export const WEEKDAYS: Phrase[] = [
  ['الْأَحَد', 'Sunday', 'the first (day)'],
  ['الاِثْنَيْن', 'Monday', 'the second (day)'],
  ['الثُّلَاثَاء', 'Tuesday', 'the third (day)'],
  ['الْأَرْبِعَاء', 'Wednesday', 'the fourth (day)'],
  ['الْخَمِيس', 'Thursday', 'the fifth (day)'],
  ['الْجُمُعَة', 'Friday', 'the day of gathering'],
  ['السَّبْت', 'Saturday', 'the sabbath'],
].map(([ar, en, lit]) => ({ ar, en: `${en} (lit. ${lit})`, segs: [[ar, en]] }));

const two = (a: string, ga: string, b: string, gb: string, en: string): Phrase => ({
  ar: `${a} ${b}`,
  en,
  segs: [
    [a, ga],
    [b, gb],
  ],
});
const one = (ar: string, en: string): Phrase => ({ ar, en, segs: [[ar, en]] });

/** Gregorian months as used in Egypt, the Gulf and much of the Arab world (borrowed from European names). */
export const MONTHS_WEST: Phrase[] = [
  one('يَنَايِر', 'January'),
  one('فِبْرَايِر', 'February'),
  one('مَارِس', 'March'),
  one('أَبْرِيل', 'April'),
  one('مَايُو', 'May'),
  one('يُونْيُو', 'June'),
  one('يُولْيُو', 'July'),
  one('أُغُسْطُس', 'August'),
  one('سِبْتَمْبِر', 'September'),
  one('أُكْتُوبَر', 'October'),
  one('نُوفَمْبِر', 'November'),
  one('دِيسَمْبِر', 'December'),
];

/** Gregorian months with the old Syriac names, used in Syria, Lebanon, Jordan, Palestine and Iraq. */
export const MONTHS_LEVANT: Phrase[] = [
  two('كَانُون', 'Kanun (month name)', 'الثَّانِي', 'the second', 'January'),
  one('شُبَاط', 'February'),
  one('آذَار', 'March'),
  one('نَيْسَان', 'April'),
  one('أَيَّار', 'May'),
  one('حَزِيرَان', 'June'),
  one('تَمُّوز', 'July'),
  one('آبْ', 'August'),
  one('أَيْلُول', 'September'),
  two('تِشْرِين', 'Tishrin (month name)', 'الْأَوَّل', 'the first', 'October'),
  two('تِشْرِين', 'Tishrin (month name)', 'الثَّانِي', 'the second', 'November'),
  two('كَانُون', 'Kanun (month name)', 'الْأَوَّل', 'the first', 'December'),
];

/** The twelve months of the Hijri (Islamic lunar) calendar. */
export const MONTHS_HIJRI: Phrase[] = [
  one('مُحَرَّم', 'Muharram'),
  one('صَفَر', 'Safar'),
  two('رَبِيع', 'Rabīʿ (month name)', 'الْأَوَّل', 'the first', 'Rabiʿ al-Awwal'),
  two('رَبِيع', 'Rabīʿ (month name)', 'الْآخِر', 'the last (the second)', 'Rabiʿ al-Akhir'),
  two('جُمَادَى', 'Jumādā (month name)', 'الْأُولَى', 'the first (f)', 'Jumada al-Ula'),
  two('جُمَادَى', 'Jumādā (month name)', 'الْآخِرَة', 'the last (f)', 'Jumada al-Akhira'),
  one('رَجَب', 'Rajab'),
  one('شَعْبَان', 'Shaʿban'),
  one('رَمَضَان', 'Ramadan (the month of fasting)'),
  one('شَوَّال', 'Shawwal'),
  two('ذُو', 'the one of (month name)', 'الْقَعْدَة', 'sitting (resting from war)', 'Dhu al-Qaʿda'),
  two('ذُو', 'the one of (month name)', 'الْحِجَّة', 'the pilgrimage', 'Dhu al-Hijja'),
];

// ------------------------------------------------------------------ dates

const ORD_DAY: TSeg[][] = [
  [],
  [['الْأَوَّل', 'the first']],
  [['الثَّانِي', 'the second']],
  [['الثَّالِث', 'the third']],
  [['الرَّابِع', 'the fourth']],
  [['الْخَامِس', 'the fifth']],
  [['السَّادِس', 'the sixth']],
  [['السَّابِع', 'the seventh']],
  [['الثَّامِن', 'the eighth']],
  [['التَّاسِع', 'the ninth']],
  [['الْعَاشِر', 'the tenth']],
];
const TEEN_ORD = [
  '',
  'الْحَادِيَ',
  'الثَّانِيَ',
  'الثَّالِثَ',
  'الرَّابِعَ',
  'الْخَامِسَ',
  'السَّادِسَ',
  'السَّابِعَ',
  'الثَّامِنَ',
  'التَّاسِعَ',
];
const UNIT_ORD = [
  '',
  'الْحَادِي',
  'الثَّانِي',
  'الثَّالِث',
  'الرَّابِع',
  'الْخَامِس',
  'السَّادِس',
  'السَّابِع',
  'الثَّامِن',
  'التَّاسِع',
];
const EN_ORD = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth'];

/** Definite masculine ordinal for a day of the month, 1–31 (the 1st … the 31st), pause forms. */
export function dayOrdinal(d: number): TSeg[] {
  if (!Number.isInteger(d) || d < 1 || d > 31) throw new RangeError(`Day out of range: ${d}`);
  if (d <= 10) return ORD_DAY[d];
  if (d < 20)
    return [
      [TEEN_ORD[d - 10], `the ${EN_ORD[d - 10]} (part 1)`],
      ['عَشَرَ', `-teen (part 2): the ${enOrd(d)}`],
    ];
  const tens: TSeg = d < 30 ? ['الْعِشْرُون', 'the twentieth'] : ['الثَّلَاثُون', 'the thirtieth'];
  if (d % 10 === 0) return [tens];
  const u = d % 10;
  return [
    [UNIT_ORD[u], `the ${EN_ORD[u]} (and …)`],
    [d < 30 ? 'وَالْعِشْرُون' : 'وَالثَّلَاثُون', d < 30 ? 'and twentieth' : 'and thirtieth'],
  ];
}

const enOrd = (d: number) =>
  `${d}${d % 10 === 1 && d !== 11 ? 'st' : d % 10 === 2 && d !== 12 ? 'nd' : d % 10 === 3 && d !== 13 ? 'rd' : 'th'}`;
const EN_MONTHS = MONTHS_WEST.map((m) => m.en);

export type MonthSet = 'west' | 'levant';

/** "Today is Tuesday, the 10th of November." */
export function sayDate(date: Date, set: MonthSet = 'west'): Phrase & { digits: string; arabicDigits: string } {
  const wd = WEEKDAYS[date.getDay()];
  const month = (set === 'west' ? MONTHS_WEST : MONTHS_LEVANT)[date.getMonth()];
  const d = date.getDate();
  const segs: TSeg[] = [['الْيَوْمُ', 'today (lit. the day)'], wd.segs[0], ...dayOrdinal(d), ['مِنْ', 'of'], ...month.segs];
  const y = date.getFullYear();
  return {
    ar: join(segs),
    en: `Today is ${wd.segs[0][1]}, the ${enOrd(d)} of ${EN_MONTHS[date.getMonth()]}.`,
    segs,
    digits: `${d}/${date.getMonth() + 1}/${y}`,
    arabicDigits: `${toArabicIndic(d)}/${toArabicIndic(date.getMonth() + 1)}/${toArabicIndic(y)}`,
  };
}

/** Day, month (1–12) and year of the Hijri date from the platform's Umm al-Qura calendar, or null if unsupported. */
export function hijriParts(date: Date): { day: number; month: number; year: number } | null {
  try {
    const f = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' });
    if (!/islamic/.test(f.resolvedOptions().calendar)) return null;
    const p = Object.fromEntries(f.formatToParts(date).map((x) => [x.type, x.value]));
    const day = parseInt(p.day, 10);
    const month = parseInt(p.month, 10);
    const year = parseInt(p.year ?? p.relatedYear, 10);
    if (!(day >= 1 && day <= 30 && month >= 1 && month <= 12 && year > 1300)) return null;
    return { day, month, year };
  } catch {
    return null;
  }
}

/** "the 19th of Jumada al-Ula, 1448" — Hijri date in words, or null when the platform cannot compute it. */
export function sayHijri(date: Date): (Phrase & { year: number; arabicYear: string }) | null {
  const h = hijriParts(date);
  if (!h) return null;
  const month = MONTHS_HIJRI[h.month - 1];
  const segs: TSeg[] = [...dayOrdinal(h.day), ['مِنْ', 'of'], ...month.segs];
  return {
    ar: join(segs),
    en: `the ${enOrd(h.day)} of ${month.en}, ${h.year} AH`,
    segs,
    year: h.year,
    arabicYear: toArabicIndic(h.year),
  };
}
