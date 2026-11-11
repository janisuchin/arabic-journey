import { expect, type Page } from '@playwright/test';

export async function newLearner(page: Page, name = 'Sara') {
  await page.goto('/');
  await page.getByTestId('learner-name').fill(name);
  await page.getByTestId('add-learner').click();
  await skipOnboarding(page);
  await expect(page.getByTestId('greeting')).toContainText(name);
}

/** Go through the first-run welcome with the defaults and start at Day 1. */
export async function skipOnboarding(page: Page) {
  await page.getByTestId('onb-next-0').click();
  await page.getByTestId('onb-next-1').click();
  await page.getByTestId('onb-start').click();
}

/** Answer the visible quiz correctly using the content's answer key. */
export async function answerQuiz(page: Page, questions: { options: string[]; answer: number }[]) {
  for (const q of questions) {
    await page.locator('[data-testid^="option-"]').first().waitFor();
    const right = q.options[q.answer];
    const options = page.locator('[data-testid^="option-"]');
    const n = await options.count();
    let clicked = false;
    for (let k = 0; k < n; k++) {
      const text = (await options.nth(k).innerText()).trim();
      if (text === right || text.startsWith(right + '\n') || text.split('\n')[0].trim() === right) {
        await options.nth(k).click();
        clicked = true;
        break;
      }
    }
    expect(clicked, `option "${right}" not found`).toBe(true);
    await page.getByTestId('quiz-next').click();
  }
}
