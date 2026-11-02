# Autolytics IT Consultancy: website and test automation

The company website for Autolytics IT Consultancy Ltd, plus the automated test suite that checks it.
The two parts show the same thing: a small product built carefully, and the testing around it.

## What's in this repository

| Folder | What it is |
| --- | --- |
| [`/`](.) | The website: static HTML, CSS and JavaScript with no build step |
| [`autolytics-website-e2e/`](autolytics-website-e2e) | End-to-end test framework: Gherkin scenarios, Playwright and TypeScript |

### The website

Four pages (`index.html`, `about.html`, `services.html`, `experience.html`), responsive, with a mobile
menu and an Experience page that has one keyboard-accessible tab per role, each linkable directly,
e.g. `experience.html#evri`.

To view it, open `index.html` in a browser.

### The test framework

- **39 Gherkin scenarios** (324 test runs) kept in a CSV, which is the single source of truth.
  A generator turns the CSV into `.feature` files, which run through Playwright.
- **Three browsers:** Chrome, Firefox and Edge.
- **Coverage:** navigation and broken links, page content, tab behaviour (mouse, keyboard, direct links),
  the mobile menu, the footer, JavaScript errors, and WCAG 2.1 AA accessibility scans with axe.
- **Page Object Model**, reusable step definitions, and Playwright HTML, Cucumber HTML and JUnit reports.
- Found and fixed two real defects in the site: insufficient colour contrast and a mobile menu
  that stayed open when the window was narrowed.

Setup and run instructions are in [`autolytics-website-e2e/README.md`](autolytics-website-e2e/README.md).

## Quick start

```powershell
cd autolytics-website-e2e
npm install
npm run install:browsers
npm test
```
