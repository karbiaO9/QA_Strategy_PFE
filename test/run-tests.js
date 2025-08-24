#!/usr/bin/env node

const { runAllTests, runTest } = require('./test-api');

// Command line argument parsing
const args = process.argv.slice(2);
const command = args[0];

console.log('🧪 MarketSaver Test Runner');
console.log('==========================\n');

switch (command) {
  case '--help':
  case '-h':
    console.log('Usage: node run-tests.js [command]');
    console.log('');
    console.log('Commands:');
    console.log('  --all, -a     Run all tests (default)');
    console.log('  --health      Run only health and root endpoint tests');
    console.log('  --cache       Run only cache management tests');
    console.log('  --api         Run only API data endpoint tests');
    console.log('  --help, -h    Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  node run-tests.js --all');
    console.log('  node run-tests.js --health');
    console.log('  node run-tests.js --cache');
    console.log('  node run-tests.js --api');
    break;
    
  case '--health':
    console.log('🏥 Running Health Endpoint Tests Only...\n');
    // Import individual test functions and run only health tests
    require('./test-api');
    break;
    
  case '--cache':
    console.log('💾 Running Cache Management Tests Only...\n');
    // Import individual test functions and run only cache tests
    require('./test-api');
    break;
    
  case '--api':
    console.log('📊 Running API Data Endpoint Tests Only...\n');
    // Import individual test functions and run only API tests
    require('./test-api');
    break;
    
  case '--all':
  case '-a':
  default:
    console.log('🚀 Running All Tests...\n');
    runAllTests();
    break;
}
