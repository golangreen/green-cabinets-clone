# Performance Monitoring Guide

Comprehensive performance monitoring using Lighthouse CI to track Core Web Vitals, page load times, and performance budgets.

## Overview

Automated performance testing runs on every PR to ensure your app stays fast:

- **Core Web Vitals**: LCP, CLS, FCP, TBT, FID
- **Performance Budgets**: Resource size and timing limits
- **Trend Analysis**: Compare against baseline
- **Detailed Reports**: HTML and JSON reports with recommendations

## Running Performance Tests

### Local Testing

```bash
# Build the project
npm run build

# Serve the build
npx serve -s dist -l 8080

# Run Lighthouse (in another terminal)
npm run lighthouse

# View results
open .lighthouseci/report.html
```

### CI Testing

Performance tests run automatically on every PR:
- Triggered on PR to `main` or `develop`
- Tests all major pages
- Compares with baseline from `main` branch
- Posts detailed results as PR comments

## Core Web Vitals

### Largest Contentful Paint (LCP)
**Target: ≤ 2.5s**

Measures loading performance - when the largest content element becomes visible.

**Good**: ≤ 2.5s | **Needs Improvement**: 2.5s - 4.0s | **Poor**: > 4.0s

**How to improve:**
- Optimize images (WebP, lazy loading)
- Reduce server response times
- Eliminate render-blocking resources
- Use CDN for static assets

### Cumulative Layout Shift (CLS)
**Target: ≤ 0.1**

Measures visual stability - how much content shifts during load.

**Good**: ≤ 0.1 | **Needs Improvement**: 0.1 - 0.25 | **Poor**: > 0.25

**How to improve:**
- Set explicit dimensions on images and videos
- Reserve space for ads and embeds
- Avoid inserting content above existing content
- Use CSS transform instead of properties that trigger layout

### First Input Delay (FID)
**Target: ≤ 100ms**

Measures interactivity - time from first interaction to response.

**Good**: ≤ 100ms | **Needs Improvement**: 100ms - 300ms | **Poor**: > 300ms

**How to improve:**
- Break up long JavaScript tasks
- Optimize JavaScript execution
- Use web workers for heavy computation
- Reduce JavaScript payload

### First Contentful Paint (FCP)
**Target: ≤ 1.8s**

Time until first text or image is painted.

**How to improve:**
- Eliminate render-blocking resources
- Minify CSS
- Remove unused CSS
- Preconnect to required origins

### Time to Interactive (TTI)
**Target: ≤ 3.8s**

Time until page is fully interactive.

**How to improve:**
- Minimize main thread work
- Reduce JavaScript execution time
- Keep request counts low and transfer sizes small

### Speed Index
**Target: ≤ 3.4s**

How quickly content is visually displayed.

**How to improve:**
- Optimize content visibility
- Minimize critical rendering path
- Prioritize visible content

### Total Blocking Time (TBT)
**Target: ≤ 200ms**

Total time that main thread is blocked.

**How to improve:**
- Break up long tasks
- Optimize third-party scripts
- Use code splitting

## Performance Budgets

Performance budgets are defined in `budget.json` and enforce limits on:

### Resource Sizes (KB)

| Resource Type | Budget | Purpose |
|--------------|--------|---------|
| Document | 50 KB | HTML files |
| Scripts | 300 KB | JavaScript bundles |
| Stylesheets | 50 KB | CSS files |
| Images | 500 KB | All images combined |
| Fonts | 100 KB | Web fonts |
| **Total** | **1000 KB** | All resources |

### Resource Counts

| Resource Type | Budget | Purpose |
|--------------|--------|---------|
| Third-party | 10 | External scripts |
| Total | 50 | All requests |

### Timings

| Metric | Budget | Standard |
|--------|--------|----------|
| FCP | 2000ms | Good: ≤1800ms |
| LCP | 2500ms | Good: ≤2500ms |
| CLS | 0.1 | Good: ≤0.1 |
| TBT | 300ms | Good: ≤200ms |
| Speed Index | 4000ms | Good: ≤3400ms |
| TTI | 5000ms | Good: ≤3800ms |

## PR Comments

Performance tests post detailed comments on PRs:

```markdown
## 🚀 Lighthouse Performance Report

### 📊 Performance Scores
| Category | Score | Visual | Status |
|----------|-------|--------|--------|
| 🟢 Performance | 92 | `█████████░` | Pass |
| 🟢 Accessibility | 95 | `█████████░` | Pass |
| 🟢 Best Practices | 100 | `██████████` | Pass |
| 🟢 SEO | 100 | `██████████` | Pass |

### 🎯 Core Web Vitals
| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| Largest Contentful Paint | **2.1s** | 2500ms | ✅ Good |
| Cumulative Layout Shift | **0.05** | 0.1 | ✅ Good |
| First Contentful Paint | **1.5s** | 1800ms | ✅ Good |

### 💡 Top Optimization Opportunities
- **Eliminate render-blocking resources**: Save ~450ms
- **Properly size images**: Save ~320ms
- **Minify JavaScript**: Save ~180ms
```

## Understanding Results

### Score Ranges

- **90-100** 🟢 Good - No action needed
- **50-89** 🟡 Needs Improvement - Review opportunities
- **0-49** 🔴 Poor - Critical issues, must fix

### Trend Analysis

When comparing with baseline:
- 📈 **Improved** - Metric got better
- 📉 **Regressed** - Metric got worse
- ➡️ **Unchanged** - No significant change

### Budget Violations

If budgets fail:
1. Review the specific resource type
2. Check bundle analyzer for largest modules
3. Consider code splitting or lazy loading
4. Optimize images and fonts

## Optimization Strategies

### JavaScript

```bash
# Analyze bundle size
npm run build -- --stats
npx webpack-bundle-analyzer dist/stats.json

# Code splitting
# Use dynamic imports
const Component = lazy(() => import('./Component'));

# Tree shaking
# Ensure side-effect-free code
```

### Images

```bash
# Convert to WebP
npx @squoosh/cli --webp auto input.png

# Lazy loading
<img loading="lazy" src="image.jpg" alt="..." />

# Responsive images
<img
  srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 600px) 480px, 800px"
  src="medium.jpg"
  alt="..."
/>
```

### CSS

```css
/* Critical CSS - inline in <head> */
/* Non-critical CSS - load async */
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">

/* Remove unused CSS */
/* Use PurgeCSS or similar */
```

### Fonts

```css
/* Font display strategy */
@font-face {
  font-family: 'Custom';
  src: url('custom.woff2') format('woff2');
  font-display: swap; /* Show fallback immediately */
}

/* Preload critical fonts */
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>
```

### Caching

```javascript
// Service worker caching
// Use workbox or manual cache strategies

// HTTP caching headers
Cache-Control: public, max-age=31536000, immutable
```

## Monitoring in Production

### Set Up Monitoring

```javascript
// web-vitals library
import {getLCP, getFID, getCLS, getFCP, getTTFB} from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics
  console.log(metric);
}

getLCP(sendToAnalytics);
getFID(sendToAnalytics);
getCLS(sendToAnalytics);
getFCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Real User Monitoring (RUM)

Consider services like:
- Google Analytics 4
- Sentry Performance
- New Relic Browser
- DataDog RUM

## Troubleshooting

### High LCP

**Check:**
- Image optimization
- Server response time
- Render-blocking resources
- CDN usage

**Fix:**
```bash
# Optimize images
npm install sharp
# Use next-gen formats (WebP, AVIF)
# Implement lazy loading
# Use CDN for images
```

### High CLS

**Check:**
- Image dimensions
- Font loading
- Dynamic content insertion
- Ads and embeds

**Fix:**
```html
<!-- Set dimensions -->
<img width="800" height="600" src="..." alt="..." />

<!-- Reserve space -->
<div style="aspect-ratio: 16/9">
  <img src="..." alt="..." />
</div>
```

### High TBT/FID

**Check:**
- Long JavaScript tasks
- Third-party scripts
- Unoptimized code

**Fix:**
```javascript
// Break up long tasks
async function processLargeData(data) {
  for (let i = 0; i < data.length; i++) {
    await processChunk(data[i]);
    // Yield to main thread
    if (i % 100 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
}
```

### Large Bundle Size

**Check:**
```bash
# Analyze bundle
npx webpack-bundle-analyzer dist/stats.json

# Check what's in your bundle
npx source-map-explorer dist/**/*.js
```

**Fix:**
- Remove unused dependencies
- Use code splitting
- Lazy load routes
- Tree shake properly

## Best Practices

### Development

1. **Test locally** before pushing
2. **Monitor bundle size** in development
3. **Use performance profiler** in DevTools
4. **Check lighthouse** after major changes

### CI/CD

1. **Run tests on every PR**
2. **Block merges** if critical threshold fails
3. **Review trends** regularly
4. **Update budgets** as needed

### Deployment

1. **Enable compression** (gzip/brotli)
2. **Use CDN** for static assets
3. **Enable HTTP/2**
4. **Implement caching** strategy
5. **Monitor real users** (RUM)

## Resources

### Tools
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [WebPageTest](https://www.webpagetest.org/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [web-vitals library](https://github.com/GoogleChrome/web-vitals)

### Learning
- [Web.dev - Performance](https://web.dev/performance/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Performance Budgets](https://web.dev/performance-budgets-101/)
- [Optimize LCP](https://web.dev/optimize-lcp/)
- [Optimize CLS](https://web.dev/optimize-cls/)

### Metrics
- [Lighthouse Scoring](https://web.dev/performance-scoring/)
- [Core Web Vitals Thresholds](https://web.dev/defining-core-web-vitals-thresholds/)

## Support

For performance issues:
1. Check this documentation
2. Review Lighthouse reports
3. Use Chrome DevTools Performance tab
4. Open an issue with "perf:" prefix
