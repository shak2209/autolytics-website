import type { Locator, Page } from '@playwright/test';
import { escapeRegExp } from '../support/utils';

/** The Experience page: one tab per role, each controlling a panel of detail. */
export class ExperiencePage {
  readonly tabs: Locator;
  readonly selectedTab: Locator;
  readonly visiblePanels: Locator;
  readonly visiblePanel: Locator;

  constructor(readonly page: Page) {
    this.tabs = page.getByRole('tab');
    this.selectedTab = page.locator('[role="tab"][aria-selected="true"]');
    this.visiblePanels = page.locator('[role="tabpanel"]:visible');
    this.visiblePanel = this.visiblePanels.first();
  }

  /**
   * A tab is identified by company and role, because a company can appear more than once
   * (e.g. Next PLC). The tab text is "<company><small><role> · <years></small>".
   */
  tab(company: string, role: string): Locator {
    return this.tabs
      .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(company)}`) })
      .filter({ has: this.page.locator('small', { hasText: new RegExp(`^\\s*${escapeRegExp(role)} ·`) }) });
  }

  async panelFor(company: string, role: string): Promise<Locator> {
    const panelId = await this.tab(company, role).getAttribute('aria-controls');
    if (!panelId) throw new Error(`Tab for ${company} / ${role} has no aria-controls`);
    return this.page.locator(`[id="${panelId}"]`);
  }
}
