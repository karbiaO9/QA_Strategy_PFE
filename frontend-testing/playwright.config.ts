import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const isCI = process.env.CI === 'true';
const baseURL = process.env.BASE_URL ?? 'https://kine.physio.agregatech.com';
const workers = Number(process.env.WORKERS ?? (isCI ? 2 : 4));
const retries = Number(process.env.RETRIES ?? (isCI ? 2 : 0));

const authStoragePath = path.join(__dirname, 'playwright/.auth/physio-kine.json');
const adminStoragePath = path.join(__dirname, 'playwright/.auth/physio-admin.json');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries,
  workers,
  timeout: 60_000,
  expect: { timeout: 10_000 },

  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),

  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
    ['allure-playwright', { resultsDir: 'reports/allure-results' }],
    ['./utils/reporters/stc-markdown-reporter.ts'],
  ],

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
  },

  outputDir: 'test-results',

  projects: [
    {
      name: 'chromium-guest',
      testMatch: [/tests\/auth\/.*\.spec\.ts$/, /tests\/smoke\/.*\.spec\.ts$/],
      grepInvert: /STC-AUTH-021/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: { cookies: [], origins: [] },
      },
    },
    {
      name: 'chromium-auth',
      testMatch: /tests\/auth\/me\.spec\.ts$/,
      grep: /STC-AUTH-021/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: authStoragePath,
      },
    },
    {
      // Invitation suite — cabinet-admin session (create invitations).
      // Public deep-link / register specs clear storage per-test.
      name: 'chromium-kine-admin',
      testMatch: /tests\/invitations\/.*\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: adminStoragePath,
      },
    },
    {
      // Profile suite — authenticated member Kine session
      // (switcher + add profile).
      name: 'chromium-kine',
      testMatch: /tests\/profiles\/.*\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: authStoragePath,
      },
    },
  ],

  metadata: {
    project: process.env.PROJECT_NAME ?? 'XXX & Connect',
    environment: baseURL,
  },
});
