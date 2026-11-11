import { expect, test } from '@playwright/test';
import course from '../content/course/course.json';
import day1 from '../content/days/day01.json';
import { buildFinalExam } from '../src/core/finalExam';
import { buildPlacement } from '../src/core/placement';
import { answerQuiz, newLearner, skipOnboarding } from './helpers';

test('onboarding creates a learner and the whole document is right-to-left', async ({ page }) => {
  await newLearner(page);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.getByTestId('lesson-card')).toContainText('Hello!');
  // Arabic text is tagged and uses the Naskh font
  const ar = page.getByTestId('lesson-card').locator('[lang="ar"][dir="rtl"]').filter({ hasText: 'مَرْحَبًا' }).last();
  await expect(ar).toBeVisible();
  expect(await ar.evaluate((el) => getComputedStyle(el).fontFamily)).toContain('NotoNaskhArabic');
  expect(await page.evaluate(() => document.fonts.check('24px NotoNaskhArabic_400Regular', 'مرحبا'))).toBe(true);
});

test('layout is mirrored: tabs start at the right, progress fills from the right', async ({ page }) => {
  await newLearner(page);
  const today = await page.getByTestId('tab-index').boundingBox();
  const me = await page.getByTestId('tab-me').boundingBox();
  expect(today!.x).toBeGreaterThan(me!.x);
  await page.getByTestId('start-lesson').click();
  const bar = page.getByRole('progressbar', { name: 'lesson progress' });
  const box = await bar.boundingBox();
  const fill = await bar.locator('div').first().boundingBox();
  expect(Math.abs(fill!.x + fill!.width - (box!.x + box!.width))).toBeLessThan(2);
  expect(fill!.width).toBeLessThan(box!.width);
});

test('Arabic letters keep their joined shapes (word is narrower than its letters apart)', async ({ page }) => {
  await newLearner(page);
  const widths = await page.evaluate(() => {
    const m = (t: string) => {
      const s = document.createElement('span');
      s.style.font = '32px NotoNaskhArabic_400Regular';
      s.textContent = t;
      document.body.appendChild(s);
      const w = s.getBoundingClientRect().width;
      s.remove();
      return w;
    };
    return { joined: m('سلام'), apart: m('س ل ا م') };
  });
  expect(widths.joined).toBeLessThan(widths.apart * 0.8);
});

test('lesson flow: page 2 is Pronunciation, quiz passes, progress persists', async ({ page }) => {
  await newLearner(page);
  await page.getByTestId('start-lesson').click();
  await expect(page.getByTestId('page-caption')).toContainText('Start · 1 / 10');
  await expect(page.getByTestId('counts-line')).toContainText('80%');
  await page.getByTestId('next-page').click();
  await expect(page.getByTestId('page-caption')).toContainText('Pronunciation · 2 / 10');
  for (let i = 0; i < 7; i++) await page.getByTestId('next-page').click();
  await expect(page.getByTestId('page-caption')).toContainText('Quiz · 9 / 10');
  await answerQuiz(page, day1.quiz);
  await expect(page.getByTestId('done')).toContainText('Day complete');
  await page.reload();
  await page.goto('/');
  await expect(page.getByTestId('lesson-card')).toContainText("What's your name?");
});

test('word box opens as a floating card from a table cell and closes on an outside tap', async ({ page }) => {
  await newLearner(page);
  await page.goto('/grammar/greetings');
  await page.getByTestId('cell-0-0').getByTestId('tap-word-0').click();
  await expect(page.getByTestId('word-box')).toBeVisible();
  await expect(page.getByTestId('word-box-meaning')).toContainText('the peace');
  await page.getByTestId('word-box-backdrop').click({ position: { x: 5, y: 5 } });
  await expect(page.getByTestId('word-box')).toHaveCount(0);
});

test('tapping a word highlights it in the script and transliteration lines', async ({ page }) => {
  await newLearner(page);
  await page.goto('/day/1');
  await page.getByTestId('tap-word-0').first().click();
  await expect(page.getByTestId('word-box').first()).toContainText('hello');
  // the word is highlighted in both the Arabic line and the transliteration line
  const highlighted = await page.evaluate(
    () =>
      [...document.querySelectorAll('span, button')].filter((e) => getComputedStyle(e).backgroundColor === 'rgb(255, 233, 168)')
        .length,
  );
  expect(highlighted).toBeGreaterThanOrEqual(2);
});

test('learners have separate progress and can switch', async ({ page }) => {
  await newLearner(page, 'Sara');
  await page.getByTestId('tab-me').click();
  await page.getByTestId('switch-learner').click();
  await page.getByTestId('learner-name').fill('Omar');
  await page.getByTestId('add-learner').click();
  await skipOnboarding(page);
  await expect(page.getByTestId('greeting')).toContainText('Omar');
  await page.goto('/profiles');
  await page.getByTestId('learner-Sara').click();
  await expect(page.getByTestId('greeting')).toContainText('Sara');
});

test('number calculator shows Arabic, transliteration and English', async ({ page }) => {
  await newLearner(page);
  await page.goto('/numbers');
  await page.getByTestId('number-input').fill('٢٥');
  await expect(page.getByTestId('number-english')).toHaveText('twenty-five');
  await expect(page.getByTestId('number-result')).toContainText('خَمْسَة وَعِشْرُون');
});

test('dictionary search finds words by English and by transliteration', async ({ page }) => {
  await newLearner(page);
  await page.goto('/dictionary');
  await page.getByTestId('search-input').fill('book');
  await expect(page.getByTestId('word-card-kitab')).toBeVisible();
  await page.getByTestId('search-input').fill('kitab');
  await expect(page.getByTestId('word-card-kitab')).toBeVisible();
});

test('settings: dark theme and transliteration toggle', async ({ page }) => {
  await newLearner(page);
  await page.goto('/settings');
  await page.getByTestId('theme-dark').click();
  const bg = await page
    .locator('body > div')
    .first()
    .evaluate(() => getComputedStyle(document.querySelector('[data-testid="settings"]')!).backgroundColor);
  expect(bg).toBe('rgb(17, 22, 20)');
  await page.getByTestId('toggle-translit').click();
  await page.goto('/');
  await expect(page.getByText('Marḥaban')).toHaveCount(0);
});

test('unlock all opens later days and the week test', async ({ page }) => {
  await newLearner(page);
  await page.goto('/day/7');
  await expect(page.getByTestId('locked')).toBeVisible();
  await page.goto('/settings');
  await page.getByTestId('unlock-all').click();
  await page.goto('/day/7');
  await expect(page.getByTestId('day-title')).toContainText('Numbers 1–10');
});

test('sentence explorer searches in English, unvowelled Arabic and transliteration, and filters', async ({ page }) => {
  await newLearner(page);
  await page.goto('/explorer');
  const count = page.getByTestId('explorer-count');
  await expect(count).toContainText('sentences');
  const total = parseInt(await count.innerText(), 10);
  expect(total).toBeGreaterThan(1500);
  await page.getByTestId('search-input').fill('coffee');
  await expect(page.getByTestId('explorer-count')).not.toHaveText(`${total} sentences`);
  const coffee = parseInt(await count.innerText(), 10);
  expect(coffee).toBeGreaterThan(0);
  await page.getByTestId('search-input').fill('قهوة');
  expect(parseInt(await count.innerText(), 10)).toBeGreaterThan(0);
  await page.getByTestId('search-input').fill('qahwa');
  await expect.poll(async () => parseInt(await count.innerText(), 10)).toBeGreaterThan(0);
  // a word inside a result opens the word box
  await page.locator('[data-testid^="sentence-"]').first().getByRole('button').first().click();
  await expect(page.getByTestId('word-box')).toBeVisible();
  await page.getByTestId('word-box-close').click();
  await page.getByTestId('search-input').fill('');
  await page.getByTestId('explorer-kind-scenario').click();
  const scen = parseInt(await count.innerText(), 10);
  expect(scen).toBeGreaterThan(100);
  expect(scen).toBeLessThan(total);
});

test('grammar page links to the sentences that use its rule', async ({ page }) => {
  await newLearner(page);
  await page.goto('/grammar/past-tense');
  await page.getByTestId('grammar-explorer').click();
  await expect(page.getByTestId('explorer-clear-rule')).toBeVisible();
  const n = parseInt(await page.getByTestId('explorer-count').innerText(), 10);
  expect(n).toBeGreaterThan(0);
  await page.getByTestId('explorer-clear-rule').click();
  expect(parseInt(await page.getByTestId('explorer-count').innerText(), 10)).toBeGreaterThan(n);
});

test('placards: 20 cards, every word tappable, large display', async ({ page }) => {
  await newLearner(page);
  await page.goto('/library');
  await page.getByTestId('lib-Placards').click();
  await expect(page.locator('[data-testid^="placard-pc."]')).toHaveCount(20);
  await page.getByTestId('placard-pc.cafe').click();
  await expect(page.getByTestId('placard')).toBeVisible();
  await page.getByTestId('placard-item-0').getByTestId('tap-word-0').click();
  await expect(page.getByTestId('word-box-meaning')).toContainText('coffee');
  await page.getByTestId('placard-large').click();
  await expect(page.getByTestId('placard-large')).toContainText('Normal size');
  await page.goto('/placards/pc.alphabet');
  await expect(page.getByTestId('placard-table')).toContainText('بَاء');
});

test('time lab: the clock steps in five minutes and says the time word by word', async ({ page }) => {
  await newLearner(page);
  await page.goto('/practice');
  await page.getByTestId('time-lab-entry').click();
  await expect(page.getByTestId('time-lab')).toBeVisible();
  await page.getByTestId('time-now').click();
  const before = await page.getByTestId('time-digits').innerText();
  await page.getByTestId('time-plus-5').click();
  await expect(page.getByTestId('time-digits')).not.toHaveText(before);
  await expect(page.getByTestId('time-phrase')).toContainText('السَّاعَةُ');
  await expect(page.getByTestId('time-english')).toContainText('It is');
  await page.getByTestId('time-phrase').getByTestId('tap-word-0').click();
  await expect(page.getByTestId('word-box-meaning')).toContainText('hour');
  await expect(page.getByTestId('time-today')).toContainText('الْيَوْمُ');
  await expect(page.getByTestId('time-hijri')).toContainText('AH');
  await expect(page.getByTestId('quiz')).toBeVisible();
});

test('explore: culture chapters with photos, tappable words, a reading and a quiz; photos are credited', async ({ page }) => {
  await newLearner(page);
  await page.goto('/path');
  await page.getByTestId('path-explore').click();
  const cards = page.locator('[data-testid^="culture-cul."]');
  await expect(cards).toHaveCount(9);
  await page.getByTestId('culture-cul.coffee').click();
  await expect(page.getByTestId('culture-chapter')).toBeVisible();
  const hero = page.getByTestId('culture-chapter').locator('img').first();
  await expect(hero).toBeVisible();
  await expect.poll(() => hero.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(100);
  await page.getByTestId('culture-word-0').getByTestId('tap-word-0').click();
  await expect(page.getByTestId('word-box-meaning')).not.toBeEmpty();
  await expect(page.getByTestId('culture-reading')).toBeVisible();
  await expect(page.getByTestId('culture-quiz').getByTestId('quiz')).toBeVisible();
  await page.goto('/credits');
  await expect(page.locator('[data-testid^="credit-"]')).toHaveCount(34);
});

test('onboarding: welcome, goal and time, audio check, then the placement check suggests a start', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('learner-name').fill('Layla');
  await page.getByTestId('add-learner').click();
  await expect(page.getByTestId('onboarding')).toBeVisible();
  await expect(page.getByTestId('onboarding')).toContainText('Welcome, Layla!');
  await expect(page.getByTestId('onboarding')).toContainText('What to expect, honestly');
  await page.getByTestId('onb-next-0').click();
  await page.getByTestId('onb-min-30').click();
  await page.getByTestId('onb-next-1').click();
  await expect(page.getByTestId('onb-audio')).toBeVisible();
  await page.getByTestId('onb-placement').click();
  // placement: "I don't know" for the whole first stage → start from Day 1
  await expect(page.getByTestId('placement-pos')).toContainText('STAGE 1 OF 6');
  for (let i = 0; i < 4; i++) await page.getByTestId('placement-skip').click();
  await expect(page.getByTestId('placement-advice')).toContainText('starting from Day 1');
  await page.getByTestId('placement-day1').click();
  await expect(page.getByTestId('greeting')).toContainText('Layla');
  // onboarding is done for this learner: reloading goes straight to Today
  await page.reload();
  await expect(page.getByTestId('greeting')).toContainText('Layla');
});

test('placement: passing stages lets the learner test into week 1 and open week 2 without doing the days', async ({ page }) => {
  const stages = buildPlacement(course.weeks);
  await newLearner(page);
  await page.goto('/day/8');
  await expect(page.getByTestId('locked')).toBeVisible();
  await page.goto('/placement');
  await answerQuiz(page, stages[0].questions); // weeks 1–2 right
  for (let i = 0; i < 4; i++) await page.getByTestId('placement-skip').click(); // weeks 3–4 not known
  await expect(page.getByTestId('placement-advice')).toContainText('up to week 2');
  await expect(page.getByTestId('placement-result')).toContainText('Weeks 1–2: 4 of 4');
  await page.getByTestId('placement-week1').click();
  await expect(page.getByTestId('quiz')).toBeVisible();
  await answerQuiz(page, course.weeks[0].test);
  await expect(page.getByTestId('quiz-score')).toContainText('100%');
  await page.goto('/day/8');
  await expect(page.getByTestId('locked')).toHaveCount(0);
  await expect(page.getByTestId('day-title')).toBeVisible();
});

test('speaking lab: model, consent before recognition, record-and-compare and self-check', async ({ page }) => {
  await newLearner(page);
  await page.getByTestId('tab-practice').click();
  await page.getByTestId('speaking-lab-entry').click();
  await expect(page.getByTestId('speaking')).toContainText('never part of your quiz or test scores');
  // no day finished yet → starter sentences
  await expect(page.getByTestId('speak-fallback')).toBeVisible();
  await expect(page.getByTestId('speak-position')).toContainText('Day 1 · 1 of');
  await expect(page.getByTestId('speak-model')).toBeVisible();
  await expect(page.getByTestId('speak-rec')).toBeVisible();
  // Chromium has a recogniser: it stays off until the learner allows it
  await expect(page.getByTestId('speak-listen')).toHaveCount(0);
  await page.getByTestId('speak-consent').click();
  await expect(page.getByTestId('speak-listen')).toBeVisible();
  await page.getByTestId('speak-self-ok').click();
  await expect(page.getByTestId('speak-position')).toContainText('2 of');
  await expect(page.getByTestId('speak-tally')).toContainText('1 said clearly');
});

test('report: empty at first, then shows days, quiz accuracy and the week-1 test after a lesson and a test', async ({ page }) => {
  await newLearner(page);
  await page.getByTestId('tab-me').click();
  await page.getByTestId('me-report').click();
  await expect(page.getByTestId('report')).toBeVisible();
  await expect(page.getByTestId('report-empty')).toBeVisible();
  await expect(page.getByTestId('report-days')).toContainText('0 of 90 days');
  await expect(page.getByTestId('report-placement')).toContainText('Not taken');
  await expect(page.getByTestId('report-week-1')).toContainText('not taken');
  // finish Day 1 and pass the week 1 test (unlock all so the test is open)
  await page.goto('/day/1');
  for (let i = 0; i < 8; i++) await page.getByTestId('next-page').click();
  await answerQuiz(page, day1.quiz);
  await expect(page.getByTestId('done')).toContainText('Day complete');
  await page.goto('/settings');
  await page.getByTestId('unlock-all').click();
  await page.goto('/week-test/1');
  await answerQuiz(page, course.weeks[0].test);
  await expect(page.getByTestId('quiz-score')).toContainText('100%');
  await page.goto('/report');
  await expect(page.getByTestId('report-empty')).toHaveCount(0);
  await expect(page.getByTestId('report-days')).toContainText('1 of 90 days');
  await expect(page.getByTestId('report-skills')).toContainText('Day quizzes');
  await expect(page.getByTestId('report-skills')).toContainText('Week tests');
  await expect(page.getByTestId('report-week-1')).toContainText('1 of 7 days done');
  await expect(page.getByTestId('report-week-1')).toContainText('100% · passed');
  await expect(page.getByTestId('report-week-2')).toContainText('not taken');
  await expect(page.getByTestId('report')).toContainText('1 of 13');
});

test('final exam: locked until week 13 is passed, open with unlock-all, result feeds the Final report', async ({ page }) => {
  await newLearner(page);
  await page.goto('/final-exam');
  await expect(page.getByTestId('final-locked')).toContainText('Pass the week 13 test first');
  await page.goto('/path');
  await expect(page.getByTestId('path-final-exam')).toContainText('🔒 Final exam');
  await page.goto('/report');
  await expect(page.getByTestId('report-final')).toContainText('Not taken');
  await page.goto('/settings');
  await page.getByTestId('unlock-all').click();
  await page.goto('/path');
  await expect(page.getByTestId('path-final-exam')).toContainText('🎓 Final exam');
  await page.getByTestId('path-final-exam').click();
  await expect(page.getByTestId('final-exam')).toBeVisible();
  const exam = buildFinalExam(course.weeks);
  await expect(page.getByTestId('final-exam')).toContainText(`${exam.length} questions`);
  await page.getByTestId('final-start').click();
  await expect(page.getByTestId('final-pos')).toContainText(`QUESTION 1 OF ${exam.length} · WEEK 1`);
  // answer the first question wrong (week 1), the rest right
  const q0 = exam[0].q;
  const options = page.locator('[data-testid^="option-"]');
  const n = await options.count();
  for (let k = 0; k < n; k++) {
    const text = (await options.nth(k).innerText()).trim().split('\n')[0].trim();
    if (text !== q0.options[q0.answer]) {
      await options.nth(k).click();
      break;
    }
  }
  await expect(page.getByTestId('quiz-feedback')).toContainText('Not this one');
  await page.getByTestId('quiz-next').click();
  await answerQuiz(
    page,
    exam.slice(1).map((x) => x.q),
  );
  await expect(page.getByTestId('final-exam-result')).toBeVisible();
  await expect(page.getByTestId('final-score')).toContainText(`${exam.length - 1} / ${exam.length} correct`);
  await expect(page.getByTestId('final-by-week')).toContainText('Week 1');
  await expect(page.getByTestId('final-by-week')).toContainText('Worth another look: week 1');
  await page.getByTestId('final-report').click();
  await expect(page.getByTestId('report-final')).toContainText('passed');
  await expect(page.getByTestId('report-final')).toContainText('1 attempt');
  await expect(page.getByTestId('report-final')).toContainText('week 1');
  await expect(page.getByTestId('report-skills')).toContainText('Final exam');
  // not all 90 days are done, so it is not yet the final report
  await expect(page.getByTestId('report-title')).toContainText('Where you are');
  // the best attempt is kept on the exam's start page
  await page.goto('/final-exam');
  await expect(page.getByTestId('final-best')).toContainText('passed');
  await expect(page.getByTestId('final-best')).toContainText('1 attempt');
});
