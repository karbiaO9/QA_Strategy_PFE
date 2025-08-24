#!/usr/bin/env node

/**
 * Performance Test Script for MarketSaver Server
 * Tests the optimized endpoints under various load conditions
 */

const autocannon = require('autocannon');

const BASE_URL = process.env.TEST_URL || 'http://localhost:5055';

async function runPerformanceTest() {
  console.log('🚀 Starting Performance Tests for MarketSaver Server');
  console.log(`📍 Testing against: ${BASE_URL}`);
  console.log('═'.repeat(60));
  
  const tests = [
    {
      name: 'Health Check (Baseline)',
      url: `${BASE_URL}/health`,
      connections: 100,
      duration: 10
    },
    {
      name: 'Performance Endpoint',
      url: `${BASE_URL}/perf`,
      connections: 100,
      duration: 10
    },
    {
      name: 'Exchanges API (Light Load)',
      url: `${BASE_URL}/api/exchanges`,
      connections: 50,
      duration: 15
    },
    {
      name: 'Exchanges API (Medium Load)',
      url: `${BASE_URL}/api/exchanges`,
      connections: 200,
      duration: 20
    },
    {
      name: 'Exchanges API (High Load)',
      url: `${BASE_URL}/api/exchanges`,
      connections: 500,
      duration: 30
    }
  ];
  
  for (const test of tests) {
    console.log(`\n📊 Running: ${test.name}`);
    console.log(`🔗 URL: ${test.url}`);
    console.log(`👥 Connections: ${test.connections}`);
    console.log(`⏱️  Duration: ${test.duration}s`);
    console.log('─'.repeat(40));
    
    try {
      const result = await autocannon({
        url: test.url,
        connections: test.connections,
        duration: test.duration,
        timeout: 10,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MarketSaver-Performance-Test'
        }
      });
      
      console.log(`✅ Test completed: ${test.name}`);
      console.log(`📈 Average Latency: ${(result.latency.average / 1000).toFixed(2)}s`);
      console.log(`🚀 Requests/sec: ${result.requests.average.toFixed(2)}`);
      console.log(`📊 2.5% Latency: ${(result.latency.p2_5 / 1000).toFixed(2)}s`);
      console.log(`📊 97.5% Latency: ${(result.latency.p97_5 / 1000).toFixed(2)}s`);
      console.log(`❌ Errors: ${result.errors}`);
      console.log(`⏱️  Timeouts: ${result.timeouts}`);
      
    } catch (error) {
      console.error(`❌ Test failed: ${test.name}`, error.message);
    }
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🎯 Performance Test Suite Completed');
  console.log('═'.repeat(60));
}

// Handle command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node performance-test.js [options]

Options:
  --url <url>     Test URL (default: http://localhost:5050)
  --help, -h      Show this help message

Environment Variables:
  TEST_URL        Test URL (overrides --url argument)

Examples:
  node performance-test.js
  node performance-test.js --url https://your-server.com
  TEST_URL=https://your-server.com node performance-test.js
    `);
    process.exit(0);
  }
  
  const urlIndex = args.indexOf('--url');
  if (urlIndex !== -1 && args[urlIndex + 1]) {
    process.env.TEST_URL = args[urlIndex + 1];
  }
  
  runPerformanceTest().catch(console.error);
}

module.exports = { runPerformanceTest };
