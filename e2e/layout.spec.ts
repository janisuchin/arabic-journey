import { expect, test } from '@playwright/test';
import { newLearner } from './helpers';

const SIZES = [
  [320, 568],
  [344, 882],
  [360, 640],
  [360, 800],
  [800, 1280],
] as const;
const ROUTES = [
  '/',
  '/path',
  '/practice',
  '/library',
  '/me',
  '/day/1',
  '/letters',
  '/grammar/greetings',
  '/numbers',
  '/settings',
  '/scenarios/cafe',
];

for (const [w, h] of SIZES) {
  test(`no horizontal page scroll at ${w}×${h} (largest text size)`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await newLearner(page);
    await page.goto('/settings');
    await page.getByTestId('text-size-1.5').click();
    await page.getByTestId('unlock-all').click();
    for (const r of ROUTES) {
      await page.goto(r);
      await page.waitForTimeout(300);
      const overflow = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        let worst = 0;
        document.querySelectorAll('body *').forEach((el) => {
          const b = el.getBoundingClientRect();
          if (b.width > 0 && getComputedStyle(el).visibility !== 'hidden') worst = Math.max(worst, b.right - vw, -b.left);
        });
        return { scroll: document.scrollingElement!.scrollWidth - vw, worst: Math.round(worst) };
      });
      expect(overflow.scroll, `${r} page scroll`).toBeLessThanOrEqual(0);
      expect(overflow.worst, `${r} element off-screen by px`).toBeLessThanOrEqual(1);
    }
  });
}
