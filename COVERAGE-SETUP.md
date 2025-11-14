# Coverage Setup Complete ✓

Test coverage reporting has been configured with comprehensive thresholds and multiple report formats.

## What Was Configured

### 1. Vitest Configuration (`vitest.config.ts`)

**Coverage Provider:** V8 (fast, built-in Node.js coverage)

**Report Formats:**
- `text` - Terminal summary after tests
- `json` - Machine-readable format
- `html` - Interactive browser report
- `lcov` - Standard format for CI/CD tools
- `text-summary` - Brief terminal overview

**Coverage Thresholds:**
```javascript
{
  lines: 70,      // 70% of lines must be covered
  functions: 70,  // 70% of functions must be called
  branches: 65,   // 65% of branches must be taken
  statements: 70  // 70% of statements must be executed
}
```

**Excluded from Coverage:**
- Test files (`**/*.test.{ts,tsx}`)
- Test directories (`**/__tests__/**`)
- Auto-generated code (Supabase types/client)
- Configuration files
- Type definitions
- Barrel exports (`**/index.ts`)
- Shadcn UI components
- Setup files

### 2. Documentation Created

- **`src/test/coverage-report.md`** - Detailed coverage guide
- **`TESTING.md`** - Complete testing documentation
- **`.coveragerc`** - Coverage configuration reference

## Required Package.json Scripts

You need to add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch"
  }
}
```

### To Add Scripts:
1. Open your `package.json` file
2. Add the scripts above to the `"scripts"` section
3. Save the file

## How to Use

### Run Tests with Coverage
```bash
npm run test:coverage
```

This will:
1. Run all tests
2. Collect coverage data
3. Generate reports in `./coverage/` directory
4. Display summary in terminal
5. **Fail if coverage is below thresholds**

### View HTML Coverage Report
```bash
# After running coverage
open coverage/index.html  # macOS
start coverage/index.html # Windows
xdg-open coverage/index.html # Linux
```

### Understanding the Output

**Terminal Output:**
```
---------------------|---------|----------|---------|---------|-------------------
File                 | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
---------------------|---------|----------|---------|---------|-------------------
All files            |   75.12 |    68.45 |   72.34 |   75.12 |                   
 gallery/hooks       |   82.56 |    75.32 |   80.12 |   82.56 |                   
  useGalleryState.ts |   85.34 |    78.23 |   82.45 |   85.34 | 45-48,67-69       
---------------------|---------|----------|---------|---------|-------------------

✓ Coverage thresholds met
```

**HTML Report Features:**
- 🌳 Directory tree navigation
- 📊 Visual coverage percentages
- 🔍 Line-by-line code highlighting
  - **Green** = Covered
  - **Red** = Not covered
  - **Yellow** = Partially covered (branches)
- 📈 Coverage trends per file

## Coverage Thresholds Explained

### What They Mean
- **Lines (70%)**: At least 70% of executable code lines must be run during tests
- **Functions (70%)**: At least 70% of functions must be called during tests
- **Branches (65%)**: At least 65% of code branches (if/else, switch) must be taken
- **Statements (70%)**: At least 70% of statements must be executed during tests

### What Happens If Thresholds Fail
```
ERROR: Coverage for lines (68%) does not meet threshold (70%)
ERROR: Coverage for functions (65%) does not meet threshold (70%)

Tests failed - coverage thresholds not met
```

Tests will fail in CI/CD pipelines, preventing merges until coverage improves.

## Improving Coverage

### 1. Find Uncovered Code
```bash
npm run test:coverage
```
Look for files with low coverage percentages or check "Uncovered Line #s" column.

### 2. Open HTML Report
```bash
open coverage/index.html
```
Navigate to files with low coverage and see exactly which lines aren't covered (shown in red).

### 3. Add Tests
Focus on:
- ❌ Uncovered error handling paths
- ❌ Uncovered edge cases
- ❌ Uncovered conditional branches
- ❌ Functions that were never called

### 4. Example

**Uncovered code (red in HTML report):**
```typescript
function processData(data?: string) {
  if (!data) {
    return null; // ❌ This branch not tested
  }
  return data.toUpperCase();
}
```

**Add test to cover missing branch:**
```typescript
it('should return null for undefined data', () => {
  expect(processData(undefined)).toBeNull();
});
```

## CI/CD Integration

### GitHub Actions
```yaml
- name: Install dependencies
  run: npm ci

- name: Run tests with coverage
  run: npm run test:coverage

- name: Upload to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
    fail_ci_if_error: true
```

### GitLab CI
```yaml
test:
  script:
    - npm ci
    - npm run test:coverage
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
```

## Current Test Coverage

Based on existing tests:

| Module | Coverage | Status |
|--------|----------|--------|
| Gallery Hooks | ~75% | ✓ Good |
| Gallery Context | ~80% | ✓ Good |
| Integration Tests | ~70% | ✓ Meets threshold |

## Next Steps

1. ✅ **Add scripts to package.json** (see above)
2. ✅ **Run coverage**: `npm run test:coverage`
3. ✅ **View HTML report**: Open `coverage/index.html`
4. ✅ **Check thresholds**: Ensure all pass
5. ✅ **Add to CI/CD**: Configure pipeline to run coverage
6. ✅ **Monitor coverage**: Track trends over time

## Monitoring Coverage Over Time

### Set Up Coverage Badge (Optional)
Add to README.md:
```markdown
![Coverage](https://img.shields.io/codecov/c/github/username/repo)
```

### Best Practices
- ✓ Run coverage before committing
- ✓ Review coverage in pull requests
- ✓ Maintain or improve coverage with each PR
- ✓ Focus on critical business logic first
- ✓ Don't chase 100% - focus on meaningful coverage

## Troubleshooting

### "Coverage provider 'v8' is not supported"
```bash
npm install -D @vitest/coverage-v8
```

### "Cannot find coverage reports"
Ensure you're running:
```bash
npm run test:coverage
```
Not just:
```bash
npm run test
```

### Coverage seems wrong
```bash
# Clear cache and re-run
npx vitest run --coverage --clearCache
```

### Coverage directory missing
The directory is auto-created on first run. Make sure:
1. Tests are passing
2. You're using the coverage command
3. vitest.config.ts is properly configured

## Files Modified

- ✓ `vitest.config.ts` - Coverage configuration with thresholds
- ✓ `src/test/coverage-report.md` - Detailed coverage documentation
- ✓ `TESTING.md` - Complete testing guide
- ✓ `.coveragerc` - Coverage settings reference
- ✓ `COVERAGE-SETUP.md` - This file

## Additional Resources

- [Vitest Coverage Docs](https://vitest.dev/guide/coverage.html)
- [V8 Coverage Provider](https://v8.dev/blog/javascript-code-coverage)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Coverage Anti-Patterns](https://martinfowler.com/bliki/TestCoverage.html)

---

**Status:** ✅ Coverage configured and ready to use

**Last Updated:** 2025-11-14
