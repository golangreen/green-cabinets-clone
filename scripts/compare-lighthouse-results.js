#!/usr/bin/env node

/**
 * Compare Lighthouse results with baseline
 * Generates comparison report and trend analysis
 */

const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.join(process.cwd(), 'lighthouse-reports');
const BASELINE_DIR = path.join(process.cwd(), 'baseline-reports', 'lighthouse-reports');

console.log('📊 Comparing with baseline...\n');

try {
  // Read current results
  const summaryPath = path.join(REPORTS_DIR, 'summary.json');
  if (!fs.existsSync(summaryPath)) {
    console.log('No current summary found');
    process.exit(0);
  }

  const current = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

  // Read baseline
  const baselinePath = path.join(BASELINE_DIR, 'summary.json');
  if (!fs.existsSync(baselinePath)) {
    console.log('No baseline found - this will be the new baseline');
    process.exit(0);
  }

  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));

  // Compare scores
  const comparison = {
    timestamp: new Date().toISOString(),
    baseline: {
      timestamp: baseline.timestamp,
      scores: baseline.scores,
      metrics: baseline.metrics,
    },
    current: {
      scores: current.scores,
      metrics: current.metrics,
    },
    changes: {
      scores: {},
      metrics: {},
    },
    summary: {
      improved: 0,
      regressed: 0,
      unchanged: 0,
    },
  };

  // Compare scores
  for (const [key, score] of Object.entries(current.scores)) {
    const baselineScore = baseline.scores[key] || 0;
    const delta = score - baselineScore;
    
    comparison.changes.scores[key] = {
      baseline: baselineScore,
      current: score,
      delta: delta,
      deltaPercent: baselineScore > 0 ? ((delta / baselineScore) * 100).toFixed(1) : 0,
      status: delta > 0 ? 'improved' : delta < 0 ? 'regressed' : 'unchanged',
    };

    if (delta > 0) comparison.summary.improved++;
    else if (delta < 0) comparison.summary.regressed++;
    else comparison.summary.unchanged++;
  }

  // Compare metrics
  for (const [key, value] of Object.entries(current.metrics)) {
    const baselineValue = baseline.metrics[key] || 0;
    const delta = value - baselineValue;
    
    // For metrics, lower is better (except for scores)
    const status = delta < 0 ? 'improved' : delta > 0 ? 'regressed' : 'unchanged';
    
    comparison.changes.metrics[key] = {
      baseline: baselineValue,
      current: value,
      delta: delta,
      deltaPercent: baselineValue > 0 ? ((delta / baselineValue) * 100).toFixed(1) : 0,
      status: status,
    };

    if (status === 'improved') comparison.summary.improved++;
    else if (status === 'regressed') comparison.summary.regressed++;
    else comparison.summary.unchanged++;
  }

  // Save comparison
  const comparisonPath = path.join(REPORTS_DIR, 'comparison.json');
  fs.writeFileSync(comparisonPath, JSON.stringify(comparison, null, 2));

  console.log('✅ Comparison complete!');
  console.log(`Comparison saved to: ${comparisonPath}`);
  console.log('\nSummary:');
  console.log(`  📈 Improved: ${comparison.summary.improved}`);
  console.log(`  📉 Regressed: ${comparison.summary.regressed}`);
  console.log(`  ➡️  Unchanged: ${comparison.summary.unchanged}`);

  // Log significant changes
  console.log('\nSignificant changes:');
  
  for (const [key, change] of Object.entries(comparison.changes.scores)) {
    if (Math.abs(change.delta) >= 5) {
      const emoji = change.delta > 0 ? '📈' : '📉';
      console.log(`  ${emoji} ${key}: ${change.baseline} → ${change.current} (${change.delta > 0 ? '+' : ''}${change.delta})`);
    }
  }

  for (const [key, change] of Object.entries(comparison.changes.metrics)) {
    if (Math.abs(change.deltaPercent) >= 10) {
      const emoji = change.status === 'improved' ? '📈' : '📉';
      console.log(`  ${emoji} ${key}: ${change.baseline}ms → ${change.current}ms (${change.delta > 0 ? '+' : ''}${change.delta}ms)`);
    }
  }

} catch (error) {
  console.error('❌ Error comparing results:', error);
  process.exit(1);
}
