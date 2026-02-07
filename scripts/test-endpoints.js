const http = require('http');

const BASE = process.env.BASE_URL || 'http://localhost:5051';

function request(method, path, body = null) {
  const url = new URL(path, BASE);
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port || 80,
        path: url.pathname + url.search,
        method,
        headers: body ? { 'Content-Type': 'application/json' } : {}
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null });
          } catch {
            resolve({ status: res.statusCode, data });
          }
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const get = (path) => request('GET', path);

async function run() {
  console.log('Testing base:', BASE);
  console.log('');

  const tests = [
    ['GET', '/', 'Root'],
    ['GET', '/health', 'Health'],
    ['GET', '/health/detailed', 'Health detailed'],
    ['GET', '/health/cache-ready', 'Health cache-ready'],
    ['GET', '/cache/stats', 'Cache stats'],
    ['GET', '/cache/health', 'Cache health'],
    ['GET', '/cache/status', 'Cache status'],
    ['GET', '/cache/service', 'Cache service'],
    ['GET', '/api/market-data', 'API market-data'],
    ['GET', '/api/news', 'API news'],
    ['GET', '/api/trending-coins', 'API trending-coins'],
    ['GET', '/api/top-gainers', 'API top-gainers'],
    ['GET', '/api/top-coins', 'API top-coins'],
    ['GET', '/api/top-market-coins', 'API top-market-coins'],
    ['GET', '/api/exchanges', 'API exchanges']
  ];

  let ok = 0;
  let fail = 0;

  for (const [method, path, name] of tests) {
    try {
      const { status, data } = await get(path);
      const success = status >= 200 && status < 300;
      if (success) ok++;
      else fail++;
      const symbol = success ? '✓' : '✗';
      const total = data?.data?.length ?? data?.total ?? data?.cache?.total ?? '-';
      console.log(`${symbol} ${status} ${name.padEnd(22)} ${path} ${typeof total === 'number' ? `(${total})` : ''}`);
    } catch (err) {
      fail++;
      console.log(`✗ ERR ${name.padEnd(22)} ${path}  ${err.message}`);
    }
  }

  console.log('');
  console.log(`Done: ${ok} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
}

run();
