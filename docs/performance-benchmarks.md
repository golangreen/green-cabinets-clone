# Performance Benchmarks - Vanity Designer

## Overview
This document outlines performance benchmarks for measuring the impact of Phase 26 component decomposition and Phase 33 performance optimizations on the Vanity Designer feature.

## Optimization Summary

### Phase 26: Component Decomposition
- **Before**: Monolithic `Vanity3DPreview.tsx` (1200+ lines)
- **After**: Modular architecture with 15+ focused components
- **Impact**: Improved maintainability, testability, and code reusability

### Phase 33: Performance Optimizations
1. **useCallback Hooks** (7 handlers)
   - `SharePreviewCard`: handleCopyUrl, handleDownloadQR
   - `Vanity3DPreview`: handleMeasurementClick, downloadScreenshot, printView
   - `TemplateGallery`: handleDeleteClick, confirmDelete

2. **React.memo** (4 components)
   - `TextureSwatch`: Prevents re-render when gallery updates
   - `MeasurementLine`: Prevents 3D line re-render on state changes
   - `DimensionLabels`: Prevents label re-render on unrelated updates
   - `VanityPricingCard`: Prevents pricing re-render on config changes

3. **Lazy Loading** (7 fixture components)
   - BathroomFixtures, VanitySink, MirrorCabinet, BathroomAccessories
   - VanityFaucet, VanityBacksplash, VanityLighting
   - **Expected savings**: ~150KB initial bundle reduction

## Measuring Performance

### 1. React DevTools Profiler

**Setup:**
```bash
# Install React DevTools browser extension
# Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/
# Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/
```

**Measurement Steps:**
1. Open React DevTools → Profiler tab
2. Click "Record" (⏺)
3. Perform user interactions:
   - Change vanity dimensions (width, height, depth)
   - Switch brands/finishes
   - Toggle measurement mode
   - Open/close fullscreen preview
   - Add/remove hardware
4. Stop recording
5. Analyze flame graph and ranked chart

**Key Metrics:**
- **Render Count**: Number of times each component rendered
- **Render Duration**: Time spent rendering (ms)
- **Committed At**: When updates were committed to DOM

**Expected Results:**
- `TextureSwatch`: Should NOT re-render when non-texture config changes
- `VanityPricingCard`: Should NOT re-render when measurement mode toggles
- `MeasurementLine`: Should NOT re-render when pricing updates
- Lazy-loaded fixtures: Should only load when first needed

### 2. Bundle Size Analysis

**Build Analysis:**
```bash
npm run build
```

**Check Output:**
```bash
# Look for chunk sizes in build output
# Expected results:
# - Main bundle: Reduced by ~150KB (lazy fixtures)
# - Fixture chunks: Separate files loaded on-demand
# - Total size: Similar, but better distribution
```

**Lighthouse Bundle Analyzer:**
```bash
# In Chrome DevTools
# 1. Run Lighthouse audit
# 2. Check "Performance" → "Diagnostics"
# 3. Look for "Reduce JavaScript execution time"
# 4. Verify fixture components load on-demand
```

### 3. Runtime Performance Metrics

**Core Web Vitals:**
- **LCP (Largest Contentful Paint)**: Target < 2.5s
- **FID (First Input Delay)**: Target < 100ms
- **CLS (Cumulative Layout Shift)**: Target < 0.1

**Custom Metrics:**
```typescript
// Add to VanityDesignerApp for measurement
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

const VanityDesignerApp = () => {
  const { markStart, measureOperation } = usePerformanceMonitor({
    name: 'VanityDesignerApp',
    trackMount: true,
    trackRender: true,
  });

  const handleDimensionChange = useCallback((dimension: string, value: number) => {
    const mark = markStart('dimension-change');
    // ... existing logic
    measureOperation('dimension-change', mark.name);
  }, []);
};
```

### 4. Memory Profiling

**Chrome DevTools Memory Profiler:**
1. Open DevTools → Memory tab
2. Take heap snapshot before interactions
3. Perform vanity configuration changes
4. Take heap snapshot after
5. Compare snapshots for memory leaks

**Expected Results:**
- No significant memory growth after repeated interactions
- useCallback prevents function recreation
- React.memo prevents unnecessary object allocation

## Performance Targets

### Before Optimizations (Baseline)
- **Initial Bundle**: ~3.85MB (with all fixtures)
- **Render Count** (dimension change): 15-20 components
- **Render Duration**: 50-100ms per interaction
- **Memory Growth**: 2-5MB per configuration cycle

### After Optimizations (Target)
- **Initial Bundle**: ~3.70MB (lazy fixtures reduce initial load)
- **Render Count** (dimension change): 8-12 components (React.memo saves 4)
- **Render Duration**: 30-60ms per interaction (useCallback/memo optimizations)
- **Memory Growth**: 1-3MB per configuration cycle (fewer re-renders)

## Automated Testing

### Run E2E Tests
```bash
# Install dependencies
npx playwright install

# Run vanity designer tests
npx playwright test e2e/vanity-designer.spec.ts

# Run with UI mode for debugging
npx playwright test e2e/vanity-designer.spec.ts --ui

# Run specific test
npx playwright test -g "should update dimensions"
```

### Expected Test Results
All tests in `e2e/vanity-designer.spec.ts` should pass:
- ✅ Load vanity designer interface
- ✅ Update dimensions
- ✅ Select different brands
- ✅ Generate and send quote
- ✅ Toggle fullscreen preview

## Continuous Monitoring

### Production Performance Monitoring
The app includes built-in performance monitoring at `/admin/performance`:
- Real-time Web Vitals charts (LCP, CLS, TTFB, INP)
- Slowest operations table
- Performance budgets tracking
- Automated alerts for degradation

### Performance Budgets
```typescript
// From src/lib/performance.ts
export const PERFORMANCE_BUDGETS = {
  'vanity-config-update': 100,      // Max 100ms for config updates
  'texture-generation': 200,        // Max 200ms for texture generation
  '3d-preview-render': 300,         // Max 300ms for 3D render
  'dimension-calculation': 50,      // Max 50ms for calculations
} as const;
```

## Regression Testing

### Before Each Release
1. Run full Playwright E2E test suite
2. Generate Lighthouse performance report
3. Compare bundle sizes with previous build
4. Review React Profiler recordings
5. Check memory profiler for leaks
6. Verify lazy loading chunks are created

### Performance CI/CD Integration
```yaml
# Example GitHub Actions workflow
- name: Performance Tests
  run: |
    npm run build
    npm run test:e2e
    npm run lighthouse:ci
```

## Known Issues & Limitations

### Lazy Loading Trade-offs
- **Pro**: Smaller initial bundle, faster TTI
- **Con**: Slight delay when fixtures first load
- **Mitigation**: Use Suspense fallback, preload critical fixtures

### React.memo Considerations
- Only effective when props are primitives or stable references
- Requires useCallback/useMemo for function/object props
- May add overhead for frequently changing props

### useCallback Dependencies
- Must include all external dependencies in array
- Missing dependencies cause stale closures
- ESLint react-hooks/exhaustive-deps helps catch issues

## Future Optimizations

### Phase 34 Candidates
1. **Virtual Scrolling**: For large texture galleries (react-window)
2. **Web Workers**: Offload 3D calculations to background thread
3. **Progressive Image Loading**: Blur-up technique for textures
4. **Intersection Observer**: Lazy load off-screen 3D elements
5. **Request Deduplication**: Cache material property calculations

## References
- [React Profiler API](https://react.dev/reference/react/Profiler)
- [React.memo Documentation](https://react.dev/reference/react/memo)
- [useCallback Hook](https://react.dev/reference/react/useCallback)
- [Web Vitals](https://web.dev/vitals/)
- [Playwright Testing](https://playwright.dev/)
