const http = require('http');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const RAW_ENDPOINTS = process.env.ENDPOINTS || '';

function loadEndpoints() {
  if (!RAW_ENDPOINTS.trim()) {
    return [
      ['GET', '/health', 'Health check']
    ];
  }

  return RAW_ENDPOINTS
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((endpoint, index) => ['GET', endpoint, `Endpoint ${index + 1}`]);
}

function request(method, routePath) {
  const url = new URL(routePath, BASE);
  const isHttps = url.protocol === 'https:';
  const transport = isHttps ? require('https') : http;

  return new Promise((resolve, reject) => {
    const req = transport.request(
      {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method
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
    req.end();
  });
}

async function run() {
  const tests = loadEndpoints();
  console.log('Testing base:', BASE);
  console.log('Endpoints:', tests.map(([, path]) => path).join(', '));
  console.log('');

  let ok = 0;
  let fail = 0;

  for (const [method, routePath, name] of tests) {
    try {
      const { status } = await request(method, routePath);
      const success = status >= 200 && status < 300;
      if (success) ok++;
      else fail++;
      console.log(`${success ? 'PASS' : 'FAIL'} ${status} ${name} ${routePath}`);
    } catch (err) {
      fail++;
      console.log(`FAIL ERR ${name} ${routePath} ${err.message}`);
    }
  }

  console.log('');
  console.log(`Done: ${ok} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
}

run();
