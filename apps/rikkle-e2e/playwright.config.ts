import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src',
  testMatch: '**/*.e2e.ts',
  use: {
    baseURL: 'http://localhost:4200',
  },
  webServer: {
    command: 'npx nx serve rikkle',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 120000,
  },
});
