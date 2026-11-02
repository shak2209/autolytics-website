import { expect } from '@playwright/test';
import { When, Then } from '../support/fixtures';
import { escapeRegExp } from '../support/utils';

Then('there should be {int} role tabs', async ({ experience }, count: number) => {
  await expect(experience.tabs).toHaveCount(count);
});

When('I select the {string} tab for the {string} role', async ({ experience }, company: string, role: string) => {
  await experience.tab(company, role).click();
});

When('I press {string} on the selected tab', async ({ experience }, key: string) => {
  await experience.selectedTab.press(key);
});

Then(
  'the {string} tab for the {string} role should be selected',
  async ({ experience }, company: string, role: string) => {
    const tab = experience.tab(company, role);
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    await expect(experience.selectedTab).toHaveCount(1);
  },
);

Then(
  'the {string} tab for the {string} role should have keyboard focus',
  async ({ experience }, company: string, role: string) => {
    await expect(experience.tab(company, role)).toBeFocused();
  },
);

Then(
  'the panel for {string} as {string} should be displayed',
  async ({ experience }, company: string, role: string) => {
    const panel = await experience.panelFor(company, role);
    await expect(panel).toBeVisible();
    await expect(panel.getByRole('heading', { level: 2 })).toContainText(company);
    await expect(panel.locator('.role')).toHaveText(role);
  },
);

Then('the panel should show the dates {string}', async ({ experience }, dates: string) => {
  await expect(experience.visiblePanel.locator('.dates')).toHaveText(dates);
});

Then('only one role panel should be visible', async ({ experience }) => {
  await expect(experience.visiblePanels).toHaveCount(1);
});

Then('the URL hash should be {string}', async ({ page }, hash: string) => {
  await expect(page).toHaveURL(new RegExp(`${escapeRegExp(hash)}$`));
});

Then('the URL should not contain a hash', async ({ page }) => {
  await expect(page).not.toHaveURL(/#/);
});

Then('only the selected role tab should be reachable with the Tab key', async ({ page, experience }) => {
  // Roving tabindex: the selected tab is focusable, the others are not.
  await expect(page.locator('[role="tab"][tabindex="0"]')).toHaveCount(1);
  await expect(experience.selectedTab).toHaveAttribute('tabindex', '0');

  // Tab from the selected tab skips the other tabs and lands on the open panel...
  await experience.selectedTab.focus();
  await page.keyboard.press('Tab');
  await expect(experience.visiblePanel).toBeFocused();

  // ...and Shift+Tab returns to the selected tab.
  await page.keyboard.press('Shift+Tab');
  await expect(experience.selectedTab).toBeFocused();
});
