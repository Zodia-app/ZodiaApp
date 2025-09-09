# ZodiaApp Test Suite

A comprehensive testing suite for all ZodiaApp features, including palm reading, astrology, compatibility system, user profiles, database operations, edge functions, and UI components.

## 🚀 Quick Start

```bash
# Run all tests
node tests/run-all-tests.js

# Run specific feature tests
node tests/run-all-tests.js palm-reading
node tests/run-all-tests.js compatibility

# Run high-priority tests only (quick mode)
node tests/run-all-tests.js --quick

# Generate HTML report
node tests/run-all-tests.js --report

# Health check (critical systems only)
node tests/run-all-tests.js --health
```

## 📋 Available Test Suites

### 1. Palm Reading Feature (`test-palm-reading.js`)
- **Priority**: High
- **Tests**: User data validation, palm image processing, AI reading generation, database storage, quality validation, error handling, performance, concurrency
- **Usage**: `node tests/test-palm-reading.js [test-name]`

### 2. Astrology Reading Feature (`test-astrology-reading.js`)
- **Priority**: High  
- **Tests**: Zodiac calculations, daily horoscopes, personalized readings, monthly reports, birth chart calculations, caching, compatibility
- **Usage**: `node tests/test-astrology-reading.js [test-name]`

### 3. Compatibility System (`test-compatibility-system.js`)
- **Priority**: High
- **Tests**: Code generation, Social Mode flow, Friend Mode flow, compatibility analysis, database operations, deep linking, error handling
- **Usage**: `node tests/test-compatibility-system.js [test-name]`

### 4. User Profile Management (`test-user-profile.js`)
- **Priority**: Medium
- **Tests**: Profile creation, updates, privacy settings, search, preferences, data portability, deletion
- **Usage**: `node tests/test-user-profile.js [test-name]`

### 5. Database Operations (`test-database-operations.js`)
- **Priority**: High
- **Tests**: Connection, table structure, CRUD operations, data integrity, performance, security, consistency, transactions, cleanup
- **Usage**: `node tests/test-database-operations.js [test-name]`

### 6. Edge Functions (`test-edge-functions.js`)
- **Priority**: High
- **Tests**: Function availability, palm reading function, astrology function, input validation, error handling, reliability, concurrency, environment, deployment
- **Usage**: `node tests/test-edge-functions.js [test-name]`

### 7. UI Components (`test-ui-components.js`)
- **Priority**: Medium
- **Tests**: Component discovery, structure validation, props/TypeScript, styling, event handling, accessibility, performance, testing setup
- **Usage**: `node tests/test-ui-components.js [test-name]`

## 🎯 Test Commands

### Master Test Runner
```bash
# Run all tests with detailed reporting
node tests/run-all-tests.js --report --verbose

# Run specific features
node tests/run-all-tests.js --feature palm-reading --feature database

# Quick smoke test (high-priority only)
node tests/run-all-tests.js --quick

# Health check for critical systems
node tests/run-all-tests.js --health
```

### Individual Test Suites
Each test suite supports these commands:

```bash
# Run all tests for the feature
node tests/test-[feature].js

# Run specific test
node tests/test-[feature].js [test-name]

# Show available tests
node tests/test-[feature].js help
```

#### Example Test Names:
- **Palm Reading**: `data`, `images`, `generate`, `storage`, `quality`, `errors`, `performance`, `concurrent`
- **Astrology**: `zodiac`, `daily`, `reading`, `monthly`, `chart`, `cache`, `compatibility`
- **Compatibility**: `codes`, `social`, `friend`, `analysis`, `database`, `deeplink`, `errors`
- **User Profile**: `create`, `update`, `privacy`, `search`, `preferences`, `export`, `delete`
- **Database**: `connection`, `structure`, `users`, `readings`, `integrity`, `performance`, `security`
- **Edge Functions**: `availability`, `palm`, `astrology`, `validation`, `errors`, `reliability`, `concurrency`
- **UI Components**: `discovery`, `structure`, `props`, `styling`, `events`, `accessibility`, `performance`

## 📊 Test Reports

### Console Output
All tests provide detailed console output with:
- ✅ Passed tests
- ❌ Failed tests with error details
- ⚠️ Warnings and recommendations
- 📊 Summary statistics
- 💡 Performance insights

### HTML Reports
Generate beautiful HTML reports with:
```bash
node tests/run-all-tests.js --report
```

The report includes:
- Executive summary with success rates
- Feature-by-feature breakdown
- Error details and recommendations
- Performance metrics
- Visual charts and graphs

## 🔧 Configuration

### Environment Setup
Make sure you have the required environment variables:
```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Dependencies
The test suite uses:
- Supabase JavaScript client
- Node.js built-in modules (fs, path, crypto)
- No external testing frameworks required

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   node tests/test-database-operations.js connection
   ```

2. **Edge Function Not Found**
   ```bash
   node tests/test-edge-functions.js availability
   ```

3. **Component Analysis Errors**
   ```bash
   node tests/test-ui-components.js discovery
   ```

### Performance Issues
If tests are running slowly:
- Use `--quick` mode for faster feedback
- Run individual test suites instead of all tests
- Check network connectivity for edge function tests

### Test Data Cleanup
Tests automatically clean up their data, but you can manually verify:
- Database test records are removed
- Generated compatibility codes are tracked
- No permanent changes are made to your data

## 🎯 Best Practices

### Running Tests Regularly
1. **Before commits**: `node tests/run-all-tests.js --quick`
2. **Before releases**: `node tests/run-all-tests.js --report`
3. **Daily health check**: `node tests/run-all-tests.js --health`

### Interpreting Results
- **Green tests**: Features working correctly
- **Yellow warnings**: Areas for improvement  
- **Red failures**: Issues requiring immediate attention
- **Performance metrics**: Response times and optimization opportunities

### Adding New Tests
To add tests for new features:
1. Create new test file following existing patterns
2. Add to master test runner in `run-all-tests.js`
3. Update this README with the new test suite

## 🤝 Contributing

When adding new features:
1. Create comprehensive tests covering all functionality
2. Include both happy path and error scenarios
3. Add performance and security validation
4. Update documentation

## 📞 Support

If you encounter issues with the test suite:
1. Check the console output for detailed error messages
2. Run individual test suites to isolate issues
3. Generate an HTML report for comprehensive analysis
4. Verify your environment configuration

---

*This test suite was created to ensure ZodiaApp maintains high quality and reliability across all features. Run tests regularly to catch issues early and maintain a great user experience! 🔮✨*