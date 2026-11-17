import { test as base, createBdd } from 'playwright-bdd';
import type { Page } from '@playwright/test';
import { SitePage } from '../pages/SitePage';
import { ExperiencePage } from '../pages/ExperiencePage';
import { AdminPage } from '../pages/AdminPage';

export type Role = 'editor' | 'viewer';
export interface Credentials { username: string; password: string }

type Fixtures = {
  site: SitePage;
  experience: ExperiencePage;
  admin: AdminPage;
  /**
   * Looks up the demo admin passwords from E2E_<ROLE>_USER / E2E_<ROLE>_PASSWORD (a git-ignored .env file locally,
   * GitHub Actions secrets in CI). If they are not set, the test is skipped rather than failed.
   */
  credentials: (role: string) => Credentials;
  /** A second browser tab in the same session, for multi-tab scenarios. */
  tabs: { second?: Page };
  /** Holds a value from one step for a later step, e.g. an error message. */
  memo: { error?: string };
  /** Uncaught JS errors, console errors, pop-up dialogs and failed same-origin requests seen during the test. */
  pageProblems: string[];
};

// Browsers request /favicon.ico automatically; the site has none, so that 404 is ignored.
const isFavicon = (url: string) => /\/favicon\.ico(\?|$)/.test(url);

export const test = base.extend<Fixtures>({
  site: async ({ page }, use) => use(new SitePage(page)),
  experience: async ({ page }, use) => use(new ExperiencePage(page)),
  admin: async ({ page }, use) => use(new AdminPage(page)),
  tabs: async ({}, use) => use({}),
  memo: async ({}, use) => use({}),

  credentials: async ({}, use, testInfo) => {
    await use((role: string) => {
      const key = role.toUpperCase();
      const username = process.env[`E2E_${key}_USER`];
      const password = process.env[`E2E_${key}_PASSWORD`];
      if (!username || !password) {
        testInfo.skip(true, `Admin ${role} credentials are not configured (see .env.example)`);
        throw new Error('unreachable');
      }
      return { username, password };
    });
  },

  // Auto fixture so listeners are attached before the first navigation.
  pageProblems: [
    async ({ page, baseURL }, use) => {
      const problems: string[] = [];
      const origin = new URL(baseURL ?? 'http://localhost').origin;
      page.on('pageerror', (error) => problems.push(`Uncaught error: ${error.message}`));
      page.on('console', (msg) => {
        if (msg.type() === 'error' && !isFavicon(msg.location().url)) problems.push(`Console error: ${msg.text()}`);
      });
      page.on('dialog', (dialog) => {
        problems.push(`Browser ${dialog.type()} dialog: ${dialog.message()}`);
        void dialog.dismiss();
      });
      page.on('response', (response) => {
        const url = response.url();
        if (response.status() >= 400 && url.startsWith(origin) && !isFavicon(url)) {
          problems.push(`HTTP ${response.status()}: ${url}`);
        }
      });
      await use(problems);
    },
    { auto: true },
  ],
});

export const { Given, When, Then } = createBdd(test);
