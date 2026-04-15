const fs = require('fs');

function generateNewmanMarkdown(inputPath = 'reports/newman-report.json', outputPath = 'reports/newman-report.md') {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Missing Newman JSON report at ${inputPath}`);
  }

  const report = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const run = report.run || {};
  const stats = run.stats || {};
  const timings = run.timings || {};
  const executions = Array.isArray(run.executions) ? run.executions : [];
  const failures = Array.isArray(run.failures) ? run.failures : [];

  const total = (key) => stats[key]?.total ?? 0;
  const failed = (key) => stats[key]?.failed ?? 0;
  const skipped = (key) => stats[key]?.pending ?? 0;
  const toUrl = (url) => {
    if (!url) return 'N/A';
    if (typeof url === 'string') return url;
    if (typeof url.toString === 'function') return url.toString();
    return JSON.stringify(url);
  };

  const startedMs = timings.started ? new Date(timings.started).getTime() : null;
  const completedMs = timings.completed ? new Date(timings.completed).getTime() : null;
  const durationMs = Number.isFinite(startedMs) && Number.isFinite(completedMs) ? completedMs - startedMs : 'N/A';

  const lines = [];
  lines.push('# Newman Test Report');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- **Collection:** ${report.collection?.name ?? 'N/A'}`);
  lines.push(`- **Started At:** ${timings.started ?? 'N/A'}`);
  lines.push(`- **Completed At:** ${timings.completed ?? 'N/A'}`);
  lines.push(`- **Run Duration (ms):** ${durationMs}`);
  lines.push(`- **Total Requests:** ${total('requests')} (failed: ${failed('requests')})`);
  lines.push(`- **Total Test Scripts:** ${total('tests')} (failed: ${failed('tests')})`);
  lines.push(`- **Total Assertions:** ${total('assertions')} (failed: ${failed('assertions')}, skipped: ${skipped('assertions')})`);
  lines.push('');

  lines.push('## Failures');
  lines.push('');
  if (failures.length === 0) {
    lines.push('- None');
  } else {
    failures.forEach((failure, index) => {
      const source = failure.source || {};
      const err = failure.error || {};
      lines.push(`${index + 1}. **${source.name || 'Unknown request'}**`);
      if (source.test) lines.push(`   - Test: \`${source.test}\``);
      lines.push(`   - Message: ${err.message || 'N/A'}`);
    });
  }
  lines.push('');

  lines.push('## Request Executions');
  lines.push('');
  executions.forEach((execution, index) => {
    const itemName = execution.item?.name || 'Unnamed request';
    const method = execution.request?.method || 'N/A';
    const url = toUrl(execution.request?.url);
    const statusCode = execution.response?.code ?? 'N/A';
    const statusText = execution.response?.status ?? 'N/A';
    const responseTime = execution.response?.responseTime ?? 'N/A';
    const responseSize = execution.response?.responseSize ?? 'N/A';
    const assertionCount = Array.isArray(execution.assertions) ? execution.assertions.length : 0;

    lines.push(`### ${index + 1}. ${itemName}`);
    lines.push('');
    lines.push(`- Method: \`${method}\``);
    lines.push(`- URL: ${url}`);
    lines.push(`- Response: ${statusCode} ${statusText}`);
    lines.push(`- Response Time (ms): ${responseTime}`);
    lines.push(`- Response Size (bytes): ${responseSize}`);
    lines.push(`- Assertions in execution: ${assertionCount}`);
    lines.push('');
  });

  fs.writeFileSync(outputPath, `${lines.join('\n')}\n`);
}

if (require.main === module) {
  const inputPath = process.argv[2] || 'reports/newman-report.json';
  const outputPath = process.argv[3] || 'reports/newman-report.md';
  generateNewmanMarkdown(inputPath, outputPath);
}

module.exports = { generateNewmanMarkdown };
