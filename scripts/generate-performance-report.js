#!/usr/bin/env node

/**
 * Generate HTML performance report
 */

const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.join(process.cwd(), 'lighthouse-reports');

console.log('📄 Generating HTML report...\n');

try {
  const summaryPath = path.join(REPORTS_DIR, 'summary.json');
  if (!fs.existsSync(summaryPath)) {
    console.log('No summary found');
    process.exit(0);
  }

  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

  // Read comparison if available
  let comparison = null;
  const comparisonPath = path.join(REPORTS_DIR, 'comparison.json');
  if (fs.existsSync(comparisonPath)) {
    comparison = JSON.parse(fs.readFileSync(comparisonPath, 'utf8'));
  }

  const html = generateHtml(summary, comparison);

  const htmlPath = path.join(REPORTS_DIR, 'report.html');
  fs.writeFileSync(htmlPath, html);

  console.log(`✅ HTML report saved to: ${htmlPath}`);

} catch (error) {
  console.error('❌ Error generating report:', error);
  process.exit(1);
}

function generateHtml(summary, comparison) {
  const getScoreColor = (score) => {
    if (score >= 90) return '#0cce6b';
    if (score >= 50) return '#ffa400';
    return '#ff4e42';
  };

  const formatMs = (ms) => {
    if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
    return `${Math.round(ms)}ms`;
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lighthouse Performance Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      background: #f8f9fa;
      color: #202124;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .header {
      background: white;
      padding: 40px;
      border-radius: 8px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    h1 { font-size: 32px; margin-bottom: 8px; }
    .timestamp { color: #5f6368; font-size: 14px; }
    .scores-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .score-card {
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      text-align: center;
    }
    .score-value {
      font-size: 48px;
      font-weight: bold;
      margin: 16px 0;
    }
    .score-label {
      font-size: 14px;
      color: #5f6368;
      text-transform: uppercase;
      font-weight: 500;
    }
    .gauge {
      width: 120px;
      height: 120px;
      margin: 0 auto;
      position: relative;
    }
    .gauge-circle {
      fill: none;
      stroke: #e0e0e0;
      stroke-width: 8;
    }
    .gauge-progress {
      fill: none;
      stroke-width: 8;
      stroke-linecap: round;
      transform: rotate(-90deg);
      transform-origin: 50% 50%;
      transition: stroke-dashoffset 0.3s ease;
    }
    .metrics-section {
      background: white;
      padding: 32px;
      border-radius: 8px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    h2 { font-size: 24px; margin-bottom: 24px; }
    .metric-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .metric-row:last-child { border-bottom: none; }
    .metric-label {
      font-size: 14px;
      color: #5f6368;
    }
    .metric-value {
      font-size: 18px;
      font-weight: 600;
    }
    .metric-status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      margin-left: 12px;
    }
    .status-good { background: #e6f4ea; color: #137333; }
    .status-average { background: #fef7e0; color: #b06000; }
    .status-poor { background: #fce8e6; color: #c5221f; }
    .opportunities {
      background: white;
      padding: 32px;
      border-radius: 8px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .opportunity {
      padding: 16px;
      margin: 12px 0;
      background: #f8f9fa;
      border-radius: 4px;
      border-left: 4px solid #1a73e8;
    }
    .opportunity-title { font-weight: 600; margin-bottom: 8px; }
    .opportunity-savings {
      color: #137333;
      font-weight: 500;
      font-size: 14px;
    }
    .delta {
      font-size: 14px;
      margin-left: 8px;
      color: #5f6368;
    }
    .delta.improved { color: #137333; }
    .delta.regressed { color: #c5221f; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Lighthouse Performance Report</h1>
      <p class="timestamp">Generated: ${new Date(summary.timestamp).toLocaleString()}</p>
    </div>

    <div class="scores-grid">
      ${Object.entries(summary.scores)
        .map(
          ([key, score]) => `
        <div class="score-card">
          <div class="gauge">
            <svg viewBox="0 0 120 120">
              <circle class="gauge-circle" cx="60" cy="60" r="54" />
              <circle
                class="gauge-progress"
                cx="60"
                cy="60"
                r="54"
                stroke="${getScoreColor(score)}"
                stroke-dasharray="${(score / 100) * 339.292} 339.292"
              />
            </svg>
          </div>
          <div class="score-value" style="color: ${getScoreColor(score)}">${score}</div>
          <div class="score-label">${key.replace('-', ' ')}</div>
          ${
            comparison && comparison.changes.scores[key]
              ? `<div class="delta ${comparison.changes.scores[key].status}">
                ${comparison.changes.scores[key].delta > 0 ? '+' : ''}${comparison.changes.scores[key].delta}
              </div>`
              : ''
          }
        </div>
      `
        )
        .join('')}
    </div>

    <div class="metrics-section">
      <h2>⚡ Core Web Vitals</h2>
      ${
        summary.metrics.lcp
          ? `
      <div class="metric-row">
        <div>
          <div class="metric-label">Largest Contentful Paint</div>
        </div>
        <div>
          <span class="metric-value">${formatMs(summary.metrics.lcp)}</span>
          <span class="metric-status ${summary.metrics.lcp <= 2500 ? 'status-good' : summary.metrics.lcp <= 4000 ? 'status-average' : 'status-poor'}">
            ${summary.metrics.lcp <= 2500 ? 'Good' : summary.metrics.lcp <= 4000 ? 'Needs Improvement' : 'Poor'}
          </span>
        </div>
      </div>
      `
          : ''
      }
      ${
        summary.metrics.cls !== undefined
          ? `
      <div class="metric-row">
        <div>
          <div class="metric-label">Cumulative Layout Shift</div>
        </div>
        <div>
          <span class="metric-value">${(summary.metrics.cls / 1000).toFixed(3)}</span>
          <span class="metric-status ${summary.metrics.cls <= 100 ? 'status-good' : summary.metrics.cls <= 250 ? 'status-average' : 'status-poor'}">
            ${summary.metrics.cls <= 100 ? 'Good' : summary.metrics.cls <= 250 ? 'Needs Improvement' : 'Poor'}
          </span>
        </div>
      </div>
      `
          : ''
      }
      ${
        summary.metrics.fcp
          ? `
      <div class="metric-row">
        <div>
          <div class="metric-label">First Contentful Paint</div>
        </div>
        <div>
          <span class="metric-value">${formatMs(summary.metrics.fcp)}</span>
          <span class="metric-status ${summary.metrics.fcp <= 1800 ? 'status-good' : summary.metrics.fcp <= 3000 ? 'status-average' : 'status-poor'}">
            ${summary.metrics.fcp <= 1800 ? 'Good' : summary.metrics.fcp <= 3000 ? 'Needs Improvement' : 'Poor'}
          </span>
        </div>
      </div>
      `
          : ''
      }
      ${
        summary.metrics.tbt
          ? `
      <div class="metric-row">
        <div>
          <div class="metric-label">Total Blocking Time</div>
        </div>
        <div>
          <span class="metric-value">${formatMs(summary.metrics.tbt)}</span>
          <span class="metric-status ${summary.metrics.tbt <= 200 ? 'status-good' : summary.metrics.tbt <= 600 ? 'status-average' : 'status-poor'}">
            ${summary.metrics.tbt <= 200 ? 'Good' : summary.metrics.tbt <= 600 ? 'Needs Improvement' : 'Poor'}
          </span>
        </div>
      </div>
      `
          : ''
      }
      ${
        summary.metrics.si
          ? `
      <div class="metric-row">
        <div>
          <div class="metric-label">Speed Index</div>
        </div>
        <div>
          <span class="metric-value">${formatMs(summary.metrics.si)}</span>
          <span class="metric-status ${summary.metrics.si <= 3400 ? 'status-good' : summary.metrics.si <= 5800 ? 'status-average' : 'status-poor'}">
            ${summary.metrics.si <= 3400 ? 'Good' : summary.metrics.si <= 5800 ? 'Needs Improvement' : 'Poor'}
          </span>
        </div>
      </div>
      `
          : ''
      }
      ${
        summary.metrics.tti
          ? `
      <div class="metric-row">
        <div>
          <div class="metric-label">Time to Interactive</div>
        </div>
        <div>
          <span class="metric-value">${formatMs(summary.metrics.tti)}</span>
          <span class="metric-status ${summary.metrics.tti <= 3800 ? 'status-good' : summary.metrics.tti <= 7300 ? 'status-average' : 'status-poor'}">
            ${summary.metrics.tti <= 3800 ? 'Good' : summary.metrics.tti <= 7300 ? 'Needs Improvement' : 'Poor'}
          </span>
        </div>
      </div>
      `
          : ''
      }
    </div>

    ${
      summary.opportunities && summary.opportunities.length > 0
        ? `
    <div class="opportunities">
      <h2>💡 Optimization Opportunities</h2>
      ${summary.opportunities
        .slice(0, 10)
        .map(
          (opp) => `
        <div class="opportunity">
          <div class="opportunity-title">${opp.title}</div>
          <div class="opportunity-savings">Potential savings: ~${formatMs(opp.numericValue)}</div>
        </div>
      `
        )
        .join('')}
    </div>
    `
        : ''
    }
  </div>
</body>
</html>
  `;
}
