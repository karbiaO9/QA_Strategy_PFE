import fs from 'fs';
import path from 'path';
import {
  getStcSpec,
  loadStcSpecCatalog,
  resolveStcSpecPath,
} from '../utils/stc-spec-catalog';
import { validateStcMarkdownFile } from '../utils/reporters/stc-report-builder';

const REPORTS_DIR = path.join(__dirname, '../reports/markdown');

function main(): void {
  loadStcSpecCatalog(resolveStcSpecPath());

  if (!fs.existsSync(REPORTS_DIR)) {
    console.error(`No reports directory: ${REPORTS_DIR}`);
    console.error('Run Playwright tests first.');
    process.exit(1);
  }

  const files = fs
    .readdirSync(REPORTS_DIR)
    .filter((f) => f.startsWith('STC-') && f.endsWith('.md'));

  if (files.length === 0) {
    console.error('No STC markdown reports found.');
    process.exit(1);
  }

  const issues: string[] = [];

  for (const file of files) {
    const filePath = path.join(REPORTS_DIR, file);
    const stcId = file.replace(/\.md$/, '').replace(/-([FB])$/, '/$1');
    const content = fs.readFileSync(filePath, 'utf8');

    // Skip legacy reports generated before spec-prefill reporter
    if (!content.includes('Verified by Playwright automated integration test.')) {
      console.warn(`Skipping legacy report (re-run tests to refresh): ${file}`);
      continue;
    }

    const spec = getStcSpec(stcId);
    const fileIssues = validateStcMarkdownFile(filePath, spec);
    for (const issue of fileIssues) {
      issues.push(`${file}: ${issue.message}`);
    }
  }

  console.log(`Validated ${files.length} report(s) in ${REPORTS_DIR}`);

  if (issues.length > 0) {
    console.error(`${issues.length} issue(s):`);
    for (const msg of issues) {
      console.error(`  - ${msg}`);
    }
    process.exit(1);
  }

  console.log('All STC markdown reports passed validation.');
}

main();
