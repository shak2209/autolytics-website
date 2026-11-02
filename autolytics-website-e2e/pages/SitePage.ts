import type { Locator, Page } from '@playwright/test';
import { escapeRegExp } from '../support/utils';

/** Friendly page names used in the Gherkin steps, mapped to their files. */
export const SITE_PAGES = {
  Home: 'index.html',
  'About Me': 'about.html',
  Services: 'services.html',
  Experience: 'experience.html',
} as const;

export type SitePageName = keyof typeof SITE_PAGES;

/** Elements shared by every page of the site: header, navigation, content and footer. */
export class SitePage {
  readonly header: Locator;
  readonly headerNav: Locator;
  readonly logo: Locator;
  readonly menuButton: Locator;
  readonly mainHeading: Locator;
  readonly contactSection: Locator;
  readonly footer: Locator;

  constructor(readonly page: Page) {
    this.header = page.locator('header.site-header');
    this.headerNav = page.locator('#site-nav');
    this.logo = this.header.locator('a.brand');
    this.menuButton = this.header.getByRole('button', { name: 'Menu' });
    this.mainHeading = page.getByRole('heading', { level: 1 });
    this.contactSection = page.locator('#contact');
    this.footer = page.locator('footer.site-footer');
  }

  static fileFor(name: string): string {
    const file = SITE_PAGES[name as SitePageName];
    if (!file) throw new Error(`Unknown page "${name}". Known pages: ${Object.keys(SITE_PAGES).join(', ')}`);
    return file;
  }

  /** URL pattern for a page; the home page may also be served at the site root. */
  static urlPatternFor(name: string): RegExp {
    const file = escapeRegExp(SitePage.fileFor(name));
    const path = name === 'Home' ? `(?:${file})?` : file;
    return new RegExp(`/${path}(?:[?#].*)?$`);
  }

  async open(name: string): Promise<void> {
    await this.page.goto(SitePage.fileFor(name));
  }

  async openPath(path: string): Promise<void> {
    await this.page.goto(path.replace(/^\//, ''));
  }

  navLink(name: string): Locator {
    return this.headerNav.getByRole('link', { name, exact: true });
  }

  serviceCard(title: string): Locator {
    return this.page.locator('article.card').filter({
      has: this.page.getByRole('heading', { name: title, exact: true }),
    });
  }

  heading(text: string): Locator {
    return this.page.getByRole('heading', { name: text, exact: true });
  }

  /** The first <ul> that follows a heading, e.g. the Certifications list. */
  listUnderHeading(text: string): Locator {
    return this.heading(text).locator('xpath=following-sibling::ul[1]');
  }

  /** The tag "pills" (ul.tags) that follow a heading. */
  tagsUnderHeading(text: string): Locator {
    return this.heading(text).locator('xpath=following-sibling::ul[contains(@class, "tags")][1]').locator('li');
  }
}
