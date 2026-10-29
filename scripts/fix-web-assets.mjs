// Post-processes a web export: sets <html dir="rtl" lang="ar">, adds a web manifest and icons.
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2] ?? 'dist';
const unlocked = out.includes('unlocked');
const name = unlocked ? 'Arabic Journey (Unlocked)' : 'Arabic Journey';
const index = join(out, 'index.html');
if (!existsSync(index)) {
  console.error(`fix-web-assets: ${index} not found`);
  process.exit(1);
}
let html = readFileSync(index, 'utf8');
html = html.replace(/<html[^>]*>/, '<html dir="rtl" lang="ar">');
if (!html.includes('manifest.webmanifest'))
  html = html.replace(
    '</head>',
    '<link rel="manifest" href="/manifest.webmanifest"><link rel="apple-touch-icon" href="/icon-512.png"><meta name="theme-color" content="#0B7A5C"></head>',
  );
html = html.replace(/<title>[^<]*<\/title>/, `<title>${name}</title>`);
writeFileSync(index, html);
copyFileSync('assets/images/icon.png', join(out, 'icon-512.png'));
writeFileSync(
  join(out, 'manifest.webmanifest'),
  JSON.stringify(
    {
      name,
      short_name: 'Arabic Journey',
      lang: 'ar',
      dir: 'rtl',
      start_url: '/',
      display: 'standalone',
      background_color: '#F6F4EF',
      theme_color: '#0B7A5C',
      icons: [{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' }],
    },
    null,
    2,
  ),
);
console.log(`fix-web-assets: ${out} ready (dir=rtl, manifest, icons)`);
