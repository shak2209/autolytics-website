# autolytics-website-e2e

End-to-end tests for the Autolytics IT Consultancy website, written in Gherkin and run with
Playwright + TypeScript ([playwright-bdd](https://vitalets.github.io/playwright-bdd/)) on
**Chrome, Firefox and Edge**.

## How it fits together

```
test-data/autolytics-website-test-cases.csv   <- source of truth: one row per scenario
        │  npm run generate (scripts/generate-features.ts)
        ▼
features/*.feature                             <- generated Gherkin, one file per "Feature File" value
        │  bddgen
        ▼
.features-gen/                                 <- generated Playwright specs (not committed)
        │  playwright test
        ▼
steps/*.steps.ts  +  pages/*.ts                <- step definitions and page objects
```

Edit test cases in the CSV, not in `features/`; the feature files are overwritten on every run.

### CSV columns

| Column | Purpose |
| --- | --- |
| Test ID | Unique ID, e.g. `TC-NAV-001`. Becomes the scenario name prefix and a tag (`@TC-NAV-001`). |
| Feature / Feature File | Feature name and the `.feature` file it is written to. |
| Scenario | Scenario title. |
| Tags | Space-separated tags, e.g. `@smoke @regression`. `@fixme` skips a scenario (known gap). |
| Priority, Test Type, Page | Shown as a comment in the feature file. Priority is also a tag (`@priority-high`). |
| Automation Status | `Automated` or `Manual`. Manual scenarios are written to the feature file but not run. |
| Gherkin Steps | The Given/When/Then steps, one per line. Data table rows start with `|`. |
| Examples | For Scenario Outlines: the Examples table, header row first. Leave empty otherwise. |

The generator checks for duplicate IDs, empty required columns, and `<placeholders>` without Examples.
Any new step wording needs a matching step definition in `steps/`; `bddgen` reports missing ones.

## Setup (once)

```powershell
npm install
npm run install:browsers   # Playwright's Firefox; Chrome and Edge use the installed browsers
```

### Admin passwords (for the sign-in tests)

The demo admin area (`../admin`) is tested with two accounts. Their passwords are **not** in the repository:
only salted hashes are (`../admin/users.js`).

- **Locally:** copy `.env.example` to `.env` and fill in the passwords. `.env` is git-ignored.
- **In GitHub Actions:** the secrets `E2E_EDITOR_USER`, `E2E_EDITOR_PASSWORD`, `E2E_VIEWER_USER` and
  `E2E_VIEWER_PASSWORD` (Settings, Secrets and variables, Actions).
- **If they are missing**, the few scenarios that type a real password are *skipped*, not failed. Everything else
  (including all editing scenarios, which start from a ready-made session) still runs.

To use the admin area by hand, run `npx tsx scripts/static-server.ts` and open http://127.0.0.1:4173/admin/index.html.

If a hash ever needs to be regenerated for a new password, hash it with PBKDF2-SHA-256, 150,000 iterations, using the
salt bytes decoded from the hex string in `users.js`.

## Running

```powershell
npm test                 # all browsers
npm run test:chrome      # or test:firefox / test:edge
npm run test:smoke       # the quick @smoke set (6 scenarios) on all browsers, about 20 seconds
npm run test:headed      # watch it run
npx playwright test --grep "@TC-EXP-002"            # a single test case
npx playwright test --grep "@experience-tabs"       # a whole feature
npm run report           # open the Playwright HTML report
npm run test:report      # run everything, then build the readable report (see below)
npm run report:build     # rebuild the readable report from the last run's results
```

### Readable test report

The report lists every scenario with its Gherkin steps, the example data, and the pass/fail result in each browser,
plus totals by browser and by area. There are two ways to see it.

**1. Online (no setup).** Every push to GitHub runs the tests and publishes the report at
https://shak2209.github.io/autolytics-website/test-report/

**2. On your own computer.** The report files are generated, so they do not exist until you run the tests
(they are not stored in the repository, which is why `reports/TEST-REPORT.html` does not open on GitHub).

```powershell
cd autolytics-website-e2e
npm install
npm run install:browsers
npm run test:report
```

Then open `autolytics-website-e2e\reports\TEST-REPORT.html` by double-clicking it in File Explorer. It opens in your
browser. `reports\TEST-REPORT.md` has the same content in Markdown, and `reports\test-execution-results.csv` has one
row per executed test, for Excel.

If you have already run the tests and only want to rebuild the report, run `npm run report:build`.

By default the website files in the parent folder are served at `http://127.0.0.1:4173/`.
To test a deployed site instead: `$env:BASE_URL = 'https://your-domain/'; npm test`.

Reports are written to `reports/`: Playwright HTML (`playwright-html/`), Cucumber HTML
(`cucumber-report.html`) and JUnit XML (`junit.xml`) for CI. Traces, screenshots and videos are
kept for failed tests.
