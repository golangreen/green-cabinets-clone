# Test Coverage Guide

## Running Coverage Reports

### Basic Coverage Report
```bash
npm run test:coverage
```

This will:
- Run all tests with coverage collection
- Generate reports in multiple formats (text, html, json, lcov)
- Display a summary in the terminal
- Create an HTML report in `./coverage/index.html`

### Coverage Report Formats

#### 1. **Terminal Output** (text)
- Shows coverage summary immediately after test run
- Displays line, branch, function, and statement coverage
- Lists uncovered lines for each file

#### 2. **HTML Report** (html)
- Interactive browser-based report
- Open `./coverage/index.html` in your browser
- Navigate through files to see line-by-line coverage
- Visual highlighting of covered/uncovered code

#### 3. **LCOV Report** (lcov)
- Standard format for CI/CD integration
- Used by tools like Codecov, Coveralls
- Located at `./coverage/lcov.info`

#### 4. **JSON Report** (json)
- Machine-readable format
- Located at `./coverage/coverage-final.json`
- Useful for custom tooling and analysis

## Coverage Thresholds

Current thresholds configured in `vitest.config.ts`:

```
Lines:      70%
Functions:  70%
Branches:   65%
Statements: 70%
```

**Tests will fail if coverage drops below these values.**

### Understanding Metrics

- **Lines**: Percentage of executable lines that were executed
- **Functions**: Percentage of functions that were called
- **Branches**: Percentage of conditional branches (if/else, switch, ternary) that were taken
- **Statements**: Percentage of statements that were executed

## Viewing Coverage Reports

### 1. Terminal Summary
After running tests with coverage, you'll see:
```
---------------------|---------|----------|---------|---------|-------------------
File                 | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
---------------------|---------|----------|---------|---------|-------------------
All files            |   75.12 |    68.45 |   72.34 |   75.12 |                   
 gallery/hooks       |   82.56 |    75.32 |   80.12 |   82.56 |                   
  useGalleryState.ts |   85.34 |    78.23 |   82.45 |   85.34 | 45-48,67-69       
---------------------|---------|----------|---------|---------|-------------------
```

### 2. HTML Report
1. Run `npm run test:coverage`
2. Open `./coverage/index.html` in your browser
3. Navigate through directories and files
4. Click on files to see line-by-line coverage with highlighting:
   - **Green**: Code that was covered
   - **Red**: Code that was not covered
   - **Yellow**: Partially covered branches

## Coverage Best Practices

### What to Test
✅ **Priority Areas:**
- Core business logic
- Custom hooks
- Utility functions
- State management
- Data transformations
- Error handling paths

### What to Skip
❌ **Low Priority:**
- UI component styling
- Third-party library code
- Type definitions
- Auto-generated code
- Simple barrel exports (index.ts files)

## Excluded from Coverage

The following are excluded from coverage reports:

```
- node_modules/
- src/test/                         # Test utilities
- **/*.test.{ts,tsx}                # Test files
- **/__tests__/**                   # Test directories
- **/index.ts                       # Barrel exports
- src/integrations/supabase/types.ts # Auto-generated
- src/integrations/supabase/client.ts # Auto-generated
- src/components/ui/**              # Shadcn UI components
- *.config.{ts,js}                  # Config files
- **/*.d.ts                         # Type declarations
```

## Improving Coverage

### 1. Identify Uncovered Code
```bash
npm run test:coverage
# Look for red lines in HTML report or "Uncovered Line #s" in terminal
```

### 2. Add Tests for Uncovered Lines
Focus on:
- Error handling paths
- Edge cases
- Conditional branches
- Rarely used functions

### 3. Example: Improving Branch Coverage

**Before** (50% branch coverage):
```typescript
function processValue(value?: string) {
  if (value) {
    return value.toUpperCase();
  }
  // Missing test for undefined case
}
```

**After** (100% branch coverage):
```typescript
it('should handle undefined value', () => {
  expect(processValue(undefined)).toBeUndefined();
});

it('should uppercase defined value', () => {
  expect(processValue('test')).toBe('TEST');
});
```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run tests with coverage
  run: npm run test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
    fail_ci_if_error: true
```

## Monitoring Coverage Over Time

1. **Set up coverage badges** in README.md
2. **Track coverage trends** in CI/CD
3. **Review coverage** in pull requests
4. **Maintain or improve** coverage with each change

## Troubleshooting

### Coverage Not Generating
- Ensure `@vitest/coverage-v8` is installed
- Check that tests are running successfully
- Verify vitest.config.ts is properly configured

### Low Coverage
- Add unit tests for untested modules
- Test error paths and edge cases
- Focus on critical business logic first

### Coverage Threshold Failures
- Review uncovered code in HTML report
- Add tests for critical paths
- Consider if thresholds need adjustment

## Commands Reference

```bash
# Run tests with coverage
npm run test:coverage

# Run tests in watch mode (no coverage)
npm run test

# Run tests in UI mode
npm run test:ui

# Run specific test file with coverage
npx vitest run src/features/gallery/hooks/useGalleryState.test.ts --coverage
```

## Coverage Goals

### Current Status
- Gallery features: 70%+ coverage
- Core hooks: 75%+ coverage
- Utilities: 80%+ coverage

### Target Goals
- Maintain minimum 70% overall coverage
- 80%+ coverage for critical business logic
- 65%+ branch coverage for conditional logic
- 100% coverage for utility functions

## Resources

- [Vitest Coverage Documentation](https://vitest.dev/guide/coverage.html)
- [V8 Coverage Provider](https://vitest.dev/config/#coverage-provider)
- [Coverage Thresholds](https://vitest.dev/config/#coverage-thresholds)
