import { defineConfig, devices } from '@playwright/test';

// Web e2e against the exported build (npm run build:web first). Port 4190 is Arabic Journey's.
export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  retries: 0,
  workers: 2,
  use: { baseURL: 'http://localhost:4190', ...devices['Pixel 7'], browserName: 'chromium' },
  webServer: { command: 'node scripts/serve-dist.mjs dist 4190', url: 'http://localhost:4190', reuseExistingServer: true },
});
