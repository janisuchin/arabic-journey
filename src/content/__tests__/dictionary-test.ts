import { dictionary, dictionaryLookup, latinKey, searchDictionary } from '../dictionary';
import { vocabulary } from '../index';

const HARAKA = /[ً-ْٰ]/;

describe('5,000-word dictionary', () => {
  const words = dictionary();

  it('has 5,000 rows with every course word in it', () => {
    expect(words).toHaveLength(5000);
    expect(words.filter((w) => w.course)).toHaveLength(vocabulary.length);
  });

  it('every headword is Arabic and vocalised, every meaning English', () => {
    for (const w of words) {
      expect(w.ar).toMatch(/^[؀-ۿ ]+$/);
      expect(HARAKA.test(w.ar)).toBe(true);
      expect(w.en.trim()).not.toBe('');
      expect(w.en).not.toMatch(/[؀-ۿ]/);
    }
  });

  it('has no duplicate headword with the same part of speech', () => {
    const seen = new Set<string>();
    const dups = words.filter((w) => {
      const k = `${w.ar}|${w.pos}`;
      const d = seen.has(k);
      seen.add(k);
      return d && !w.course;
    });
    expect(dups.map((w) => w.ar)).toEqual([]);
  });

  it('finds words by English, transliteration and Arabic with or without vowels', () => {
    expect(searchDictionary('book')[0].ar).toBe('كِتَاب');
    expect(searchDictionary('kitab').some((w) => w.ar === 'كِتَاب')).toBe(true);
    expect(searchDictionary('كتاب')[0].ar).toBe('كِتَاب');
    expect(searchDictionary('كِتَاب')[0].ar).toBe('كِتَاب');
  });

  it('a verb is found by its present tense too', () => {
    const w = words.find((x) => x.pos === 'verb' && x.present && !x.course)!;
    expect(searchDictionary(w.present).some((x) => x === w)).toBe(true);
  });

  it('latin keys ignore macrons, ʿ/ʾ and hyphens', () => {
    expect(latinKey('al-ʿarabiyya')).toBe('alarabiyya');
    expect(latinKey('kitāb')).toBe('kitab');
  });
  it('tap lookup strips wa-/bi-/li-/al- and finds the headword', () => {
    expect(dictionaryLookup('الْكِتَابُ')).toBe('كتاب');
    expect(dictionaryLookup('وَالْمَدِينَةِ')).toBe('مدينة');
    expect(dictionaryLookup('بِالسَّيَّارَةِ')).toBe('سيارة');
    expect(dictionaryLookup('لِلْمَدْرَسَةِ')).toBe('مدرسة');
    // a word that starts with و keeps it
    expect(dictionaryLookup('وَقْتٌ')).toBe('وقت');
    // the course form wins when given
    expect(dictionaryLookup('بَيْتِي', 'بَيْت')).toBe('بيت');
    for (const q of ['كتاب', 'مدينة', 'سيارة', 'مدرسة', 'وقت', 'بيت'])
      expect(searchDictionary(q, 1)[0]).toBeDefined();
  });
});
