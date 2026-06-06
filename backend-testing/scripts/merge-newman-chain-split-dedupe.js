/**
 * Merges physio-chain-* and physio-split-* Newman JSON exports into one file.
 * Dedupes executions that map to the same STC ID (name contains STC-.../B) — first occurrence
 * across the ordered file list wins.
 *
 * Usage: node scripts/merge-newman-chain-split-dedupe.js
 * Output: reports/newman/physio-chain-split-full-deduped.json
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'reports', 'newman', 'physio-chain-split-full-deduped.json');

const INPUTS = [
  'reports/newman/physio-chain-1-PHYSIO-ADMIN-Backend.json',
  'reports/newman/physio-chain-2-PHYSIO-KINE-Backend.json',
  'reports/newman/physio-chain-3-PHYSIO-PATIENT-Backend.json',
  'reports/newman/physio-chain-4-PHYSIO-SHARED-Backend.json',
  'reports/newman/physio-split-1-PHYSIO-Admin-Verification-STCs.json',
  'reports/newman/physio-split-2-PHYSIO-INVIT-Assistant-E2E.json',
  'reports/newman/physio-split-3-PHYSIO-KINE-Profile-STCs.json',
  'reports/newman/physio-split-4-PHYSIO-KINE-Register-SOLO-STCs.json',
];

function normalizeStcId(stcId) {
  return String(stcId || '').replace('/', '');
}

function extractStcIdFromText(value) {
  const match = String(value || '').match(/(STC-[A-Z0-9-]+\/[A-Z])/i);
  return match ? match[1].toUpperCase() : '';
}

function dedupeFailures(failures) {
  const seen = new Set();
  const out = [];
  for (const f of failures || []) {
    const name = f?.source?.name || 'Unknown';
    const msg = f?.error?.message || f?.error?.name || '';
    const key = `${name}::${msg}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(f);
  }
  return out;
}

function main() {
  const jsonPaths = INPUTS.map((rel) => path.join(ROOT, rel));
  for (const p of jsonPaths) {
    if (!fs.existsSync(p)) {
      console.error('Missing:', p);
      process.exit(1);
    }
  }

  const first = JSON.parse(fs.readFileSync(jsonPaths[0], 'utf8'));
  const allExecutions = [];
  const allFailures = [];
  let started = null;
  let completed = null;
  const seenStc = new Set();
  let droppedExec = 0;

  for (const p of jsonPaths) {
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    const run = j.run || {};
    const ex = Array.isArray(run.executions) ? run.executions : [];
    for (const e of ex) {
      const name = e?.item?.name || '';
      const stcId = extractStcIdFromText(name);
      if (stcId) {
        const k = normalizeStcId(stcId);
        if (seenStc.has(k)) {
          droppedExec++;
          continue;
        }
        seenStc.add(k);
      }
      allExecutions.push(e);
    }
    if (Array.isArray(run.failures)) allFailures.push(...run.failures);
    const t = run.timings || {};
    if (t.started != null && (started == null || t.started < started)) started = t.started;
    if (t.completed != null && (completed == null || t.completed > completed)) completed = t.completed;
  }

  const failuresDeduped = dedupeFailures(allFailures);

  const merged = { ...first };
  merged.run = { ...(first.run || {}) };
  merged.run.executions = allExecutions;
  merged.run.failures = failuresDeduped;
  merged.run.timings = { ...(first.run?.timings || {}), started, completed };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(merged, null, 2), 'utf8');
  console.log('Written:', OUT);
  console.log('Executions:', allExecutions.length, '| dropped duplicate STC executions:', droppedExec);
  console.log('Failures:', failuresDeduped.length, '(raw combined:', allFailures.length + ')');
}

main();
