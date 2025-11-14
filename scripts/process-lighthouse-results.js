#!/usr/bin/env node

/**
 * Process Lighthouse CI results
 * Extracts key metrics and generates summary
 */

const fs = require('fs');
const path = require('path');

const LIGHTHOUSE_DIR = path.join(process.cwd(), '.lighthouseci');
const REPORTS_DIR = path.join(process.cwd(), 'lighthouse-reports');

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

console.log('📊 Processing Lighthouse results...\n');

try {
  // Find manifest file
  const manifestPath = path.join(LIGHTHOUSE_DIR, 'manifest.json');
  
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ No Lighthouse results found');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  const summary = {
    timestamp: new Date().toISOString(),
    scores: {},
    metrics: {},
    opportunities: [],
    budgetStatus: { passed: 0, failed: 0, total: 0 },
    budgetViolations: [],
  };

  // Process each URL's results
  for (const entry of manifest) {
    const reportPath = path.join(LIGHTHOUSE_DIR, entry.jsonPath);
    
    if (!fs.existsSync(reportPath)) {
      console.warn(`⚠️  Report not found: ${reportPath}`);
      continue;
    }

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    const url = new URL(entry.url).pathname;
    
    console.log(`Processing: ${url}`);

    // Extract scores (average across multiple runs)
    const categories = report.categories || {};
    for (const [key, category] of Object.entries(categories)) {
      const score = Math.round((category.score || 0) * 100);
      if (!summary.scores[key]) {
        summary.scores[key] = [];
      }
      summary.scores[key].push(score);
    }

    // Extract Core Web Vitals and performance metrics
    const audits = report.audits || {};
    const metricsMap = {
      'first-contentful-paint': 'fcp',
      'largest-contentful-paint': 'lcp',
      'cumulative-layout-shift': 'cls',
      'total-blocking-time': 'tbt',
      'speed-index': 'si',
      'interactive': 'tti',
      'max-potential-fid': 'fid',
    };

    for (const [auditKey, metricKey] of Object.entries(metricsMap)) {
      const audit = audits[auditKey];
      if (audit && audit.numericValue !== undefined) {
        if (!summary.metrics[metricKey]) {
          summary.metrics[metricKey] = [];
        }
        summary.metrics[metricKey].push(audit.numericValue);
      }
    }

    // Extract opportunities
    const opportunityAudits = [
      'unused-javascript',
      'unused-css-rules',
      'modern-image-formats',
      'offscreen-images',
      'render-blocking-resources',
      'unminified-css',
      'unminified-javascript',
      'uses-optimized-images',
      'uses-text-compression',
      'uses-responsive-images',
    ];

    for (const auditKey of opportunityAudits) {
      const audit = audits[auditKey];
      if (audit && audit.details && audit.details.overallSavingsMs > 0) {
        summary.opportunities.push({
          id: auditKey,
          title: audit.title,
          description: audit.description,
          numericValue: audit.details.overallSavingsMs,
          displayValue: audit.displayValue,
          url: url,
        });
      }
    }

    // Check performance budget
    const budgetAudit = audits['performance-budget'];
    if (budgetAudit && budgetAudit.details && budgetAudit.details.items) {
      for (const item of budgetAudit.details.items) {
        summary.budgetStatus.total++;
        if (item.sizeOverBudget && item.sizeOverBudget > 0) {
          summary.budgetStatus.failed++;
          summary.budgetViolations.push({
            metric: item.label,
            budget: item.budget,
            actual: item.size,
            overage: item.sizeOverBudget,
          });
        } else {
          summary.budgetStatus.passed++;
        }
      }
    }
  }

  // Average scores and metrics
  for (const [key, values] of Object.entries(summary.scores)) {
    summary.scores[key] = Math.round(
      values.reduce((a, b) => a + b, 0) / values.length
    );
  }

  for (const [key, values] of Object.entries(summary.metrics)) {
    summary.metrics[key] = Math.round(
      values.reduce((a, b) => a + b, 0) / values.length
    );
  }

  // Sort opportunities by potential savings
  summary.opportunities.sort((a, b) => b.numericValue - a.numericValue);

  // Save summary
  const summaryPath = path.join(REPORTS_DIR, 'summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  console.log('\n✅ Processing complete!');
  console.log(`Summary saved to: ${summaryPath}`);
  console.log('\nScores:');
  for (const [key, score] of Object.entries(summary.scores)) {
    const emoji = score >= 90 ? '🟢' : score >= 50 ? '🟡' : '🔴';
    console.log(`  ${emoji} ${key}: ${score}`);
  }

  console.log('\nCore Web Vitals:');
  if (summary.metrics.lcp) {
    console.log(`  LCP: ${summary.metrics.lcp}ms`);
  }
  if (summary.metrics.fid) {
    console.log(`  FID: ${summary.metrics.fid}ms`);
  }
  if (summary.metrics.cls) {
    console.log(`  CLS: ${(summary.metrics.cls / 1000).toFixed(3)}`);
  }

} catch (error) {
  console.error('❌ Error processing results:', error);
  process.exit(1);
}
