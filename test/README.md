# MarketSaver API Tests

This directory contains comprehensive tests for all MarketSaver API endpoints.

## Test Coverage

### Health & Root Endpoints
- `GET /health` - Server health check
- `GET /` - Root endpoint with API information

### Cache Management Endpoints
- `GET /cache/stats` - Cache statistics and performance metrics
- `GET /cache/health` - Cache health status
- `POST /cache/clear` - Clear specific or all cache
- `POST /cache/refresh` - Force refresh cache from database

### Data API Endpoints
- `GET /api/market-data` - Market data from cache
- `GET /api/news` - News data from cache
- `GET /api/trending-coins` - Trending coins from cache
- `GET /api/top-gainers` - Top gainers from cache
- `GET /api/top-coins` - Top coins from cache
- `GET /api/top-market-coins` - Top market coins from cache
- `GET /api/exchanges` - Exchange data from cache

## Running Tests

### Prerequisites
1. Make sure the server is running: `npm start`
2. Ensure the server is accessible at `http://localhost:5050`

### Run All Tests
```bash
npm test
```

### Run Tests Manually
```bash
node test/test-api.js
```

## Test Features

- **Comprehensive Coverage**: Tests all endpoints with proper assertions
- **Error Handling**: Tests both success and error scenarios
- **Performance Testing**: Measures response times
- **Data Validation**: Verifies response structure and data types
- **Colored Output**: Easy-to-read test results with color coding
- **Detailed Reporting**: Shows passed/failed tests with error details

## Test Structure

Each test validates:
- HTTP status codes
- Response structure
- Data types and formats
- Business logic requirements
- Error handling

## Troubleshooting

### Common Issues

1. **Server Not Running**: Make sure to start the server with `npm start`
2. **Port Conflicts**: Default port is 5050, check if it's available
3. **Cache Empty**: Some tests may fail if cache is not populated
4. **Database Connection**: Ensure database is accessible for cache population

### Test Output

- ✅ Green: Tests passed
- ❌ Red: Tests failed with error details
- 🔵 Cyan: Informational messages
- 🟡 Yellow: Warnings

## Adding New Tests

To add tests for new endpoints:

1. Create a new test function following the naming convention `test[EndpointName]()`
2. Add the test to the `runAllTests()` function
3. Use the provided assertion helpers:
   - `assertStatus(response, expectedStatus)`
   - `assertSuccess(response)`
   - `assertDataStructure(response, expectedFields)`

## Dependencies

- `axios`: HTTP client for API requests
- Built-in Node.js modules: `child_process`, `process`
