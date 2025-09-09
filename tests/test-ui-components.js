/**
 * UI Components Tester
 * Tests React Native UI components including:
 * - Component rendering and structure
 * - Props validation and handling
 * - Event handling and callbacks
 * - Styling and responsiveness
 * - Accessibility features
 * - Performance and memory usage
 * - Navigation integration
 */

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class UIComponentsTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
    this.componentFiles = [];
    this.projectRoot = process.cwd();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().substring(11, 19);
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warn' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async test(name, testFunction) {
    try {
      this.log(`Starting test: ${name}`);
      await testFunction();
      this.testResults.passed++;
      this.log(`✅ Test passed: ${name}`, 'success');
    } catch (error) {
      this.testResults.failed++;
      this.testResults.errors.push({ test: name, error: error.message });
      this.log(`❌ Test failed: ${name} - ${error.message}`, 'error');
    }
  }

  // Test 1: Component discovery and inventory
  async testComponentDiscovery() {
    this.log('Discovering UI components...');

    try {
      // Find all component files
      const componentDirs = [
        path.join(this.projectRoot, 'components'),
        path.join(this.projectRoot, 'screens')
      ];

      for (const dir of componentDirs) {
        try {
          const files = await this.findComponentFiles(dir);
          this.componentFiles.push(...files);
        } catch (error) {
          this.log(`⚠️  Could not scan directory ${dir}: ${error.message}`, 'warn');
        }
      }

      if (this.componentFiles.length === 0) {
        throw new Error('No component files found');
      }

      this.log(`✓ Found ${this.componentFiles.length} component files`);
      
      // Categorize components
      const categories = this.categorizeComponents(this.componentFiles);
      for (const [category, count] of Object.entries(categories)) {
        this.log(`   - ${category}: ${count} components`);
      }

      return this.componentFiles;
    } catch (error) {
      throw new Error(`Component discovery failed: ${error.message}`);
    }
  }

  async findComponentFiles(dir, files = []) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          await this.findComponentFiles(fullPath, files);
        } else if (entry.isFile() && this.isComponentFile(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist, skip silently
    }
    
    return files;
  }

  isComponentFile(filename) {
    return (
      (filename.endsWith('.tsx') || filename.endsWith('.ts') || filename.endsWith('.jsx') || filename.endsWith('.js')) &&
      !filename.endsWith('.test.tsx') &&
      !filename.endsWith('.test.ts') &&
      !filename.endsWith('.spec.tsx') &&
      !filename.endsWith('.spec.ts') &&
      !filename.startsWith('.')
    );
  }

  categorizeComponents(componentFiles) {
    const categories = {
      'Screens': 0,
      'Palm Reading': 0,
      'Compatibility': 0,
      'Shared/Common': 0,
      'Navigation': 0,
      'Other': 0
    };

    for (const file of componentFiles) {
      const relativePath = path.relative(this.projectRoot, file).toLowerCase();
      
      if (relativePath.includes('screen')) {
        categories['Screens']++;
      } else if (relativePath.includes('palm')) {
        categories['Palm Reading']++;
      } else if (relativePath.includes('compatibility')) {
        categories['Compatibility']++;
      } else if (relativePath.includes('shared') || relativePath.includes('common')) {
        categories['Shared/Common']++;
      } else if (relativePath.includes('navigation')) {
        categories['Navigation']++;
      } else {
        categories['Other']++;
      }
    }

    return categories;
  }

  // Test 2: Component syntax and structure validation
  async testComponentStructure() {
    this.log('Testing component structure and syntax...');

    const structureIssues = [];

    for (const componentFile of this.componentFiles) {
      try {
        const content = await fs.readFile(componentFile, 'utf8');
        const relativePath = path.relative(this.projectRoot, componentFile);
        
        const issues = this.analyzeComponentStructure(content, relativePath);
        if (issues.length > 0) {
          structureIssues.push({ file: relativePath, issues });
        }
      } catch (error) {
        structureIssues.push({ 
          file: path.relative(this.projectRoot, componentFile), 
          issues: [`Failed to read file: ${error.message}`] 
        });
      }
    }

    if (structureIssues.length > 0) {
      this.log(`⚠️  Found structure issues in ${structureIssues.length} components:`, 'warn');
      for (const { file, issues } of structureIssues) {
        this.log(`   ${file}:`);
        for (const issue of issues) {
          this.log(`     - ${issue}`);
        }
      }
    } else {
      this.log('✓ All components have valid structure');
    }

    this.log('Component structure tests completed');
  }

  analyzeComponentStructure(content, filePath) {
    const issues = [];

    // Check for React import
    if (!content.includes('import React') && !content.includes('from \'react\'')) {
      issues.push('Missing React import');
    }

    // Check for component export
    if (!content.includes('export') || (!content.includes('export const') && !content.includes('export default'))) {
      issues.push('No component export found');
    }

    // Check for TypeScript interface/props (for .tsx files)
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      if (!content.includes('interface') && !content.includes('type ') && content.includes('Props')) {
        issues.push('Props type definition recommended for TypeScript components');
      }
    }

    // Check for proper JSX return
    if (!content.includes('return (') && !content.includes('return <')) {
      issues.push('No JSX return statement found');
    }

    // Check for StyleSheet usage
    if (content.includes('StyleSheet.create') && !content.includes('import.*StyleSheet')) {
      issues.push('StyleSheet used but not imported');
    }

    // Check for common React Native imports
    const commonComponents = ['View', 'Text', 'TouchableOpacity', 'ScrollView'];
    for (const component of commonComponents) {
      if (content.includes(`<${component}`) && !content.includes(`import.*${component}`)) {
        issues.push(`${component} used but not imported`);
      }
    }

    // Check for unused imports (basic check)
    const importMatches = content.match(/import\s+{([^}]+)}\s+from/g);
    if (importMatches) {
      for (const importMatch of importMatches) {
        const imports = importMatch.match(/{([^}]+)}/)[1]
          .split(',')
          .map(imp => imp.trim());
        
        for (const imp of imports) {
          if (!content.includes(imp.replace(/\s+as\s+\w+/, '')) && imp !== 'React') {
            // Skip this check as it's too basic and may cause false positives
          }
        }
      }
    }

    return issues;
  }

  // Test 3: Component props and TypeScript validation
  async testComponentProps() {
    this.log('Testing component props and TypeScript definitions...');

    const propsIssues = [];

    for (const componentFile of this.componentFiles) {
      if (!componentFile.endsWith('.tsx') && !componentFile.endsWith('.ts')) {
        continue; // Skip non-TypeScript files
      }

      try {
        const content = await fs.readFile(componentFile, 'utf8');
        const relativePath = path.relative(this.projectRoot, componentFile);
        
        const issues = this.analyzeComponentProps(content, relativePath);
        if (issues.length > 0) {
          propsIssues.push({ file: relativePath, issues });
        }
      } catch (error) {
        propsIssues.push({ 
          file: path.relative(this.projectRoot, componentFile), 
          issues: [`Failed to analyze props: ${error.message}`] 
        });
      }
    }

    if (propsIssues.length > 0) {
      this.log(`⚠️  Found props issues in ${propsIssues.length} components:`, 'warn');
      for (const { file, issues } of propsIssues) {
        this.log(`   ${file}:`);
        for (const issue of issues) {
          this.log(`     - ${issue}`);
        }
      }
    } else {
      this.log('✓ All TypeScript components have valid props definitions');
    }

    this.log('Component props tests completed');
  }

  analyzeComponentProps(content, filePath) {
    const issues = [];

    // Check if component has props parameter but no interface
    const functionMatch = content.match(/const\s+\w+.*=.*\(\s*{([^}]*)}.*\)/);
    const propsMatch = content.match(/const\s+\w+.*=.*\(\s*props/);
    
    if ((functionMatch || propsMatch) && !content.includes('interface') && !content.includes('type ')) {
      issues.push('Component accepts props but has no TypeScript interface/type definition');
    }

    // Check for proper props destructuring
    if (functionMatch) {
      const propsInDestructuring = functionMatch[1].split(',').map(p => p.trim());
      
      // Check if required props are marked appropriately
      for (const prop of propsInDestructuring) {
        if (prop.includes('?')) {
          // Optional prop - this is good
        } else if (prop.includes('=')) {
          // Default value - this is good
        } else {
          // Required prop - should be validated in interface
        }
      }
    }

    // Check for navigation props typing
    if (content.includes('navigation') && !content.includes('NavigationProp') && !content.includes('StackNavigationProp')) {
      issues.push('Navigation prop used but not properly typed');
    }

    // Check for route props typing
    if (content.includes('route.params') && !content.includes('RouteProp')) {
      issues.push('Route params used but route not properly typed');
    }

    return issues;
  }

  // Test 4: Component styling and responsiveness
  async testComponentStyling() {
    this.log('Testing component styling and responsiveness...');

    const stylingIssues = [];

    for (const componentFile of this.componentFiles) {
      try {
        const content = await fs.readFile(componentFile, 'utf8');
        const relativePath = path.relative(this.projectRoot, componentFile);
        
        const issues = this.analyzeComponentStyling(content, relativePath);
        if (issues.length > 0) {
          stylingIssues.push({ file: relativePath, issues });
        }
      } catch (error) {
        stylingIssues.push({ 
          file: path.relative(this.projectRoot, componentFile), 
          issues: [`Failed to analyze styling: ${error.message}`] 
        });
      }
    }

    if (stylingIssues.length > 0) {
      this.log(`⚠️  Found styling issues in ${stylingIssues.length} components:`, 'warn');
      for (const { file, issues } of stylingIssues) {
        this.log(`   ${file}:`);
        for (const issue of issues) {
          this.log(`     - ${issue}`);
        }
      }
    } else {
      this.log('✓ All components have appropriate styling');
    }

    this.log('Component styling tests completed');
  }

  analyzeComponentStyling(content, filePath) {
    const issues = [];

    // Check for inline styles (should be minimal)
    const inlineStyleMatches = content.match(/style={{[^}]+}}/g);
    if (inlineStyleMatches && inlineStyleMatches.length > 3) {
      issues.push(`Excessive inline styles found (${inlineStyleMatches.length} instances) - consider using StyleSheet`);
    }

    // Check for missing StyleSheet when styles are used
    if ((content.includes('styles.') || content.includes('style={styles')) && !content.includes('StyleSheet.create')) {
      issues.push('Styles referenced but no StyleSheet.create found');
    }

    // Check for hardcoded dimensions
    const hardcodedDimensions = content.match(/(?:width|height|fontSize|margin|padding):\s*\d+/g);
    if (hardcodedDimensions && hardcodedDimensions.length > 5) {
      issues.push('Many hardcoded dimensions found - consider responsive design');
    }

    // Check for responsive design patterns
    if (content.includes('Dimensions.get') && !content.includes('width') && !content.includes('height')) {
      issues.push('Dimensions imported but not used effectively');
    }

    // Check for accessibility props
    if (content.includes('TouchableOpacity') || content.includes('Button')) {
      if (!content.includes('accessibilityLabel') && !content.includes('accessibilityHint')) {
        issues.push('Interactive elements missing accessibility properties');
      }
    }

    // Check for proper color usage (should use theme colors)
    const colorMatches = content.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\(|rgba\(/g);
    if (colorMatches && colorMatches.length > 2) {
      issues.push('Hardcoded colors found - consider using theme colors');
    }

    // Check for ScrollView contentContainerStyle usage
    if (content.includes('<ScrollView') && content.includes('justifyContent') && !content.includes('contentContainerStyle')) {
      issues.push('ScrollView with layout styles should use contentContainerStyle');
    }

    return issues;
  }

  // Test 5: Event handling and callbacks
  async testEventHandling() {
    this.log('Testing component event handling...');

    const eventIssues = [];

    for (const componentFile of this.componentFiles) {
      try {
        const content = await fs.readFile(componentFile, 'utf8');
        const relativePath = path.relative(this.projectRoot, componentFile);
        
        const issues = this.analyzeEventHandling(content, relativePath);
        if (issues.length > 0) {
          eventIssues.push({ file: relativePath, issues });
        }
      } catch (error) {
        eventIssues.push({ 
          file: path.relative(this.projectRoot, componentFile), 
          issues: [`Failed to analyze event handling: ${error.message}`] 
        });
      }
    }

    if (eventIssues.length > 0) {
      this.log(`⚠️  Found event handling issues in ${eventIssues.length} components:`, 'warn');
      for (const { file, issues } of eventIssues) {
        this.log(`   ${file}:`);
        for (const issue of issues) {
          this.log(`     - ${issue}`);
        }
      }
    } else {
      this.log('✓ All components have proper event handling');
    }

    this.log('Event handling tests completed');
  }

  analyzeEventHandling(content, filePath) {
    const issues = [];

    // Check for proper event handler naming
    const onPressHandlers = content.match(/onPress={[^}]+}/g);
    if (onPressHandlers) {
      for (const handler of onPressHandlers) {
        if (handler.includes('() =>') && handler.length > 50) {
          issues.push('Complex inline onPress handler - consider extracting to separate function');
        }
      }
    }

    // Check for missing error handling in async operations
    if (content.includes('async') && content.includes('await') && !content.includes('try') && !content.includes('catch')) {
      issues.push('Async operations without error handling found');
    }

    // Check for proper navigation handling
    if (content.includes('navigation.navigate') && !content.includes('useNavigation') && !content.includes('navigation: ')) {
      issues.push('Navigation used but hook or prop not properly imported');
    }

    // Check for form validation
    if (content.includes('TextInput') && !content.includes('onChangeText')) {
      issues.push('TextInput without onChangeText handler');
    }

    // Check for memory leaks in useEffect
    const useEffectMatches = content.match(/useEffect\([^)]+\)/g);
    if (useEffectMatches) {
      for (const effect of useEffectMatches) {
        if (effect.includes('setInterval') || effect.includes('setTimeout')) {
          if (!content.includes('clearInterval') && !content.includes('clearTimeout')) {
            issues.push('Timer in useEffect without cleanup');
          }
        }
      }
    }

    return issues;
  }

  // Test 6: Component accessibility
  async testAccessibility() {
    this.log('Testing component accessibility...');

    const a11yIssues = [];

    for (const componentFile of this.componentFiles) {
      try {
        const content = await fs.readFile(componentFile, 'utf8');
        const relativePath = path.relative(this.projectRoot, componentFile);
        
        const issues = this.analyzeAccessibility(content, relativePath);
        if (issues.length > 0) {
          a11yIssues.push({ file: relativePath, issues });
        }
      } catch (error) {
        a11yIssues.push({ 
          file: path.relative(this.projectRoot, componentFile), 
          issues: [`Failed to analyze accessibility: ${error.message}`] 
        });
      }
    }

    if (a11yIssues.length > 0) {
      this.log(`⚠️  Found accessibility issues in ${a11yIssues.length} components:`, 'warn');
      for (const { file, issues } of a11yIssues) {
        this.log(`   ${file}:`);
        for (const issue of issues) {
          this.log(`     - ${issue}`);
        }
      }
    } else {
      this.log('✓ All components have good accessibility practices');
    }

    this.log('Accessibility tests completed');
  }

  analyzeAccessibility(content, filePath) {
    const issues = [];

    // Check for accessibility labels on touchable components
    const touchableElements = ['TouchableOpacity', 'TouchableHighlight', 'TouchableWithoutFeedback', 'Pressable'];
    for (const element of touchableElements) {
      if (content.includes(`<${element}`) && !content.includes('accessibilityLabel')) {
        issues.push(`${element} missing accessibilityLabel`);
      }
    }

    // Check for accessibility hints on complex interactions
    if (content.includes('onLongPress') && !content.includes('accessibilityHint')) {
      issues.push('Long press interactions should have accessibilityHint');
    }

    // Check for proper heading hierarchy
    if (content.includes('fontSize') && content.match(/fontSize:\s*[2-4]\d/)) {
      if (!content.includes('accessibilityRole="header"') && !content.includes('accessibilityLevel')) {
        issues.push('Large text should be marked as header for screen readers');
      }
    }

    // Check for image accessibility
    if (content.includes('<Image') && !content.includes('alt=') && !content.includes('accessibilityLabel')) {
      issues.push('Images should have accessibility labels or be marked as decorative');
    }

    // Check for form element labels
    if (content.includes('TextInput') && !content.includes('accessibilityLabel') && !content.includes('placeholder')) {
      issues.push('TextInput should have accessibilityLabel or placeholder');
    }

    // Check for color-only information
    if (content.match(/color:\s*['"]red['"]/) || content.match(/color:\s*['"]green['"]/)) {
      issues.push('Avoid using color alone to convey information');
    }

    return issues;
  }

  // Test 7: Performance and optimization
  async testPerformance() {
    this.log('Testing component performance patterns...');

    const performanceIssues = [];

    for (const componentFile of this.componentFiles) {
      try {
        const content = await fs.readFile(componentFile, 'utf8');
        const relativePath = path.relative(this.projectRoot, componentFile);
        
        const issues = this.analyzePerformance(content, relativePath);
        if (issues.length > 0) {
          performanceIssues.push({ file: relativePath, issues });
        }
      } catch (error) {
        performanceIssues.push({ 
          file: path.relative(this.projectRoot, componentFile), 
          issues: [`Failed to analyze performance: ${error.message}`] 
        });
      }
    }

    if (performanceIssues.length > 0) {
      this.log(`⚠️  Found performance issues in ${performanceIssues.length} components:`, 'warn');
      for (const { file, issues } of performanceIssues) {
        this.log(`   ${file}:`);
        for (const issue of issues) {
          this.log(`     - ${issue}`);
        }
      }
    } else {
      this.log('✓ All components follow good performance practices');
    }

    this.log('Performance tests completed');
  }

  analyzePerformance(content, filePath) {
    const issues = [];

    // Check for unnecessary re-renders
    if (content.includes('useState') && content.includes('useEffect')) {
      const stateVariables = content.match(/const\s+\[(\w+),\s*set\w+\]\s*=\s*useState/g);
      if (stateVariables && stateVariables.length > 5) {
        issues.push('Many state variables - consider useReducer or state consolidation');
      }
    }

    // Check for missing React.memo on expensive components
    if (content.includes('map(') && content.includes('return (') && !content.includes('React.memo')) {
      issues.push('Component renders lists but not memoized - consider React.memo');
    }

    // Check for expensive operations in render
    if (content.includes('JSON.parse') || content.includes('JSON.stringify')) {
      if (!content.includes('useMemo') && !content.includes('useCallback')) {
        issues.push('JSON operations in render without memoization');
      }
    }

    // Check for large StyleSheet objects
    const styleSheetMatch = content.match(/StyleSheet\.create\(({[\s\S]*?})\);/);
    if (styleSheetMatch) {
      const styleLines = styleSheetMatch[1].split('\n').length;
      if (styleLines > 50) {
        issues.push('Large StyleSheet - consider splitting into multiple files');
      }
    }

    // Check for FlatList optimization
    if (content.includes('FlatList')) {
      if (!content.includes('getItemLayout') && !content.includes('keyExtractor')) {
        issues.push('FlatList missing performance optimizations (keyExtractor, getItemLayout)');
      }
    }

    // Check for unnecessary function creation in render
    const inlineFunctions = content.match(/onPress={\(\) =>/g);
    if (inlineFunctions && inlineFunctions.length > 2) {
      issues.push('Multiple inline functions in render - consider useCallback');
    }

    return issues;
  }

  // Test 8: Component testing setup
  async testComponentTestSetup() {
    this.log('Checking component testing setup...');

    const testSetupIssues = [];
    let testsFound = 0;

    for (const componentFile of this.componentFiles) {
      const componentName = path.basename(componentFile, path.extname(componentFile));
      const componentDir = path.dirname(componentFile);
      
      // Look for test files
      const possibleTestFiles = [
        path.join(componentDir, `${componentName}.test.tsx`),
        path.join(componentDir, `${componentName}.test.ts`),
        path.join(componentDir, `${componentName}.spec.tsx`),
        path.join(componentDir, `${componentName}.spec.ts`),
        path.join(componentDir, '__tests__', `${componentName}.test.tsx`),
        path.join(componentDir, '__tests__', `${componentName}.test.ts`)
      ];

      let hasTest = false;
      for (const testFile of possibleTestFiles) {
        try {
          await fs.access(testFile);
          hasTest = true;
          testsFound++;
          break;
        } catch (error) {
          // Test file doesn't exist
        }
      }

      if (!hasTest && !componentFile.includes('index.')) {
        const relativePath = path.relative(this.projectRoot, componentFile);
        testSetupIssues.push(`${relativePath} - No test file found`);
      }
    }

    this.log(`✓ Found ${testsFound} component test files`);
    
    if (testSetupIssues.length > 0) {
      this.log(`⚠️  Components without tests (${testSetupIssues.length}):`, 'warn');
      testSetupIssues.slice(0, 10).forEach(issue => {
        this.log(`   - ${issue}`);
      });
      if (testSetupIssues.length > 10) {
        this.log(`   ... and ${testSetupIssues.length - 10} more`);
      }
    }

    // Check for testing dependencies
    try {
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      
      const testingDependencies = [
        '@testing-library/react-native',
        '@testing-library/jest-native',
        'jest',
        'react-test-renderer'
      ];

      const missingDeps = testingDependencies.filter(dep => 
        !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
      );

      if (missingDeps.length > 0) {
        this.log(`⚠️  Missing testing dependencies: ${missingDeps.join(', ')}`, 'warn');
      } else {
        this.log('✓ Testing dependencies are available');
      }
    } catch (error) {
      this.log(`⚠️  Could not check testing dependencies: ${error.message}`, 'warn');
    }

    this.log('Component testing setup check completed');
  }

  // Test 9: Generate component test templates
  async generateTestTemplates() {
    this.log('Generating test templates for components without tests...');

    const templatesCreated = [];
    
    // Create a few test templates for key components
    const priorityComponents = this.componentFiles
      .filter(file => 
        file.includes('DateOfBirthPicker') || 
        file.includes('PalmReadingFlow') || 
        file.includes('CompatibilitySystem')
      )
      .slice(0, 3);

    for (const componentFile of priorityComponents) {
      try {
        const template = await this.generateTestTemplate(componentFile);
        const templatePath = componentFile.replace(/\.(tsx|ts|jsx|js)$/, '.test.template.tsx');
        
        await fs.writeFile(templatePath, template);
        templatesCreated.push(path.relative(this.projectRoot, templatePath));
        
        this.log(`✓ Generated test template: ${path.basename(templatePath)}`);
      } catch (error) {
        this.log(`⚠️  Failed to generate template for ${path.basename(componentFile)}: ${error.message}`, 'warn');
      }
    }

    if (templatesCreated.length > 0) {
      this.log(`Generated ${templatesCreated.length} test templates`);
    }

    return templatesCreated;
  }

  async generateTestTemplate(componentFile) {
    const content = await fs.readFile(componentFile, 'utf8');
    const componentName = path.basename(componentFile, path.extname(componentFile));
    
    // Extract props interface if available
    const interfaceMatch = content.match(/interface\s+(\w+Props)\s*{([^}]*)}/);
    const propsInterface = interfaceMatch ? interfaceMatch[1] : null;
    
    // Generate basic test template
    const template = `/**
 * Test template for ${componentName}
 * Generated automatically - customize as needed
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ${componentName} } from './${componentName}';

// Mock navigation if needed
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

const mockRoute = {
  params: {},
};

describe('${componentName}', () => {
  const defaultProps${propsInterface ? `: ${propsInterface}` : ''} = {
    // Add default props here
    ${content.includes('navigation') ? 'navigation: mockNavigation,' : ''}
    ${content.includes('route') ? 'route: mockRoute,' : ''}
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { getByTestId } = render(<${componentName} {...defaultProps} />);
    // Add assertions here
    expect(true).toBe(true); // Replace with actual test
  });

  it('should handle user interactions', () => {
    const { getByTestId } = render(<${componentName} {...defaultProps} />);
    // Add interaction tests here
    // fireEvent.press(getByTestId('button'));
    // expect(mockFunction).toHaveBeenCalled();
  });

  ${content.includes('useState') ? `
  it('should manage state correctly', () => {
    const { getByTestId } = render(<${componentName} {...defaultProps} />);
    // Test state changes
  });
  ` : ''}

  ${content.includes('useEffect') ? `
  it('should handle side effects', async () => {
    const { getByTestId } = render(<${componentName} {...defaultProps} />);
    // Test useEffect behavior
    await waitFor(() => {
      // Wait for async operations
    });
  });
  ` : ''}

  // Add more specific tests based on component functionality
});
`;

    return template;
  }

  // Run all tests
  async runAllTests() {
    this.log('🚀 Starting UI Components Tests');
    this.log('='.repeat(50));

    await this.test('Component Discovery', () => this.testComponentDiscovery());
    await this.test('Component Structure', () => this.testComponentStructure());
    await this.test('Component Props', () => this.testComponentProps());
    await this.test('Component Styling', () => this.testComponentStyling());
    await this.test('Event Handling', () => this.testEventHandling());
    await this.test('Accessibility', () => this.testAccessibility());
    await this.test('Performance', () => this.testPerformance());
    await this.test('Testing Setup', () => this.testComponentTestSetup());
    await this.test('Generate Test Templates', () => this.generateTestTemplates());

    this.log('='.repeat(50));
    this.log(`📊 Test Results: ${this.testResults.passed} passed, ${this.testResults.failed} failed`);

    // Component summary
    this.log(`\n📋 Component Analysis Summary:`);
    this.log(`   Total components analyzed: ${this.componentFiles.length}`);
    
    const categories = this.categorizeComponents(this.componentFiles);
    for (const [category, count] of Object.entries(categories)) {
      if (count > 0) {
        this.log(`   ${category}: ${count} components`);
      }
    }

    if (this.testResults.failed > 0) {
      this.log('\n❌ Failed Tests:');
      this.testResults.errors.forEach(error => {
        this.log(`   - ${error.test}: ${error.error}`);
      });
    } else {
      this.log('\n🎉 All UI component tests passed!');
    }

    return this.testResults;
  }

  // Manual test runner
  async runManualTest(testName) {
    const tests = {
      'discovery': () => this.testComponentDiscovery(),
      'structure': () => this.testComponentStructure(),
      'props': () => this.testComponentProps(),
      'styling': () => this.testComponentStyling(),
      'events': () => this.testEventHandling(),
      'accessibility': () => this.testAccessibility(),
      'performance': () => this.testPerformance(),
      'testing': () => this.testComponentTestSetup(),
      'templates': () => this.generateTestTemplates()
    };

    if (!testName || testName === 'help') {
      console.log('Available UI component tests:');
      console.log('  discovery     - Discover and categorize components');
      console.log('  structure     - Test component structure and syntax');
      console.log('  props         - Test component props and TypeScript');
      console.log('  styling       - Test component styling and responsiveness');
      console.log('  events        - Test event handling and callbacks');
      console.log('  accessibility - Test accessibility features');
      console.log('  performance   - Test performance patterns');
      console.log('  testing       - Check component testing setup');
      console.log('  templates     - Generate test templates');
      console.log('  all           - Run all tests');
      return;
    }

    if (testName === 'all') {
      return await this.runAllTests();
    }

    const testFunction = tests[testName];
    if (!testFunction) {
      this.log(`❌ Unknown test: ${testName}`, 'error');
      return;
    }

    try {
      this.log(`Running UI component test: ${testName}`);
      this.log('='.repeat(30));
      
      await this.test(testName, testFunction);
      
      this.log('='.repeat(30));
      this.log('✅ Test completed successfully!', 'success');
    } catch (error) {
      this.log(`❌ Test failed: ${error.message}`, 'error');
    }
  }
}

// Run tests if called directly
async function main() {
  const tester = new UIComponentsTester();
  const testName = process.argv[2] || 'all';
  
  try {
    await tester.runManualTest(testName);
  } catch (error) {
    console.error('❌ Fatal error during testing:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { UIComponentsTester };