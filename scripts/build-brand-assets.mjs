/**
 * Renders the Arabic Journey icon set and Play Store graphics from one SVG design.
 *   node scripts/build-brand-assets.mjs
 * Writes app icons to assets/images/ and store graphics to store/graphics/.
 * Uses Playwright's Chromium, so no image tooling is needed. The letter is ع (ʿayn, the sound English has
 * no letter for) set in Noto Naskh Arabic, the app's own Arabic font.
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const GREEN = '#0B7A5C';
const GREEN_DARK = '#065C44';
const SAND = '#E8C97A';
const FONT_FILE = pathToFileURL(
  resolve('node_modules/@expo-google-fonts/noto-naskh-arabic/700Bold/NotoNaskhArabic_700Bold.ttf'),
).href;
const GRADIENT = `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#14997A"/><stop offset="1" stop-color="${GREEN_DARK}"/></linearGradient></defs>`;
const AR = `font-family="'Noto Naskh Arabic Brand'" font-weight="700"`;
const LATIN = `font-family="'Segoe UI','Arial',sans-serif"`;

/** Speech bubble with ع and a sand-coloured accent bar, drawn in a 1024 box. */
function mark({ bubble = '#FFFFFF', letter = GREEN, bar = false, mono = false } = {}) {
  const bubblePath = `<path d="M342 250 H682 A110 110 0 0 1 792 360 V580 A110 110 0 0 1 682 690 H452 L322 800 L342 690 A110 110 0 0 1 232 580 V360 A110 110 0 0 1 342 250 Z" fill="${bubble}"/>`;
  const glyph = (fill) => `<text x="512" y="585" text-anchor="middle" font-size="360" ${AR} fill="${fill}">ع</text>`;
  if (mono) {
    return `<defs><mask id="m"><rect width="1024" height="1024" fill="white"/>${glyph('black')}</mask></defs><g mask="url(#m)">${bubblePath}</g>`;
  }
  const accent = bar ? `<rect x="432" y="628" width="160" height="22" rx="11" fill="${SAND}"/>` : '';
  return `${bubblePath}${glyph(letter)}${accent}`;
}

const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
const scaled = (s, body) => `<g transform="translate(${512 - 512 * s} ${512 - 512 * s}) scale(${s})">${body}</g>`;

const ICON_FULL = svg(1024, 1024, `${GRADIENT}<rect width="1024" height="1024" fill="url(#bg)"/>${scaled(1.08, mark())}`);
// Adaptive icon foreground must keep its content inside the central 66% safe zone.
const ADAPTIVE_FG = svg(1024, 1024, scaled(0.74, mark()));
const ADAPTIVE_BG = svg(1024, 1024, `${GRADIENT}<rect width="1024" height="1024" fill="url(#bg)"/>`);
const ADAPTIVE_MONO = svg(1024, 1024, scaled(0.74, mark({ mono: true })));
const SPLASH = svg(1024, 1024, mark());

const FEATURE = svg(
  1024,
  500,
  `${GRADIENT}<rect width="1024" height="500" fill="url(#bg)"/>
  <g transform="translate(30 70) scale(0.36)">${mark()}</g>
  <text x="400" y="200" ${LATIN} font-size="54" font-weight="800" fill="#FFFFFF">Arabic Journey</text>
  <text x="402" y="258" ${LATIN} font-size="30" font-weight="600" fill="#DDF3EA">Modern Standard Arabic in 90 days</text>
  <text x="402" y="302" ${LATIN} font-size="22" fill="#BFE3D5">Letters · Lessons · Speaking · Real-life scenarios</text>
  <text x="402" y="400" ${AR} font-size="60" fill="${SAND}" direction="rtl" text-anchor="end" xml:space="preserve">رِحْلَةٌ عَرَبِيَّةٌ</text>`,
);

const OUTPUTS = [
  { file: 'assets/images/icon.png', svg: ICON_FULL, size: [1024, 1024] },
  { file: 'assets/images/favicon.png', svg: ICON_FULL, size: [48, 48] },
  { file: 'assets/images/android-icon-foreground.png', svg: ADAPTIVE_FG, size: [1024, 1024], transparent: true },
  { file: 'assets/images/android-icon-background.png', svg: ADAPTIVE_BG, size: [1024, 1024] },
  { file: 'assets/images/android-icon-monochrome.png', svg: ADAPTIVE_MONO, size: [1024, 1024], transparent: true },
  { file: 'assets/images/splash-icon.png', svg: SPLASH, size: [512, 512], transparent: true },
  { file: 'store/graphics/icon-512.png', svg: ICON_FULL, size: [512, 512] },
  { file: 'store/graphics/feature-graphic-1024x500.png', svg: FEATURE, size: [1024, 500] },
];

mkdirSync('store/graphics', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
for (const o of OUTPUTS) {
  const [w, h] = o.size;
  const [vw, vh] = o.svg
    .match(/viewBox="0 0 (\d+) (\d+)"/)
    .slice(1)
    .map(Number);
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(
    `<html><head><style>@font-face{font-family:'Noto Naskh Arabic Brand';src:url('${FONT_FILE}') format('truetype');font-weight:700}</style></head><body style="margin:0;background:transparent">${o.svg.replace(/width="\d+" height="\d+"/, `width="${w}" height="${h}"`).replace(`viewBox="0 0 ${vw} ${vh}"`, `viewBox="0 0 ${vw} ${vh}" style="display:block"`)}</body></html>`,
  );
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  await page.screenshot({ path: o.file, omitBackground: !!o.transparent, clip: { x: 0, y: 0, width: w, height: h } });
  console.log('wrote', o.file, `${w}x${h}`);
}
await browser.close();
