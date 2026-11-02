import { test as base, createBdd } from 'playwright-bdd';
import { SitePage } from '../pages/SitePage';
import { ExperiencePage } from '../pages/ExperiencePage';

type Fixtures = {
  site: SitePage;
  experience: ExperiencePage;
  /** Uncaught JS errors, console errors and failed same-origin requests seen during the test. */
  pageProblems: string[];
};

// Browsers request /favicon.ico automatically; the site has none, so that 404 is ignored.
const isFavicon = (url: string) => /\/favicon\.ico(\?|$)/.test(url);

export const test = base.extend<Fixtures>({
  site: async ({ page }, use) => use(new SitePage(page)),
  experience: async ({ page }, use) => use(new ExperiencePage(page)),

  // Auto fixture so listeners are attached before the first navigation.
  pageProblems: [
    async ({ page, baseURL }, use) => {
      const problems: string[] = [];
      const origin = new URL(baseURL ?? 'http://localhost').origin;
      page.on('pageerror', (error) => problems.push(`Uncaught error: ${error.message}`));
      page.on('console', (msg) => {
        if (msg.type() === 'error' && !isFavicon(msg.location().url)) problems.push(`Console error: ${msg.text()}`);
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
