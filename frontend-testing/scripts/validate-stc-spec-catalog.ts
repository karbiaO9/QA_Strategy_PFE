import {
  loadStcSpecCatalog,
  resolveStcSpecPath,
} from '../utils/stc-spec-catalog';

const EXPECTED_STC_COUNT = 28;

function main(): void {
  const specPath = resolveStcSpecPath();
  const catalog = loadStcSpecCatalog(specPath);
  const ids = [...catalog.keys()].filter((id) => id.includes('/'));

  console.log(`STC spec: ${specPath}`);
  console.log(`Parsed ${ids.length} test case(s).`);

  if (ids.length < EXPECTED_STC_COUNT) {
    console.error(`Expected at least ${EXPECTED_STC_COUNT} STCs, found ${ids.length}.`);
    process.exit(1);
  }

  const sample = catalog.get('STC-AUTH-001/F');
  if (!sample || sample.steps.length < 5) {
    console.error('STC-AUTH-001/F missing or has too few steps.');
    process.exit(1);
  }

  console.log(`Sample: ${sample.stcId} — ${sample.steps.length} steps, title: ${sample.title.slice(0, 60)}…`);
  console.log('STC spec catalog OK.');
}

main();
