import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { Then } from '../support/fixtures';

Then('the page should have no serious or critical accessibility violations', async ({ page, $testInfo }) => {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  await $testInfo.attach('axe-violations.json', {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });
  const blocking = results.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} element(s)) ${v.helpUrl}`);
  expect(blocking).toEqual([]);
});

Then('the page language should be {string}', async ({ page }, lang: string) => {
  await expect(page.locator('html')).toHaveAttribute('lang', lang);
});

Then('the page should have a meta description', async ({ page }) => {
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S.{20,}/);
});

Then('the page should have exactly one main heading', async ({ page }) => {
  await expect(page.locator('h1')).toHaveCount(1);
});
