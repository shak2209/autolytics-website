# Autolytics IT Consultancy website

Owner: Shakeel Malik (Test Manager, founder). Static marketing site for Autolytics IT Consultancy Ltd. UK English (`lang="en-GB"`).

## Site (root folder)
- Plain HTML/CSS/JS, no build step, no framework. Pages: `index.html`, `about.html`, `services.html`, `experience.html`.
- `css/styles.css`: one stylesheet; colours are CSS variables in `:root`. Mobile breakpoint is `max-width: 820px`.
- `js/main.js`: mobile menu toggle (matchMedia `change` listener), Experience tabs (click, arrow keys with wrap-around, `#slug` deep links, roving tabindex), footer year.
- Header/nav and footer are copy-pasted into every page; change all four pages together.
- Not hosted yet: no live URL or domain.
- Git: public repo https://github.com/shak2209/autolytics-website (branch `main`, remote `origin`). Commits use the GitHub no-reply email, never the real one. Only commit/push when asked.

## Test framework (`autolytics-website-e2e/`)
Playwright + TypeScript + playwright-bdd. Runs on Chrome (`channel: chrome`), Firefox (Playwright build) and Edge (`channel: msedge`).
- **Source of truth: `test-data/autolytics-website-test-cases.csv`**, one row per scenario. Columns: Test ID, Feature, Feature File, Scenario, Tags, Priority, Test Type, Page, Automation Status, Gherkin Steps, Examples.
- `npm run generate` rebuilds `features/*.feature` from the CSV, then runs `bddgen`. **Never edit `features/` by hand.**
- Steps are in `steps/*.steps.ts`, page objects in `pages/` (`SitePage`, `ExperiencePage`), fixtures in `support/fixtures.ts`. `support/fixtures.ts` also has the auto `pageProblems` fixture, which collects JS errors and HTTP 4xx/5xx responses.
- New step wording needs a step definition. `bddgen` fails if one is missing.
- Test IDs: `TC-<AREA>-nnn`, where AREA is NAV, HOME, ABOUT, SERV, EXP, MOB, FOOT or A11Y. Each ID is also a tag.
- Tags: `@smoke`, `@regression`, `@fixme` (skipped known gap), `Manual` status becomes `@manual` (not run).
- Serves the parent folder on http://127.0.0.1:4173 via `scripts/static-server.ts`. Set `BASE_URL` to test a deployed site instead.
- Reports go to `reports/`: Playwright HTML, Cucumber HTML and JUnit XML.

### Running (prefer targeted runs to save time)
- One test: `npx playwright test --grep "@TC-EXP-002" --project=chrome`
- One feature: `--grep "@experience-tabs"`. Everything: `npm test`. Typecheck: `npm run typecheck`.
- Don't use `--reporter=line` for full runs; the output is huge. Use `--reporter=json` with `PLAYWRIGHT_JSON_OUTPUT_NAME` and print only the stats and the failures.

## Decisions already made (don't re-ask)
- CSV is the master copy; feature files are generated from it.
- Accessibility standard: WCAG 2.1 AA via axe, failing only on serious/critical issues.
- Video is recorded on first retry only, with 1 local retry. Recording every test made Firefox time out under parallel load.
- `--accent-dark` is `#0f766e`. The old `#0d9488` failed colour contrast.
- Content assertions (stats, certifications, tag counts) mirror the current site text. When page content changes, update the CSV rows to match.

## Open items
- Contact email is missing from `index.html#contact`. TC-HOME-007 is `@fixme` until the user gives the address. Don't guess one.
- Hosting/domain is undecided. When deploying, exclude `autolytics-website-e2e/`.
- No CI pipeline yet; the platform is not chosen.
- No favicon. The tests ignore the favicon 404.
- Last full run (2026-10-30): 320 passed, 3 skipped (TC-HOME-007), 0 failed.

## Working style
- Be concise. Don't re-read files or re-explore the site when this file answers the question.
- After site changes, run only the affected feature tests, then update "Open items" and "Last full run" above if they changed.
