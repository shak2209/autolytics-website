import { expect } from '@playwright/test';
import type { DataTable } from 'playwright-bdd';
import { Given, When, Then } from '../support/fixtures';
import { AdminPage } from '../pages/AdminPage';

const DEFAULT_SUMMARY = 'A short summary for testing.';
const DEFAULT_ITEMS = 'First item\nSecond item';

// ---------- Opening pages and signing in ----------

Given('I open the admin sign-in page', async ({ admin }) => {
  await admin.open('Sign in');
});

Given('I open the admin page {string}', async ({ admin }, name: string) => {
  await admin.open(name);
});

Given('I am signed in as the {string}', async ({ admin }, role: string) => {
  await admin.startSession(role.toLowerCase() as 'editor' | 'viewer');
  await expect(admin.page.getByRole('heading', { level: 1, name: 'Manage services' })).toBeVisible();
});

Then('I should be on the {string} admin page', async ({ page }, name: string) => {
  const target = AdminPage.expectedPath(name);
  await expect(page).toHaveURL(target.url);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(target.heading);
});

When('I sign in as the {string} with the correct password', async ({ admin, credentials }, role: string) => {
  const { username, password } = credentials(role);
  await admin.username.fill(username);
  await admin.password.fill(password);
  await admin.page.getByRole('button', { name: 'Sign in', exact: true }).click();
});

// A username in a scenario can be written as {editor} or {viewer}; it is replaced by that account's real username,
// so real usernames never need to appear in the test cases.
When(
  'I sign in with username {string} and password {string}',
  async ({ admin, credentials }, username: string, password: string) => {
    const resolved = username.replace(/^\{(editor|viewer)\}$/, (_, role: string) => credentials(role).username);
    await admin.username.fill(resolved);
    await admin.password.fill(password);
    await admin.page.getByRole('button', { name: 'Sign in', exact: true }).click();
  },
);

When('I fail to sign in {int} times', async ({ admin }, times: number) => {
  for (let i = 1; i <= times; i++) {
    await admin.username.fill('nobody');
    await admin.password.fill(`wrong-password-${i}`);
    await admin.page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(admin.loginError).toBeVisible();
  }
});

When('I sign in using only the keyboard as the {string}', async ({ admin, credentials, page }, role: string) => {
  const { username, password } = credentials(role);
  await admin.username.focus();
  await page.keyboard.type(username);
  await page.keyboard.press('Tab');
  await page.keyboard.type(password);
  await page.keyboard.press('Enter');
});

When('I type {string} in the password field', async ({ admin }, text: string) => {
  await admin.password.fill(text);
});

Then('the password characters should be {word}', async ({ admin }, state: string) => {
  const type = { hidden: 'password', visible: 'text' }[state];
  if (!type) throw new Error(`State must be "hidden" or "visible", not "${state}"`);
  await expect(admin.password).toHaveAttribute('type', type);
});

Then('I should see the sign-in error {string}', async ({ admin }, message: string) => {
  await expect(admin.loginError).toHaveText(message);
});

Then('I should see the sign-in notice {string}', async ({ admin }, message: string) => {
  await expect(admin.loginNotice).toHaveText(message);
});

Then(
  'the session banner should show the {string} account with the {string} role',
  async ({ admin, credentials }, role: string, label: string) => {
    await expect(admin.sessionInfo).toHaveText(`Signed in as ${credentials(role).username} (${label})`);
  },
);

// ---------- Time, history and tabs ----------

Given('the browser clock is controlled', async ({ page }) => {
  await page.clock.install();
});

When('{int} seconds pass', async ({ page }, seconds: number) => {
  await page.clock.fastForward(seconds * 1000);
});

When('{int} minutes pass', async ({ page }, minutes: number) => {
  await page.clock.fastForward(minutes * 60 * 1000);
});

When('I go back in the browser', async ({ page }) => {
  await page.goBack();
});

When('I reload the page', async ({ page }) => {
  await page.reload();
});

Given('I open a second tab on the admin page {string}', async ({ context, tabs }, name: string) => {
  tabs.second = await context.newPage();
  await tabs.second.goto(AdminPage.expectedPath(name).path);
});

When('I sign out in the second tab', async ({ tabs }) => {
  await tabs.second!.getByRole('button', { name: 'Sign out', exact: true }).click();
});

Then('the first tab should be on the {string} admin page', async ({ page }, name: string) => {
  await expect(page).toHaveURL(AdminPage.expectedPath(name).url);
});

// ---------- The services table ----------

Then('the services table should list:', async ({ admin }, table: DataTable) => {
  await expect(admin.serviceTitles).toHaveText(table.raw().map(([title]) => title));
});

Then('the services table should list {int} services', async ({ admin }, count: number) => {
  await expect(admin.serviceRows).toHaveCount(count);
});

Then('the services table should include {string}', async ({ admin }, title: string) => {
  await expect(admin.serviceTitles.filter({ hasText: new RegExp(`^${escapeRx(title)}$`) })).toHaveCount(1);
});

Then('the services table should not include {string}', async ({ admin }, title: string) => {
  await expect(admin.serviceTitles.filter({ hasText: new RegExp(`^${escapeRx(title)}$`) })).toHaveCount(0);
});

Then('the services table should not be visible', async ({ admin }) => {
  await expect(admin.page.locator('#services-table')).toBeHidden();
});

Then('the {string} row should show the summary {string}', async ({ admin }, title: string, summary: string) => {
  await expect(admin.serviceRow(title)).toContainText(summary);
});

Then('the services table should have no Edit or Delete buttons', async ({ admin }) => {
  await expect(admin.page.locator('#services-table button')).toHaveCount(0);
});

Then('the status message should be {string}', async ({ admin }, message: string) => {
  await expect(admin.status).toHaveText(message);
});

Then('the confirmation should say {string}', async ({ admin }, message: string) => {
  await expect(admin.confirmPanel).toBeVisible();
  await expect(admin.confirmPanel).toContainText(message);
});

Then('the {string} button should be disabled', async ({ page }, name: string) => {
  await expect(page.getByRole('button', { name, exact: true })).toBeDisabled();
});

Then('the read-only notice {string} should be shown', async ({ page }, message: string) => {
  await expect(page.locator('#readonly-notice')).toHaveText(message);
});

// ---------- The add / edit form ----------

Then('the service form should be {word}', async ({ admin }, state: string) => {
  if (state === 'open') await expect(admin.form).toBeVisible();
  else if (state === 'closed') await expect(admin.form).toBeHidden();
  else throw new Error(`State must be "open" or "closed", not "${state}"`);
});

Then('the {string} field should contain {string}', async ({ admin }, field: string, value: string) => {
  await expect(admin.field(field)).toHaveValue(value);
});

Then('the {string} field should be empty', async ({ admin }, field: string) => {
  await expect(admin.field(field)).toHaveValue('');
});

When('I fill in the service form:', async ({ admin }, table: DataTable) => {
  for (const [field, value] of table.raw()) {
    await admin.field(field).fill(value.replace(/\\n/g, '\n'));
  }
});

When('I change the {string} field to {string}', async ({ admin }, field: string, value: string) => {
  await admin.field(field).fill(value);
});

async function addService(
  admin: AdminPage,
  { title, summary = DEFAULT_SUMMARY, items = DEFAULT_ITEMS }: { title: string; summary?: string; items?: string },
) {
  await admin.page.getByRole('button', { name: 'Add service', exact: true }).click();
  await admin.field('Title').fill(title);
  await admin.field('Summary').fill(summary);
  await admin.field('Items').fill(items);
  await admin.page.getByRole('button', { name: 'Save service', exact: true }).click();
}

When('I add a service with the title {string}', async ({ admin }, title: string) => {
  await addService(admin, { title });
});

When('I add a service with a {word} of {int} characters', async ({ admin }, field: string, length: number) => {
  const text = (letter: string) => letter.repeat(length);
  if (field === 'title') await addService(admin, { title: text('B') });
  else if (field === 'summary') await addService(admin, { title: 'Boundary test service', summary: text('S') });
  else if (field === 'item') await addService(admin, { title: 'Boundary test service', items: text('I') });
  else throw new Error(`Field must be title, summary or item, not "${field}"`);
});

When('I add a service with {int} items', async ({ admin }, count: number) => {
  const items = Array.from({ length: count }, (_, i) => `Item number ${i + 1}`).join('\n');
  await addService(admin, { title: 'Boundary test service', items });
});

Then('the service should be saved', async ({ admin }) => {
  await expect(admin.status).toHaveText(/^Service (added|updated)\.$/);
  await expect(admin.form).toBeHidden();
});

Then(
  'the service form should show the error {string} for the {string} field',
  async ({ admin }, message: string, field: string) => {
    await expect(admin.fieldError(field)).toHaveText(message);
    await expect(admin.field(field)).toHaveAttribute('aria-invalid', 'true');
    await expect(admin.field(field)).toHaveAccessibleDescription(message);
  },
);

Then('the {string} field should have keyboard focus', async ({ admin }, field: string) => {
  await expect(admin.field(field)).toBeFocused();
});

// ---------- Permissions (bypassing the screen) ----------

When('I try to save a service directly through the browser', async ({ page, memo }) => {
  memo.error = await page.evaluate(() => {
    const store = (window as unknown as { AutolyticsStore: { saveServices(list: unknown[]): void } }).AutolyticsStore;
    try {
      store.saveServices([{ id: 'hacked', title: 'Hacked', summary: 'x', items: ['x'] }]);
      return '';
    } catch (e) {
      return (e as Error).message;
    }
  });
});

Then('the change should be refused with {string}', async ({ memo }, message: string) => {
  expect(memo.error).toBe(message);
});

// ---------- Accessibility and layout ----------

Given('the admin page is in the {string} state', async ({ admin, page }, state: string) => {
  switch (state) {
    case 'sign-in':
      await admin.open('Sign in');
      break;
    case 'sign-in with an error':
      await admin.open('Sign in');
      await page.getByRole('button', { name: 'Sign in', exact: true }).click();
      await expect(admin.loginError).toBeVisible();
      break;
    case 'services list':
      await admin.startSession('editor');
      break;
    case 'service form open':
      await admin.startSession('editor');
      await page.getByRole('button', { name: 'Add service', exact: true }).click();
      break;
    case 'service form with errors':
      await admin.startSession('editor');
      await page.getByRole('button', { name: 'Add service', exact: true }).click();
      await page.getByRole('button', { name: 'Save service', exact: true }).click();
      await expect(admin.fieldError('title')).toBeVisible();
      break;
    default:
      throw new Error(`Unknown admin page state "${state}"`);
  }
});

Then('the page should not scroll sideways', async ({ page }) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, 'pixels of horizontal overflow').toBeLessThanOrEqual(0);
});

function escapeRx(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
