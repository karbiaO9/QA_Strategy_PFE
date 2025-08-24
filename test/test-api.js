const axios = require('axios');

// Base URL for the API
const BASE_URL = 'http://localhost:5055';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Helper function to log test results
function logTest(testName, success, details = '') {
  totalTests++;
  if (success) {
    passedTests++;
    console.log(`${colors.green}✓${colors.reset} ${testName}`);
  } else {
    failedTests++;
    console.log(`${colors.red}✗${colors.reset} ${testName}`);
    if (details) {
      console.log(`  ${colors.red}${details}${colors.reset}`);
    }
  }
}

// Helper function to make API requests
async function testEndpoint(endpoint, description, expectedStatus = 200) {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`);
    const success = response.status === expectedStatus;
    logTest(description, success);
    
    if (success) {
      console.log(`  ${colors.cyan}Status:${colors.reset} ${response.status}`);
      console.log(`  ${colors.cyan}Response:${colors.reset} ${response.data.success ? 'Success' : 'Failed'}`);
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`  ${colors.cyan}Data Count:${colors.reset} ${response.data.data.length}`);
      }
      if (response.data.pagination) {
        console.log(`  ${colors.cyan}Pagination:${colors.reset} Page ${response.data.pagination.page} of ${response.data.pagination.pages}`);
      }
    }
    
    return success;
  } catch (error) {
    const errorMessage = error.response ? 
      `Status: ${error.response.status}, Message: ${error.response.data?.message || error.message}` :
      error.message;
    logTest(description, false, errorMessage);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log(`${colors.bright}${colors.blue}🚀 MarketSaver API Testing - Simplified Endpoints${colors.reset}\n`);
  console.log(`${colors.yellow}Testing simplified endpoints that fetch all data from database tables...${colors.reset}\n`);

  // Test server health
  console.log(`${colors.bright}${colors.cyan}=== Server Health Tests ===${colors.reset}`);
  await testEndpoint('/health', 'Server health check');
  await testEndpoint('/health/performance', 'Performance health check');
  
  // Test cache endpoints
  console.log(`\n${colors.bright}${colors.cyan}=== Cache Management Tests ===${colors.reset}`);
  await testEndpoint('/cache/stats', 'Cache statistics');
  await testEndpoint('/cache/health', 'Cache health check');
  
  // Test main API endpoints
  console.log(`\n${colors.bright}${colors.cyan}=== Main API Endpoints Tests ===${colors.reset}`);
  await testEndpoint('/api/market-data', 'Get all market data');
  await testEndpoint('/api/news', 'Get all news');
  await testEndpoint('/api/trending-coins', 'Get all trending coins');
  await testEndpoint('/api/top-gainers', 'Get all top gainers');
  await testEndpoint('/api/top-coins', 'Get all top coins');
  await testEndpoint('/api/top-market-coins', 'Get all top market coins');
  await testEndpoint('/api/exchanges', 'Get all exchanges');
  
  // Test API info endpoint
  console.log(`\n${colors.bright}${colors.cyan}=== API Info Tests ===${colors.reset}`);
  await testEndpoint('/api', 'API information endpoint');
  
  // Test pagination and parameters
  console.log(`\n${colors.bright}${colors.cyan}=== Pagination and Parameter Tests ===${colors.reset}`);
  await testEndpoint('/api/market-data?page=1&limit=5', 'Market data with pagination (page 1, limit 5)');
  await testEndpoint('/api/news?page=2&limit=10', 'News with pagination (page 2, limit 10)');
  await testEndpoint('/api/exchanges?sortBy=trustScoreRank&sortOrder=asc', 'Exchanges with sorting');
  
  // Test root endpoint
  console.log(`\n${colors.bright}${colors.cyan}=== Root Endpoint Tests ===${colors.reset}`);
  await testEndpoint('/', 'Root endpoint with server information');

  // Print summary
  console.log(`\n${colors.bright}${colors.blue}=== Test Summary ===${colors.reset}`);
  console.log(`Total Tests: ${totalTests}`);
  console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
  
  if (failedTests === 0) {
    console.log(`\n${colors.bright}${colors.green}🎉 All tests passed! The simplified API is working correctly.${colors.reset}`);
  } else {
    console.log(`\n${colors.bright}${colors.red}❌ Some tests failed. Please check the errors above.${colors.reset}`);
  }
  
  console.log(`\n${colors.yellow}Note: This simplified API now only provides main endpoints for each table with smart caching and pagination.${colors.reset}`);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error(`${colors.red}Test execution failed:${colors.reset}`, error.message);
    process.exit(1);
  });
}

module.exports = { runTests, testEndpoint };
