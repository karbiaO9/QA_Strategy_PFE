/**
 * Sync Playwright stcAnnotations() metadata from the STC spec catalog.
 * Does not modify test bodies (only annotation blocks).
 */
import fs from 'fs';
import path from 'path';
import { clearStcSpecCache, getStcSpec, listStcIds, loadStcSpecCatalog } from '../utils/stc-spec-catalog';

const AUTH_SPECS_DIR = path.join(__dirname, '../tests/auth');

function escapeForTsString(value: string): string {
  return value
    .replace(/`/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'");
}

function buildAnnotationBlock(stcId: string): string {
  const spec = getStcSpec(stcId);
  if (!spec) {
    throw new Error(`Missing spec for ${stcId}`);
  }

  return [
    'annotation: stcAnnotations({',
    `        stcId: '${spec.stcId}',`,
    `        module: '${escapeForTsString(spec.module)}',`,
    `        priority: '${spec.priority}',`,
    `        testType: '${escapeForTsString(spec.testType)}',`,
    `        endpoint: '${escapeForTsString(spec.endpoint)}',`,
    '      }),',
  ].join('\n');
}

function syncFile(filePath: string): number {
  const content = fs.readFileSync(filePath, 'utf8');
  let updates = 0;

  const blockRe =
    /annotation:\s*stcAnnotations\(\{[\s\S]*?stcId:\s*'(STC-AUTH-\d{3}\/[FB])'[\s\S]*?\}\),/g;

  const next = content.replace(blockRe, (match, stcId: string) => {
    try {
      updates += 1;
      return buildAnnotationBlock(stcId);
    } catch {
      return match;
    }
  });

  if (next !== content) {
    fs.writeFileSync(filePath, next, 'utf8');
  }
  return updates;
}

function main(): void {
  clearStcSpecCache();
  loadStcSpecCatalog();
  const catalogIds = new Set(listStcIds());

  const files = fs
    .readdirSync(AUTH_SPECS_DIR)
    .filter((f) => f.endsWith('.spec.ts'))
    .map((f) => path.join(AUTH_SPECS_DIR, f));

  let total = 0;
  for (const file of files) {
    const count = syncFile(file);
    total += count;
    console.log(`${path.basename(file)}: ${count} annotation block(s) updated`);
  }

  const specFiles = files.flatMap((file) => {
    const text = fs.readFileSync(file, 'utf8');
    return [...text.matchAll(/stcId:\s*'(STC-AUTH-\d{3}\/[FB])'/g)].map((m) => m[1]);
  });

  const missingInCatalog = specFiles.filter((id) => !catalogIds.has(id));
  if (missingInCatalog.length > 0) {
    console.warn(`STC IDs in tests but not in catalog: ${missingInCatalog.join(', ')}`);
  }

  const testCounts = files.map((f) => ({
    file: path.basename(f),
    tests: (fs.readFileSync(f, 'utf8').match(/^\s+test\(/gm) ?? []).length,
  }));
  console.log('\nTest counts:', testCounts.map((t) => `${t.file}=${t.tests}`).join(', '));
  console.log(`Done. ${total} annotation block(s) synced.`);
}

main();
