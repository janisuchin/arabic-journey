import { isUnvocalised } from '../../content/validate';
import { arabicWords } from '../../lang/ar/tap';
import {
  dayOrdinal,
  hijriParts,
  MONTHS_HIJRI,
  MONTHS_LEVANT,
  MONTHS_WEST,
  sayDate,
  sayHijri,
  sayTime,
  WEEKDAYS,
  type TSeg,
} from '../time';

const wellFormed = (ar: string, segs: TSeg[]) => {
  expect(segs.map((s) => s[0]).join(' ')).toBe(arabicWords(ar).join(' '));
  for (const [t, g] of segs) {
    expect(g.length).toBeGreaterThan(0);
    expect(isUnvocalised(t)).toBe(false);
  }
};

describe('time lab engine', () => {
  it('says clock times in five-minute steps', () => {
    expect(sayTime(15, 20).ar).toBe('السَّاعَةُ الثَّالِثَة وَالثُّلْث عَصْرًا');
    expect(sayTime(15, 20).en).toBe('It is twenty past three in the afternoon.');
    expect(sayTime(7, 45).ar).toBe('السَّاعَةُ الثَّامِنَة إِلَّا رُبْعًا صَبَاحًا');
    expect(sayTime(7, 45).en).toBe('It is quarter to eight in the morning.');
    expect(sayTime(9, 25, false).ar).toBe('السَّاعَةُ التَّاسِعَة وَالنِّصْفُ إِلَّا خَمْسَ دَقَائِق');
    expect(sayTime(9, 35, false).en).toBe('It is twenty-five to ten.');
    expect(sayTime(12, 0).ar).toBe('السَّاعَةُ الثَّانِيَةَ عَشْرَةَ ظُهْرًا');
    expect(sayTime(13, 30).ar).toBe('السَّاعَةُ الْوَاحِدَة وَالنِّصْف بَعْدَ الظُّهْر');
  });
  it('rounds to the nearest five minutes and rolls over the hour', () => {
    const t = sayTime(11, 58);
    expect(t.digits).toBe('12:00');
    expect(t.exact).toBe(false);
    expect(sayTime(23, 58).ar).toBe('السَّاعَةُ الثَّانِيَةَ عَشْرَةَ لَيْلًا');
    expect(sayTime(10, 50, false).ar).toBe('السَّاعَةُ الْحَادِيَةَ عَشْرَةَ إِلَّا عَشْرَ دَقَائِق');
    expect(sayTime(14, 5).arabicDigits).toBe('١٤:٠٥');
  });
  it('every time phrase is glossed word by word and fully vowelled', () => {
    for (let h = 0; h < 24; h++)
      for (let m = 0; m < 60; m += 5) {
        const t = sayTime(h, m);
        wellFormed(t.ar, t.segs);
      }
  });
  it('day ordinals 1–31', () => {
    expect(
      dayOrdinal(1)
        .map((s) => s[0])
        .join(' '),
    ).toBe('الْأَوَّل');
    expect(
      dayOrdinal(11)
        .map((s) => s[0])
        .join(' '),
    ).toBe('الْحَادِيَ عَشَرَ');
    expect(
      dayOrdinal(20)
        .map((s) => s[0])
        .join(' '),
    ).toBe('الْعِشْرُون');
    expect(
      dayOrdinal(23)
        .map((s) => s[0])
        .join(' '),
    ).toBe('الثَّالِث وَالْعِشْرُون');
    expect(
      dayOrdinal(31)
        .map((s) => s[0])
        .join(' '),
    ).toBe('الْحَادِي وَالثَّلَاثُون');
    expect(() => dayOrdinal(32)).toThrow();
  });
  it('dates in words', () => {
    const d = sayDate(new Date(2026, 10, 10));
    expect(d.ar).toBe('الْيَوْمُ الثُّلَاثَاء الْعَاشِر مِنْ نُوفَمْبِر');
    expect(d.en).toBe('Today is Tuesday, the 10th of November.');
    expect(sayDate(new Date(2026, 10, 22), 'levant').ar).toBe(
      'الْيَوْمُ الْأَحَد الثَّانِي وَالْعِشْرُون مِنْ تِشْرِين الثَّانِي',
    );
    for (let i = 0; i < 366; i++) {
      const x = sayDate(new Date(2026, 0, 1 + i), i % 2 ? 'west' : 'levant');
      wellFormed(x.ar, x.segs);
    }
  });
  it('tables are complete and glossed', () => {
    expect(WEEKDAYS).toHaveLength(7);
    for (const set of [MONTHS_WEST, MONTHS_LEVANT, MONTHS_HIJRI]) {
      expect(set).toHaveLength(12);
      for (const m of set) wellFormed(m.ar, m.segs);
    }
  });
  it('Hijri date from the Umm al-Qura calendar when the platform has it', () => {
    const h = hijriParts(new Date(2026, 10, 10));
    if (h) {
      expect(h.year).toBe(1448);
      const s = sayHijri(new Date(2026, 10, 10))!;
      wellFormed(s.ar, s.segs);
    }
  });
});
