/**
 * Captures Google Play phone screenshots (1080×1920) from the exported web build.
 *   npm run build:web && node scripts/serve-dist.mjs dist 4192   (in another terminal)
 *   node scripts/store-screenshots.mjs
 * Output: store/screenshots/*.png
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:4192';
const SHOTS = [
  { name: '01-today', route: '/' },
  { name: '02-path', route: '/path' },
  { name: '03-lesson', route: '/day/1' },
  { name: '04-letters', route: '/letters' },
  { name: '05-scenario', route: '/scenarios/cafe' },
  { name: '06-practice', route: '/practice' },
  { name: '07-grammar', route: '/grammar/greetings' },
  { name: '08-culture', route: '/culture' },
];

mkdirSync('store/screenshots', { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 360, height: 640 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  colorScheme: 'light',
});
// headless Chromium has no voices; present an Arabic one so the screens show their normal state
await context.addInitScript(() => {
  const voices = [{ name: 'العربية', lang: 'ar-SA', voiceURI: 'ar', localService: true, default: false }];
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: {
      speaking: false,
      paused: false,
      pending: false,
      onvoiceschanged: null,
      getVoices: () => voices,
      speak() {},
      cancel() {},
      pause() {},
      resume() {},
      addEventListener() {},
      removeEventListener() {},
    },
  });
});
const page = await context.newPage();
await page.goto(BASE + '/');
await page.getByTestId('learner-name').fill('Sara');
await page.getByTestId('add-learner').click();
await page.getByTestId('onb-next-0').click();
await page.getByTestId('onb-next-1').click();
await page.getByTestId('onb-start').click();
await page.getByTestId('greeting').waitFor();
for (const s of SHOTS) {
  await page.goto(BASE + s.route);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `store/screenshots/${s.name}.png` });
  console.log('wrote', s.name);
}
await browser.close();
