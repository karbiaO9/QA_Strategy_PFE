/**
 * Runs PHYSIO Postman collections in order, persisting env vars (tokens, ids) between runs.
 * Usage: from repo root, `node scripts/run-physio-newman-chain.js`
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BACKEND = path.join(ROOT, 'postman', 'physio-backend');
const ENV_BASE = path.join(BACKEND, 'PHYSIO-Backend-Execution.postman_environment.json');
const ENV_RUN = path.join(BACKEND, '_runtime.postman_environment.json');

const COLLECTIONS = [
  'PHYSIO-ADMIN-Backend.postman_collection.json',
  'PHYSIO-KINE-Backend.postman_collection.json',
  'PHYSIO-PATIENT-Backend.postman_collection.json',
  'PHYSIO-SHARED-Backend.postman_collection.json',
];

const SYNC_PWD_KEYS = ['kinePassword', 'kinePasswordAlternate'];
const REPORT_DIR = path.join(ROOT, 'reports', 'newman');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

/** Merge per-collection Newman JSON exports into one document for STC/SQTR generation. */
function mergeNewmanExports(jsonPaths, outPath) {
  const first = JSON.parse(fs.readFileSync(jsonPaths[0], 'utf8'));
  const allExecutions = [];
  const allFailures = [];
  let started = null;
  let completed = null;
  for (const p of jsonPaths) {
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    const run = j.run || {};
    if (Array.isArray(run.executions)) allExecutions.push(...run.executions);
    if (Array.isArray(run.failures)) allFailures.push(...run.failures);
    const t = run.timings || {};
    if (t.started != null && (started == null || t.started < started)) started = t.started;
    if (t.completed != null && (completed == null || t.completed > completed)) completed = t.completed;
  }
  const merged = { ...first };
  merged.run = { ...(first.run || {}) };
  merged.run.executions = allExecutions;
  merged.run.failures = allFailures;
  merged.run.timings = { ...(first.run?.timings || {}), started, completed };
  fs.writeFileSync(outPath, JSON.stringify(merged, null, 2), 'utf8');
  console.log('Merged Newman JSON ->', outPath);
}

function syncKinePasswordsToBase() {
  const base = JSON.parse(fs.readFileSync(ENV_BASE, 'utf8'));
  const run = JSON.parse(fs.readFileSync(ENV_RUN, 'utf8'));
  const runByKey = Object.fromEntries((run.values || []).map((v) => [v.key, v]));
  for (const entry of base.values || []) {
    if (SYNC_PWD_KEYS.includes(entry.key) && runByKey[entry.key]) {
      entry.value = runByKey[entry.key].value;
    }
  }
  fs.writeFileSync(ENV_BASE, JSON.stringify(base, null, 2), 'utf8');
  console.log('Synced', SYNC_PWD_KEYS.join(', '), 'from runtime ->', ENV_BASE);
}

function main() {
  if (!fs.existsSync(ENV_BASE)) {
    console.error('Missing environment:', ENV_BASE);
    process.exit(1);
  }
  fs.copyFileSync(ENV_BASE, ENV_RUN);
  console.log('Copied', ENV_BASE, '->', ENV_RUN);
  ensureDir(REPORT_DIR);
  const jsonExports = [];

  for (let i = 0; i < COLLECTIONS.length; i++) {
    const name = COLLECTIONS[i];
    const colPath = path.join(BACKEND, name);
    if (!fs.existsSync(colPath)) {
      console.error('Missing collection:', colPath);
      process.exit(1);
    }
    const slug = name.replace(/\.postman_collection\.json$/i, '').replace(/[^a-z0-9-]+/gi, '-');
    const jsonPath = path.join(REPORT_DIR, `physio-chain-${i + 1}-${slug}.json`);
    jsonExports.push(jsonPath);
    console.log(`\n--- [${i + 1}/${COLLECTIONS.length}] ${name} ---\n`);
    execSync(
      `npx newman run "${colPath}" -e "${ENV_RUN}" --export-environment "${ENV_RUN}" --suppress-exit-code --reporters cli,json --reporter-json-export "${jsonPath}" --delay-request 450`,
      { stdio: 'inherit', cwd: ROOT, shell: true }
    );
  }
  syncKinePasswordsToBase();
  mergeNewmanExports(jsonExports, path.join(REPORT_DIR, 'physio-merged.json'));
  console.log('\nAll collections finished OK.');
}

main();
