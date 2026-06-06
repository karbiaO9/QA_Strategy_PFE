/**
 * Reads sprint1/PHYSIO_backend_execution_ready_with_clickup.xlsx
 * sheet "Backend Execution Ready" and writes:
 * - One markdown file per STC under reports/markdown/stc-prefill/sheets/
 * - Optional combined BACKEND_EXECUTION_READY_PREFILL.md
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const ROOT = path.join(__dirname, '..');
const XLSX_PATH = path.join(ROOT, 'sprint1', 'PHYSIO_backend_execution_ready_with_clickup.xlsx');
const SHEET = 'Backend Execution Ready';
const OUT = path.join(ROOT, 'reports', 'markdown', 'stc-prefill', 'BACKEND_EXECUTION_READY_PREFILL.md');
const SHEETS_DIR = path.join(ROOT, 'reports', 'markdown', 'stc-prefill', 'sheets');

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

function escapeCell(s) {
  return String(s ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, '<br>');
}

/** Path only: strip scheme/host if present */
function endpointPathOnly(ep) {
  let p = String(ep ?? '').trim();
  if (!p) return p;
  if (p.startsWith('http://') || p.startsWith('https://')) {
    try {
      const u = new URL(p);
      return u.pathname + (u.search || '');
    } catch {
      return p.replace(/^https?:\/\/[^/]+/i, '') || '/';
    }
  }
  return p.startsWith('/') ? p : `/${p}`;
}

/**
 * Split payload column on | into body part and header hints (e.g. "Content-Type: ...")
 */
function splitPayloadAndHeaders(raw) {
  const full = String(raw ?? '').trim();
  if (!full) return { bodyPart: '', headerParts: [], pathNotes: [], miscHints: [] };

  const pipeIdx = full.indexOf(' | ');
  if (pipeIdx === -1) {
    return { bodyPart: full, headerParts: [], pathNotes: [], miscHints: [] };
  }
  const bodyPart = full.slice(0, pipeIdx).trim();
  const rest = full.slice(pipeIdx + 3).trim();
  const segments = rest
    .split(/\s*\|\s*/)
    .map((h) => h.trim())
    .filter(Boolean);

  const headerParts = [];
  const pathNotes = [];
  const miscHints = [];
  for (const seg of segments) {
    const pieces = seg.split(/\s*;\s*/).map((p) => p.trim()).filter(Boolean);
    for (const piece of pieces) {
      if (/^path\s/i.test(piece)) {
        pathNotes.push(piece);
        continue;
      }
      if (!parseHeaderToken(piece).name) {
        miscHints.push(piece);
        continue;
      }
      headerParts.push(piece);
    }
  }
  return { bodyPart, headerParts, pathNotes, miscHints };
}

function parseHeaderToken(tok) {
  const m = /^([^:]+):\s*(.+)$/i.exec(tok);
  if (!m) return { name: null, value: tok };
  return { name: m[1].trim(), value: m[2].trim() };
}

/** Remove // and /* *\/ comments from pseudo-JSON for pretty-print attempts */
function stripJsComments(text) {
  let s = text;
  s = s.replace(/\/\*[\s\S]*?\*\//g, ' ');
  s = s.replace(/(^|[^:])\/\/.*$/gm, '$1');
  return s;
}

function tryPrettyJson(bodyPart) {
  const trimmed = bodyPart.trim();
  if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('{   ') === false && !trimmed.startsWith('{') && !trimmed.startsWith('['))
    return null;
  if (trimmed.includes('multipart/form-data') || trimmed.toLowerCase().includes('same multipart')) return null;
  if (trimmed.toLowerCase().startsWith('no body')) return null;
  if (trimmed.startsWith('/path/') || /^\/[\w/.:-]+$/.test(trimmed) && !trimmed.startsWith('{')) return null;

  let candidate = stripJsComments(trimmed);
  candidate = candidate.replace(/,(\s*[}\]])/g, '$1');
  try {
    const obj = JSON.parse(candidate);
    return JSON.stringify(obj, null, 2);
  } catch {
    return null;
  }
}

function defaultHeaders(method, bodyPart, parsedFromColumn) {
  const lower = bodyPart.toLowerCase();
  const map = new Map();
  for (const h of parsedFromColumn) {
    const { name, value } = parseHeaderToken(h);
    if (!name) continue;
    const key = name.toLowerCase();
    if (key === 'content-type' || key === 'authorization' || key === 'accept' || key === 'x-profile-id') {
      map.set(key, `${name}: ${value}`);
    }
  }
  const m = String(method || 'GET').toUpperCase();
  const hasBody =
    m !== 'GET' &&
    m !== 'HEAD' &&
    bodyPart &&
    !lower.startsWith('no body') &&
    !bodyPart.trim().startsWith('/path/');

  if (lower.includes('multipart/form-data')) {
    if (!map.has('content-type')) map.set('content-type', 'Content-Type: multipart/form-data (boundary per client)');
  } else if (hasBody && !lower.includes('multipart')) {
    if (!map.has('content-type')) map.set('content-type', 'Content-Type: application/json');
  }
  if (!map.has('accept')) map.set('accept', 'Accept: application/json');
  return Array.from(map.values());
}

function buildPurpose(row) {
  const stc = row['Test Case ID'];
  const us = row['User Story'];
  const ticket = row['ClickUp Ticket'];
  return `Validate PHYSIO backend API behavior for **${us}** using test case **${stc}** (ClickUp **${ticket}**), per the execution-ready specification.`;
}

function buildPreconditions(actor, method, endpointPath, bodyPart, headerLines, pathNotes) {
  const parts = [
    'API base URL configured for the target environment.',
    `Caller context: **${actor}**.`,
  ];
  const needsAuth = headerLines.some((h) => h.toLowerCase().includes('authorization'));
  if (needsAuth) {
    parts.push('Obtain a valid **Bearer** access token for the actor/role required by this case (placeholder in Headers).');
  }
  if (endpointPath.includes(':id') || endpointPath.includes(':profileId')) {
    parts.push('Replace path placeholders (`:id`, `:profileId`, etc.) with real resource identifiers prepared for this test.');
  }
  for (const pn of pathNotes) {
    parts.push(`Path binding from spec: **${pn}**.`);
  }
  if (bodyPart.includes('<') && bodyPart.includes('>')) {
    parts.push('Replace placeholder tokens in the payload (e.g. `<valid unused invitation token>`) with data prepared for this scenario.');
  }
  if (method.toUpperCase() === 'GET' && bodyPart.toLowerCase().includes('no auth')) {
    parts.push('Unless the deployment protects this route, call without Authorization.');
  }
  return parts.join(' ');
}

function buildRequiredInfo(endpointPath, ticket) {
  return `Endpoint path: \`${endpointPath}\`; ClickUp: **${ticket}**; HTTP method and payload as in Test Data below.`;
}

function buildRequirementsValidated(row) {
  const us = row['User Story'];
  const ticket = row['ClickUp Ticket'];
  const er = String(row['Expected Result'] ?? '').replace(/\s+/g, ' ').trim();
  const short = er.length > 320 ? `${er.slice(0, 317)}…` : er;
  return `**${us}**; **${ticket}**. Expected API outcome per spec: ${short}`;
}

function buildSteps(method, endpointPath, bodyPart, headerLines) {
  const m = method.toUpperCase();
  const steps = [];
  steps.push(`Target: **${m}** \`${endpointPath}\` (prepend configured API base URL).`);
  steps.push(
    `Set request headers: ${headerLines.length ? headerLines.join('; ') : '**Accept: application/json** (add **Content-Type: application/json** when sending a JSON body).'}`
  );
  if (m === 'GET' || m === 'HEAD' || bodyPart.toLowerCase().startsWith('no body')) {
    steps.push('Do not send a request body.');
  } else if (bodyPart.includes('multipart/form-data')) {
    steps.push('Build **multipart/form-data** per **Payload / Test Data** (fields + file part).');
  } else if (bodyPart.includes(' ou ') || bodyPart.includes('\nou\n') || bodyPart.toLowerCase().includes(' or ')) {
    steps.push('Attach **one** of the alternative JSON bodies documented in **Payload / Test Data** (separate execution per variant if required).');
  } else if (bodyPart.trim().startsWith('/path/')) {
    steps.push('Use the concrete path from **Payload / Test Data** (resource id) instead of a JSON body.');
  } else {
    steps.push('Attach the JSON body from **Payload / Test Data**.');
  }
  steps.push(`Execute the request; capture HTTP status, response body, and any observable backend side effects described under **Expected Result**.`);
  return steps;
}

function buildExpectedResultCell(row) {
  return String(row['Expected Result'] ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\s+\n/g, '\n')
    .trim();
}

function normalizeStcId(id) {
  return String(id ?? '').replace(/\s+/g, '').replace(/\/B$/i, '/B');
}

/** Filesystem-safe: STC-AUTH-ADMIN-001/B → STC-AUTH-ADMIN-001-B.md */
function safeStcBasename(stcId) {
  return String(stcId ?? 'UNKNOWN')
    .replace(/\//g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '_');
}

function rowToMarkdown(row, index, total, mode = 'bundle') {
  const stcId = row['Test Case ID'];
  const userStory = row['User Story'];
  const ticket = row['ClickUp Ticket'];
  const actor = row['Actor'];
  const endpointRaw = row['Endpoint'];
  const method = row['Method'];
  const payloadRaw = row['Payload / Test Data'];

  const pathOnly = endpointPathOnly(endpointRaw);
  const { bodyPart, headerParts, pathNotes, miscHints } = splitPayloadAndHeaders(payloadRaw);
  const headerLines = defaultHeaders(method, bodyPart, headerParts);
  const pretty = tryPrettyJson(bodyPart);
  const payloadDisplay =
    pretty !== null
      ? pretty
      : bodyPart.replace(/\r\n/g, '\n').trim();

  const purpose = buildPurpose(row);
  const preconditions = buildPreconditions(actor, method, pathOnly, bodyPart, headerLines, pathNotes);
  const requiredInfo = buildRequiredInfo(pathOnly, ticket);
  const reqVal = buildRequirementsValidated(row);
  const expectedResult = buildExpectedResultCell(row);
  const steps = buildSteps(method, pathOnly, bodyPart, headerLines);

  const title = `PHYSIO — ${stcId}`;

  const testDataSummary = escapeCell(
    pretty !== null ? 'JSON body per Payload section' : payloadDisplay.slice(0, 500) + (payloadDisplay.length > 500 ? '…' : '')
  );

  const stepRows = steps
    .map((text, i) => {
      const isLast = i === steps.length - 1;
      let dataCol = '—';
      if (i === 0) dataCol = escapeCell(`${method} ${pathOnly}`);
      else if (i === 1) dataCol = escapeCell(headerLines.join('; ') || 'Accept / Content-Type per Headers section');
      else if (i === steps.length - 2) dataCol = testDataSummary;
      return `| ${i + 1} | ${escapeCell(text)} | ${dataCol} | ${escapeCell(isLast ? expectedResult : '—')} | | ${escapeCell(reqVal)} | | | |`;
    })
    .join('\n');

  const bundleHeader =
    mode === 'bundle'
      ? `
---

## Prefill block ${index + 1} / ${total} — ${normalizeStcId(stcId)}

### Replace in template: title line`
      : `
# ${normalizeStcId(stcId)} — PHYSIO STC prefill

**Backend Execution Ready** · case ${index + 1} of ${total}  
**Source:** \`sprint1/PHYSIO_backend_execution_ready_with_clickup.xlsx\` (sheet **${SHEET}**)

---

### Replace in template: title line`;

  // Paste block: mirrors template sections + extra metadata rows user asked for
  return `${bundleHeader}
\`## Test Case - ${title}\`

### Metadata table (extend first table block as needed)
| Field | Value |
|-------|--------|
| **Project** | PHYSIO |
| **STC ID** | ${normalizeStcId(stcId)} |
| **USER STORY** | ${escapeCell(userStory).replace(/<br>/g, ' ')} |
| **ClickUp Ticket** | ${ticket} |
| **Actor** | ${escapeCell(actor).replace(/<br>/g, ' ')} |

### Purpose
${purpose}

### Test Run Information (prefill)
| Field | Value |
|-------|--------|
| Test Type | Backend API |
| Application Version | |
| Date(s) of Test | |
| Browser | N/A (API) |
| Database | |
| Priority | |
| OS | |
| Server | |

### Preconditions / Required information
| Field | Value |
|-------|--------|
| **Testing Preconditions:** | ${escapeCell(preconditions).replace(/<br>/g, ' ')} |
| **Required Information:** | ${escapeCell(requiredInfo).replace(/<br>/g, ' ')} |

### Endpoint (path only)
\`${pathOnly}\`

### Headers
${headerLines.map((h) => `- ${h}`).join('\n')}
${miscHints.length ? miscHints.map((h) => `- _(Hint: ${h})_`).join('\n') : ''}

### Method
${method}

### Payload / Test Data
${pretty !== null ? '```json\n' + payloadDisplay + '\n```' : '```text\n' + payloadDisplay + '\n```'}

### Expected Result (full)
${expectedResult.split('\n').map((l) => `- ${l}`).join('\n')}

### Requirements validated (maps to ACCEPTANCE CRITERIA column)
${reqVal}

### Notes
_(leave empty for execution)_

### TEST SCRIPT STEPS / RESULTS — paste under section heading
\`### TEST SCRIPT STEPS / RESULTS - ${title}\`

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|---------------------|-----------|--------|----------|
${stepRows}

`;
}

function clearGeneratedSheets(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    if (/^STC-.*\.md$/i.test(name)) {
      fs.unlinkSync(path.join(dir, name));
    }
  }
}

function main() {
  if (!fs.existsSync(XLSX_PATH)) {
    console.error('Missing:', XLSX_PATH);
    process.exit(1);
  }
  const wb = XLSX.readFile(XLSX_PATH);
  const sh = wb.Sheets[SHEET];
  if (!sh) {
    console.error('Sheet not found:', SHEET);
    process.exit(1);
  }
  const rows = XLSX.utils.sheet_to_json(sh, { defval: '' });
  const total = rows.length;

  ensureDir(SHEETS_DIR);
  clearGeneratedSheets(SHEETS_DIR);

  for (let i = 0; i < rows.length; i++) {
    const stcId = rows[i]['Test Case ID'];
    const base = safeStcBasename(stcId);
    const onePath = path.join(SHEETS_DIR, `${base}.md`);
    const body = rowToMarkdown(rows[i], i, total, 'standalone').trimStart();
    fs.writeFileSync(onePath, body, 'utf8');
  }
  console.log('Wrote', total, 'files under', SHEETS_DIR);

  ensureDir(path.dirname(OUT));
  const header = `# PHYSIO Backend — STC prefill blocks\n\nSource: \`sprint1/PHYSIO_backend_execution_ready_with_clickup.xlsx\` sheet **${SHEET}** (${total} cases).\n\nExecution fields (Actual results, PASS/FAIL, Bug ID, dates, Notes) are left blank in the step table.\n\nIndividual sheets: \`reports/markdown/stc-prefill/sheets/\`\n\n`;
  const body = rows.map((r, i) => rowToMarkdown(r, i, total, 'bundle')).join('\n');
  fs.writeFileSync(OUT, header + body, 'utf8');
  console.log('Wrote', OUT);
}

main();
