import { translit, translitWord } from '../translit';

const t = (s: string) => translit(s);

describe('transliteration engine (academic)', () => {
  it.each([
    ['مَرْحَبًا', 'Marḥaban'],
    ['السَّلَامُ عَلَيْكُمْ', 'As-salāmu ʿalaykum'],
    ['صَبَاحُ الْخَيْر', 'Ṣabāḥu l-khayr'],
    ['صَبَاحُ النُّور', 'Ṣabāḥu n-nūr'],
    ['مَا اسْمُكَ؟', 'Mā smuka?'],
    ['أَنَا مِصْرِيّ', 'Anā miṣrī'],
    ['هِيَ مِصْرِيَّة', 'Hiya miṣriyya'],
    ['هٰذَا كِتَاب', 'Hādhā kitāb'],
    ['الْحَمْدُ لِلّٰه', 'Al-ḥamdu lillāh'],
    ['شُكْرًا جَزِيلًا', 'Shukran jazīlan'],
    ['وَالْكِتَاب', 'Wa-l-kitāb'],
    ['بِالسَّيَّارَة', 'Bi-s-sayyāra'],
    ['لِلْأُسْتَاذ', 'Li-l-ustādh'],
    ['يَوْم', 'Yawm'],
    ['دَرَسُوا', 'Darasū'],
    ['آسِف', 'Āsif'],
    ['مَسْؤُول', 'Masʾūl'],
    ['إِلَى اللِّقَاء', 'Ilā l-liqāʾ'],
    ['مَا شَاءَ اللّٰه', 'Mā shāʾa llāh'],
    ['سَيَّارَةُ الْأُسْتَاذ', 'Sayyāratu l-ustādh'],
    ['وَأَنْتَ؟', 'Wa-anta?'],
    ['أَنَا بِخَيْر، وَأَنْتِ؟', 'Anā bikhayr, wa-anti?'],
  ])('%s → %s', (ar, expected) => expect(t(ar)).toBe(expected));

  // accuracy review round 1: the engine bugs the reviewers found, one case each
  it.each([
    ['عِنْدِي صَدِيق الَّذِي', 'ʿIndī ṣadīq alladhī'], // relative pronoun: a-, not i-
    ['هِيَ الَّتِي', 'Hiya llatī'],
    ['أَدَوَاتُ الِاسْتِفْهَامِ', 'Adawātu l-istifhāmi'], // kasra on the article before hamzat al-waṣl
    ['فِي الِامْتِحَان', 'Fī l-imtiḥān'],
    ['وَبِالْأَشْجَار', 'Wa-bi-l-ashjār'], // two clitics before the article
    ['وَلِلرَّجُلِ', 'Wa-li-r-rajuli'],
    ['وَبِالنِّسْبَةِ', 'Wa-bi-n-nisbati'],
    ['نَشْرَبُ الشَّاي', 'Nashrabu sh-shāy'], // consonantal final y / w
    ['الزَّاي وَالْوَاو', 'Az-zāy wa-l-wāw'],
    ['رَأْي', 'Raʾy'],
    ['تَمْرٌ حُلْو', 'Tamrun ḥulw'],
    ['أَسْهَلُ', 'As·halu'], // s and h are two letters
    ['مَقْهًى', 'Maqhan'], // tanwīn before alif maqṣūra
    ['مِائَة', 'Miʾa'], // silent alif of the old spelling
    ['غُرْفَةِي', 'Ghurfa-ī'], // the mistake shows as written
    ['وَاتَّصَلَ', 'Wa-ttaṣala'],
    ['مُزْدَحِم جِدًّا الْيَوْمَ', 'Muzdaḥim jiddani l-yawma'], // tanwīn + waṣla: helping i
  ])('round 1: %s → %s', (ar, expected) => expect(t(ar)).toBe(expected));

  it('simple style uses plain letters', () => {
    expect(translit('صَبَاحُ الْخَيْر', { style: 'simple' })).toBe('Sabaahu l-khayr');
    expect(translit('عَائِلَة', { style: 'simple' })).toBe("'Aa'ila");
  });

  it('capitalises names after the article (regression: "mina L-qāhira")', () => {
    expect(translit('هُوَ مِنَ الْقَاهِرَة', { names: [2] })).toBe('Huwa mina l-Qāhira');
    expect(translit('شَارِعِ النِّيل', { names: [1] })).toBe('Shāriʿi n-Nīl');
    expect(translit('الْقَاهِرَة كَبِيرَة', { names: [0] })).toBe('Al-Qāhira kabīra');
  });

  it('never invents a vowel for an unvocalised consonant', () => {
    expect(translitWord('كتب').text).toBe('ktb');
  });

  it('turns Arabic punctuation and digits into Latin ones', () => {
    expect(translit('رَقْم ٧، نَعَم؟')).toBe('Raqm 7, naʿam?');
  });
});
