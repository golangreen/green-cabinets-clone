#!/usr/bin/env node

/**
 * Pa11y test runner script
 * Runs pa11y-ci with custom reporting
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const reportsDir = path.join(process.cwd(), 'accessibility-reports', 'pa11y');

// Ensure reports directory exists
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Ensure screenshots directory exists
const screenshotsDir = path.join(reportsDir, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

console.log('🔍 Running Pa11y accessibility tests...\n');

// Run pa11y-ci
const pa11y = spawn('npx', ['pa11y-ci', '--json'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true
});

let stdout = '';
let stderr = '';

pa11y.stdout.on('data', (data) => {
  stdout += data.toString();
  process.stdout.write(data);
});

pa11y.stderr.on('data', (data) => {
  stderr += data.toString();
  process.stderr.write(data);
});

pa11y.on('close', (code) => {
  // Save results
  const resultsPath = path.join(reportsDir, 'results.json');
  
  try {
    let results;
    if (stdout.trim()) {
      // Try to parse JSON output
      try {
        results = JSON.parse(stdout);
      } catch (e) {
        // If not JSON, create structured output
        results = {
          timestamp: new Date().toISOString(),
          total: 0,
          errors: 0,
          warnings: 0,
          notices: 0,
          output: stdout,
          stderr: stderr
        };
      }
    } else {
      results = {
        timestamp: new Date().toISOString(),
        error: 'No output from pa11y-ci',
        stderr: stderr
      };
    }

    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n✅ Pa11y results saved to: ${resultsPath}`);

    // Generate HTML report
    generateHtmlReport(results);

  } catch (error) {
    console.error('Error saving results:', error);
  }

  // Exit with pa11y's exit code
  process.exit(code);
});

function generateHtmlReport(results) {
  const htmlPath = path.join(reportsDir, 'report.html');
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pa11y Accessibility Report</title>
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
    h1 { margin: 0; color: #333; }
    .timestamp { color: #666; margin-top: 10px; }
    .results {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    pre {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔍 Pa11y Accessibility Report</h1>
    <p class="timestamp">Generated: ${new Date(results.timestamp).toLocaleString()}</p>
  </div>
  <div class="results">
    <h2>Results</h2>
    <pre>${JSON.stringify(results, null, 2)}</pre>
  </div>
</body>
</html>
  `;

  fs.writeFileSync(htmlPath, html);
  console.log(`📄 HTML report saved to: ${htmlPath}`);
}
