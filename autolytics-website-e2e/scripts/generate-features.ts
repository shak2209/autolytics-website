// Generates Gherkin .feature files from the test case CSV.
//
// The CSV is the single source of truth: edit test-data/autolytics-website-test-cases.csv
// (in Excel or any editor), then run `npm run generate` (also run automatically by `npm test`).
//
// One .feature file is written per value of the "Feature File" column. Each scenario is named
// "<Test ID>: <Scenario>" and tagged with its Test ID, its feature file name and the CSV tags.
import { parse } from 'csv-parse/sync';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const csvPath = path.resolve(process.argv[2] ?? 'test-data/autolytics-website-test-cases.csv');
const featuresDir = path.resolve('features');

const COLUMNS = {
  id: 'Test ID',
  feature: 'Feature',
  file: 'Feature File',
  scenario: 'Scenario',
  tags: 'Tags',
  priority: 'Priority',
  type: 'Test Type',
  page: 'Page',
  status: 'Automation Status',
  steps: 'Gherkin Steps',
  examples: 'Examples',
} as const;

type Row = Record<(typeof COLUMNS)[keyof typeof COLUMNS], string>;

const rows: Row[] = parse(readFileSync(csvPath), { bom: true, columns: true, skip_empty_lines: true, trim: false });

const errors: string[] = [];
const required = [COLUMNS.id, COLUMNS.feature, COLUMNS.file, COLUMNS.scenario, COLUMNS.steps];
const missingColumns = required.filter((c) => rows.length && !(c in rows[0]));
if (missingColumns.length) fail([`CSV is missing column(s): ${missingColumns.join(', ')}`]);

const seenIds = new Set<string>();
const byFile = new Map<string, { feature: string; rows: Row[] }>();

rows.forEach((row, i) => {
  const line = `CSV row ${i + 2}`;
  const id = row[COLUMNS.id]?.trim();
  if (!id) return; // allow blank spacer rows
  for (const c of required) if (!row[c]?.trim()) errors.push(`${line} (${id}): "${c}" is empty`);
  if (!/^[A-Za-z0-9_-]+$/.test(id)) errors.push(`${line}: Test ID "${id}" may only contain letters, numbers, - and _`);
  if (seenIds.has(id)) errors.push(`${line}: duplicate Test ID "${id}"`);
  seenIds.add(id);

  const file = toFileName(row[COLUMNS.file] || row[COLUMNS.feature]);
  const usesPlaceholders = /<[^>]+>/.test(row[COLUMNS.steps] ?? '');
  const hasExamples = !!row[COLUMNS.examples]?.trim();
  if (usesPlaceholders && !hasExamples) errors.push(`${line} (${id}): steps use <placeholders> but "Examples" is empty`);
  if (!usesPlaceholders && hasExamples) errors.push(`${line} (${id}): "Examples" is filled in but no step uses a <placeholder>`);

  const group = byFile.get(file) ?? { feature: row[COLUMNS.feature].trim(), rows: [] };
  if (group.feature !== row[COLUMNS.feature].trim()) {
    errors.push(`${line} (${id}): feature file "${file}" is used by two features ("${group.feature}" and "${row[COLUMNS.feature].trim()}")`);
  }
  group.rows.push(row);
  byFile.set(file, group);
});

if (errors.length) fail(errors);

// Replace previously generated feature files.
mkdirSync(featuresDir, { recursive: true });
for (const f of readdirSync(featuresDir)) if (f.endsWith('.feature')) rmSync(path.join(featuresDir, f));

for (const [file, { feature, rows: featureRows }] of byFile) {
  const featureTag = `@${path.basename(file, '.feature')}`;
  const out: string[] = [
    `# Generated from ${path.basename(csvPath)} by scripts/generate-features.ts. Do not edit; edit the CSV instead.`,
    featureTag,
    `Feature: ${feature}`,
    '',
  ];

  for (const row of featureRows) {
    const id = row[COLUMNS.id].trim();
    const tags = [`@${id}`, ...splitTags(row[COLUMNS.tags])];
    if (row[COLUMNS.status]?.trim().toLowerCase() === 'manual') tags.push('@manual');
    const priority = row[COLUMNS.priority]?.trim();
    if (priority) tags.push(`@priority-${priority.toLowerCase()}`);

    const meta = [
      priority && `Priority: ${priority}`,
      row[COLUMNS.type]?.trim() && `Type: ${row[COLUMNS.type].trim()}`,
      row[COLUMNS.page]?.trim() && `Page: ${row[COLUMNS.page].trim()}`,
    ].filter(Boolean);

    const hasExamples = !!row[COLUMNS.examples]?.trim();
    out.push(`  ${unique(tags).join(' ')}`);
    out.push(`  Scenario${hasExamples ? ' Outline' : ''}: ${id}: ${row[COLUMNS.scenario].trim()}`);
    if (meta.length) out.push(`    # ${meta.join(' | ')}`);
    for (const step of lines(row[COLUMNS.steps])) out.push(step.startsWith('|') ? `      ${step}` : `    ${step}`);
    if (hasExamples) {
      out.push('', '    Examples:');
      for (const ex of lines(row[COLUMNS.examples])) out.push(`      ${ex}`);
    }
    out.push('');
  }

  writeFileSync(path.join(featuresDir, file), out.join('\n'), 'utf8');
  console.log(`  ${file}  (${featureRows.length} scenarios)`);
}
console.log(`Generated ${byFile.size} feature files from ${seenIds.size} test cases in ${path.relative(process.cwd(), csvPath)}`);

function toFileName(value: string): string {
  const base = value.trim().replace(/\.feature$/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${base}.feature`;
}

function splitTags(value = ''): string[] {
  return value.split(/[\s,]+/).filter(Boolean).map((t) => (t.startsWith('@') ? t : `@${t}`));
}

function lines(value = ''): string[] {
  return value.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function fail(messages: string[]): never {
  console.error(`Cannot generate feature files from ${csvPath}:\n  - ${messages.join('\n  - ')}`);
  process.exit(1);
}
