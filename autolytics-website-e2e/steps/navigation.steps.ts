import { expect } from '@playwright/test';
import { Given, When, Then } from '../support/fixtures';
import { SitePage } from '../pages/SitePage';
import { escapeRegExp } from '../support/utils';

Given('I open the {string} page', async ({ site }, name: string) => {
  await site.open(name);
});

Given('I open the path {string}', async ({ site }, path: string) => {
  await site.openPath(path);
});

When('I click the {string} link in the header navigation', async ({ site }, name: string) => {
  await site.navLink(name).click();
});

When('I click the site logo', async ({ site }) => {
  await site.logo.click();
});

When('I click the {string} link', async ({ page }, name: string) => {
  await page.getByRole('link', { name, exact: true }).first().click();
});

When('I click the {string} button', async ({ page }, name: string) => {
  await page.getByRole('button', { name, exact: true }).click();
});

Then('I should be on the {string} page', async ({ page }, name: string) => {
  await expect(page).toHaveURL(SitePage.urlPatternFor(name));
});

Then('the URL should end with {string}', async ({ page }, suffix: string) => {
  await expect(page).toHaveURL(new RegExp(`${escapeRegExp(suffix)}$`));
});

Then('the page title should be {string}', async ({ page }, title: string) => {
  await expect(page).toHaveTitle(title);
});

Then('the main heading should be {string}', async ({ site }, heading: string) => {
  await expect(site.mainHeading).toHaveText(heading);
});

Then(
  'the {string} link in the header navigation should be marked as the current page',
  async ({ site }, name: string) => {
    await expect(site.navLink(name)).toHaveAttribute('aria-current', 'page');
  },
);

Then('only one header navigation link should be marked as the current page', async ({ site }) => {
  await expect(site.headerNav.locator('a[aria-current="page"]')).toHaveCount(1);
});

Then('the section headed {string} should be in view', async ({ site }, heading: string) => {
  await expect(site.heading(heading)).toBeInViewport();
});

Then('every internal link on the page should resolve', async ({ page, request }) => {
  const pageOrigin = new URL(page.url()).origin;
  const hrefs = await page.locator('a[href]').evaluateAll((links) => links.map((a) => (a as HTMLAnchorElement).href));
  const internal = [...new Set(hrefs)].filter((href) => new URL(href).origin === pageOrigin);
  expect(internal.length, 'internal links found on the page').toBeGreaterThan(0);

  const bodies = new Map<string, { status: number; html: string }>();
  const broken: string[] = [];
  for (const href of internal) {
    const url = new URL(href);
    const anchor = decodeURIComponent(url.hash.slice(1));
    url.hash = '';
    const target = url.toString();
    if (!bodies.has(target)) {
      const response = await request.get(target);
      bodies.set(target, { status: response.status(), html: await response.text() });
    }
    const { status, html } = bodies.get(target)!;
    if (status !== 200) broken.push(`${href} returned HTTP ${status}`);
    else if (anchor && !new RegExp(`id=["']${escapeRegExp(anchor)}["']`).test(html)) {
      broken.push(`${href} points to #${anchor}, which does not exist on that page`);
    }
  }
  expect(broken, 'broken links').toEqual([]);
});

Then('there should be no JavaScript errors on the page', async ({ page, pageProblems }) => {
  await page.waitForLoadState('load');
  expect(pageProblems).toEqual([]);
});

Then('the {string} link should open {string} in a new tab', async ({ page }, name: string, url: string) => {
  const link = page.getByRole('link', { name, exact: true });
  await expect(link).toHaveAttribute('href', url);
  await expect(link).toHaveAttribute('target', '_blank');
  // rel="noopener" stops the new tab from controlling this page via window.opener.
  await expect(link).toHaveAttribute('rel', /\bnoopener\b/);
});
