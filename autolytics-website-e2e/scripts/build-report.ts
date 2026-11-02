// Builds a human-readable test report from the Playwright JSON results and the test case CSV.
//
//   npm run report:build
//
// Reads  reports/results.json (written by `npm run test:report`) and the CSV.
// Writes reports/TEST-REPORT.md (renders on GitHub / VS Code) and reports/TEST-REPORT.html (open in any browser).
import { parse } from 'csv-parse/sync';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const resultsPath = path.resolve('reports/results.json');
const csvPath = path.resolve('test-data/autolytics-website-test-cases.csv');

type Status = 'pass' | 'fail' | 'flaky' | 'skip';
const STATUS_MAP: Record<string, Status> = { expected: 'pass', unexpected: 'fail', flaky: 'flaky', skipped: 'skip' };
const ICON: Record<Status, string> = { pass: '✅ Pass', fail: '❌ Fail', flaky: '⚠️ Flaky', skip: '⏭️ Skipped' };
const BROWSERS: Record<string, string> = { chrome: 'Chrome', firefox: 'Firefox', edge: 'Edge' };

interface Run { id: string; example: number; browser: string; status: Status; ms: number }
interface CaseRow {
  id: string; feature: string; file: string; scenario: string; tags: string; priority: string;
  type: string; page: string; steps: string; examples: string;
}

// ---------- Load ----------
const raw = JSON.parse(readFileSync(resultsPath, 'utf8'));
const csvRows: Record<string, string>[] = parse(readFileSync(csvPath), { bom: true, columns: true, skip_empty_lines: true });
const csv: CaseRow[] = csvRows.map(
  (r) => ({
    id: r['Test ID'], feature: r['Feature'], file: r['Feature File'], scenario: r['Scenario'], tags: r['Tags'],
    priority: r['Priority'], type: r['Test Type'], page: r['Page'], steps: r['Gherkin Steps'], examples: r['Examples'],
  }),
);

const runs: Run[] = [];
(function walk(suites: any[]) {
  for (const suite of suites) {
    for (const spec of suite.specs ?? []) {
      const id = (spec.tags as string[]).find((t) => /^TC-/.test(t));
      if (!id) continue;
      const example = Number(/^Example #(\d+)/.exec(spec.title)?.[1] ?? 0);
      for (const t of spec.tests) {
        const ms = t.results.reduce((sum: number, r: any) => sum + r.duration, 0);
        runs.push({ id, example, browser: t.projectName, status: STATUS_MAP[t.status] ?? 'fail', ms });
      }
    }
    walk(suite.suites ?? []);
  }
})(raw.suites);

const browsers = Object.keys(BROWSERS).filter((b) => runs.some((r) => r.browser === b));
const count = (rs: Run[], s: Status) => rs.filter((r) => r.status === s).length;
const worst = (rs: Run[]): Status =>
  (['fail', 'flaky', 'skip', 'pass'] as Status[]).find((s) => rs.some((r) => r.status === s)) ?? 'pass';

// ---------- Helpers ----------
const splitRow = (line: string) =>
  line.replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'));
const lines = (v: string) => v.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const mdCell = (v: string) => v.replace(/\|/g, '\\|');
const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : '-');
const secs = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

const total = runs.length;
const started = new Date(raw.stats.startTime);
const features = [...new Set(csv.map((c) => c.file))].map((file) => ({
  file, name: csv.find((c) => c.file === file)!.feature, cases: csv.filter((c) => c.file === file),
}));

// ---------- Markdown ----------
const md: string[] = [];
md.push('# Autolytics website: test report', '');
md.push(`Run on ${started.toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' })} against the local copy of the website.`, '');
md.push('## Summary', '');
md.push('| Measure | Result |', '| --- | --- |');
md.push(`| Test scenarios | ${csv.length} |`);
md.push(`| Test runs (scenario examples × browsers) | ${total} |`);
md.push(`| Passed | ${count(runs, 'pass')} (${pct(count(runs, 'pass'), total)}) |`);
md.push(`| Failed | ${count(runs, 'fail')} |`);
md.push(`| Flaky (failed, then passed on retry) | ${count(runs, 'flaky')} |`);
md.push(`| Skipped | ${count(runs, 'skip')} |`);
md.push(`| Browsers | ${browsers.map((b) => BROWSERS[b]).join(', ')} |`);
md.push(`| Total run time | ${secs(raw.stats.duration)} |`, '');

md.push('## Results by browser', '');
md.push('| Browser | Runs | Passed | Failed | Flaky | Skipped |', '| --- | ---: | ---: | ---: | ---: | ---: |');
for (const b of browsers) {
  const rs = runs.filter((r) => r.browser === b);
  md.push(`| ${BROWSERS[b]} | ${rs.length} | ${count(rs, 'pass')} | ${count(rs, 'fail')} | ${count(rs, 'flaky')} | ${count(rs, 'skip')} |`);
}
md.push('');

md.push('## Results by area tested', '');
md.push('| Area | Scenarios | Runs | Passed | Failed |', '| --- | ---: | ---: | ---: | ---: |');
for (const f of features) {
  const rs = runs.filter((r) => f.cases.some((c) => c.id === r.id));
  md.push(`| ${f.name} | ${f.cases.length} | ${rs.length} | ${count(rs, 'pass')} | ${count(rs, 'fail')} |`);
}
md.push('');

md.push('## What was tested', '', 'Every scenario is written in Gherkin (Given / When / Then). Where a scenario has an Examples table, it runs once per row, in every browser.', '');
for (const f of features) {
  md.push(`### ${f.name}`, '');
  for (const c of f.cases) {
    const rs = runs.filter((r) => r.id === c.id);
    md.push(`#### ${c.id}: ${c.scenario}`, '');
    md.push(`**Result:** ${ICON[worst(rs)]} · **Priority:** ${c.priority} · **Type:** ${c.type} · **Page:** ${c.page} · **Tags:** \`${c.tags}\``, '');
    md.push('```gherkin', ...lines(c.steps).map((s) => (s.startsWith('|') ? `    ${s}` : s)), '```', '');

    const header = browsers.map((b) => BROWSERS[b]);
    if (c.examples.trim()) {
      const exRows = lines(c.examples).map(splitRow);
      const [cols, ...data] = exRows;
      md.push(`| ${[...cols, ...header].map(mdCell).join(' | ')} |`, `| ${[...cols, ...header].map(() => '---').join(' | ')} |`);
      data.forEach((row, i) => {
        const results = browsers.map((b) => {
          const r = rs.find((x) => x.example === i + 1 && x.browser === b);
          return r ? ICON[r.status] : '-';
        });
        md.push(`| ${[...row, ...results].map(mdCell).join(' | ')} |`);
      });
    } else {
      md.push(`| ${header.join(' | ')} |`, `| ${header.map(() => '---').join(' | ')} |`);
      md.push(`| ${browsers.map((b) => { const r = rs.find((x) => x.browser === b); return r ? ICON[r.status] : '-'; }).join(' | ')} |`);
    }
    md.push('');
  }
}
writeFileSync('reports/TEST-REPORT.md', md.join('\n'), 'utf8');

// ---------- HTML ----------
const cls: Record<Status, string> = { pass: 'pass', fail: 'fail', flaky: 'flaky', skip: 'skip' };
const badge = (s: Status) => `<span class="badge ${cls[s]}">${ICON[s]}</span>`;
const h: string[] = [];
h.push(`<!DOCTYPE html><html lang="en-GB"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Autolytics website: test report</title><style>
body{font-family:"Segoe UI",system-ui,sans-serif;margin:0;color:#1f2937;background:#f5f8fb;line-height:1.5}
main{max-width:1100px;margin:0 auto;padding:24px 20px 64px}
h1{color:#0f2a44}h2{color:#0f2a44;margin-top:40px;border-bottom:2px solid #14b8a6;padding-bottom:4px}h3{color:#173a5e;margin-top:32px}
h4{margin:24px 0 6px;color:#0f2a44}table{border-collapse:collapse;width:100%;background:#fff;margin:8px 0 12px;font-size:.92rem}
th,td{border:1px solid #e3e8ef;padding:6px 10px;text-align:left;vertical-align:top}th{background:#eef3f8}td.n{text-align:right}
pre{background:#0f2a44;color:#e6f1ff;padding:12px 14px;border-radius:8px;overflow-x:auto;font-size:.88rem}
.meta{color:#5b6676;font-size:.9rem;margin:0 0 6px}.badge{padding:2px 8px;border-radius:999px;font-size:.82rem;white-space:nowrap}
.pass{background:#dcfce7;color:#166534}.fail{background:#fee2e2;color:#991b1b}.flaky{background:#fef3c7;color:#92400e}.skip{background:#e5e7eb;color:#374151}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}.card{background:#fff;border:1px solid #e3e8ef;border-radius:10px;padding:14px;text-align:center}
.card strong{display:block;font-size:1.9rem;color:#0f2a44}.card span{color:#5b6676;font-size:.9rem}
</style></head><body><main>`);
h.push(`<h1>Autolytics website: test report</h1><p class="meta">Run on ${esc(started.toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' }))} against the local copy of the website. Browsers: ${browsers.map((b) => BROWSERS[b]).join(', ')}.</p>`);
h.push(`<div class="cards">
<div class="card"><strong>${csv.length}</strong><span>Test scenarios</span></div>
<div class="card"><strong>${total}</strong><span>Test runs</span></div>
<div class="card"><strong>${count(runs, 'pass')}</strong><span>Passed (${pct(count(runs, 'pass'), total)})</span></div>
<div class="card"><strong>${count(runs, 'fail')}</strong><span>Failed</span></div>
<div class="card"><strong>${count(runs, 'flaky')}</strong><span>Flaky</span></div>
<div class="card"><strong>${count(runs, 'skip')}</strong><span>Skipped</span></div>
<div class="card"><strong>${secs(raw.stats.duration)}</strong><span>Run time</span></div></div>`);

h.push('<h2>Results by browser</h2><table><tr><th>Browser</th><th>Runs</th><th>Passed</th><th>Failed</th><th>Flaky</th><th>Skipped</th></tr>');
for (const b of browsers) {
  const rs = runs.filter((r) => r.browser === b);
  h.push(`<tr><td>${BROWSERS[b]}</td><td class="n">${rs.length}</td><td class="n">${count(rs, 'pass')}</td><td class="n">${count(rs, 'fail')}</td><td class="n">${count(rs, 'flaky')}</td><td class="n">${count(rs, 'skip')}</td></tr>`);
}
h.push('</table><h2>Results by area tested</h2><table><tr><th>Area</th><th>Scenarios</th><th>Runs</th><th>Passed</th><th>Failed</th></tr>');
for (const f of features) {
  const rs = runs.filter((r) => f.cases.some((c) => c.id === r.id));
  h.push(`<tr><td>${esc(f.name)}</td><td class="n">${f.cases.length}</td><td class="n">${rs.length}</td><td class="n">${count(rs, 'pass')}</td><td class="n">${count(rs, 'fail')}</td></tr>`);
}
h.push('</table><h2>What was tested</h2><p>Every scenario is written in Gherkin (Given / When / Then). Where a scenario has an Examples table, it runs once per row, in every browser.</p>');
for (const f of features) {
  h.push(`<h3>${esc(f.name)}</h3>`);
  for (const c of f.cases) {
    const rs = runs.filter((r) => r.id === c.id);
    h.push(`<h4>${esc(c.id)}: ${esc(c.scenario)} ${badge(worst(rs))}</h4>`);
    h.push(`<p class="meta">Priority: ${esc(c.priority)} · Type: ${esc(c.type)} · Page: ${esc(c.page)} · Tags: ${esc(c.tags)}</p>`);
    h.push(`<pre>${esc(lines(c.steps).map((s) => (s.startsWith('|') ? `    ${s}` : s)).join('\n'))}</pre>`);
    const head = browsers.map((b) => `<th>${BROWSERS[b]}</th>`).join('');
    if (c.examples.trim()) {
      const [cols, ...data] = lines(c.examples).map(splitRow);
      h.push(`<table><tr>${cols.map((x) => `<th>${esc(x)}</th>`).join('')}${head}</tr>`);
      data.forEach((row, i) => {
        const cells = browsers.map((b) => { const r = rs.find((x) => x.example === i + 1 && x.browser === b); return `<td>${r ? badge(r.status) : '-'}</td>`; });
        h.push(`<tr>${row.map((x) => `<td>${esc(x)}</td>`).join('')}${cells.join('')}</tr>`);
      });
    } else {
      h.push(`<table><tr>${head}</tr><tr>${browsers.map((b) => { const r = rs.find((x) => x.browser === b); return `<td>${r ? badge(r.status) : '-'}</td>`; }).join('')}</tr>`);
    }
    h.push('</table>');
  }
}
h.push('</main></body></html>');
writeFileSync('reports/TEST-REPORT.html', h.join('\n'), 'utf8');

console.log(`Report written: reports/TEST-REPORT.md and reports/TEST-REPORT.html (${csv.length} scenarios, ${total} runs)`);
