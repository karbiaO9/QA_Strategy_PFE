/**
 * stc-execution-context.ts
 * ---------------------------------------------------------------------------
 * Standalone, non-invasive STC report enrichment utility.
 *
 * PURPOSE
 *   Appends a single contextual metadata block to the END of an already
 *   generated STC markdown report. It improves audit readability, execution
 *   traceability, debugging, CI/CD diagnostics and environment
 *   reproducibility WITHOUT touching the V02R00 template, the report builder
 *   logic, or any existing section / wording.
 *
 * DESIGN RULES
 *   - Pure append: existing markdown is never parsed, rewritten or reordered.
 *   - Idempotent: re-running the reporter replaces the previously appended
 *     block (delimited by sentinel HTML comments) instead of stacking copies.
 *   - Defensive: every collector is wrapped so missing data degrades to a
 *     readable fallback ("N/A") and never throws into the Playwright run.
 *   - Zero new dependencies: only Node.js built-ins are used.
 * ---------------------------------------------------------------------------
 */

import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import { createRequire } from 'module';
import { randomUUID } from 'crypto';
import type { FullConfig, TestCase, TestResult } from '@playwright/test/reporter';

/** Marker comments used to keep the appended block idempotent across re-runs. */
const BLOCK_START = '<!-- stc:execution-context:start -->';
const BLOCK_END = '<!-- stc:execution-context:end -->';
const SECTION_HEADING = '## 09 - Execution Context Metadata';

/** Version of this enrichment reporter add-on (independent of the builder). */
export const STC_EXECUTION_CONTEXT_VERSION = '1.0.0';

/**
 * Section 09 (Execution Context Metadata) has been retired from the STC
 * reports. When false (the current behaviour) the enrichment becomes a pure
 * cleanup pass: any previously appended block is stripped and nothing is
 * re-added. Flip back to true to restore the appended metadata section.
 */
const APPEND_EXECUTION_CONTEXT = false;

/**
 * Context passed in by the Playwright reporter. Every field is optional so the
 * utility stays usable even with partial information.
 */
export interface StcEnrichmentContext {
  /** Playwright test case (provides spec file path & project name). */
  test?: TestCase;
  /** Playwright test result (provides timings, retry, worker, attachments). */
  result?: TestResult;
  /** Full Playwright config (used only as a base URL / project fallback). */
  config?: FullConfig;
  /** Absolute path of the STC source specification document. */
  specPath?: string;
  /** Version string of the calling reporter, surfaced for traceability. */
  reporterVersion?: string;
  /** Pre-generated run id; when omitted a UUID v4 is generated. */
  runId?: string;
  /** Extra evidence paths (screenshots / traces / videos) to record. */
  evidencePaths?: string[];
}

/** A single rendered "Field | Value" row of the metadata table. */
interface MetadataRow {
  field: string;
  value: string;
}

const NA = 'N/A';

/**
 * Run a collector and never let it break the Playwright reporter.
 * Empty / nullish results are normalised to a readable fallback.
 */
function safe(fn: () => string | undefined | null, fallback: string = NA): string {
  try {
    const out = fn();
    const trimmed = (out ?? '').toString().trim();
    return trimmed.length > 0 ? trimmed : fallback;
  } catch {
    return fallback;
  }
}

/** Escape a value so it cannot break out of a markdown table cell. */
function escapeCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

/** Resolve the installed Playwright version from its package manifest. */
function detectPlaywrightVersion(): string {
  const req = createRequire(__filename);
  try {
    return (req('@playwright/test/package.json') as { version: string }).version;
  } catch {
    // Fallback: core playwright package if @playwright/test is unresolved.
    return (req('playwright/package.json') as { version: string }).version;
  }
}

/** Run a git command relative to this file and return trimmed stdout. */
function git(args: string[]): string {
  return execFileSync('git', args, {
    cwd: __dirname,
    timeout: 4000,
    stdio: ['ignore', 'pipe', 'ignore'],
  })
    .toString()
    .trim();
}

/**
 * Detect a CI environment from the most common provider markers.
 * Returns the provider name when detected, otherwise "Local".
 */
function detectCiEnvironment(): string {
  const markers: Array<[string, string]> = [
    ['GITHUB_ACTIONS', 'GitHub Actions'],
    ['GITLAB_CI', 'GitLab CI'],
    ['JENKINS_URL', 'Jenkins'],
    ['CIRCLECI', 'CircleCI'],
    ['TF_BUILD', 'Azure Pipelines'],
    ['BUILDKITE', 'Buildkite'],
    ['TRAVIS', 'Travis CI'],
    ['TEAMCITY_VERSION', 'TeamCity'],
  ];
  for (const [envKey, label] of markers) {
    if (process.env[envKey]) {
      return label;
    }
  }
  // Treat an explicit falsey CI value ("false", "0", "no", "off", "") as Local.
  const ciRaw = (process.env.CI ?? '').trim().toLowerCase();
  const ciIsTruthy = ciRaw.length > 0 && !['false', '0', 'no', 'off'].includes(ciRaw);
  return ciIsTruthy ? 'Generic CI (CI=true)' : 'Local';
}

/**
 * Whitelisted, non-sensitive environment variables only. Nothing is read
 * outside this list, so secrets / tokens can never leak into the report.
 */
const ENV_WHITELIST = [
  'NODE_ENV',
  'CI',
  'BASE_URL',
  'PROJECT_NAME',
  'BROWSER_NAME',
  'OS_NAME',
  'SPRINT_ID',
  'BUILD_NUMBER',
  'APPLICATION_VERSION',
  'STC_SPEC_PATH',
  'TZ',
  'GITHUB_WORKFLOW',
  'GITHUB_RUN_ID',
  'GITHUB_REF_NAME',
  'GITHUB_ACTOR',
] as const;

function collectWhitelistedEnv(): string {
  const present = ENV_WHITELIST.filter((key) => {
    const v = process.env[key];
    return v !== undefined && v !== '';
  }).map((key) => `${key}=${process.env[key]}`);
  return present.length > 0 ? present.join(', ') : 'none set';
}

/** Resolve the base URL from env first, then the Playwright config. */
function resolveBaseUrl(context: StcEnrichmentContext): string {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  }
  const projects = context.config?.projects ?? [];
  for (const project of projects) {
    const useBlock = project.use as { baseURL?: string } | undefined;
    if (useBlock?.baseURL) {
      return useBlock.baseURL;
    }
  }
  return NA;
}

/** Resolve the executing browser / Playwright project name. */
function resolveProjectName(context: StcEnrichmentContext): string {
  const fromTest = context.test?.parent?.project()?.name;
  if (fromTest) {
    return fromTest;
  }
  return process.env.BROWSER_NAME ?? context.config?.projects?.[0]?.name ?? NA;
}

/** Gather every evidence path from the result attachments and explicit input. */
function collectEvidencePaths(context: StcEnrichmentContext): string[] {
  const paths = new Set<string>();
  for (const explicit of context.evidencePaths ?? []) {
    if (explicit) {
      paths.add(explicit);
    }
  }
  for (const attachment of context.result?.attachments ?? []) {
    if (attachment.path) {
      paths.add(attachment.path);
    }
  }
  return [...paths];
}

/**
 * Build the ordered list of metadata rows. Each value is collected through
 * `safe()` so a single failing probe cannot abort enrichment.
 */
function buildMetadataRows(context: StcEnrichmentContext): MetadataRow[] {
  const { result, test } = context;

  const startMs = result?.startTime ? new Date(result.startTime).getTime() : undefined;
  const durationMs = typeof result?.duration === 'number' ? result.duration : undefined;
  const endMs =
    startMs !== undefined && durationMs !== undefined ? startMs + durationMs : undefined;

  const startIso = safe(() => (startMs !== undefined ? new Date(startMs).toISOString() : ''));
  const endIso = safe(() => (endMs !== undefined ? new Date(endMs).toISOString() : ''));
  const durationLabel = safe(() => {
    if (durationMs === undefined) {
      return '';
    }
    const totalSec = Math.max(0, Math.round(durationMs / 1000));
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${durationMs} ms (${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')})`;
  });

  const runId = safe(() => context.runId ?? randomUUID());
  const evidence = collectEvidencePaths(context);

  return [
    { field: 'Report Generated At', value: safe(() => new Date().toISOString()) },
    { field: 'Test Execution Start', value: startIso },
    { field: 'Test Execution End', value: endIso },
    { field: 'Total Execution Duration', value: durationLabel },
    { field: 'Test Run ID', value: runId },
    { field: 'Playwright Version', value: safe(detectPlaywrightVersion) },
    { field: 'Node.js Version', value: safe(() => process.version) },
    {
      field: 'OS Platform / Architecture',
      value: safe(() => `${os.platform()} ${os.release()} (${os.arch()})`),
    },
    { field: 'Execution Machine Hostname', value: safe(() => os.hostname()) },
    {
      field: 'Timezone',
      value: safe(
        () => process.env.TZ || Intl.DateTimeFormat().resolvedOptions().timeZone
      ),
    },
    { field: 'Browser / Project', value: safe(() => resolveProjectName(context)) },
    { field: 'Base URL', value: safe(() => resolveBaseUrl(context)) },
    { field: 'Git Branch', value: safe(() => git(['rev-parse', '--abbrev-ref', 'HEAD'])) },
    { field: 'Git Commit Hash', value: safe(() => git(['rev-parse', 'HEAD'])) },
    { field: 'CI Environment', value: safe(detectCiEnvironment) },
    {
      field: 'Spec File Path',
      value: safe(() =>
        test?.location?.file
          ? path.relative(process.cwd(), test.location.file).replace(/\\/g, '/')
          : ''
      ),
    },
    {
      field: 'STC Source File',
      value: safe(() =>
        context.specPath
          ? path.relative(process.cwd(), context.specPath).replace(/\\/g, '/')
          : process.env.STC_SPEC_PATH ?? ''
      ),
    },
    {
      field: 'Reporter Version',
      value: safe(
        () => context.reporterVersion ?? `stc-execution-context@${STC_EXECUTION_CONTEXT_VERSION}`
      ),
    },
    {
      field: 'Retry Count',
      value: safe(() =>
        typeof result?.retry === 'number' ? String(result.retry) : ''
      ),
    },
    {
      field: 'Worker Index',
      value: safe(() =>
        typeof result?.workerIndex === 'number' ? String(result.workerIndex) : ''
      ),
    },
    { field: 'Environment Snapshot (whitelist)', value: safe(collectWhitelistedEnv) },
    {
      field: 'Attached Evidence',
      value: safe(() =>
        evidence.length > 0
          ? evidence
              .map((p) => path.relative(process.cwd(), p).replace(/\\/g, '/'))
              .join('<br>')
          : ''
      ),
    },
  ];
}

/** Render the metadata rows into a self-contained, audit-friendly block. */
function renderBlock(rows: MetadataRow[]): string {
  const tableRows = rows
    .map((r) => `| **${escapeCell(r.field)}** | ${escapeCell(r.value)} |`)
    .join('\n');

  return [
    BLOCK_START,
    '',
    '---',
    '',
    SECTION_HEADING,
    '',
    '> Auto-generated runtime context appended for QA governance, audit',
    '> traceability and debugging. This block is additive and does not alter',
    '> any existing STC section.',
    '',
    '| Field | Value |',
    '|-------|-------|',
    tableRows,
    '',
    BLOCK_END,
    '',
  ].join('\n');
}

/**
 * Enrich a generated STC markdown report with an execution-context block.
 *
 * @param markdown  The fully generated STC report markdown string.
 * @param context   Playwright test metadata / runtime context (all optional).
 * @returns         The original markdown with the context block appended at
 *                  the very end. On any unexpected failure the original,
 *                  unmodified markdown is returned (fail-safe).
 */
export function enrichSTCReportContext(
  markdown: string,
  context: StcEnrichmentContext = {}
): string {
  try {
    // Idempotency / retirement: always strip any previously appended block so
    // re-runs never stack duplicates and legacy Section 09 is removed.
    const existing = new RegExp(
      `\\n*${BLOCK_START}[\\s\\S]*?${BLOCK_END}\\n*`,
      'g'
    );
    const base = markdown.replace(existing, '').trimEnd();

    if (!APPEND_EXECUTION_CONTEXT) {
      return `${base}\n`;
    }

    const rows = buildMetadataRows(context);
    const block = renderBlock(rows);
    return `${base}\n\n${block}`;
  } catch {
    // Absolute fail-safe: never break report generation.
    return markdown;
  }
}

export default enrichSTCReportContext;
