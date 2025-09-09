/**
 * Master Test Runner for ZodiaApp
 * Orchestrates all feature tests and provides comprehensive reporting
 * 
 * Usage:
 * node tests/run-all-tests.js                    # Run all tests
 * node tests/run-all-tests.js --feature palm     # Run specific feature tests
 * node tests/run-all-tests.js --quick            # Run quick test suite
 * node tests/run-all-tests.js --report           # Generate detailed report
 */

const { PalmReadingTester } = require('./test-palm-reading');
const { AstrologyReadingTester } = require('./test-astrology-reading');
const { CompatibilitySystemTester } = require('./test-compatibility-system');
const { UserProfileTester } = require('./test-user-profile');
const { DatabaseOperationsTester } = require('./test-database-operations');
const { EdgeFunctionsTester } = require('./test-edge-functions');
const { UIComponentsTester } = require('./test-ui-components');
const fs = require('fs').promises;
const path = require('path');

class MasterTestRunner {
  constructor() {
    this.results = {
      startTime: null,
      endTime: null,
      duration: 0,
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0,
      features: {},
      summary: {},
      errors: [],
      warnings: []
    };

    this.testers = {
      'palm-reading': { 
        class: PalmReadingTester, 
        name: 'Palm Reading', 
        priority: 'high',
        description: 'Tests palm reading generation and validation'
      },
      'astrology': { 
        class: AstrologyReadingTester, 
        name: 'Astrology Reading', 
        priority: 'high',
        description: 'Tests astrology readings and horoscopes'
      },
      'compatibility': { 
        class: CompatibilitySystemTester, 
        name: 'Compatibility System', 
        priority: 'high',
        description: 'Tests Social Mode and Friend Mode compatibility'
      },
      'user-profile': { 
        class: UserProfileTester, 
        name: 'User Profile Management', 
        priority: 'medium',
        description: 'Tests user profiles and preferences'
      },
      'database': { 
        class: DatabaseOperationsTester, 
        name: 'Database Operations', 
        priority: 'high',
        description: 'Tests database connectivity and operations'
      },
      'edge-functions': { 
        class: EdgeFunctionsTester, 
        name: 'Edge Functions', 
        priority: 'high',
        description: 'Tests Supabase Edge Functions'
      },
      'ui-components': { 
        class: UIComponentsTester, 
        name: 'UI Components', 
        priority: 'medium',
        description: 'Tests React Native UI components'
      }
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().substring(11, 19);
    const prefix = {
      'error': '❌',
      'success': '✅',
      'warn': '⚠️',
      'info': 'ℹ️',
      'header': '🚀',
      'summary': '📊'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  // Parse command line arguments
  parseArgs() {
    const args = process.argv.slice(2);
    const options = {
      features: [],
      quick: false,
      report: false,
      verbose: false,
      help: false
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      switch (arg) {
        case '--feature':
          if (i + 1 < args.length) {
            options.features.push(args[++i]);
          }
          break;
        case '--quick':
          options.quick = true;
          break;
        case '--report':
          options.report = true;
          break;
        case '--verbose':
          options.verbose = true;
          break;
        case '--help':
        case '-h':
          options.help = true;
          break;
        default:
          if (!arg.startsWith('--')) {
            options.features.push(arg);
          }
      }
    }

    return options;
  }

  // Show help information
  showHelp() {
    console.log(`
🧪 ZodiaApp Master Test Runner

Usage:
  node tests/run-all-tests.js [options] [features...]

Options:
  --feature <name>  Run specific feature tests
  --quick          Run only high-priority tests
  --report         Generate detailed HTML report
  --verbose        Show detailed output
  --help, -h       Show this help message

Available Features:
${Object.entries(this.testers).map(([key, tester]) => 
  `  ${key.padEnd(15)} ${tester.name} (${tester.priority})`).join('\n')}

Examples:
  node tests/run-all-tests.js                    # Run all tests
  node tests/run-all-tests.js palm-reading       # Run palm reading tests
  node tests/run-all-tests.js --quick            # Run high-priority tests only
  node tests/run-all-tests.js --feature database # Run database tests
  node tests/run-all-tests.js --report           # Generate HTML report
    `);
  }

  // Run tests for a specific feature
  async runFeatureTests(featureKey, options = {}) {
    const testerConfig = this.testers[featureKey];
    if (!testerConfig) {
      throw new Error(`Unknown feature: ${featureKey}`);
    }

    this.log(`Starting ${testerConfig.name} tests...`, 'header');
    
    const startTime = Date.now();
    const tester = new testerConfig.class();
    
    try {
      const results = await tester.runAllTests();
      const endTime = Date.now();
      const duration = endTime - startTime;

      const featureResult = {
        name: testerConfig.name,
        key: featureKey,
        priority: testerConfig.priority,
        description: testerConfig.description,
        duration,
        passed: results.passed,
        failed: results.failed,
        total: results.passed + results.failed,
        errors: results.errors || [],
        startTime,
        endTime,
        status: results.failed === 0 ? 'passed' : 'failed'
      };

      this.results.features[featureKey] = featureResult;
      
      this.log(`${testerConfig.name} completed: ${results.passed} passed, ${results.failed} failed (${duration}ms)`, 
        results.failed === 0 ? 'success' : 'error');

      return featureResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      const featureResult = {
        name: testerConfig.name,
        key: featureKey,
        priority: testerConfig.priority,
        description: testerConfig.description,
        duration,
        passed: 0,
        failed: 1,
        total: 1,
        errors: [{ test: 'Test Suite', error: error.message }],
        startTime,
        endTime: Date.now(),
        status: 'error'
      };

      this.results.features[featureKey] = featureResult;
      this.log(`${testerConfig.name} failed: ${error.message}`, 'error');
      
      return featureResult;
    }
  }

  // Run all or filtered tests
  async runTests(options = {}) {
    this.results.startTime = Date.now();
    
    this.log('🚀 Starting ZodiaApp Test Suite', 'header');
    this.log('='.repeat(60));

    // Determine which features to test
    let featuresToTest = options.features.length > 0 
      ? options.features.filter(f => this.testers[f])
      : Object.keys(this.testers);

    // Filter by priority if quick mode
    if (options.quick) {
      featuresToTest = featuresToTest.filter(key => 
        this.testers[key].priority === 'high'
      );
      this.log('Quick mode: Running high-priority tests only', 'info');
    }

    this.log(`Testing ${featuresToTest.length} features: ${featuresToTest.map(f => this.testers[f].name).join(', ')}`);
    this.log('='.repeat(60));

    // Run tests sequentially to avoid resource conflicts
    for (const featureKey of featuresToTest) {
      try {
        await this.runFeatureTests(featureKey, options);
      } catch (error) {
        this.log(`Fatal error in ${featureKey}: ${error.message}`, 'error');
        this.results.errors.push({
          feature: featureKey,
          error: error.message
        });
      }

      // Small delay between test suites
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.results.endTime = Date.now();
    this.results.duration = this.results.endTime - this.results.startTime;

    // Calculate totals
    this.calculateTotals();

    // Display results
    this.displayResults();

    // Generate report if requested
    if (options.report) {
      await this.generateHtmlReport();
    }

    return this.results;
  }

  // Calculate total statistics
  calculateTotals() {
    let totalPassed = 0;
    let totalFailed = 0;
    let totalTests = 0;

    const statusCounts = { passed: 0, failed: 0, error: 0 };
    const priorityCounts = { high: 0, medium: 0, low: 0 };

    for (const [key, feature] of Object.entries(this.results.features)) {
      totalPassed += feature.passed;
      totalFailed += feature.failed;
      totalTests += feature.total;

      statusCounts[feature.status]++;
      priorityCounts[feature.priority]++;
    }

    this.results.totalPassed = totalPassed;
    this.results.totalFailed = totalFailed;
    this.results.totalTests = totalTests;
    this.results.summary = {
      features: Object.keys(this.results.features).length,
      statusCounts,
      priorityCounts,
      successRate: totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0,
      avgDuration: Object.values(this.results.features).reduce((sum, f) => sum + f.duration, 0) / Object.keys(this.results.features).length
    };
  }

  // Display test results
  displayResults() {
    this.log('='.repeat(60));
    this.log('📊 Test Results Summary', 'summary');
    this.log('='.repeat(60));

    // Overall statistics
    this.log(`Total Duration: ${Math.round(this.results.duration / 1000)}s`);
    this.log(`Features Tested: ${this.results.summary.features}`);
    this.log(`Total Tests: ${this.results.totalTests}`);
    this.log(`Passed: ${this.results.totalPassed}`, 'success');
    this.log(`Failed: ${this.results.totalFailed}`, this.results.totalFailed > 0 ? 'error' : 'info');
    this.log(`Success Rate: ${this.results.summary.successRate}%`);

    // Feature breakdown
    this.log('\n📋 Feature Results:');
    for (const [key, feature] of Object.entries(this.results.features)) {
      const statusIcon = {
        'passed': '✅',
        'failed': '❌',
        'error': '💥'
      }[feature.status] || '❓';

      const duration = Math.round(feature.duration / 1000);
      this.log(`${statusIcon} ${feature.name}: ${feature.passed}/${feature.total} passed (${duration}s)`);
    }

    // Priority breakdown
    this.log('\n🎯 By Priority:');
    for (const [priority, count] of Object.entries(this.results.summary.priorityCounts)) {
      if (count > 0) {
        this.log(`${priority.toUpperCase()}: ${count} features`);
      }
    }

    // Show errors if any
    if (this.results.totalFailed > 0 || this.results.errors.length > 0) {
      this.log('\n❌ Issues Found:', 'error');
      
      for (const [key, feature] of Object.entries(this.results.features)) {
        if (feature.errors.length > 0) {
          this.log(`\n${feature.name}:`);
          for (const error of feature.errors.slice(0, 5)) { // Show first 5 errors
            this.log(`  • ${error.test}: ${error.error}`);
          }
          if (feature.errors.length > 5) {
            this.log(`  ... and ${feature.errors.length - 5} more errors`);
          }
        }
      }

      for (const error of this.results.errors) {
        this.log(`\n${error.feature}: ${error.error}`);
      }
    }

    // Recommendations
    this.displayRecommendations();

    this.log('='.repeat(60));
    
    if (this.results.totalFailed === 0 && this.results.errors.length === 0) {
      this.log('🎉 All tests passed! Your app is in great shape!', 'success');
    } else {
      this.log('🔧 Some issues found. Please review and fix the failing tests.', 'warn');
    }
  }

  // Display recommendations based on test results
  displayRecommendations() {
    const recommendations = [];

    // Check overall success rate
    if (this.results.summary.successRate < 80) {
      recommendations.push('Overall success rate is low - focus on fixing critical issues first');
    }

    // Check high priority failures
    const highPriorityFailures = Object.values(this.results.features)
      .filter(f => f.priority === 'high' && f.status !== 'passed');
    
    if (highPriorityFailures.length > 0) {
      recommendations.push(`${highPriorityFailures.length} high-priority features have issues - address these first`);
    }

    // Check slow tests
    const slowTests = Object.values(this.results.features)
      .filter(f => f.duration > 60000); // Over 1 minute
    
    if (slowTests.length > 0) {
      recommendations.push(`${slowTests.length} test suites are slow - consider optimization`);
    }

    // Check database connectivity
    const dbFeature = this.results.features['database'];
    if (dbFeature && dbFeature.status !== 'passed') {
      recommendations.push('Database issues detected - check connection and configuration');
    }

    // Check edge functions
    const edgeFunctionFeature = this.results.features['edge-functions'];
    if (edgeFunctionFeature && edgeFunctionFeature.status !== 'passed') {
      recommendations.push('Edge function issues detected - verify deployment and API keys');
    }

    if (recommendations.length > 0) {
      this.log('\n💡 Recommendations:');
      recommendations.forEach((rec, index) => {
        this.log(`${index + 1}. ${rec}`);
      });
    }
  }

  // Generate HTML report
  async generateHtmlReport() {
    this.log('Generating HTML report...', 'info');

    try {
      const reportHtml = this.generateHtmlContent();
      const reportPath = path.join(process.cwd(), 'test-report.html');
      
      await fs.writeFile(reportPath, reportHtml);
      
      this.log(`✅ HTML report generated: ${reportPath}`, 'success');
      this.log(`Open file://${reportPath} in your browser to view the report`);
    } catch (error) {
      this.log(`Failed to generate HTML report: ${error.message}`, 'error');
    }
  }

  // Generate HTML report content
  generateHtmlContent() {
    const timestamp = new Date().toISOString();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZodiaApp Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f7; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
        .header h1 { margin: 0 0 10px 0; font-size: 2.5rem; }
        .header p { margin: 0; opacity: 0.9; font-size: 1.1rem; }
        .content { padding: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center; border-left: 4px solid #667eea; }
        .stat-number { font-size: 2rem; font-weight: bold; margin-bottom: 5px; }
        .stat-label { color: #666; font-size: 0.9rem; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        .features { margin-top: 30px; }
        .feature { background: #f8f9fa; border-radius: 8px; margin-bottom: 20px; overflow: hidden; }
        .feature-header { padding: 20px; background: white; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center; }
        .feature-title { font-weight: bold; font-size: 1.2rem; }
        .feature-status { padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; }
        .status-passed { background: #d4edda; color: #155724; }
        .status-failed { background: #f8d7da; color: #721c24; }
        .status-error { background: #fff3cd; color: #856404; }
        .feature-details { padding: 0 20px 20px 20px; }
        .feature-meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 15px; }
        .meta-item { font-size: 0.9rem; }
        .meta-label { color: #666; }
        .errors { margin-top: 15px; }
        .error-item { background: #fff; border-left: 4px solid #dc3545; padding: 10px; margin-bottom: 10px; border-radius: 4px; }
        .error-test { font-weight: bold; color: #721c24; }
        .error-message { color: #666; font-size: 0.9rem; margin-top: 5px; }
        .recommendations { background: #e3f2fd; border-radius: 8px; padding: 20px; margin-top: 30px; }
        .recommendations h3 { margin-top: 0; color: #1976d2; }
        .recommendations ul { margin-bottom: 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9rem; border-top: 1px solid #e9ecef; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔮 ZodiaApp Test Report</h1>
            <p>Generated on ${new Date(timestamp).toLocaleString()}</p>
        </div>
        
        <div class="content">
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">${this.results.summary.features}</div>
                    <div class="stat-label">Features Tested</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${this.results.totalTests}</div>
                    <div class="stat-label">Total Tests</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number success">${this.results.totalPassed}</div>
                    <div class="stat-label">Passed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number ${this.results.totalFailed > 0 ? 'error' : ''}">${this.results.totalFailed}</div>
                    <div class="stat-label">Failed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${this.results.summary.successRate}%</div>
                    <div class="stat-label">Success Rate</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${Math.round(this.results.duration / 1000)}s</div>
                    <div class="stat-label">Total Duration</div>
                </div>
            </div>

            <div class="features">
                <h2>Feature Test Results</h2>
                ${Object.values(this.results.features).map(feature => `
                    <div class="feature">
                        <div class="feature-header">
                            <div class="feature-title">${feature.name}</div>
                            <div class="feature-status status-${feature.status}">${feature.status}</div>
                        </div>
                        <div class="feature-details">
                            <div class="feature-meta">
                                <div class="meta-item"><span class="meta-label">Priority:</span> ${feature.priority.toUpperCase()}</div>
                                <div class="meta-item"><span class="meta-label">Duration:</span> ${Math.round(feature.duration / 1000)}s</div>
                                <div class="meta-item"><span class="meta-label">Tests:</span> ${feature.passed}/${feature.total}</div>
                            </div>
                            <div style="color: #666; font-size: 0.9rem; margin-bottom: 10px;">${feature.description}</div>
                            ${feature.errors.length > 0 ? `
                                <div class="errors">
                                    <strong>Issues Found:</strong>
                                    ${feature.errors.slice(0, 5).map(error => `
                                        <div class="error-item">
                                            <div class="error-test">${error.test}</div>
                                            <div class="error-message">${error.error}</div>
                                        </div>
                                    `).join('')}
                                    ${feature.errors.length > 5 ? `<div style="text-align: center; color: #666; margin-top: 10px;">... and ${feature.errors.length - 5} more errors</div>` : ''}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>

            ${this.getRecommendationsHtml()}
        </div>

        <div class="footer">
            Report generated by ZodiaApp Master Test Runner<br>
            <a href="https://github.com/anthropics/claude-code" target="_blank">Powered by Claude Code</a>
        </div>
    </div>
</body>
</html>
    `;
  }

  getRecommendationsHtml() {
    const recommendations = [];

    if (this.results.summary.successRate < 80) {
      recommendations.push('Overall success rate is low - focus on fixing critical issues first');
    }

    const highPriorityFailures = Object.values(this.results.features)
      .filter(f => f.priority === 'high' && f.status !== 'passed');
    
    if (highPriorityFailures.length > 0) {
      recommendations.push(`${highPriorityFailures.length} high-priority features have issues - address these first`);
    }

    if (recommendations.length === 0) {
      return '';
    }

    return `
      <div class="recommendations">
        <h3>💡 Recommendations</h3>
        <ul>
          ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  // Health check - run minimal tests
  async healthCheck() {
    this.log('Running health check...', 'info');
    
    const criticalFeatures = ['database', 'edge-functions'];
    const results = {};

    for (const feature of criticalFeatures) {
      if (this.testers[feature]) {
        try {
          this.log(`Checking ${this.testers[feature].name}...`);
          const tester = new this.testers[feature].class();
          
          // Run a minimal test for health check
          if (feature === 'database') {
            await tester.testDatabaseConnection();
          } else if (feature === 'edge-functions') {
            await tester.testFunctionAvailability();
          }
          
          results[feature] = 'healthy';
          this.log(`✅ ${this.testers[feature].name} is healthy`);
        } catch (error) {
          results[feature] = 'unhealthy';
          this.log(`❌ ${this.testers[feature].name} is unhealthy: ${error.message}`);
        }
      }
    }

    return results;
  }
}

// Main execution
async function main() {
  const runner = new MasterTestRunner();
  const options = runner.parseArgs();

  if (options.help) {
    runner.showHelp();
    return;
  }

  try {
    if (process.argv.includes('--health')) {
      await runner.healthCheck();
    } else {
      const results = await runner.runTests(options);
      
      // Exit with error code if tests failed
      if (results.totalFailed > 0 || results.errors.length > 0) {
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { MasterTestRunner };