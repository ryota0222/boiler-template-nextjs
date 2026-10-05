import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 2 : 0,
  ...(process.env['CI'] ? { workers: 1 } : {}),
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'on',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // 開発サーバーは初めて開いた画面や API をその場で組み立て、そのたびに画面を読み直すことがあるため、
    // CI では本番のビルドで動かして、結果が組み立ての順番に左右されないようにする
    command: process.env['CI'] ? 'pnpm run build && pnpm run start' : 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env['CI'],
  },
});
