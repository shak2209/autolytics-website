import { expect } from '@playwright/test';
import { Given, When, Then } from '../support/fixtures';

Given('my browser window is {int} by {int} pixels', async ({ page }, width: number, height: number) => {
  await page.setViewportSize({ width, height });
});

When('I resize the browser window to {int} by {int} pixels', async ({ page }, width: number, height: number) => {
  await page.setViewportSize({ width, height });
});

Then('the header navigation should be visible', async ({ site }) => {
  await expect(site.headerNav).toBeVisible();
});

Then('the header navigation should be hidden', async ({ site }) => {
  await expect(site.headerNav).toBeHidden();
});

Then('the {string} button should be visible', async ({ page }, name: string) => {
  await expect(page.getByRole('button', { name, exact: true })).toBeVisible();
});

Then('the {string} button should not be visible', async ({ page }, name: string) => {
  await expect(page.getByRole('button', { name, exact: true })).toBeHidden();
});

Then('the menu button should show the menu is {word}', async ({ site }, state: string) => {
  const expanded = { expanded: 'true', collapsed: 'false' }[state];
  if (!expanded) throw new Error(`Menu state must be "expanded" or "collapsed", not "${state}"`);
  await expect(site.menuButton).toHaveAttribute('aria-expanded', expanded);
});
