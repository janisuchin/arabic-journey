import { ZWJ } from '../../../core/arabic';
import { meaningOf, splitRuns, syllables, tapTokens, translitLine } from '../tap';

describe('Arabic language pack', () => {
  it('keeps Arabic words whole and attaches leading digits', () => {
    const runs = splitRuns('7السَّاعَة hello، ok');
    expect(runs[0]).toEqual({ kind: 'ar', text: '7السَّاعَة' });
    expect(runs.find((r) => r.kind === 'latin')?.text).toBe('hello');
  });
  it('elides across words and capitalises names', () => {
    expect(translitLine('صَبَاحُ الْخَيْر يَا لَيْلَى!', 'academic', new Set(['لَيْلَى']))).toBe('Ṣabāḥu l-khayr yā Laylā!');
  });
  it('gives every token its own transliteration', () => {
    const toks = tapTokens('مَا اسْمُكَ؟', 'academic').filter((t) => t.kind === 'ar');
    expect(toks.map((t) => t.tr)).toEqual(['Mā', 'smuka']);
  });
  it('splits syllables with joiners so letters keep their joined shapes', () => {
    const s = syllables('كِتَاب', 'academic');
    expect(s.map((x) => x.tr)).toEqual(['ki', 'tāb']);
    expect(s[0].ar.endsWith(ZWJ)).toBe(true);
    expect(s[1].ar.startsWith(ZWJ)).toBe(true);
  });
  it('finds meanings through the chain and never guesses', () => {
    expect(meaningOf('مَرْحَبًا')).toBe('hello');
    expect(meaningOf('اسْمُكَ')).toBe('your name (to a man)');
    expect(meaningOf('٧')).toBe('seven');
    expect(meaningOf('ب')).toBe('the letter bāʾ');
    expect(meaningOf('زَرْزُور')).toBeUndefined();
  });
});
