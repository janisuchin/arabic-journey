import { ZWJ } from '../../../core/arabic';
import autoList from '../../../../content/glossary/auto.json';
import { handGlossary, mistakeGlossary } from '../../../content';
import {
  compatibleForms,
  meaningOf,
  namesSet,
  proseLine,
  proseTranslit,
  splitRuns,
  syllables,
  tapTokens,
  translitLine,
  vocabOf,
  withoutExerciseNote,
} from '../tap';

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
  // round-1 accuracy review: the tap meaning must come from the vocalised form, never the bare spelling
  it('never borrows a meaning from a word with other harakat', () => {
    expect(compatibleForms('الْمَدْرَسَةِ', 'الْمَدْرَسَة')).toBe(true);
    expect(compatibleForms('هُمُ', 'هُمْ')).toBe(true);
    expect(compatibleForms('مُدَرِّسَة', 'مَدْرَسَة')).toBe(false);
    expect(compatibleForms('شَرِبْتُ', 'شَرِبْتَ', 'verb')).toBe(false);
    expect(compatibleForms('اسْمُكَ', 'اسْمُكِ', 'noun')).toBe(false);
    expect(compatibleForms('كِتَابٌ', 'كِتَابَ', 'noun')).toBe(true);
    expect(meaningOf('مُدَرِّسَة')).toMatch(/teacher/);
    expect(vocabOf('مُدَرِّسَة')?.en ?? '').not.toMatch(/school/);
    expect(meaningOf('شَرِبْتَ')).not.toBe('I drank');
    expect(meaningOf('رِجْل')).toMatch(/leg/);
    expect(meaningOf('رَجُل')).toMatch(/man/);
  });
  it('names a bare letter as a letter', () => {
    expect(meaningOf('ل')).toBe('the letter lām');
    expect(meaningOf('و')).toBe('the letter wāw');
    expect(meaningOf('أَنْتَ')).toBe('you (to a man)');
  });
  it('hyphenates a clitic before a name and keeps the capital on the name', () => {
    expect(translitLine('أَنَا وَسَامِي', 'academic', new Set(['وَسَامِي', 'سَامِي']))).toBe('Anā wa-Sāmī');
  });
  it('reads Arabic inside English prose without a capital and names bare letters', () => {
    expect(proseTranslit('ة', 'academic')).toBe('tāʾ marbūṭa');
    expect(proseTranslit('مَا عَمَلُكَ؟', 'academic')).toBe('mā ʿamaluka?');
    expect(proseTranslit('أنت', 'academic')).toBe('');
    // round 2: never name a letter twice
    // round 3: and no stray space or empty brackets where the letter was
    expect(proseTranslit('plus hamza ء, and ة (tāʾ marbūṭa)', 'academic')).toBe('plus hamza, and (tāʾ marbūṭa)');
    expect(proseTranslit('ḥāʾ (ح) versus hāʾ (ه)', 'academic')).toBe('ḥāʾ versus hāʾ');
    expect(proseTranslit('a seat: أ or ؤ', 'academic')).toBe('a seat: alif with hamza or wāw with hamza');
  });
  it('teacher-pack F: no reading when the English right after the Arabic already gives it', () => {
    expect(proseTranslit('أَبِي', 'academic', ' (abī).')).toBe('');
    expect(proseTranslit('قَرَأْتُ', 'academic', ' (qaraʾtu, I read).')).toBe('');
    expect(proseTranslit('بَيْت', 'academic', ' bayt, house)')).toBe('');
    expect(proseTranslit('كَيْفَ حَالُكِ؟', 'academic', ' (kayfa ḥāluki).')).toBe('');
    // a different word after it keeps the reading
    expect(proseTranslit('أَبِي', 'academic', ' (my father).')).toBe('abī');
    expect(proseLine("'My father' is أَبِي (abī).", 'academic')).toBe("'My father' is أَبِي (abī).");
    expect(proseLine('١ وَاحِد · ٢ اِثْنَان', 'academic')).toBe('١ wāḥid · ٢ ithnān');
  });
  it('round 4: hamza seats, silent wāw, lone Arabic signs, letter lists, clitics', () => {
    expect(translitLine('أ', 'academic')).toBe('ʾ');
    expect(translitLine('إ', 'academic')).toBe('ʾ');
    expect(translitLine('أَنَا', 'academic')).toBe('Anā');
    expect(translitLine('أُولٰئِكَ', 'academic')).toBe('Ulāʾika');
    expect(proseLine('The Arabic question mark ؟ is a mirrored ?.', 'academic')).toBe(
      'The Arabic question mark ؟ is a mirrored ?.',
    );
    expect(proseLine('Ask: هَلْ أَنْتَ مِصْرِيّ؟ Then wait.', 'academic')).toBe('Ask: hal anta miṣrī? Then wait.');
    expect(proseTranslit('(أ إ ؤ ئ)', 'academic')).toBe(
      '(alif with hamza, alif with hamza below, wāw with hamza, yāʾ with hamza)',
    );
    expect(translitLine('فَازَ بِجَائِزَةِ', 'academic')).toBe('Fāza bi-jāʾizati');
    expect(translitLine('شُكْرًا لِحُسْنِ الِاسْتِمَاعِ', 'academic', namesSet())).toBe('Shukran li-ḥusni l-istimāʿi');
  });
  it('round 3: one clitic style, endings, Allāhu, names after titles, no repeated senses', () => {
    expect(translitLine('وَجُبْنًا وَخُبْزًا', 'academic')).toBe('Wa-jubnan wa-khubzan');
    expect(translitLine('لَاشْتَرَيْتُ', 'academic')).toBe('La-shtaraytu');
    expect(translitLine('وَلَد وَصَلَ كَمَا', 'academic')).toBe('Walad waṣala kamā');
    expect(translitLine('وَلِسَامِي', 'academic', namesSet())).toBe('Wa-li-Sāmī');
    expect(translitLine('ـهُ', 'academic')).toBe('-hu');
    expect(translitLine('اللّٰهُ يُسَلِّمُكِ', 'academic')).toBe('Allāhu yusallimuki');
    expect(translitLine('الْأُسْتَاذ كَرِيم', 'academic', namesSet())).toBe('Al-ustādh Karīm');
    expect(translitLine('رَجُل كَرِيم', 'academic', namesSet())).toBe('Rajul karīm');
    expect(translitLine('فِي مِصْر', 'academic', namesSet())).toBe('Fī Miṣr');
    expect(meaningOf('أَكْبَر')).not.toMatch(/bigger; bigger/);
  });
  it('round 3: a scoped gloss holds in its own place only', () => {
    expect(meaningOf('الْإِشَارَة', { place: 'scenario:directions' })).toMatch(/traffic light/);
    expect(meaningOf('الْإِشَارَة')).toBe('pointing');
  });
  it('round 2: shows both readings of a name/word and of an elative, and forms as forms', () => {
    expect(meaningOf('كَرِيم')).toMatch(/generous.*Karim/);
    expect(meaningOf('أَكْبَرُ')).toMatch(/bigger.*biggest/);
    expect(meaningOf('يَضْحَكُ') ?? '').not.toMatch(/^laughed/);
    expect(translitLine('رَمَضَان كَرِيم', 'academic', namesSet())).toBe('Ramaḍān karīm');
    expect(translitLine('مُزْدَحِم جِدًّا الْيَوْمَ', 'academic')).toBe('Muzdaḥim jiddani l-yawma');
  });
  it('round 2b: hyphenates a clitic only on a clitic + word, reads Arabic digits as words', () => {
    expect(translitLine('وَهُوَ', 'academic')).toBe('Wa-huwa');
    expect(translitLine('كَلَام', 'academic')).toBe('Kalām');
    expect(translitLine('بِطَاقَة', 'academic')).toBe('Biṭāqa');
    expect(translitLine('٧', 'academic')).toBe('sabʿa');
    expect(proseTranslit('the digits ٧ and 7', 'academic')).toBe('the digits ٧ and 7');
  });
  it('lets the lesson day choose between senses', () => {
    expect(meaningOf('حَارّ', { day: 18 })).toMatch(/spicy/);
  });
  it('keeps exercise notes inside mistake cards', () => {
    for (const [k, g] of Object.entries(handGlossary)) expect(`${k} = ${g}`).not.toMatch(/wrong/i);
    expect(meaningOf('الْأَخْبَارِ')).not.toMatch(/wrong/);
    expect(meaningOf('الْأَخْبَارِ', { mistake: true })).toMatch(/wrong/);
    for (const [k, g] of Object.entries(autoList as Record<string, string>))
      if (/wrong/i.test(g)) expect(mistakeGlossary[k]).toBe(g); // only a non-word keeps its note
  });
  it("R3-45: an unanswered quiz question shows a mistake form's meaning, not its correction", () => {
    const w = 'لِلطَّبَّاخُونَ';
    expect(meaningOf(w)).toMatch(/wrong/);
    expect(meaningOf(w, { unanswered: true })).toBe('to the cooks');
    expect(meaningOf(w, { unanswered: true, mistake: true })).toBe('to the cooks');
    expect(meaningOf(w, { unanswered: false })).toMatch(/correct: li-ṭ-ṭabbākhīna/);
    expect(meaningOf('الْأَخْبَارِ', { mistake: true })).toMatch(/wrong/); // mistake cards keep the note
    expect(meaningOf('الْخَالَتِي', { unanswered: true })).toBe('my aunt');
    expect(withoutExerciseNote('(it) was announced (m; wrong here: plurals of things take the feminine)')).toBe(
      '(it) was announced (m)',
    );
    expect(withoutExerciseNote('I enrol, register (indicative; wrong after an)')).toBe('I enrol, register (indicative)');
    expect(withoutExerciseNote('from (wrong helping vowel — correct: mina before al-)')).toBe('from');
    for (const [k, g] of Object.entries(mistakeGlossary)) {
      expect(`${k} = ${withoutExerciseNote(g)}`).not.toMatch(/wrong|correct/i);
      expect(meaningOf(k, { unanswered: true }) ?? '').not.toMatch(/wrong|correct/i);
    }
  });
  it('R3-85: spoken readings shorten a long vowel before an elided waṣl', () => {
    const tip = 'فِي الْمَدِينَة is fi l-madīna, and إِلَى الْيَمِين is ila l-yamīn; مَا اسْمُكَ؟';
    expect(proseLine(tip, 'academic')).toMatch(/^fī l-madīna is .* ilā l-yamīn/);
    expect(proseLine(tip, 'academic', true)).toBe('fi l-madīna is fi l-madīna, and ila l-yamīn is ila l-yamīn; ma smuka?');
    expect(proseTranslit('فِي الْمَدِينَة', 'simple', '', '', true)).toBe('fi l-madiina');
    expect(proseTranslit('جِدًّا الْيَوْمَ', 'academic', '', '', true)).toBe('jiddani l-yawma');
    expect(proseTranslit('فِي بَيْت', 'academic', '', '', true)).toBe('fī bayt');
  });
});
