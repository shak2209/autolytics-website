import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

// Set BASE_URL to test a deployed copy of the site, e.g.
//   $env:BASE_URL = 'https://www.example.com/'; npm test
// Otherwise the local site files (the parent folder) are served on port 4173.
const PORT = 4173;
const baseURL = process.env.BASE_URL ?? `http://127.0.0.1:${PORT}/`;

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['support/fixtures.ts', 'steps/**/*.ts'],
  outputDir: '.features-gen',
  // Scenarios marked "Manual" in the CSV are written to the feature files but not automated.
  tags: 'not @manual',
});

export default defineConfig({
  testDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  outputDir: 'reports/test-results',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/playwright-html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
    cucumberReporter('html', { outputFile: 'reports/cucumber-report.html' }),
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Recording every test slows Firefox down enough to cause timeouts when all three browsers run in parallel.
    video: 'on-first-retry',
  },
  projects: [
    { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'npx tsx scripts/static-server.ts',
        url: `${baseURL}index.html`,
        reuseExistingServer: !process.env.CI,
        env: { PORT: String(PORT) },
      },
});
