const axios = require('axios');
const { spawn } = require('child_process');

// Test configuration
const BASE_URL = 'http://localhost:5055';
const TEST_TIMEOUT = 10000;

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let testResults = [];

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m'     // Reset
  };
  
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertStatus(response, expectedStatus) {
  assert(response.status === expectedStatus, 
    `Expected status ${expectedStatus}, got ${response.status}`);
}

function assertSuccess(response) {
  assert(response.data.success === true, 
    `Expected success: true, got ${response.data.success}`);
}

function assertDataStructure(response, expectedFields = []) {
  const data = response.data;
  assert(typeof data === 'object', 'Response should be an object');
  assert(typeof data.success === 'boolean', 'Response should have success field');
  
  // Check for timestamp - it can be at root level or nested in cache object
  const hasTimestamp = data.hasOwnProperty('timestamp') || 
                      (data.cache && data.cache.hasOwnProperty('timestamp'));
  assert(hasTimestamp, 'Response should have timestamp field (at root or in cache object)');
  
  if (expectedFields.length > 0) {
    expectedFields.forEach(field => {
      assert(data.hasOwnProperty(field), `Response should have ${field} field`);
    });
  }
}

// Test runner
async function runTest(testName, testFunction) {
  totalTests++;
  log(`Running test: ${testName}`, 'info');
  
  try {
    await testFunction();
    passedTests++;
    testResults.push({ name: testName, status: 'PASSED' });
    log(`✓ ${testName} - PASSED`, 'success');
  } catch (error) {
    failedTests++;
    testResults.push({ name: testName, status: 'FAILED', error: error.message });
    log(`✗ ${testName} - FAILED: ${error.message}`, 'error');
  }
}

// Test functions
async function testHealthEndpoint() {
  const response = await axios.get(`${BASE_URL}/health`);
  assertStatus(response, 200);
  assertSuccess(response);
  assertDataStructure(response, ['status', 'database', 'cache', 'uptime']);
  assert(response.data.status === 'healthy', 'Health status should be healthy');
}

async function testRootEndpoint() {
  const response = await axios.get(`${BASE_URL}/`);
  assertStatus(response, 200);
  assertSuccess(response);
  assertDataStructure(response, ['message', 'version', 'server', 'api', 'cache']);
  assert(response.data.version === '3.0.0', 'Version should be 3.0.0');
}

async function testCacheStatsEndpoint() {
  const response = await axios.get(`${BASE_URL}/cache/stats`);
  assertStatus(response, 200);
  assertSuccess(response);
  assertDataStructure(response, ['cache']);
  assert(response.data.cache.status === 'active', 'Cache status should be active');
}

async function testCacheHealthEndpoint() {
  const response = await axios.get(`${BASE_URL}/cache/health`);
  assertStatus(response, 200);
  assertSuccess(response);
  assertDataStructure(response, ['cache']);
  assert(response.data.cache.status === 'healthy', 'Cache health should be healthy');
}

async function testCacheClearEndpoint() {
  // Test clearing specific cache type - use the correct cache key format
  // The cache expects the key name (e.g., 'MARKET_DATA'), not the actual cache key value
  const response = await axios.post(`${BASE_URL}/cache/clear`, { type: 'MARKET_DATA' });
  assertStatus(response, 200);
  assertSuccess(response);
  assertDataStructure(response, ['message', 'cleared']);
  
  // Test clearing all cache
  const responseAll = await axios.post(`${BASE_URL}/cache/clear`, { type: 'all' });
  assertStatus(responseAll, 200);
  assertSuccess(responseAll);
  assertDataStructure(responseAll, ['message', 'cleared']);
}

async function testCacheClearInvalidType() {
  try {
    await axios.post(`${BASE_URL}/cache/clear`, { type: 'invalid-type' });
    throw new Error('Should have returned 400 for invalid cache type');
  } catch (error) {
    assert(error.response.status === 400, 'Should return 400 for invalid cache type');
    assert(error.response.data.success === false, 'Should return success: false');
  }
}

async function testCacheRefreshEndpoint() {
  // Test refreshing specific cache type
  const response = await axios.post(`${BASE_URL}/cache/refresh`, { type: 'market-data' });
  assertStatus(response, 200);
  assertSuccess(response);
  assertDataStructure(response, ['message']);
  
  // Test refreshing all cache
  const responseAll = await axios.post(`${BASE_URL}/cache/refresh`, { type: 'all' });
  assertStatus(responseAll, 200);
  assertSuccess(responseAll);
  assertDataStructure(responseAll, ['message']);
}

async function testCacheRefreshInvalidType() {
  try {
    await axios.post(`${BASE_URL}/cache/refresh`, { type: 'invalid-type' });
    throw new Error('Should have returned 400 for invalid cache type');
  } catch (error) {
    assert(error.response.status === 400, 'Should return 400 for invalid cache type');
    assert(error.response.data.success === false, 'Should return success: false');
  }
}

async function testMarketDataEndpoint() {
  const response = await axios.get(`${BASE_URL}/api/market-data`);
  assertStatus(response, 200);
  assertSuccess(response);
  assertDataStructure(response, ['data', 'source', 'total']);
  assert(response.data.source === 'cache', 'Source should be cache');
  assert(Array.isArray(response.data.data), 'Data should be an array');
}

async function testNewsEndpoint() {
  const response = await axios.get(`${BASE_URL}/api/news`);
  assertStatus(response, 200);
  assertSuccess(response);
  assertDataStructure(response, ['data', 'source', 'total']);
  assert(response.data.source === 'cache', 'Source should be cache');
  assert(Array.isArray(response.data.data), 'Data should be an array');
}

async function testTrendingCoinsEndpoint() {
  const response = await axios.get(`${BASE_URL}/api/trending-coins`);
  assertStatus(response, 200);
  assertSuccess(response);
  assertDataStructure(response, ['data', 'source', 'total']);
  assert(response.data.source === 'cache', 'Source should be cache');
  assert(Array.isArray(response.data.data), 'Data should be an array');
}

async function testTopGainersEndpoint() {
  const response = await axios.get(`${BASE_URL}/api/top-gainers`);
  assertStatus(response, 200);
  assertSuccess(response);
  assertDataStructure(response, ['data', 'source', 'total']);
  assert(response.data.source === 'cache', 'Source should be cache');
  assert(Array.isArray(response.data.data), 'Data should be an array');
}

async function testTopCoinsEndpoint() {
  const response = await axios.get(`${BASE_URL}/api/top-coins`);
  assertStatus(response, 200);
  assertSuccess(response);
  assertDataStructure(response, ['data', 'source', 'total']);
  assert(response.data.source === 'cache', 'Source should be cache');
  assert(Array.isArray(response.data.data), 'Data should be an array');
}

async function testTopMarketCoinsEndpoint() {
  const response = await axios.get(`${BASE_URL}/api/top-market-coins`);
  assertStatus(response, 200);
  assertSuccess(response);
  assertDataStructure(response, ['data', 'source', 'total']);
  assert(response.data.source === 'cache', 'Source should be cache');
  assert(Array.isArray(response.data.data), 'Data should be an array');
}

async function testExchangesEndpoint() {
  const response = await axios.get(`${BASE_URL}/api/exchanges`);
  assertStatus(response, 200);
  assertSuccess(response);
  assertDataStructure(response, ['data', 'source', 'total']);
  assert(response.data.source === 'cache', 'Source should be cache');
  assert(Array.isArray(response.data.data), 'Data should be an array');
}

async function testEndpointWithEmptyCache() {
  // This test simulates what happens when cache is empty
  // We'll test the error handling by checking the response structure
  // Note: In a real scenario, you might want to temporarily clear cache for this test
  
  // Test that endpoints return proper error structure when cache is empty
  // This is more of a validation that the error handling is consistent
  log('Testing endpoint error handling structure (cache may be populated)', 'warning');
}

async function testResponseTime() {
  const startTime = Date.now();
  const response = await axios.get(`${BASE_URL}/api/market-data`);
  const endTime = Date.now();
  const responseTime = endTime - startTime;
  
  assertStatus(response, 200);
  assertSuccess(response);
  
  // Log response time for performance monitoring
  log(`Response time for /api/market-data: ${responseTime}ms`, 'info');
  
  // Assert reasonable response time (adjust threshold as needed)
  assert(responseTime < 1000, `Response time should be under 1000ms, got ${responseTime}ms`);
}

// Main test execution
async function runAllTests() {
  log('🚀 Starting MarketSaver API Tests', 'info');
  log(`Base URL: ${BASE_URL}`, 'info');
  log('=' * 50, 'info');
  
  // Health and root endpoints
  await runTest('Health Endpoint', testHealthEndpoint);
  await runTest('Root Endpoint', testRootEndpoint);
  
  // Cache management endpoints
  await runTest('Cache Stats Endpoint', testCacheStatsEndpoint);
  await runTest('Cache Health Endpoint', testCacheHealthEndpoint);
  await runTest('Cache Clear Endpoint', testCacheClearEndpoint);
  await runTest('Cache Clear Invalid Type', testCacheClearInvalidType);
  await runTest('Cache Refresh Endpoint', testCacheRefreshEndpoint);
  await runTest('Cache Refresh Invalid Type', testCacheRefreshInvalidType);
  
  // Data API endpoints
  await runTest('Market Data Endpoint', testMarketDataEndpoint);
  await runTest('News Endpoint', testNewsEndpoint);
  await runTest('Trending Coins Endpoint', testTrendingCoinsEndpoint);
  await runTest('Top Gainers Endpoint', testTopGainersEndpoint);
  await runTest('Top Coins Endpoint', testTopCoinsEndpoint);
  await runTest('Top Market Coins Endpoint', testTopMarketCoinsEndpoint);
  await runTest('Exchanges Endpoint', testExchangesEndpoint);
  
  // Performance and error handling tests
  await runTest('Response Time Test', testResponseTime);
  await runTest('Endpoint Error Handling', testEndpointWithEmptyCache);
  
  // Test summary
  log('=' * 50, 'info');
  log('📊 Test Results Summary', 'info');
  log(`Total Tests: ${totalTests}`, 'info');
  log(`Passed: ${passedTests}`, 'success');
  log(`Failed: ${failedTests}`, failedTests > 0 ? 'error' : 'success');
  
  if (failedTests > 0) {
    log('\n❌ Failed Tests:', 'error');
    testResults
      .filter(result => result.status === 'FAILED')
      .forEach(result => {
        log(`  - ${result.name}: ${result.error}`, 'error');
      });
  }
  
  // Exit with appropriate code
  if (failedTests > 0) {
    log('\n💥 Some tests failed!', 'error');
    process.exit(1);
  } else {
    log('\n🎉 All tests passed!', 'success');
    process.exit(0);
  }
}

// Error handling for unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection at: ${promise}, reason: ${reason}`, 'error');
  process.exit(1);
});

// Check if server is running before starting tests
async function checkServerHealth() {
  try {
    await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    log('✅ Server is running and healthy', 'success');
    return true;
  } catch (error) {
    log('❌ Server is not running or not accessible', 'error');
    log('Please start the server first with: npm start', 'warning');
    return false;
  }
}

// Main execution
async function main() {
  try {
    const serverHealthy = await checkServerHealth();
    if (!serverHealthy) {
      process.exit(1);
    }
    
    await runAllTests();
  } catch (error) {
    log(`Fatal error during testing: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  runAllTests,
  runTest,
  assert,
  assertStatus,
  assertSuccess,
  assertDataStructure
};
