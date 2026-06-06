import type {
  FullConfig,
  FullResult,
  Reporter,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';
import { copyFailureScreenshot, ensureEvidenceDirs } from '../evidence';
import { getStcMetadataFromCase } from '../test-annotations';
import { getStcSpec, loadStcSpecCatalog, resolveStcSpecPath } from '../stc-spec-catalog';
import { enrichSTCReportContext } from '../stc-execution-context';
import type { StcReportPayload } from '../types';
import {
  validateStcMarkdownFile,
  writeStcMarkdownReport,
  type StcReportValidationIssue,
} from './stc-report-builder';

const OUTPUT_DIR = path.join(__dirname, '../../reports/markdown');

class StcMarkdownReporter implements Reporter {
  private readonly writtenReports = new Map<string, string>();
  private catalogLoaded = false;

  onBegin(_config: FullConfig): void {
    ensureEvidenceDirs();
    const specPath = resolveStcSpecPath();
    try {
      const catalog = loadStcSpecCatalog(specPath);
      this.catalogLoaded = true;
      console.log(`[stc-reporter] Loaded ${catalog.size} STC definitions from ${specPath}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[stc-reporter] WARN: ${message}`);
      console.warn('[stc-reporter] Reports will be generated without spec prefill.');
    }
  }

  async onTestEnd(test: TestCase, result: TestResult): Promise<void> {
    const meta = getStcMetadataFromCase(test);
    if (meta.stcId === 'STC-UNKNOWN') {
      return;
    }

    const spec = this.catalogLoaded ? getStcSpec(meta.stcId) : undefined;
    if (!spec) {
      console.warn(`[stc-reporter] No spec entry for ${meta.stcId} � check STC_SPEC_PATH.`);
    }

    const overallResult = this.resolveOverallResult(result.status);
    const screenshot =
      result.status !== 'passed' ? await copyFailureScreenshot(result, meta.stcId) : undefined;

    const relativeSpec = path.relative(
      path.join(__dirname, '../..'),
      test.location.file
    );

    const payload: StcReportPayload = {
      stcId: meta.stcId,
      title: spec?.title ?? this.cleanTitle(test.title),
      module: spec?.module ?? meta.module ?? 'Authentication',
      endpoint: spec?.endpoint ?? meta.endpoint,
      testType: spec?.testType ?? meta.testType ?? 'Frontend integration',
      priority: spec?.priority ?? meta.priority ?? 'P1',
      overallResult,
      executionNotes: this.buildExecutionNotes(test, result, spec?.endpoint),
      steps: [],
      evidenceReference: screenshot,
      attachmentReference: screenshot
        ? path.relative(path.join(__dirname, '../..'), screenshot)
        : undefined,
      executedAt: new Date(result.startTime).toISOString(),
      durationMs: result.duration,
      project: process.env.PROJECT_NAME,
      testerName: process.env.TESTER_NAME,
      playwrightProject: test.parent.project()?.name,
      errorMessage: result.error?.message,
      userStory: spec?.title,
      testObjective: spec?.expectedResult,
      automationScriptRef: `frontend-testing/${relativeSpec.replace(/\\/g, '/')}`,
    };

    const filePath = writeStcMarkdownReport(OUTPUT_DIR, payload, spec);

    // Non-invasive enrichment: append execution-context metadata only.
    try {
      const generated = fs.readFileSync(filePath, 'utf8');
      const enriched = enrichSTCReportContext(generated, {
        test,
        result,
        specPath: resolveStcSpecPath(),
        evidencePaths: payload.attachmentReference ? [payload.attachmentReference] : [],
      });
      fs.writeFileSync(filePath, enriched, 'utf8');
    } catch (err) {
      // Enrichment is best-effort and must never fail the run.
      console.warn(
        `[stc-reporter] context enrichment skipped: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }

    this.writtenReports.set(meta.stcId, filePath);
    console.log(`[stc-reporter] ${meta.stcId} -> ${filePath}`);
  }

  onEnd(_result: FullResult): void {
    const issues = this.validateWrittenReports();
    console.log(`[stc-reporter] Markdown reports: ${OUTPUT_DIR} (${this.writtenReports.size} file(s))`);

    if (issues.length > 0) {
      console.warn(`[stc-reporter] Validation: ${issues.length} issue(s):`);
      for (const issue of issues) {
        console.warn(`  - ${issue.stcId}: ${issue.message}`);
      }
    } else if (this.writtenReports.size > 0) {
      console.log('[stc-reporter] Validation: all reports passed structural checks.');
    }
  }

  private validateWrittenReports(): StcReportValidationIssue[] {
    const issues: StcReportValidationIssue[] = [];

    for (const [stcId, filePath] of this.writtenReports) {
      if (!fs.existsSync(filePath)) {
        issues.push({ stcId, filePath, message: 'Report file missing after write.' });
        continue;
      }
      const spec = this.catalogLoaded ? getStcSpec(stcId) : undefined;
      issues.push(...validateStcMarkdownFile(filePath, spec));
    }

    return issues;
  }

  private cleanTitle(title: string): string {
    return title.replace(/\s+@\w+/g, '').replace(/\s+/g, ' ').trim();
  }

  private resolveOverallResult(status: TestResult['status']): StcReportPayload['overallResult'] {
    if (status === 'passed') {
      return 'PASSED';
    }
    if (status === 'skipped') {
      return 'BLOCKED';
    }
    return 'FAILED';
  }

  private buildExecutionNotes(
    test: TestCase,
    result: TestResult,
    endpoint?: string
  ): string {
    const lines = [
      `Playwright status: ${result.status}`,
      `Project: ${test.parent.project()?.name ?? '-'}`,
      `Base URL: ${process.env.BASE_URL ?? '-'}`,
    ];

    if (endpoint) {
      lines.push(`API under test: ${endpoint}`);
    }

    if (result.error) {
      lines.push(`Error: ${result.error.message ?? 'Unknown'}`);
      if (result.error.stack) {
        lines.push(`Stack (first line): ${result.error.stack.split('\n')[1]?.trim() ?? ''}`);
      }
    }

    if (result.retry > 0) {
      lines.push(`Retries: ${result.retry}`);
    }

    lines.push(`Spec source: ${resolveStcSpecPath()}`);

    return lines.join('\n');
  }
}

export default StcMarkdownReporter;
