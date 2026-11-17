import type { Locator, Page } from '@playwright/test';

/** Where each admin page lives and what its main heading is. */
export const ADMIN_PAGES = {
  'Sign in': { path: 'admin/index.html', url: /\/admin\/(?:index\.html)?(?:[?#].*)?$/, heading: 'Staff sign in' },
  'Manage services': { path: 'admin/services.html', url: /\/admin\/services\.html(?:[?#].*)?$/, heading: 'Manage services' },
} as const;

export type AdminPageName = keyof typeof ADMIN_PAGES;

/** Sign-in page and Manage services page of the demo admin area. */
export class AdminPage {
  // Sign-in page
  readonly username: Locator;
  readonly password: Locator;
  readonly loginError: Locator;
  readonly loginNotice: Locator;

  // Manage services page
  readonly sessionInfo: Locator;
  readonly status: Locator;
  readonly form: Locator;
  readonly confirmPanel: Locator;
  readonly serviceTitles: Locator;
  readonly serviceRows: Locator;

  constructor(readonly page: Page) {
    this.username = page.getByLabel('Username');
    this.password = page.getByLabel('Password', { exact: true });
    this.loginError = page.locator('#login-error');
    this.loginNotice = page.locator('#login-notice');

    this.sessionInfo = page.locator('#session-info');
    this.status = page.locator('#status');
    this.form = page.locator('#service-form');
    this.confirmPanel = page.getByRole('region', { name: 'Confirm action' });
    this.serviceTitles = page.locator('#services-table tbody th');
    this.serviceRows = page.locator('#services-table tbody tr');
  }

  static expectedPath(name: string) {
    const entry = ADMIN_PAGES[name as AdminPageName];
    if (!entry) throw new Error(`Unknown admin page "${name}". Known: ${Object.keys(ADMIN_PAGES).join(', ')}`);
    return entry;
  }

  async open(name: string): Promise<void> {
    await this.page.goto(AdminPage.expectedPath(name).path);
  }

  /** The form fields, found by their visible labels. */
  field(name: string): Locator {
    switch (name.toLowerCase()) {
      case 'title': return this.page.getByLabel('Title', { exact: true });
      case 'summary': return this.page.getByLabel('Summary', { exact: true });
      case 'items': return this.page.getByLabel("What's included", { exact: false });
      default: throw new Error(`Unknown form field "${name}". Use Title, Summary or Items.`);
    }
  }

  fieldError(name: string): Locator {
    return this.page.locator(`#svc-${name.toLowerCase()}-error`);
  }

  serviceRow(title: string): Locator {
    return this.serviceRows.filter({ has: this.page.getByRole('rowheader', { name: title, exact: true }) });
  }

  /**
   * Fast way to be signed in for tests that are not about signing in: it writes the same session record the
   * sign-in page creates. The sign-in screen itself is covered by the TC-AUTH scenarios.
   */
  async startSession(role: 'editor' | 'viewer'): Promise<void> {
    await this.open('Sign in');
    await this.page.evaluate((r) => {
      const session = { username: `test-${r}`, role: r, expires: Date.now() + 15 * 60 * 1000 };
      localStorage.setItem('autolytics.session', JSON.stringify(session));
    }, role);
    await this.open('Manage services');
  }
}
