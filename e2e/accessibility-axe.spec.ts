/**
 * Accessibility Tests using Axe-core
 * Tests WCAG 2.1 Level A & AA compliance
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';

// Pages to test
const PAGES_TO_TEST = [
  { url: '/', name: 'home' },
  { url: '/admin/gallery', name: 'admin-gallery' },
  { url: '/vanity-designer', name: 'vanity-designer' },
];

// Ensure reports directory exists
const reportsDir = path.join(process.cwd(), 'accessibility-reports', 'axe');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

test.describe('Axe Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  for (const pageConfig of PAGES_TO_TEST) {
    test(`${pageConfig.name} page should not have accessibility violations`, async ({ page }) => {
      await page.goto(pageConfig.url);
      await page.waitForLoadState('networkidle');

      // Run axe accessibility tests
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Save detailed report
      const reportPath = path.join(reportsDir, `${pageConfig.name}.json`);
      fs.writeFileSync(
        reportPath,
        JSON.stringify(accessibilityScanResults, null, 2)
      );

      // Generate HTML report
      const htmlReport = generateHtmlReport(pageConfig.name, accessibilityScanResults);
      const htmlPath = path.join(reportsDir, `${pageConfig.name}.html`);
      fs.writeFileSync(htmlPath, htmlReport);

      console.log(`Accessibility report saved: ${reportPath}`);
      console.log(`HTML report saved: ${htmlPath}`);

      // Log violations
      if (accessibilityScanResults.violations.length > 0) {
        console.log(`\n${pageConfig.name} violations:`);
        accessibilityScanResults.violations.forEach(violation => {
          console.log(`  [${violation.impact}] ${violation.id}: ${violation.description}`);
          console.log(`    Help: ${violation.helpUrl}`);
          console.log(`    Nodes: ${violation.nodes.length}`);
        });
      }

      // Assert no violations
      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test(`${pageConfig.name} page critical issues`, async ({ page }) => {
      await page.goto(pageConfig.url);
      await page.waitForLoadState('networkidle');

      // Test only critical issues
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .options({ resultTypes: ['violations'] })
        .analyze();

      const criticalViolations = accessibilityScanResults.violations.filter(
        v => v.impact === 'critical'
      );

      if (criticalViolations.length > 0) {
        console.log(`\nCritical violations on ${pageConfig.name}:`);
        criticalViolations.forEach(v => {
          console.log(`  ${v.id}: ${v.description}`);
        });
      }

      expect(criticalViolations).toEqual([]);
    });

    test(`${pageConfig.name} page keyboard navigation`, async ({ page }) => {
      await page.goto(pageConfig.url);
      await page.waitForLoadState('networkidle');

      // Test keyboard focus order
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['focus-order-semantics'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test(`${pageConfig.name} page color contrast`, async ({ page }) => {
      await page.goto(pageConfig.url);
      await page.waitForLoadState('networkidle');

      // Test color contrast
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['color-contrast'])
        .analyze();

      const contrastViolations = accessibilityScanResults.violations;

      if (contrastViolations.length > 0) {
        console.log(`\nColor contrast violations on ${pageConfig.name}:`);
        contrastViolations.forEach(v => {
          console.log(`  ${v.description}`);
          v.nodes.forEach(node => {
            console.log(`    - ${node.html}`);
          });
        });
      }

      expect(contrastViolations).toEqual([]);
    });

    test(`${pageConfig.name} page ARIA attributes`, async ({ page }) => {
      await page.goto(pageConfig.url);
      await page.waitForLoadState('networkidle');

      // Test ARIA usage
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['best-practice', 'cat.aria'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }

  test('gallery with images - accessibility', async ({ page }) => {
    await page.goto('/admin/gallery');
    await page.waitForLoadState('networkidle');

    // Check initial state
    let scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(scanResults.violations).toEqual([]);

    // Upload an image and check again
    // (This would need actual file upload implementation)
    // For now, just verify the page structure
  });

  test('form elements - accessibility', async ({ page }) => {
    await page.goto('/admin/gallery');
    await page.waitForLoadState('networkidle');

    // Test form accessibility
    const scanResults = await new AxeBuilder({ page })
      .withRules(['label', 'button-name', 'input-button-name'])
      .analyze();

    expect(scanResults.violations).toEqual([]);
  });

  test('interactive elements - accessibility', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test interactive elements
    const scanResults = await new AxeBuilder({ page })
      .withRules(['link-name', 'button-name'])
      .analyze();

    expect(scanResults.violations).toEqual([]);
  });

  test('heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test heading structure
    const scanResults = await new AxeBuilder({ page })
      .withRules(['heading-order'])
      .analyze();

    expect(scanResults.violations).toEqual([]);
  });

  test('landmark regions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test landmark regions
    const scanResults = await new AxeBuilder({ page })
      .withRules(['region', 'landmark-one-main'])
      .analyze();

    expect(scanResults.violations).toEqual([]);
  });
});

/**
 * Generate HTML report for violations
 */
function generateHtmlReport(pageName: string, results: any): string {
  const { violations, passes, incomplete } = results;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Report - ${pageName}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 { margin: 0 0 10px 0; color: #333; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    .stat {
      background: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      margin: 10px 0;
    }
    .stat-label {
      color: #666;
      font-size: 14px;
      text-transform: uppercase;
    }
    .critical { color: #d32f2f; }
    .serious { color: #f57c00; }
    .moderate { color: #fbc02d; }
    .minor { color: #7cb342; }
    .passed { color: #388e3c; }
    .violation {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 15px;
      border-left: 4px solid;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .violation.critical { border-left-color: #d32f2f; }
    .violation.serious { border-left-color: #f57c00; }
    .violation.moderate { border-left-color: #fbc02d; }
    .violation.minor { border-left-color: #7cb342; }
    .violation-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 15px;
    }
    .violation-title {
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }
    .badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .badge.critical { background: #ffebee; color: #d32f2f; }
    .badge.serious { background: #fff3e0; color: #f57c00; }
    .badge.moderate { background: #fffde7; color: #fbc02d; }
    .badge.minor { background: #f1f8e9; color: #7cb342; }
    .violation-description {
      color: #666;
      margin: 10px 0;
    }
    .help-link {
      display: inline-block;
      margin: 10px 0;
      color: #1976d2;
      text-decoration: none;
    }
    .help-link:hover { text-decoration: underline; }
    .tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin: 10px 0;
    }
    .tag {
      background: #e3f2fd;
      color: #1976d2;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
    .nodes {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #eee;
    }
    .node {
      background: #f9f9f9;
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      overflow-x: auto;
    }
    .node-count {
      font-weight: bold;
      color: #666;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Accessibility Report: ${pageName}</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
  </div>

  <div class="summary">
    <div class="stat">
      <div class="stat-label">Violations</div>
      <div class="stat-value critical">${violations.length}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Passes</div>
      <div class="stat-value passed">${passes.length}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Incomplete</div>
      <div class="stat-value moderate">${incomplete.length}</div>
    </div>
  </div>

  ${violations.length === 0 ? `
    <div class="stat" style="grid-column: 1/-1; text-align: center; padding: 40px;">
      <h2 style="color: #388e3c;">🎉 No Violations Found!</h2>
      <p>This page passed all WCAG 2.1 Level AA accessibility checks.</p>
    </div>
  ` : `
    <h2>Violations (${violations.length})</h2>
    ${violations.map(v => `
      <div class="violation ${v.impact}">
        <div class="violation-header">
          <div class="violation-title">${v.id}</div>
          <span class="badge ${v.impact}">${v.impact}</span>
        </div>
        <div class="violation-description">${v.description}</div>
        <a href="${v.helpUrl}" target="_blank" class="help-link">
          📚 Learn more about ${v.id}
        </a>
        <div class="tags">
          ${v.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <div class="nodes">
          <div class="node-count">${v.nodes.length} element(s) affected:</div>
          ${v.nodes.slice(0, 3).map(node => `
            <div class="node">${escapeHtml(node.html)}</div>
          `).join('')}
          ${v.nodes.length > 3 ? `<div class="node-count">... and ${v.nodes.length - 3} more</div>` : ''}
        </div>
      </div>
    `).join('')}
  `}
</body>
</html>
  `;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
