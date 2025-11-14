# CI/CD Setup Guide

This guide explains the GitHub Actions workflows set up for automated testing and quality assurance.

## Overview

Three main workflows provide comprehensive testing coverage:

1. **E2E Tests** - Full end-to-end testing across browsers
2. **Visual Regression** - Screenshot comparison testing
3. **Test Coverage** - Unit test coverage reporting

## Workflows

### 1. E2E Tests (`e2e-tests.yml`)

**Triggers:**
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`
- Manual workflow dispatch

**Features:**
- Runs across 3 browsers (Chromium, Firefox, WebKit)
- Parallel execution with sharding (2 shards per browser)
- Automatic test artifact uploads
- PR comments with test results

**Artifacts:**
- Test results (JSON)
- Playwright HTML reports
- Screenshots on failure
- Videos on failure
- Trace files for debugging

**Duration:** ~15-20 minutes

### 2. Visual Regression Tests (`visual-regression.yml`)

**Triggers:**
- Pull requests with UI file changes
- Pushes to `main` or `develop`
- Manual workflow dispatch

**Features:**
- Screenshot comparison testing
- Diff image generation
- Visual diff gallery (HTML report)
- Detailed PR comments with affected tests

**Artifacts:**
- Visual diff images (expected, actual, diff)
- Visual diff gallery (HTML viewer)
- Baseline snapshots (on main branch)

**Duration:** ~10-15 minutes

### 3. Test Coverage (`test-coverage.yml`)

**Triggers:**
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`
- Manual workflow dispatch

**Features:**
- Unit test execution with coverage
- Coverage threshold validation
- Visual coverage bars in PR comments
- HTML coverage reports

**Artifacts:**
- Coverage reports (HTML, JSON, LCOV)
- Coverage summary

**Duration:** ~5 minutes

## PR Comments

Each workflow posts comments to PRs with relevant information:

### E2E Test Comment Example
```
## ✅ E2E Test Results

**Workflow:** View Details

### Summary
- **Status:** success
- **Browsers:** chromium, firefox, webkit
- **Shards:** 2 per browser
```

### Visual Regression Comment Example
```
## ⚠️ Visual Regression Test Results

### ⚠️ Visual Differences Detected

**Found 3 visual difference(s)** across browsers: chromium firefox

### Affected Tests
- **gallery-grid-6-items** (chromium)
- **upload-zone-hover** (firefox)
- **batch-edit-modal** (chromium)

### 📸 Review Changes
1. View workflow run
2. Download visual-diff-gallery artifact
3. Review side-by-side comparisons
```

### Coverage Comment Example
```
## 📊 Test Coverage Report

| Metric | Coverage | Visual |
|--------|----------|--------|
| 🟢 Lines | 75.2% | `███████░░░` |
| 🟢 Statements | 73.8% | `███████░░░` |
| 🟡 Functions | 68.5% | `██████░░░░` |
| 🟡 Branches | 67.3% | `██████░░░░` |

✅ Coverage meets thresholds!
```

## Viewing Test Results

### GitHub Actions Tab
1. Go to repository → Actions tab
2. Select workflow run
3. View job logs and artifacts

### Downloading Artifacts
1. Navigate to completed workflow run
2. Scroll to "Artifacts" section
3. Download desired artifacts (reports, screenshots, etc.)

### Visual Diff Gallery
1. Download `visual-diff-gallery` artifact
2. Extract ZIP file
3. Open `index.html` in browser
4. View side-by-side comparisons

## Handling Test Failures

### E2E Test Failures

1. **Check workflow logs:**
   - Click failed job
   - Review error messages
   - Check screenshot/video artifacts

2. **Download artifacts:**
   ```bash
   # From Actions tab, download test-results-{browser}-{shard}
   # Extract and review screenshots/videos
   ```

3. **Run tests locally:**
   ```bash
   npm run test:e2e -- --project=chromium --headed
   ```

### Visual Regression Failures

1. **Review visual diffs:**
   - Download visual-diff-gallery artifact
   - Compare expected vs actual screenshots

2. **If changes are intentional:**
   ```bash
   npm run test:e2e e2e/gallery-visual-regression.spec.ts -- --update-snapshots
   git add e2e/**/*-snapshots/
   git commit -m "Update visual regression baselines"
   git push
   ```

3. **If changes are bugs:**
   - Fix the CSS/component issue
   - Push changes
   - Tests will re-run automatically

### Coverage Failures

1. **Review coverage report:**
   - Download coverage-report artifact
   - Open `index.html` to see uncovered lines

2. **Add missing tests:**
   ```bash
   # Run coverage locally
   npm run test:coverage
   
   # View report
   open coverage/index.html
   ```

3. **Focus on:**
   - Untested functions
   - Uncovered branches
   - Edge cases

## Skipping CI

To skip CI runs on specific commits:

```bash
git commit -m "docs: update readme [skip ci]"
```

Or for visual tests only:

```bash
git commit -m "refactor: internal logic [skip visual]"
```

## Manual Workflow Runs

Run workflows manually from GitHub:

1. Go to Actions tab
2. Select workflow
3. Click "Run workflow"
4. Select branch
5. Click "Run workflow" button

## Workflow Configuration

### Concurrency Control

Workflows cancel in-progress runs when new ones start:
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

### Timeout Settings

- E2E Tests: 60 minutes per job
- Visual Tests: 30 minutes per job
- Coverage: 15 minutes per job

### Artifact Retention

- Test results: 30 days
- Visual diffs: 30 days
- Baseline snapshots: 90 days
- Coverage reports: 30 days

## Required Permissions

Workflows require these permissions:
```yaml
permissions:
  pull-requests: write  # For PR comments
  contents: read        # For code checkout
```

These are granted automatically via `GITHUB_TOKEN`.

## Branch Protection

Recommended branch protection rules for `main`:

1. **Status checks:**
   - Require E2E Tests to pass
   - Require Visual Regression to pass
   - Require Test Coverage to pass

2. **Review requirements:**
   - Require 1 approval
   - Dismiss stale reviews

3. **Additional rules:**
   - Require conversation resolution
   - Require linear history

## Optimization Tips

### Faster CI Runs

1. **Use sharding:**
   ```yaml
   strategy:
     matrix:
       shardIndex: [1, 2, 3, 4]
       shardTotal: [4]
   ```

2. **Cache dependencies:**
   ```yaml
   - uses: actions/cache@v4
     with:
       path: ~/.npm
       key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
   ```

3. **Selective test runs:**
   ```yaml
   paths:
     - 'src/**/*.tsx'
     - 'src/**/*.css'
   ```

### Reduce Artifact Size

1. **Compress screenshots:**
   ```yaml
   - run: |
       find test-results -name "*.png" -exec pngquant --force --output {} {} \;
   ```

2. **Upload selectively:**
   ```yaml
   if: failure()  # Only on failures
   ```

## Troubleshooting

### Tests pass locally but fail in CI

**Possible causes:**
- Different Node.js versions
- Missing environment variables
- Timing issues (faster/slower CI)

**Solutions:**
```bash
# Match CI Node version
nvm use 20

# Check for race conditions
npm run test:e2e -- --repeat-each=3

# Enable debug logging
DEBUG=pw:api npm run test:e2e
```

### Flaky visual tests

**Solutions:**
```typescript
// Increase threshold
await expect(page).toHaveScreenshot('test.png', {
  maxDiffPixelRatio: 0.02,
  threshold: 0.3,
});

// Wait for animations
await page.waitForLoadState('networkidle');
await page.evaluate(() => document.fonts.ready);
```

### GitHub API rate limits

If getting rate limit errors:
1. Reduce comment frequency
2. Use GitHub App instead of GITHUB_TOKEN
3. Batch operations

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright CI Guide](https://playwright.dev/docs/ci)
- [Testing Best Practices](./TESTING.md)
- [Visual Regression Guide](./VISUAL-REGRESSION.md)

## Support

For issues with CI/CD:
1. Check workflow logs in Actions tab
2. Review this documentation
3. Open an issue with workflow run link
