import { expect, test } from '@playwright/test';
import day1 from '../content/days/day01.json';
import { answerQuiz, newLearner } from './helpers';

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
