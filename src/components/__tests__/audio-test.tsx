import { pauseReading } from '../../lang/ar/tap';
import { voiceRank } from '../../services/tts';

describe('owner audio round (2026-11-14)', () => {
  it('names the pause form of a word said on its own', () => {
    expect(pauseReading('طَالِبَتَانِ', 'ṭālibatāni', 'academic')).toBe('Ṭālibatān');
    expect(pauseReading('مَرْحَبًا', 'marḥaban', 'academic')).toBe('Marḥabā');
    expect(pauseReading('الْمَدْرَسَةِ', 'al-madrasati', 'academic')).toBe('Al-madrasa');
    // nothing to say when the word already ends in pause or a long vowel
    expect(pauseReading('بَيْت', 'bayt', 'academic')).toBeUndefined();
    expect(pauseReading('أَنَا', 'anā', 'academic')).toBeUndefined();
  });
  it('prefers voices that read the vowel marks', () => {
    expect(voiceRank('Microsoft Hamed Online (Natural) - Arabic (Saudi Arabia)', 'ar-SA')).toBeGreaterThan(
      voiceRank('Microsoft Naayf - Arabic (Saudi Arabia)', 'ar-SA'),
    );
    expect(voiceRank('Google العربية', 'ar-XA')).toBeGreaterThan(voiceRank('Microsoft Hoda', 'ar-EG'));
  });
});
