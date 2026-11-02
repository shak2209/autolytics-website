import { expect } from '@playwright/test';
import type { DataTable } from 'playwright-bdd';
import { When, Then } from '../support/fixtures';
import { exactText } from '../support/utils';

/** A single-column data table as a list of strings. */
const column = (table: DataTable) => table.raw().map(([value]) => value);

Then('I should see the following statistics:', async ({ page }, table: DataTable) => {
  const rows = table.hashes();
  await expect(page.locator('.stat strong')).toHaveText(rows.map((r) => r.value));
  await expect(page.locator('.stat span')).toHaveText(rows.map((r) => r.label));
});

Then('I should see the following service cards:', async ({ page }, table: DataTable) => {
  await expect(page.locator('article.card h3')).toHaveText(column(table));
});

When('I click "Learn more" on the {string} card', async ({ site }, title: string) => {
  await site.serviceCard(title).getByRole('link', { name: /Learn more/ }).click();
});

Then('the {string} service card should be in view', async ({ site }, title: string) => {
  await expect(site.serviceCard(title)).toBeInViewport();
});

Then('the {string} service card should list {int} items', async ({ site }, title: string, count: number) => {
  await expect(site.serviceCard(title).locator('li')).toHaveCount(count);
});

Then('the tags under the {string} heading should be:', async ({ site }, heading: string, table: DataTable) => {
  await expect(site.tagsUnderHeading(heading)).toHaveText(column(table));
});

Then(
  'the tags under the {string} heading should include:',
  async ({ site }, heading: string, table: DataTable) => {
    for (const tag of column(table)) {
      await expect(site.tagsUnderHeading(heading).filter({ hasText: exactText(tag) }), `tag "${tag}"`).toHaveCount(1);
    }
  },
);

Then('there should be {int} tags under the {string} heading', async ({ site }, count: number, heading: string) => {
  await expect(site.tagsUnderHeading(heading)).toHaveCount(count);
});

Then('the list under the {string} heading should be:', async ({ site }, heading: string, table: DataTable) => {
  await expect(site.listUnderHeading(heading).locator('li')).toHaveText(column(table));
});

Then('I should see the text {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text).first()).toBeVisible();
});

Then('the contact section should show the email address {string}', async ({ site }, email: string) => {
  const link = site.contactSection.getByRole('link', { name: email, exact: true });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', `mailto:${email}`);
});

Then('the footer should show the copyright notice for the current year', async ({ site }) => {
  const year = new Date().getFullYear();
  await expect(site.footer).toContainText(`© ${year} Autolytics IT Consultancy Ltd. All rights reserved.`);
});
