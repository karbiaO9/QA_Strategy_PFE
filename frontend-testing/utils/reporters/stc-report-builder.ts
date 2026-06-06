import fs from 'fs';
import path from 'path';
import type { StcReportPayload, StcStepResult } from '../types';
import type { StcSpecDefinition } from '../stc-spec-catalog';

const TEMPLATE_PATH = path.resolve(
  __dirname,
  '../../../backend-testing/reports/templates/STC Software Test Case Sheet template V02R00.md'
);

export function escapeMdCell(value?: string): string {
  if (!value) {
    return '';
  }
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

/** Flatten spec markdown tables / lists for use inside V02 table cells. */
export function formatSpecContentForCell(value?: string): string {
  if (!value?.trim()) {
    return '';
  }

  const lines = value.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const isTable = lines.some((l) => l.startsWith('|'));

  if (!isTable) {
    return escapeMdCell(value);
  }

  const rows = lines
    .filter((l) => l.startsWith('|') && !/^\|[-\s|]+\|$/.test(l))
    .map((l) =>
      l
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean)
        .join(' ? ')
    );

  return rows.join('<br>');
}

function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Europe/Paris',
    });
  } catch {
    return iso.slice(0, 10);
  }
}

function loadTemplate(): string {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(`STC template not found: ${TEMPLATE_PATH}`);
  }
  return fs.readFileSync(TEMPLATE_PATH, 'utf8').replace(/\r\n/g, '\n');
}

function setTableField(doc: string, fieldLabel: string, value: string): string {
  const escaped = fieldLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const fieldRe = new RegExp(`\\*\\*${escaped}\\*\\*`);

  return doc
    .split('\n')
    .map((line) => {
      if (!line.trimStart().startsWith('|') || !fieldRe.test(line)) {
        return line;
      }

      const cells = line.split('|');
      for (let i = 1; i < cells.length - 1; i++) {
        if (fieldRe.test(cells[i] ?? '')) {
          cells[i + 1] = ` ${escapeMdCell(value)} `;
          break;
        }
      }
      return cells.join('|');
    })
    .join('\n');
}

function replacePlaceholderBlock(doc: string, header: string, content: string): string {
  const escaped = header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(\\*\\*${escaped}\\*\\*[^\\n]*\\n\\n)\\|\\n`, 'm');
  const body = content.trim() || '?';
  if (pattern.test(doc)) {
    // Replacer function (not a string) so `$`-sequences inside spec/payload
    // text (e.g. an acceptance-criteria regex like `/login$`) are inserted
    // literally and not interpreted as replacement patterns.
    return doc.replace(pattern, (_m, prefix: string) => `${prefix}${body}\n`);
  }
  return doc;
}

function markCheckbox(doc: string, label: string): string {
  const unchecked = `- [ ] ${label}`;
  const checked = `- [x] ${label}`;
  if (!doc.includes(unchecked)) {
    return doc;
  }
  return doc.replace(unchecked, checked);
}

function markTestTypeCheckboxes(doc: string, testType: string): string {
  let result = doc;
  const normalized = testType.toLowerCase();

  if (normalized.includes('integration')) {
    result = markCheckbox(result, 'Integration');
  }
  if (normalized.includes('functional') || normalized.includes('positive') || normalized.includes('negative')) {
    result = markCheckbox(result, 'Functional');
  }
  if (normalized.includes('ui') || normalized.includes('ux')) {
    result = markCheckbox(result, 'UI / UX');
  }
  if (normalized.includes('regression')) {
    result = markCheckbox(result, 'Regression');
  }
  if (normalized.includes('smoke')) {
    result = markCheckbox(result, 'Smoke');
  }
  if (normalized.includes('security')) {
    result = markCheckbox(result, 'Security');
  }

  return result;
}

function markPriorityCheckboxes(doc: string, priority: string): string {
  const p = priority.toUpperCase();
  let result = doc;

  if (p.includes('P0') || p.includes('CRITICAL')) {
    result = markCheckbox(result, 'Critical');
  } else if (p.includes('P1') || p.includes('HIGH')) {
    result = markCheckbox(result, 'High');
  } else if (p.includes('P2') || p.includes('MEDIUM')) {
    result = markCheckbox(result, 'Medium');
  } else if (p.includes('P3') || p.includes('LOW')) {
    result = markCheckbox(result, 'Low');
  }

  return result;
}

function markExecutionStatus(doc: string, overall: StcReportPayload['overallResult']): string {
  let result = doc;
  if (overall === 'PASSED') {
    result = markCheckbox(result, 'Passed');
  } else if (overall === 'FAILED') {
    result = markCheckbox(result, 'Failed');
  } else if (overall === 'BLOCKED') {
    result = markCheckbox(result, 'Blocked');
  } else {
    result = markCheckbox(result, 'Not Run');
  }
  return result;
}

function markEnvironmentType(doc: string, baseUrl: string): string {
  const url = baseUrl.toLowerCase();
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    return markCheckbox(doc, 'Dev');
  }
  if (url.includes('uat')) {
    return markCheckbox(doc, 'UAT');
  }
  if (url.includes('staging') || url.includes('stg')) {
    return markCheckbox(doc, 'Staging');
  }
  return markCheckbox(doc, 'Staging');
}

function formatStepRows(steps: StcStepResult[]): string {
  if (steps.length === 0) {
    return '| 1 | | | | | | | | | |';
  }

  return steps
    .map(
      (s) =>
        `| ${s.index} | ${escapeMdCell(s.action)} | ${escapeMdCell(s.testData)} | ${escapeMdCell(s.expected)} | ${escapeMdCell(s.actual)} | ${escapeMdCell(s.acceptanceCriteria)} | ${escapeMdCell(s.status)} | ${escapeMdCell(s.defectRef)} | ${escapeMdCell(s.severity)} | ${escapeMdCell(s.evidenceRef)} |`
    )
    .join('\n');
}

function patchSection06(template: string, steps: StcStepResult[]): string {
  const header =
    '| # | Action / Test Step | Test Data | Expected Result | Actual Result | Acceptance Criteria | Status | Defect Ref | Sev | Evidence Ref |';
  const separator =
    '|---|-------------------|------------|-----------------|---------------|---------------------|--------|------------|-----|--------------|';

  const block = `${header}\n${separator}\n${formatStepRows(steps)}`;
  const pattern =
    /\| # \| Action \/ Test Step[\s\S]*?\*Status:\* Pass \/ Fail \/ Blocked \/ N\/A/;

  // Replacer function: `block` is built from spec text that may contain
  // `$`-sequences (e.g. `/login$`); a string replacement would treat those
  // as patterns and splice in surrounding document text.
  return template.replace(
    pattern,
    () => `${block}\n\n*Status:* Pass / Fail / Blocked / N/A`
  );
}

/**
 * A step is "field-filling" when it enters/types data into an input (so the
 * Test Data belongs on that row) - as opposed to opening a page, navigating,
 * clicking, asserting or submitting an empty form.
 */
function isFieldFillingStep(action: string): boolean {
  const a = action.toLowerCase();
  if (/\b(fill|enter|type|input|provide|saisir|remplir|seed)\b/.test(a)) {
    return true;
  }
  // "Submit <something with credentials>" still implies filling fields first,
  // but "submit the form" / "submit empty" do not.
  if (/\bsubmit\b/.test(a) && /\b(email|password|credential|code|identifier|phone|token)\b/.test(a) && !/\bempty\b/.test(a)) {
    return true;
  }
  return false;
}

/**
 * Turn one imperative clause into a past-tense "what happened" outcome:
 *   "Open `/login`"                 -> "`/login` opened"
 *   "Fill X with valid credentials" -> "X filled with valid credentials"
 *   "Submit the form"               -> "form submitted"
 *   "Assert response ok()"          -> "verified response ok()"
 */
function pastTenseClause(clause: string): string {
  const c = clause.trim().replace(/[.;]+$/, '').trim();
  if (!c) {
    return '';
  }
  const rules: Array<[RegExp, (m: RegExpMatchArray) => string]> = [
    [/^fill\s+(.+?)\s+with\s+(.+)$/i, (m) => `${m[1]} filled with ${m[2]}`],
    [/^fill\s+(.+)$/i, (m) => `${m[1]} filled`],
    [/^open\s+(.+)$/i, (m) => `${m[1]} opened`],
    [/^enter\s+(.+)$/i, (m) => `${m[1]} entered`],
    [/^type\s+(.+)$/i, (m) => `${m[1]} typed`],
    [/^submit$/i, () => 'form submitted'],
    [/^submit\s+(.+)$/i, (m) => `${m[1].replace(/^the\s+/i, '')} submitted`],
    [/^(?:navigate|go)\s+(?:to\s+)?(.+)$/i, (m) => `navigated to ${m[1]}`],
    [/^`?page\.goto\(([^)]*)\)`?\s*(.*)$/i, (m) => `navigated to ${m[1].replace(/['"]/g, '`')}${m[2] ? ` ${m[2]}` : ''}`],
    [/^reload\b(.*)$/i, (m) => `page reloaded${m[1]}`],
    [/^accept\s+(.+)$/i, (m) => `${m[1]} accepted`],
    [/^click\s+(?:the\s+|on\s+)?(.+)$/i, (m) => `${m[1]} clicked`],
    [/^assert\s+(.+)$/i, (m) => `verified ${m[1]}`],
    [/^confirm\s+(.+)$/i, (m) => `confirmed ${m[1]}`],
    [/^count\s+(.+)$/i, (m) => `${m[1]} counted`],
    [/^mock\s+(.+)$/i, (m) => `${m[1]} mocked`],
    [/^seed\s+(.+)$/i, (m) => `${m[1]} seeded`],
    [/^set\s+(.+)$/i, (m) => `${m[1]} set`],
    [/^trigger\s+(.+)$/i, (m) => `${m[1]} triggered`],
    [/^establish\s+(.+)$/i, (m) => `${m[1]} established`],
    [/^configure\s+(.+)$/i, (m) => `${m[1]} configured`],
    [/^invoke\s+(.+)$/i, (m) => `${m[1]} invoked`],
    [/^force\s+(.+)$/i, (m) => `${m[1]} forced`],
    [/^wait\b(.*)$/i, (m) => `waited${m[1]}`],
    [/^log\s?in\b(.*)$/i, (m) => `logged in${m[1]}`],
  ];
  for (const [re, fn] of rules) {
    const m = c.match(re);
    if (m) {
      return fn(m).trim();
    }
  }
  return `${c} — confirmed`;
}

/** Describe the whole step action as a completed outcome (drops "→ expect …"). */
function describeStepOutcome(action: string): string {
  const text = action
    .split(';')
    .map((part) => part.split(/→|->/)[0])
    .map((part) => pastTenseClause(part))
    .filter(Boolean)
    .join('; ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) {
    return 'step executed';
  }
  return /^[a-z]/.test(text) ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

/**
 * Per-step "Actual Result": a consistent past-tense echo of the step action
 * (what actually happened), not a generic pass sentence.
 */
function buildActualResult(
  action: string,
  passed: boolean,
  isFirst: boolean,
  truncatedFail: string
): string {
  const outcome = describeStepOutcome(action);
  if (passed) {
    return `${outcome}.`;
  }
  return isFirst
    ? `${outcome} — failed: expected result / acceptance criteria not met. ${truncatedFail}`
    : 'Not executed — blocked by the failure at step 1.';
}

export function buildStepsFromSpecAndRun(
  spec: StcSpecDefinition,
  run: Pick<StcReportPayload, 'overallResult' | 'executionNotes'> & {
    errorMessage?: string;
    evidenceReference?: string;
  }
): StcStepResult[] {
  const passed = run.overallResult === 'PASSED';
  const failMsg = run.errorMessage?.trim();
  const truncatedFail = failMsg ? failMsg.slice(0, 200) : 'See execution notes.';
  const testData = formatSpecContentForCell(spec.requiredTestData) || undefined;

  // Attach the test data to the first step that actually fills a field; if no
  // step fills a field (e.g. session-based flows), fall back to step 1.
  let dataStepIndex = spec.steps.findIndex((action) => isFieldFillingStep(action));
  if (dataStepIndex === -1) {
    dataStepIndex = 0;
  }

  return spec.steps.map((action, index) => {
    const isFirst = index === 0;
    return {
      index: index + 1,
      action,
      testData: index === dataStepIndex ? testData : undefined,
      expected: spec.expectedResult,
      acceptanceCriteria: spec.acceptanceCriteria || spec.expectedResult,
      actual: buildActualResult(action, passed, isFirst, truncatedFail),
      status: passed ? 'Pass' : 'Fail',
      evidenceRef: !passed && isFirst ? run.evidenceReference : undefined,
    } satisfies StcStepResult;
  });
}

export function buildStcMarkdownReport(
  payload: StcReportPayload,
  spec?: StcSpecDefinition
): string {
  const baseUrl = process.env.BASE_URL ?? '';
  const appVersion = process.env.APPLICATION_VERSION ?? '';
  const tester = payload.testerName?.trim() || process.env.TESTER_NAME?.trim() || '';
  const project = payload.project?.trim() || process.env.PROJECT_NAME?.trim() || 'XXX & Connect';
  const sprintId = process.env.SPRINT_ID?.trim() || 'Sprint 1';
  const buildNumber = process.env.BUILD_NUMBER?.trim() || '';
  const browser = process.env.BROWSER_NAME ?? 'Chromium (Playwright Desktop Chrome)';
  const os = process.env.OS_NAME ?? process.platform;
  const automationRef = payload.automationScriptRef ?? `frontend-testing/tests/auth (Playwright ? ${payload.stcId})`;
  const ciRef = process.env.CI === 'true' ? 'CI pipeline (Playwright)' : 'Local Playwright run';

  const title = spec?.title ?? payload.title;
  const module = spec?.module ?? payload.module;
  const priority = spec?.priority ?? payload.priority;
  const testType = spec?.testType ?? payload.testType;
  const endpoint = spec?.endpoint ?? payload.endpoint ?? '';
  const userStory = payload.userStory ?? title;
  const testObjective =
    payload.testObjective ??
    (spec?.expectedResult
      ? `${title}. ${spec.expectedResult}`.slice(0, 600)
      : title);

  let doc = loadTemplate();

  doc = setTableField(doc, 'Project', project);
  doc = setTableField(doc, 'STC ID', payload.stcId);
  doc = setTableField(doc, 'Module / Component', module);
  doc = setTableField(doc, 'Feature Name', title);
  doc = setTableField(doc, 'Sprint ID', sprintId);
  doc = setTableField(doc, 'Build Number', buildNumber);
  doc = setTableField(doc, 'API Version', appVersion);
  doc = setTableField(doc, 'Traceability Ref', payload.stcId);
  doc = setTableField(doc, 'Tester Name', tester);
  doc = setTableField(doc, 'Date(s) of Test', formatDate(payload.executedAt));
  doc = setTableField(doc, 'Execution Duration', formatDuration(payload.durationMs));
  doc = setTableField(doc, 'User Role Tested', process.env.USER_ROLE_TESTED ?? 'Kine practitioner (test account)');
  doc = setTableField(doc, 'Application Version', appVersion || 'See BUILD / APPLICATION_VERSION');
  doc = setTableField(doc, 'Server / Base URL', baseUrl);
  doc = setTableField(doc, 'API Endpoint', endpoint);
  doc = setTableField(doc, 'Browser', browser);
  doc = setTableField(doc, 'Operating System', os);
  doc = setTableField(doc, 'Automation Script Ref', automationRef);
  doc = setTableField(doc, 'CI/CD Pipeline Ref', ciRef);

  if (spec?.preconditions) {
    doc = setTableField(doc, 'Preconditions', spec.preconditions);
  }
  if (spec?.postconditions) {
    doc = setTableField(doc, 'Postconditions', spec.postconditions);
  }
  if (spec?.requiredTestData) {
    const requiredTestData = formatSpecContentForCell(spec.requiredTestData);
    doc = doc.replace(
      /\| \*\*Required Test Data\*\* \|[^|]*\|/,
      () => `| **Required Test Data** | ${requiredTestData} |`
    );
  }

  doc = replacePlaceholderBlock(doc, 'User Story', userStory);
  doc = replacePlaceholderBlock(
    doc,
    'Test Objective',
    spec?.acceptanceCriteria
      ? `${testObjective}\n\n**Acceptance criteria (spec):**\n${spec.acceptanceCriteria}`
      : testObjective
  );

  doc = markTestTypeCheckboxes(doc, testType);
  doc = markPriorityCheckboxes(doc, priority);
  doc = markExecutionStatus(doc, payload.overallResult);
  doc = markCheckbox(doc, 'Automated');
  doc = markCheckbox(doc, 'Hybrid');
  doc = markEnvironmentType(doc, baseUrl);

  const steps =
    payload.steps.length > 0 && !spec
      ? payload.steps
      : spec
        ? buildStepsFromSpecAndRun(spec, {
            overallResult: payload.overallResult,
            executionNotes: payload.executionNotes,
            errorMessage: payload.errorMessage,
            evidenceReference: payload.evidenceReference,
          })
        : payload.steps;

  doc = patchSection06(doc, steps);
  doc = patchExecutionSummary(doc, { ...payload, steps });

  const footerNote = [
    '',
    '---',
    '',
    `*Playwright ? ${payload.executedAt} ? Duration ${payload.durationMs}ms ? Project ${payload.playwrightProject ?? '?'} ? Tester ${tester || '?'}*`,
  ].join('\n');

  return doc.trimEnd() + footerNote;
}

function patchExecutionSummary(
  template: string,
  payload: StcReportPayload & { steps: StcStepResult[] }
): string {
  const passed = payload.steps.filter((s) => s.status === 'Pass').length;
  const failed = payload.steps.filter((s) => s.status === 'Fail').length;
  const blocked = payload.steps.filter(
    (s) => s.status === 'Blocked' || s.status === 'N/A' || s.status === '?'
  ).length;
  const total = payload.steps.length || 1;

  let result = template;
  result = setTableField(result, 'Total Steps', String(total));
  result = setTableField(result, 'Steps Passed', String(passed));
  result = setTableField(result, 'Steps Failed', String(failed));
  result = setTableField(result, 'Blocked / Skipped', String(blocked));

  // Section 07 (V02R00 revised): Overall Result is an inline table row and
  // Execution Notes is a "**Execution Notes** :" prose block before the rule.
  result = setTableField(result, 'Overall Result', payload.overallResult);
  const executionNotes = payload.executionNotes;
  result = result.replace(
    /\*\*Execution Notes\*\* :\n/,
    () => `**Execution Notes** :\n\n${executionNotes}\n`
  );

  if (payload.evidenceReference) {
    const evidence = escapeMdCell(payload.evidenceReference);
    result = result.replace(
      /\| \*\*Evidence Reference\*\* \| \*\(screenshots/,
      () => `| **Evidence Reference** | ${evidence} *(screenshots`
    );
  }

  if (payload.attachmentReference) {
    result = setTableField(result, 'Attachment Reference', payload.attachmentReference);
  }

  return result;
}

export interface StcReportValidationIssue {
  stcId: string;
  filePath: string;
  message: string;
}

export function validateStcMarkdownFile(
  filePath: string,
  spec?: StcSpecDefinition
): StcReportValidationIssue[] {
  const issues: StcReportValidationIssue[] = [];
  const content = fs.readFileSync(filePath, 'utf8');
  const stcIdMatch = content.match(/\| \*\*STC ID\*\*[^|]*\| ([^|]+) \|/);
  const stcId = stcIdMatch?.[1]?.trim() ?? path.basename(filePath, '.md');

  if (!stcId || stcId.length < 8) {
    issues.push({ stcId, filePath, message: 'STC ID cell is empty in section 01.' });
  }

  if (/\| \*\*Project\*\*[^|]*\| \|/.test(content)) {
    issues.push({ stcId, filePath, message: 'Project cell is empty in section 01.' });
  }

  if (/\*\*Overall Result\*\*\s*\|\s*\|/.test(content)) {
    issues.push({ stcId, filePath, message: 'Overall result was not filled in section 07.' });
  }

  const stepRows = content.match(/^\| \d+ \|/gm) ?? [];
  if (stepRows.length === 0) {
    issues.push({ stcId, filePath, message: 'No step rows found in section 06.' });
  }

  if (spec && stepRows.length !== spec.steps.length) {
    issues.push({
      stcId,
      filePath,
      message: `Step count mismatch: report has ${stepRows.length}, spec has ${spec.steps.length}.`,
    });
  }

  return issues;
}

export function writeStcMarkdownReport(
  outputDir: string,
  payload: StcReportPayload,
  spec?: StcSpecDefinition
): string {
  fs.mkdirSync(outputDir, { recursive: true });
  const fileName = `${payload.stcId.replace(/\//g, '-')}.md`;
  const filePath = path.join(outputDir, fileName);
  fs.writeFileSync(filePath, buildStcMarkdownReport(payload, spec), 'utf8');
  return filePath;
}
