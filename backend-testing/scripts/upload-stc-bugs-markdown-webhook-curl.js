/**
 * One POST (multipart/form-data) with every .md under:
 *   reports/markdown/stc
 *   reports/markdown/bugs
 * Uses curl so the payload matches n8n / manual --form 'file=@...' tests.
 *
 * Usage (from repo root):
 *   set WEBHOOK_MARKDOWN_URL=https://.../webhook/...
 *   node scripts/upload-stc-bugs-markdown-webhook-curl.js
 * Or:
 *   node scripts/upload-stc-bugs-markdown-webhook-curl.js "https://.../webhook/..."
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCAN_DIRS = [
  path.join(ROOT, 'reports', 'markdown', 'stc'),
  path.join(ROOT, 'reports', 'markdown', 'bugs'),
];

function collectMdFiles(dir, out) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      collectMdFiles(full, out);
    } else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) {
      out.push(full);
    }
  }
}

/** Paths passed to curl -F file=@... ; forward slashes avoid Windows drive-letter quirks. */
function pathForCurlForm(absPath) {
  const abs = path.resolve(absPath);
  if (process.platform === 'win32') {
    return abs.split(path.sep).join('/');
  }
  return abs;
}

function curlBinary() {
  return process.platform === 'win32' ? 'curl.exe' : 'curl';
}

function resolveWebhook() {
  const fromEnv = process.env.WEBHOOK_MARKDOWN_URL && String(process.env.WEBHOOK_MARKDOWN_URL).trim();
  if (fromEnv) return fromEnv;
  const arg = process.argv[2] && String(process.argv[2]).trim();
  if (arg && /^https?:\/\//i.test(arg)) return arg;
  return '';
}

function main() {
  const webhook = resolveWebhook();
  if (!webhook) {
    console.error('Missing webhook URL.');
    console.error('  Set WEBHOOK_MARKDOWN_URL, or pass the URL as the first argument.');
    console.error('  Example: node scripts/upload-stc-bugs-markdown-webhook-curl.js "https://host/webhook/..."');
    process.exit(1);
  }

  const files = [];
  for (const dir of SCAN_DIRS) {
    collectMdFiles(dir, files);
  }
  files.sort();

  if (!files.length) {
    console.error('No .md files found under:');
    SCAN_DIRS.forEach((d) => console.error(' ', d));
    process.exit(1);
  }

  const args = ['--location', '-sS', webhook];
  for (const f of files) {
    args.push('-F', `file=@${pathForCurlForm(f)}`);
  }

  console.log(`POST ${files.length} file(s) (multipart field "file" repeated) → ${webhook}`);
  const r = spawnSync(curlBinary(), args, { stdio: 'inherit' });
  if (r.error) {
    console.error(r.error.message);
    process.exit(1);
  }
  if (r.status !== 0) {
    process.exit(r.status ?? 1);
  }
  console.log('Done.');
}

main();
