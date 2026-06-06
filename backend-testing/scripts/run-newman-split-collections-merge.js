/**
 * Runs the four split PHYSIO Postman collections with Newman, reusing one runtime
 * environment file so tokens persist, then merges JSON exports for generate-md-reports-from-newman.js
 *
 * Usage: node scripts/run-newman-split-collections-merge.js
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BACKEND = path.join(ROOT, 'postman', 'physio-backend');
const ENV_BASE = path.join(BACKEND, 'PHYSIO-Backend-Execution.postman_environment.json');
const ENV_RUN = path.join(BACKEND, '_runtime.postman_environment.json');
const OUT_DIR = path.join(ROOT, 'reports', 'newman');

const COLLECTIONS = [
  'PHYSIO-Admin-Verification-STCs.postman_collection.json',
  'PHYSIO-INVIT-Assistant-E2E.postman_collection.json',
  'PHYSIO-KINE-Profile-STCs.postman_collection.json',
  'PHYSIO-KINE-Register-SOLO-STCs.postman_collection.json',
];

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

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
  console.log('Merged ->', outPath);
}

function main() {
  if (!fs.existsSync(ENV_BASE)) {
    console.error('Missing:', ENV_BASE);
    process.exit(1);
  }
  fs.copyFileSync(ENV_BASE, ENV_RUN);
  ensureDir(OUT_DIR);

  const jsonExports = [];
  for (let i = 0; i < COLLECTIONS.length; i++) {
    const file = COLLECTIONS[i];
    const col = path.join(BACKEND, file);
    if (!fs.existsSync(col)) {
      console.error('Missing collection:', col);
      process.exit(1);
    }
    const outJson = path.join(OUT_DIR, `physio-split-${i + 1}-${file.replace('.postman_collection.json', '')}.json`);
    jsonExports.push(outJson);
    const cmd = [
      'npx',
      'newman',
      'run',
      `"${col}"`,
      '-e',
      `"${ENV_RUN}"`,
      '--export-environment',
      `"${ENV_RUN}"`,
      '--suppress-exit-code',
      '--reporters',
      'cli,json',
      '--reporter-json-export',
      `"${outJson}"`,
    ].join(' ');
    console.log('\n>>>', cmd, '\n');
    execSync(cmd, { cwd: ROOT, stdio: 'inherit', shell: true, env: process.env });
  }

  const mergedPath = path.join(OUT_DIR, 'physio-split-collections-merged.json');
  mergeNewmanExports(jsonExports, mergedPath);
  console.log('\nNext: node scripts/generate-md-reports-from-newman.js', mergedPath);
}

main();
