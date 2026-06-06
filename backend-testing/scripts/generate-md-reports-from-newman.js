const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const ROOT = path.join(__dirname, '..');

function resolveBugTemplatePath() {
  const candidates = [
    path.join(ROOT, 'reports', 'templates', 'Bug report Template.md'),
    path.join(ROOT, 'reports', 'templates', 'Buf report Template.md'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return candidates[0];
}

const PATHS = {
  newman: path.join(ROOT, 'reports', 'newman', 'auth-results.json'),
  config: path.join(ROOT, 'qa-config', 'project.config.json'),
  stories: path.join(ROOT, 'qa-config', 'user-stories.json'),
  sprintConfig: path.join(ROOT, 'qa-config-sprint1', 'project.config.json'),
  sprintStories: path.join(ROOT, 'qa-config-sprint1', 'user-stories.json'),
  sprintCases: path.join(ROOT, 'sprint1', 'tables', 'testcases.md'),
  sprintCasesLegacy: path.join(ROOT, 'sprint1 files', 'tables', 'testcases.md'),
  sprintCasesNew: path.join(ROOT, 'sprint1', 'tables', 'new test cases.md'),
  sprintCasesNewLegacy: path.join(ROOT, 'sprint1 files', 'tables', 'new test cases.md'),
  physioSheet: 'Backend Execution Ready',
  stcTemplate: path.join(ROOT, 'reports', 'templates', 'Software Test Case Sheet template.md'),
  bugTemplate: resolveBugTemplatePath(),
  sqtrTemplate: path.join(ROOT, 'reports', 'templates', 'SQTR.md'),
  stcOut: path.join(ROOT, 'reports', 'markdown', 'stc'),
  bugOut: path.join(ROOT, 'reports', 'markdown', 'bugs'),
  sqtrOut: path.join(ROOT, 'reports', 'markdown', 'sqtr', 'SQTR-Sprint1-Auth.md'),
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function exists(filePath) {
  return fs.existsSync(filePath);
}

function resolveNewmanReportPath() {
  const arg = process.argv[2];
  if (arg) {
    const p = path.isAbsolute(arg) ? arg : path.join(ROOT, arg);
    if (exists(p)) return p;
    throw new Error(`Newman JSON not found: ${p}`);
  }
  return PATHS.newman;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function replaceTokens(template, replacements) {
  return Object.entries(replacements).reduce((acc, [key, value]) => {
    return acc.replaceAll(`{{${key}}}`, String(value ?? ''));
  }, template);
}

/** Escape for markdown table cells; avoid "N/A" fabrication — use empty string when value missing */
function escapeMd(value) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (!s.trim()) return '';
  return s.replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function normalizeWhitespace(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([•·])\s*/g, ' $1 ')
    .trim();
}

function truncateOneLine(text, maxLen) {
  const t = normalizeWhitespace(text);
  if (!t) return '';
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1).trim()}…`;
}

function stringifyRequestUrl(url, baseUrlFallback) {
  if (!url) return baseUrlFallback || '';
  if (typeof url === 'string') return url;
  if (url.raw && typeof url.raw === 'string' && url.raw.trim()) return url.raw;

  const hostPart = Array.isArray(url.host) ? url.host.join('.') : url.host;
  const pathPart = Array.isArray(url.path) ? url.path.join('/') : url.path;
  const queryPart = Array.isArray(url.query) ? url.query : [];

  let base = '';
  const hostStr = typeof hostPart === 'string' ? hostPart : '';
  if (hostStr.includes('{{baseUrl}}')) {
    base = baseUrlFallback || '';
  } else if (hostStr.startsWith('http://') || hostStr.startsWith('https://')) {
    base = hostStr;
  } else if (url.protocol && typeof url.protocol === 'string') {
    base = `${url.protocol.replace(/:$/, '')}://${hostStr}`;
  } else if (hostStr) {
    base = `https://${hostStr}`;
  } else {
    base = baseUrlFallback || '';
  }

  base = base.replace(/\/$/, '');
  const cleanPath = (pathPart || '').toString().replace(/^\/+/, '');
  let full = cleanPath ? `${base}/${cleanPath}` : base;

  if (queryPart.length) {
    const qs = queryPart
      .map((q) => {
        const key = q.key ?? q.name ?? '';
        if (!key) return '';
        const value = q.value ?? '';
        return `${encodeURIComponent(String(key))}=${encodeURIComponent(String(value))}`;
      })
      .filter(Boolean)
      .join('&');
    if (qs) full += `?${qs}`;
  }

  if (!full || full === '[object Object]') return baseUrlFallback || '';
  return full;
}

function normalizeStcId(stcId) {
  return String(stcId || '').replace('/', '');
}

/** Group Newman executions that share an STC but came from different merged JSON exports. */
function clusterExecutionsBySource(mappedExecutions) {
  const order = [];
  const by = new Map();
  for (const e of mappedExecutions) {
    const s = e.__newmanSourceFile || '__default__';
    if (!by.has(s)) {
      by.set(s, []);
      order.push(s);
    }
    by.get(s).push(e);
  }
  return order.map((sourceKey) => ({
    sourceKey,
    sourceLabel: sourceKey === '__default__' ? '' : sourceKey,
    executions: by.get(sourceKey),
  }));
}

function bugDedupeKey(execution, requestName) {
  const src = execution && execution.__newmanSourceFile;
  return src ? `${src}::${requestName}` : requestName;
}

/**
 * Newman request names use either:
 * - Physio-style: STC-PROFILE-ADD-001/B | …
 * - Sprint1 Identity-style: STC-AUTH-002B - … (no slash before the sheet letter)
 */
function extractStcIdFromText(value) {
  const s = String(value || '');
  const slashForm = s.match(/\b(STC-[A-Z0-9-]+\/[A-Z])\b/i);
  if (slashForm) return slashForm[1].toUpperCase();
  const compactForm = s.match(/\b(STC-(?:[A-Z0-9]+-)+[A-Z0-9]+B)\b/i);
  if (compactForm) return compactForm[1].toUpperCase();
  return '';
}

function resolvePhysioExcelPath() {
  const more = path.join(ROOT, 'sprint1', 'PHYSIO_backend_execution_ready_with_more_columns.xlsx');
  const legacy = path.join(ROOT, 'sprint1', 'PHYSIO_backend_execution_ready_with_clickup.xlsx');
  if (exists(more)) return more;
  return legacy;
}

/**
 * Collect explicit HTTP status codes from the Excel "Expected Result" cell (HTTP NNN, statusCode: NNN, etc.).
 * Returns null when no codes are found — then we do not raise Excel-vs-actual status mismatches.
 */
function parseExplicitExpectedHttpCodesFromExcel(text) {
  const s = String(text || '');
  if (!s.trim()) return null;
  const codes = new Set();
  const patterns = [
    /\bHTTP\s+(\d{3})\b/gi,
    /statusCode['"`]?\s*[:=]\s*(\d{3})\b/gi,
    /Response status code\s*:\s*HTTP\s+(\d{3})/gi,
  ];
  for (const re of patterns) {
    let m;
    const r = new RegExp(re.source, re.flags);
    while ((m = r.exec(s))) {
      const n = Number(m[1]);
      if (n >= 100 && n <= 599) codes.add(n);
    }
  }
  if (codes.size === 0) return null;
  return [...codes].sort((a, b) => a - b);
}

function excelHttpStatusMismatch(stc, execution) {
  const codes = stc.expectedHttpCodesFromExcel;
  if (!codes || !codes.length) return false;
  const actual = execution?.response?.code;
  if (actual == null) return false;
  return !codes.includes(actual);
}

function parseExpectedStatusFromAssertions(assertions = []) {
  const codes = new Set();
  for (const assertion of assertions) {
    const source = `${assertion?.assertion || ''} ${assertion?.error?.test || ''}`;
    const m = source.match(/(?:Status(?:\s+code)?\s+is|status code|status)\s+(\d{3})/gi);
    if (m) {
      m.forEach((x) => {
        const n = x.match(/(\d{3})/);
        if (n) codes.add(Number(n[1]));
      });
    }
    const incl = source.match(/include\((\[[\d,\s]+\])/);
    if (incl) {
      const nums = incl[1].match(/\d+/g);
      if (nums) nums.forEach((d) => codes.add(Number(d)));
    }
  }
  if (codes.size) return Math.min(...codes);
  return null;
}

function parseMarkdownTableRows(markdownText) {
  const lines = String(markdownText || '').split(/\r?\n/).map((l) => l.trim());
  return lines
    .filter((l) => l.startsWith('|') && l.endsWith('|'))
    .filter((l) => !/^\|\s*---/.test(l))
    .map((l) => l.slice(1, -1).split('|').map((c) => c.trim()));
}

function parseCasesFromMarkdown(caseRows) {
  const caseMap = new Map();
  caseRows.forEach((cols) => {
    const rawId = cols[0] || '';
    const stcId = extractStcIdFromText(rawId);
    if (!stcId) return;
    const description = cols[4] || cols[3] || cols[5] || '';
    const priority = cols[8] || cols[7] || '';
    const userStoryId = cols[3] || cols[2] || '';
    caseMap.set(stcId, {
      stcId,
      description: description || '',
      priority,
      userStoryId,
    });
  });
  return caseMap;
}

function loadPhysioExcelCaseMap() {
  const map = new Map();
  const excelPath = resolvePhysioExcelPath();
  if (!exists(excelPath)) return map;
  try {
    const wb = XLSX.readFile(excelPath);
    const sheet = wb.Sheets[PATHS.physioSheet] || wb.Sheets[wb.SheetNames[0]];
    if (!sheet) return map;
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    for (const r of rows) {
      const id = extractStcIdFromText(r['Test Case ID'] || '');
      if (!id) continue;
      const expectedResult = String(r['Expected Result'] ?? '').trim();
      const ticketRef = String(r['Ticket Ref'] ?? r['ClickUp Ticket'] ?? r['ClickUp ticket'] ?? '').trim();
      map.set(id, {
        priority: String(r.Priority ?? r.priority ?? '').trim(),
        expectedResult,
        userStory: String(r['User Story'] ?? '').trim(),
        clickUp: ticketRef,
        acceptanceCriteria: String(r['Acceptance Criteria'] ?? r['Acceptance criteria'] ?? '').trim(),
        testCaseType: String(r['TC Type'] ?? r['TC type'] ?? '').trim(),
        endpoint: String(r.Endpoint ?? '').trim(),
        method: String(r.Method ?? '').trim(),
        actor: String(r.Actor ?? '').trim(),
        expectedHttpCodes: parseExplicitExpectedHttpCodesFromExcel(expectedResult),
      });
    }
  } catch {
    /* Excel optional */
  }
  return map;
}

function loadGeneratorConfig() {
  const configPath = exists(PATHS.sprintConfig) ? PATHS.sprintConfig : PATHS.config;
  const config = readJson(configPath);
  const storiesPath = exists(PATHS.stories) ? PATHS.stories : PATHS.sprintStories;
  const storiesRaw = exists(storiesPath) ? readJson(storiesPath) : [];
  const stories = Array.isArray(storiesRaw) ? storiesRaw : [];
  return { config, stories };
}

function buildStcsFromExecutions(executions, baseStories, excelMap) {
  const caseRows = [];
  if (exists(PATHS.sprintCases)) caseRows.push(...parseMarkdownTableRows(readText(PATHS.sprintCases)));
  if (exists(PATHS.sprintCasesLegacy)) caseRows.push(...parseMarkdownTableRows(readText(PATHS.sprintCasesLegacy)));
  if (exists(PATHS.sprintCasesNew)) caseRows.push(...parseMarkdownTableRows(readText(PATHS.sprintCasesNew)));
  if (exists(PATHS.sprintCasesNewLegacy)) caseRows.push(...parseMarkdownTableRows(readText(PATHS.sprintCasesNewLegacy)));
  const caseMap = parseCasesFromMarkdown(caseRows);

  const byId = new Map();
  baseStories.forEach((stc) => {
    if (stc?.stcId) byId.set(String(stc.stcId).toUpperCase(), { ...stc });
  });

  executions.forEach((execution) => {
    const requestName = execution?.item?.name || '';
    const stcId = extractStcIdFromText(requestName);
    if (!stcId) return;
    const ex = excelMap.get(stcId);
    const statusFromAssertion = parseExpectedStatusFromAssertions(execution.assertions || []);
    const inferred = {
      stcId,
      epic: '',
      userStoryId: ex?.userStory || caseMap.get(stcId)?.userStoryId || '',
      clickUpTicket: ex?.clickUp || '',
      expectedResultExcel: ex?.expectedResult || '',
      acceptanceCriteria: ex?.acceptanceCriteria || '',
      testCaseType: ex?.testCaseType || '',
      expectedHttpCodesFromExcel: ex?.expectedHttpCodes ?? null,
      description: caseMap.get(stcId)?.description || truncateOneLine(ex?.expectedResult || requestName, 120),
      status: 'EXECUTABLE',
      priority: ex?.priority || caseMap.get(stcId)?.priority || '',
      sprint: 'Sprint 1',
      method: ex?.method || execution.request?.method || '',
      endpoint: ex?.endpoint || stringifyRequestUrl(execution.request?.url, ''),
      expectedStatus: statusFromAssertion ?? execution.response?.code ?? 200,
      purpose: '',
      actor: ex?.actor || '',
    };

    if (!inferred.purpose) {
      inferred.purpose = buildPurposeLine(inferred);
    }

    if (!byId.has(stcId)) {
      byId.set(stcId, inferred);
      return;
    }

    const existing = byId.get(stcId);
    byId.set(stcId, {
      ...inferred,
      ...existing,
      description: caseMap.get(stcId)?.description || existing.description || inferred.description,
      priority: ex?.priority || caseMap.get(stcId)?.priority || existing.priority || inferred.priority,
      userStoryId: existing.userStoryId || inferred.userStoryId,
      clickUpTicket: existing.clickUpTicket || inferred.clickUpTicket,
      expectedResultExcel: existing.expectedResultExcel || inferred.expectedResultExcel,
      acceptanceCriteria: existing.acceptanceCriteria || inferred.acceptanceCriteria,
      testCaseType: existing.testCaseType || inferred.testCaseType,
      expectedHttpCodesFromExcel: existing.expectedHttpCodesFromExcel ?? inferred.expectedHttpCodesFromExcel,
      endpoint: existing.endpoint || inferred.endpoint,
      method: existing.method || inferred.method,
      purpose: buildPurposeLine({ ...existing, ...inferred }),
    });
  });

  return [...byId.values()].map((s) => ({
    ...s,
    purpose: s.purpose || buildPurposeLine(s),
  }));
}

function buildPurposeLine(stc) {
  const us = stc.userStoryId || '';
  const ticket = stc.clickUpTicket || '';
  const head = [us, ticket].filter(Boolean).join('; ');
  const spec = truncateOneLine(stc.expectedResultExcel, 220);
  if (head && spec) return `Validate ${head}: ${spec}`;
  if (spec) return `Validate: ${spec}`;
  if (head) return `Validate backend behavior covered by ${head}.`;
  return `Validate ${stc.method} ${stc.endpoint} per test specification.`.trim();
}

function buildUserStoryField(stc) {
  const parts = [stc.userStoryId, stc.clickUpTicket].filter(Boolean);
  return parts.join(' — ');
}

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toISOString();
}

function formatSubmitDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDatesOfTest(run) {
  const started = run?.timings?.started;
  const completed = run?.timings?.completed;
  if (!started && !completed) return '';
  const s = started ? formatSubmitDate(started) : '';
  const e = completed ? formatSubmitDate(completed) : '';
  if (s && e && s !== e) return `${s} – ${e}`;
  return s || e;
}

/** Pass/fail from Newman assertions only — HTTP 4xx can be expected */
function executionHasAssertionFailure(execution) {
  return (execution.assertions || []).some((a) => a.error);
}

function extractStatusFromExecutions(stc, executions) {
  if (!executions.length) return 'BLOCKED';
  if (executions.every((e) => !e.response)) return 'BLOCKED';
  const hasFailed = executions.some((e) => executionHasAssertionFailure(e));
  return hasFailed ? 'FAILED' : 'PASSED';
}

function detectFailureFeedback(stc, executions) {
  if (executions.some((e) => executionHasAssertionFailure(e))) return 'Review linked bug report(s).';
  return '';
}

function detectBlockedReason(executions) {
  const blockedExecution = executions.find((e) =>
    (e.assertions || []).some((a) => String(a.error?.message || '').includes('Missing phone test data'))
  );
  if (blockedExecution) return 'Missing phone test data variable(s).';
  return '';
}

function responseSummary(execution) {
  if (!execution.response) return '';
  const code = execution.response.code ?? '';
  const status = execution.response.status || '';
  const rt = execution.response.responseTime ?? execution.timings?.responseTime ?? '';
  const timePart = rt !== '' && rt !== undefined ? ` in ${rt} ms` : '';
  return `${code} ${status}`.trim() + timePart;
}

function getResponseBodyString(execution) {
  const b = execution.response?.body;
  if (typeof b === 'string' && b.trim()) return b;
  const data = execution.response?.stream?.data;
  if (Array.isArray(data)) {
    try {
      return Buffer.from(data).toString('utf8');
    } catch {
      return '';
    }
  }
  return '';
}

function redactSensitive(text) {
  let s = String(text || '');
  s = s.replace(/Bearer\s+[\w.-]+/gi, 'Bearer [redacted]');
  s = s.replace(/"accessToken"\s*:\s*"[^"]+"/gi, '"accessToken":"[redacted]"');
  s = s.replace(/"refreshToken"\s*:\s*"[^"]+"/gi, '"refreshToken":"[redacted]"');
  s = s.replace(/"resetToken"\s*:\s*"[^"]+"/gi, '"resetToken":"[redacted]"');
  s = s.replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[redacted-jwt]');
  return s;
}

/** Omit noisy / transport headers; keep auth and API-relevant values for reports. */
const SKIP_REPORT_HEADER_KEYS = new Set([
  'user-agent',
  'cache-control',
  'postman-token',
  'host',
  'accept-encoding',
  'connection',
  'content-length',
  'accept',
]);

function filterReportHeaders(headers) {
  if (!Array.isArray(headers)) return [];
  return headers.filter((h) => {
    if (h.disabled) return false;
    if (h.system === true) return false;
    const k = String(h.key || '').toLowerCase();
    return !SKIP_REPORT_HEADER_KEYS.has(k);
  });
}

function formatHeadersForReport(headers, valueMax = 220) {
  const list = filterReportHeaders(headers);
  if (!list.length) return '';
  return list
    .map((h) => `${String(h.key || '')}: ${truncateOneLine(String(h.value ?? ''), valueMax)}`)
    .join('; ');
}

/**
 * Resolved request body as sent (Newman execution.request), for STC / bug Test data.
 */
function formatBodyForReport(body) {
  if (!body || !body.mode) return '';
  const mode = body.mode;
  if (mode === 'raw' && body.raw != null && String(body.raw).trim()) {
    return normalizeWhitespace(String(body.raw));
  }
  if (mode === 'urlencoded' && Array.isArray(body.urlencoded)) {
    return body.urlencoded
      .filter((x) => !x.disabled)
      .map((x) => `${x.key}=${x.value}`)
      .join('&');
  }
  if (mode === 'formdata' && Array.isArray(body.formdata)) {
    return body.formdata
      .filter((x) => !x.disabled)
      .map((x) => {
        if (x.type === 'file') {
          const src = x.src || (typeof x.value === 'object' && x.value && x.value.path) || '';
          return `${x.key}: <file> ${String(src)}`;
        }
        return `${x.key}: ${x.value}`;
      })
      .join('; ');
  }
  return '';
}

function summarizeJsonBodyForActual(bodyStr, maxLen = 320) {
  const raw = redactSensitive(bodyStr).trim();
  if (!raw) return '';
  let obj;
  try {
    obj = JSON.parse(raw);
  } catch {
    return truncateOneLine(raw, maxLen);
  }
  if (obj === null) return 'null';
  if (Array.isArray(obj)) return `JSON array (${obj.length} items).`;
  if (typeof obj === 'object') {
    const keys = Object.keys(obj).slice(0, 12);
    const parts = keys.map((k) => {
      const v = obj[k];
      if (v === null || v === undefined) return `${k}: null`;
      if (typeof v === 'object') return `${k}: {…}`;
      const vs = String(v);
      if (vs.length > 40) return `${k}: …`;
      return `${k}: ${vs}`;
    });
    return truncateOneLine(`Body keys: ${parts.join('; ')}`, maxLen);
  }
  return truncateOneLine(String(obj), maxLen);
}

function buildAssertionSummary(execution) {
  const all = execution.assertions || [];
  const failed = all.filter((a) => a.error);
  const passed = all.length - failed.length;
  if (!all.length) return 'No assertions recorded.';
  if (!failed.length) return `${passed} assertion(s) passed.`;
  const msgs = failed.slice(0, 2).map((a) => truncateOneLine(a.error?.message || 'Assertion failed', 100));
  return `${failed.length} failed, ${passed} passed. ${msgs.join(' | ')}`;
}

function buildExpectedResultCell(stc, execution) {
  const httpFromAssert = parseExpectedStatusFromAssertions(execution.assertions || []);
  const spec = truncateOneLine(stc.expectedResultExcel, 280);
  const excelCodes = stc.expectedHttpCodesFromExcel;
  const excelLine =
    excelCodes && excelCodes.length
      ? `Execution sheet: HTTP ∈ {${excelCodes.join(', ')}}.`
      : '';
  const parts = [];
  if (spec) parts.push(spec);
  if (excelLine) parts.push(excelLine);
  if (httpFromAssert) parts.push(`Newman: expect HTTP ${httpFromAssert}.`);
  if (parts.length) return truncateOneLine(parts.join(' '), 420);
  if (httpFromAssert) {
    return `HTTP ${httpFromAssert}; response and contract align with ${buildUserStoryField(stc) || 'user story'}.`;
  }
  return `HTTP ${stc.expectedStatus}; response matches acceptance for ${buildUserStoryField(stc) || 'specified story'}.`;
}

function buildActualResultCell(execution) {
  if (!execution.response) {
    return executionHasAssertionFailure(execution) ? buildAssertionSummary(execution) : 'No HTTP response captured.';
  }
  const line = responseSummary(execution);
  const assertPart = buildAssertionSummary(execution);
  const body = getResponseBodyString(execution);
  const bodySum = body ? summarizeJsonBodyForActual(body) : '';
  const pieces = [line, assertPart];
  if (bodySum) pieces.push(bodySum);
  return truncateOneLine(pieces.filter(Boolean).join(' '), 450);
}

function buildAcceptanceCriteriaCell(stc) {
  const ac = stc.acceptanceCriteria && String(stc.acceptanceCriteria).trim();
  if (ac) return truncateOneLine(ac, 320);
  const us = stc.userStoryId || '';
  const cu = stc.clickUpTicket || '';
  const base = [us, cu].filter(Boolean).join('; ');
  if (base) return `Per spec: ${base}.`;
  return 'Per Sprint 1 backend execution specification.';
}

function buildCompactBugSummary(stc, requestName, execution, assertionErrors) {
  const actualResponse = execution?.response
    ? `HTTP ${execution.response.code} ${execution.response.status || ''}`.trim()
    : 'No response';
  const hasMissingData = assertionErrors.some((msg) => String(msg).includes('Missing phone test data'));
  if (hasMissingData) {
    return `${normalizeStcId(stc.stcId)}: ${truncateOneLine(requestName, 80)} blocked — missing required test data.`;
  }
  if (excelHttpStatusMismatch(stc, execution)) {
    const allowed = (stc.expectedHttpCodesFromExcel || []).join(', ');
    const specLine = `${normalizeStcId(stc.stcId)}: ${truncateOneLine(requestName, 80)} — ${actualResponse}; Excel-allowed HTTP {${allowed}}.`;
    const assertExtra = assertionErrors.filter((m) => !String(m).includes('Excel Expected Result'));
    if (assertExtra.length) {
      return `${specLine} Also: ${truncateOneLine(assertExtra[0], 160)}`.trim();
    }
    return specLine;
  }
  const firstErr = assertionErrors[0] ? truncateOneLine(assertionErrors[0], 200) : '';
  return `${normalizeStcId(stc.stcId)}: ${truncateOneLine(requestName, 90)} — assertion failure (${actualResponse}). ${firstErr}`.trim();
}

function extractBugGroupFromStcId(stcId) {
  const normalized = String(stcId || '').toUpperCase().replace('/B', '').replace('/F', '').replace('/M', '');
  const match = normalized.match(/^STC-([A-Z0-9]+)-/);
  return match ? match[1] : 'GEN';
}

function buildTestDataCell(stc, execution, baseUrl, maxTotalLen = 2600) {
  const req = execution.request || {};
  const method = req.method || stc.method || '';
  const url = stringifyRequestUrl(req.url, baseUrl || stc.endpoint || '');
  const chunks = [`${method} ${url}`.trim()];
  const bodyStr = formatBodyForReport(req.body);
  if (bodyStr) chunks.push(`Body: ${bodyStr}`);
  const hdrStr = formatHeadersForReport(req.header);
  if (hdrStr) chunks.push(`Headers: ${hdrStr}`);
  return truncateOneLine(chunks.join(' | '), maxTotalLen);
}

/**
 * 3–5 execution-quality rows: prefer grouped steps for single-request STCs.
 */
function buildRowsForStc(stc, executions, failuresByRequest, stcBugIds, baseUrlFallback) {
  if (!executions.length) {
    return '| 1 | Map collection request name to STC ID and execute in Newman | — | Request runs; assertions match expected status and contract | Not executed | Per spec traceability | FAIL |  |  |';
  }

  const rows = [];
  const capped = executions.slice(0, 5);

  capped.forEach((execution, index) => {
    const requestName = execution.item?.name || 'Unnamed request';
    const assertionErrors = (execution.assertions || []).filter((a) => a.error).map((a) => a.error.message);
    const passFail = assertionErrors.length ? 'FAIL' : 'PASS';
    const reqBugId = passFail === 'FAIL' ? stcBugIds.get(bugDedupeKey(execution, requestName)) || '' : '';
    const severity = passFail === 'FAIL' ? 'Medium' : '';

    const stepAction = truncateOneLine(
      `Execute ${execution.request?.method || stc.method || 'HTTP'} request for ${normalizeStcId(stc.stcId)} (${truncateOneLine(requestName, 70)})`,
      180
    );
    const testData = buildTestDataCell(stc, execution, baseUrlFallback, 2800);
    const expected = buildExpectedResultCell(stc, execution);
    const relatedFailures = failuresByRequest.get(requestName) || [];
    let actual = buildActualResultCell(execution);
    if (assertionErrors.length && relatedFailures.length) {
      const extra = relatedFailures.map((f) => truncateOneLine(f.error?.message || '', 80)).filter(Boolean);
      if (extra.length) actual = truncateOneLine(`${actual} ${extra.join(' | ')}`, 450);
    }
    const criteria = buildAcceptanceCriteriaCell(stc);

    rows.push(
      `| ${rows.length + 1} | ${escapeMd(stepAction)} | ${escapeMd(testData)} | ${escapeMd(expected)} | ${escapeMd(actual)} | ${escapeMd(criteria)} | ${passFail} | ${escapeMd(reqBugId)} | ${escapeMd(severity)} |`
    );
  });

  return rows.join('\n');
}

function fillStcTemplate(template, projectConfig, stc, run, rows, scriptTitle, meta = {}) {
  const appVer = projectConfig.project.applicationVersion;
  const src = meta.newmanSourceLabel || '';
  const purposePrefix = meta.includePurposeSource && src ? `Newman export: ${src}. ` : '';
  const titleSuffix =
    meta.ordinal && meta.ordinal > 1 ? ` (#${meta.ordinal}${src ? ` · ${src}` : ''})` : '';
  const withTokens = replaceTokens(template, {
    TEST_CASE_TITLE: `${projectConfig.project.name} — ${normalizeStcId(stc.stcId)}${titleSuffix}`,
    STC_ID: stc.stcId,
    USER_STORY: buildUserStoryField(stc),
    PURPOSE: truncateOneLine(purposePrefix + (stc.purpose || ''), 500),
    APP_VERSION: appVer != null && String(appVer).trim() !== '' ? String(appVer) : '',
    DATES_OF_TEST: formatDatesOfTest(run),
    BROWSER: projectConfig.testenvironment.browser || '',
    DATABASE: projectConfig.testenvironment.database || '',
    TEST_TYPE: projectConfig.reporting.testType || '',
    PRIORITY: stc.priority || '',
    OS: projectConfig.testenvironment.os || '',
    SERVER: projectConfig.testenvironment.server || '',
    PRECONDITIONS: truncateOneLine(
      `API base URL available; credentials and tokens as per Postman environment. Target: ${stc.method} ${stc.endpoint}.`.trim(),
      400
    ),
    REQUIRED_INFO: truncateOneLine(
      `Base URL: ${projectConfig.testenvironment.baseUrl || ''}; ${buildUserStoryField(stc) ? `Traceability: ${buildUserStoryField(stc)}.` : ''} Execution: Newman/Postman.`.trim(),
      400
    ),
    ACCEPTANCE_CRITERIA_SHEET: stc.acceptanceCriteria
      ? truncateOneLine(stc.acceptanceCriteria, 600)
      : '—',
    TC_TYPE: stc.testCaseType ? truncateOneLine(stc.testCaseType, 200) : '—',
    SCRIPT_TITLE: truncateOneLine(scriptTitle, 200),
    TEST_STEP_ROWS: rows,
  });

  return withTokens;
}

function fillBugTemplate(template, bug, projectConfig) {
  const reportNote = bug.screenshotNote || 'Refer to Newman HTML/JSON export for this run for raw request and response details.';
  return replaceTokens(template, {
    BUG_AUTO_ID: escapeMd(bug.id),
    BUG_TITLE: escapeMd(bug.title),
    SUBMIT_DATE: escapeMd(bug.submitDate),
    SUMMARY: escapeMd(bug.summary),
    TEST_DATA: escapeMd(bug.testData),
    APP_URL: escapeMd(bug.url),
    SCREENSHOT_NOTE: escapeMd(reportNote),
    PLATFORM: projectConfig.testenvironment.platform || '',
    OPERATING_SYSTEM: escapeMd(projectConfig.testenvironment.os || ''),
    BROWSER_NAME: escapeMd(projectConfig.testenvironment.browser || ''),
    PRECONDITION: escapeMd(bug.precondition),
    STEPS_TO_REPRODUCE: escapeMd(bug.steps),
    EXPECTED_RESULT: escapeMd(bug.expected),
    ACTUAL_RESULT: escapeMd(bug.actual),
    NOTES: escapeMd(bug.notes),
  });
}

function fillSqtrTemplate(template, config, summary, testPerformedRows) {
  let output = template;
  output = output.replace('| **Project** |  | **Operating System** |  |', `| **Project** | ${config.project.name} | **Operating System** | ${config.testenvironment.os} |`);
  output = output.replace('| **Sprint** |  | **Location/Server** |  |', `| **Sprint** | ${config.project.sprint} | **Location/Server** | ${config.testenvironment.server} |`);
  output = output.replace('| **Raised By** |  | **Closed By** |  |', `| **Raised By** | ${config.sqtr.raisedBy} | **Closed By** |  |`);
  output = output.replace('| **Raised On** |  | **Closed On** |  |', `| **Raised On** | ${summary.raisedOn} | **Closed On** |  |`);
  output = output.replace('| **Test Environment** |  | **Release Decision** | GO / NO-GO |', `| **Test Environment** | ${config.testenvironment.platform} | **Release Decision** |  |`);
  output = output.replace('| **Executed Tests** |  | **Passed** |  |', `| **Executed Tests** | ${summary.executed} | **Passed** | ${summary.passed} |`);
  output = output.replace('| **Failed** |  | **Blocked** |  |', `| **Failed** | ${summary.failed} | **Blocked** | ${summary.blocked} |`);
  output = output.replace('| **Total** |  |  |  |', `| **Total** | ${summary.total} |  |  |`);

  output = output.replace(
    /## 2\. Test Performed[\s\S]*?## 3\. Testing Methodology/m,
    `## 2. Test Performed\n\n| Test Case ID | Short Description | Result | Status (Passed/Failed) | Bug ID | Feedback |\n|---|---|---|---|---|---|\n${testPerformedRows}\n\n## 3. Testing Methodology`
  );

  output = output.replace('| **Testing Tools** |  |', `| **Testing Tools** | ${config.reporting.testingTools} |`);
  output = output.replace('| **Testing Approach** |  |', `| **Testing Approach** | ${config.reporting.testingApproach} |`);
  output = output.replace('| **Evaluation Criteria** |  |', `| **Evaluation Criteria** | ${config.reporting.evaluationCriteria} |`);
  output = output.replace('| **Reporter** |  | **Signature** |  |', `| **Reporter** | ${config.sqtr.raisedBy} | **Signature** |  |`);
  output = output.replace('| **Quality Manager** |  | **Signature** |  |', `| **Quality Manager** | ${config.sqtr.qualityManager} | **Signature** |  |`);
  output = output.replace('| **Tech Lead** |  | **Signature** |  |', `| **Tech Lead** | ${config.sqtr.techLead} | **Signature** |  |`);
  output = output.replace('| **Release Decision** | **GO / NO-GO** |  |  |', '| **Release Decision** |  |  |  |');
  return output;
}

function run() {
  const bugPathResolved = PATHS.bugTemplate;
  const newmanPath = resolveNewmanReportPath();
  if (!exists(newmanPath)) throw new Error(`Required file is missing: ${newmanPath}`);
  if (!exists(PATHS.stcTemplate)) throw new Error(`Required file is missing: ${PATHS.stcTemplate}`);
  if (!exists(bugPathResolved)) throw new Error(`Required file is missing: Bug report template (${bugPathResolved})`);
  if (!exists(PATHS.sqtrTemplate)) throw new Error(`Required file is missing: ${PATHS.sqtrTemplate}`);

  ensureDir(PATHS.stcOut);
  ensureDir(PATHS.bugOut);
  ensureDir(path.dirname(PATHS.sqtrOut));
  const passedOnly = String(process.env.STC_PASSED_ONLY || '').toLowerCase() === 'true';

  const report = readJson(newmanPath);
  const excelMap = loadPhysioExcelCaseMap();
  const { config, stories: configuredStories } = loadGeneratorConfig();
  const stcTemplate = readText(PATHS.stcTemplate);
  const bugTemplate = readText(bugPathResolved);
  const sqtrTemplate = readText(PATHS.sqtrTemplate);

  const runData = report.run || {};
  const executions = Array.isArray(runData.executions) ? runData.executions : [];
  const userStories = buildStcsFromExecutions(executions, configuredStories, excelMap);
  const failures = Array.isArray(runData.failures) ? runData.failures : [];
  const failuresByRequest = failures.reduce((acc, f) => {
    const reqName = f?.source?.name || 'Unknown request';
    if (!acc.has(reqName)) acc.set(reqName, []);
    acc.get(reqName).push(f);
    return acc;
  }, new Map());

  const bugCountersByGroup = new Map();
  const bugFiles = [];
  const bugIdByRequest = new Map();
  const stcResults = [];

  fs.readdirSync(PATHS.stcOut)
    .filter((name) => name.toLowerCase().endsWith('.md'))
    .forEach((name) => fs.unlinkSync(path.join(PATHS.stcOut, name)));
  fs.readdirSync(PATHS.bugOut)
    .filter((name) => name.toLowerCase().endsWith('.md'))
    .forEach((name) => fs.unlinkSync(path.join(PATHS.bugOut, name)));

  userStories.forEach((stc) => {
    const stcKey = normalizeStcId(stc.stcId);
    const mappedAll = executions.filter(
      (e) => normalizeStcId(extractStcIdFromText(e.item?.name || '')) === stcKey
    );
    const clusters = clusterExecutionsBySource(mappedAll);
    const multiCluster = clusters.length > 1;

    clusters.forEach((cluster, clusterIdx) => {
      const mappedExecutions = cluster.executions;
      const ordinal = clusterIdx + 1;
      const stcFileBase = multiCluster ? `${stcKey}-${ordinal}` : stcKey;
      const stcFileName = `${stcFileBase}.md`;
      const stcBugIds = new Map();

      mappedExecutions.forEach((e) => {
      const requestName = e.item?.name || 'Unknown request';
      const failedAssertions = (e.assertions || []).filter((a) => a.error);
      if (!failedAssertions.length) return;
      const errMsgs = failedAssertions.map((a) => a.error.message);
      const specMismatch = excelHttpStatusMismatch(stc, e);
      if (specMismatch) {
        const allowed = (stc.expectedHttpCodesFromExcel || []).join(', ');
        errMsgs.push(
          `Excel Expected Result requires HTTP in {${allowed}}; received ${e.response?.code}.`
        );
      }
      const bugKey = bugDedupeKey(e, requestName);
      if (bugIdByRequest.has(bugKey)) {
        stcBugIds.set(bugKey, bugIdByRequest.get(bugKey));
        return;
      }

      const bugGroup = extractBugGroupFromStcId(stc.stcId);
      const currentCounter = bugCountersByGroup.get(bugGroup) || 0;
      const nextCounter = currentCounter + 1;
      bugCountersByGroup.set(bugGroup, nextCounter);
      const bugId = `BUG-${bugGroup}-${String(nextCounter).padStart(3, '0')}`;
      bugIdByRequest.set(bugKey, bugId);
      stcBugIds.set(bugKey, bugId);
      const urlValue = stringifyRequestUrl(e.request?.url, config.testenvironment.baseUrl || stc.endpoint || '');
      const method = e.request?.method || stc.method || 'HTTP';
      const actual = truncateOneLine(
        `${responseSummary(e)}. ${buildAssertionSummary(e)} ${errMsgs.length ? `— ${truncateOneLine(errMsgs[0], 220)}` : ''}`.trim(),
        500
      );
      const conciseSummary = buildCompactBugSummary(stc, requestName, e, errMsgs);
      const expectedSpec = truncateOneLine(stc.expectedResultExcel, 300);
      const codes = stc.expectedHttpCodesFromExcel;
      const codeLine =
        codes && codes.length ? ` Allowed HTTP status (execution sheet): {${codes.join(', ')}}.` : '';
      const expectedBug =
        expectedSpec || codeLine
          ? `${expectedSpec}${codeLine} Align API with spreadsheet specification or adjust Newman tests after agreement.`
          : `Newman assertions must pass for ${method} (expected behavior per ${buildUserStoryField(stc) || 'story'}).`;

      const bugTitle = `${normalizeStcId(stc.stcId)}: ${method} — ${truncateOneLine(requestName.replace(/^STC-[A-Z0-9-/]+\s*\|\s*/i, ''), 70)}`;

      const steps = [
        `1. Configure environment: base URL ${config.testenvironment.baseUrl || '(see project config)'}.`,
        `2. In Postman/Newman, open the request named "${truncateOneLine(requestName, 100)}".`,
        `3. Send ${method} to ${truncateOneLine(urlValue, 120)} with the collection's body and headers.`,
        `4. Observe HTTP status, response body, and Newman test assertions.`,
      ].join('\n');

      const testDataBug = buildTestDataCell(stc, e, config.testenvironment.baseUrl, 5200);
      const precondition = `STC ${stc.stcId} mapped to this request; authenticated context per collection (tokens as saved in environment).`;

      const bugContent = fillBugTemplate(bugTemplate, {
        id: bugId,
        title: bugTitle,
        submitDate: formatSubmitDate(runData?.timings?.completed || new Date().toISOString()),
        summary: conciseSummary,
        testData: testDataBug,
        url: urlValue,
        screenshotNote: 'Use Newman HTML/JSON export for this run for full request/response capture.',
        precondition,
        steps,
        expected: expectedBug,
        actual,
        notes: truncateOneLine(errMsgs.slice(0, 2).join(' | '), 300),
      }, config);
      const bugPath = path.join(PATHS.bugOut, `${bugId}.md`);
      fs.writeFileSync(bugPath, `${bugContent}\n`, 'utf8');
      bugFiles.push(bugPath);
    });

    const status = detectBlockedReason(mappedExecutions) ? 'BLOCKED' : extractStatusFromExecutions(stc, mappedExecutions);
    if (!passedOnly || status === 'PASSED') {
      const rows = buildRowsForStc(stc, mappedExecutions, failuresByRequest, stcBugIds, config.testenvironment.baseUrl);
      const scriptTitle = mappedExecutions[0]?.item?.name || `${stc.method} ${stc.endpoint}`;
      const stcMarkdown = fillStcTemplate(stcTemplate, config, stc, runData, rows, scriptTitle, {
        newmanSourceLabel: cluster.sourceLabel,
        ordinal: multiCluster ? ordinal : 0,
        includePurposeSource: multiCluster,
      });
      const stcFilePath = path.join(PATHS.stcOut, stcFileName);
      fs.writeFileSync(stcFilePath, `${stcMarkdown}\n`, 'utf8');
    }

    stcResults.push({
      stc,
      sqtrStcId: multiCluster ? `${stc.stcId} [${ordinal}: ${cluster.sourceLabel}]` : stc.stcId,
      status,
      executed: mappedExecutions.length > 0,
      bugIds: [...new Set([...stcBugIds.values()])],
      feedback:
        detectBlockedReason(mappedExecutions) ||
        (status === 'PASSED'
          ? 'No blocking issue observed.'
          : status === 'FAILED'
            ? detectFailureFeedback(stc, mappedExecutions) || 'Review linked bug report(s).'
            : 'Provide missing data and rerun.'),
    });
    });
  });

  const executed = stcResults.filter((r) => r.executed).length;
  const passed = stcResults.filter((r) => r.status === 'PASSED').length;
  const failed = stcResults.filter((r) => r.status === 'FAILED').length;
  const blocked = stcResults.filter((r) => r.status === 'BLOCKED').length;
  const total = stcResults.length;

  const sqtrRows = stcResults
    .map((r) => {
      const bugValue = r.bugIds.length ? r.bugIds.join(', ') : '';
      let resultText = 'All mapped requests passed';
      if (r.status === 'BLOCKED') resultText = 'Blocked due to missing required test data';
      else if (r.status === 'FAILED') {
        resultText =
          r.feedback && String(r.feedback).includes('Excel-expected')
            ? 'HTTP status differs from Excel Expected Result'
            : 'At least one assertion failed or Excel status mismatch';
      }
      const feedback = r.feedback || '';
      return `| ${escapeMd(r.sqtrStcId || normalizeStcId(r.stc.stcId))} | ${escapeMd(r.stc.description)} | ${escapeMd(resultText)} | ${r.status} | ${escapeMd(bugValue)} | ${escapeMd(feedback)} |`;
    })
    .join('\n');

  const sqtrDoc = fillSqtrTemplate(
    sqtrTemplate,
    config,
    {
      raisedOn: formatSubmitDate(runData?.timings?.completed || new Date().toISOString()),
      executed,
      passed,
      failed,
      blocked,
      total,
    },
    sqtrRows
  );

  fs.writeFileSync(PATHS.sqtrOut, `${sqtrDoc}\n`, 'utf8');

  const writtenStcCount = passedOnly ? stcResults.filter((r) => r.status === 'PASSED').length : stcResults.length;
  console.log(`Generated ${writtenStcCount} STC report(s).`);
  console.log(`Generated ${bugFiles.length} bug report(s).`);
  console.log(`Generated SQTR: ${PATHS.sqtrOut}`);
}

if (require.main === module) {
  run();
}
