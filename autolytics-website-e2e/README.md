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

## Running

```powershell
npm test                 # all browsers
npm run test:chrome      # or test:firefox / test:edge
npm run test:smoke       # @smoke scenarios only
npm run test:headed      # watch it run
npx playwright test --grep "@TC-EXP-002"            # a single test case
npx playwright test --grep "@experience-tabs"       # a whole feature
npm run report           # open the Playwright HTML report
```

By default the website files in the parent folder are served at `http://127.0.0.1:4173/`.
To test a deployed site instead: `$env:BASE_URL = 'https://your-domain/'; npm test`.

Reports are written to `reports/`: Playwright HTML (`playwright-html/`), Cucumber HTML
(`cucumber-report.html`) and JUnit XML (`junit.xml`) for CI. Traces, screenshots and videos are
kept for failed tests.
