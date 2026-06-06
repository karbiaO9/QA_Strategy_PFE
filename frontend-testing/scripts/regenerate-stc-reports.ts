/**
 * Regenerate STC markdown reports from the spec catalog + existing report execution data.
 * Does not run Playwright tests.
 *
 * Usage:
 *   npm run report:stc
 *   npm run report:stc -- STC-AUTH-001/F
 */
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import {
  clearStcSpecCache,
  getStcSpec,
  listStcIds,
  loadStcSpecCatalog,
  resolveStcSpecPath,
} from '../utils/stc-spec-catalog';
import {
  validateStcMarkdownFile,
  writeStcMarkdownReport,
} from '../utils/reporters/stc-report-builder';
import type { StcReportPayload } from '../utils/types';

dotenv.config({ path: path.join(__dirname, '../.env') });

const REPORTS_DIR = path.join(__dirname, '../reports/markdown');

function stcIdToFileName(stcId: string): string {
  return `${stcId.replace(/\//g, '-')}.md`;
}

/**
 * Strip any markdown table rows/separators (and resulting blank runs) that a
 * legacy report leaked into the Execution Notes capture, leaving only the
 * real plain-text run notes.
 */
function cleanExecutionNotes(raw?: string): string | undefined {
  if (!raw) {
    return undefined;
  }
  const cleaned = raw
    .split('\n')
    .filter((line) => !/^\s*\|/.test(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return cleaned.length > 0 ? cleaned : undefined;
}

function parseExistingReport(filePath: string): Partial<StcReportPayload> | undefined {
  if (!fs.existsSync(filePath)) {
    return undefined;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  // Supports both the legacy block layout ("**Overall Result**\n\nPASSED",
  // notes ending at the Evidence Reference row) and the revised Section 07
  // layout ("|**Overall Result** | PASSED |", "**Execution Notes** :" ending
  // at the section rule) so prior run results survive regeneration.
  const overallMatch = content.match(/\*\*Overall Result\*\*\s*(?:\|\s*|\n\n)([A-Z]+)/);
  const notesMatch = content.match(
    /\*\*Execution Notes\*\*\s*:?\s*\n+([\s\S]*?)(?=\n\| \*\*Evidence Reference\*\*|\n---|\n## )/
  );
  const durationMatch = content.match(/Duration (\d+)ms/);
  const executedMatch = content.match(/Playwright [^\d]*(\d{4}-\d{2}-\d{2}T[\d:.]+Z)/);
  const projectMatch = content.match(/Project ([^\s*]+)/);
  const errorMatch = content.match(/^Error: (.+)$/m);

  const overall = overallMatch?.[1]?.trim();
  const validOverall =
    overall === 'PASSED' || overall === 'FAILED' || overall === 'BLOCKED' ? overall : undefined;

  if (!validOverall) {
    return undefined;
  }

  return {
    overallResult: validOverall,
    executionNotes:
      cleanExecutionNotes(notesMatch?.[1]) ?? 'Regenerated from prior report execution snapshot.',
    durationMs: durationMatch ? Number(durationMatch[1]) : 0,
    executedAt: executedMatch?.[1] ?? new Date().toISOString(),
    playwrightProject: projectMatch?.[1],
    errorMessage: errorMatch?.[1],
  };
}

function buildPayloadFromSpec(
  spec: NonNullable<ReturnType<typeof getStcSpec>>,
  prior?: Partial<StcReportPayload>
): StcReportPayload {
  return {
    stcId: spec.stcId,
    title: spec.title,
    module: spec.module,
    endpoint: spec.endpoint,
    testType: spec.testType,
    priority: spec.priority,
    overallResult: prior?.overallResult ?? 'Not Executed',
    executionNotes:
      prior?.executionNotes ??
      'Regenerated from STC spec catalog only (no prior execution data found).',
    steps: [],
    executedAt: prior?.executedAt ?? new Date().toISOString(),
    durationMs: prior?.durationMs ?? 0,
    project: process.env.PROJECT_NAME,
    testerName: process.env.TESTER_NAME,
    playwrightProject: prior?.playwrightProject,
    errorMessage: prior?.errorMessage,
    userStory: spec.title,
    testObjective: spec.expectedResult,
    automationScriptRef: 'frontend-testing/tests/auth/*.spec.ts',
    evidenceReference: prior?.evidenceReference,
    attachmentReference: prior?.attachmentReference,
  };
}

function main(): void {
  clearStcSpecCache();
  const catalog = loadStcSpecCatalog();
  const filterId = process.argv[2]?.trim();
  const ids = filterId ? [filterId] : listStcIds(catalog);

  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  console.log(`Spec: ${resolveStcSpecPath()}`);
  console.log(`Output: ${REPORTS_DIR}`);

  let regenerated = 0;
  let withPriorRun = 0;
  const issues: string[] = [];

  for (const stcId of ids) {
    const spec = getStcSpec(stcId, catalog);
    if (!spec) {
      issues.push(`${stcId}: not found in spec catalog`);
      continue;
    }

    const filePath = path.join(REPORTS_DIR, stcIdToFileName(stcId));
    const prior = parseExistingReport(filePath);
    if (prior?.overallResult && prior.overallResult !== 'Not Executed') {
      withPriorRun++;
    }

    const payload = buildPayloadFromSpec(spec, prior);
    writeStcMarkdownReport(REPORTS_DIR, payload, spec);

    issues.push(
      ...validateStcMarkdownFile(filePath, spec).map((i) => `${stcId}: ${i.message}`)
    );
    regenerated++;
    console.log(
      `  ${stcId} -> ${path.basename(filePath)} (${prior?.overallResult ?? 'Not Executed'})`
    );
  }

  console.log(`\nRegenerated ${regenerated} report(s). ${withPriorRun} reused prior run results.`);
  if (issues.length > 0) {
    console.warn(`Validation issues (${issues.length}):`);
    for (const msg of issues) {
      console.warn(`  - ${msg}`);
    }
    process.exit(1);
  }
  console.log('All reports passed validation.');
}

main();
