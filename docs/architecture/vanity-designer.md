# Vanity Designer Architecture

## Overview

The Vanity Designer is a complex 3D configurator that allows users to customize bathroom vanities with real-time 3D preview, pricing calculations, and quote generation. The architecture follows a modular, performance-optimized design established through Phase 26 decomposition and Phase 33 optimizations.

## Architecture Principles

### 1. Component Decomposition
- **Single Responsibility**: Each component has one clear purpose
- **Composability**: Small components combine to create complex features
- **Testability**: Isolated components are easier to test
- **Reusability**: Shared components reduce duplication

### 2. Performance Optimization
- **Lazy Loading**: Heavy 3D components load on-demand
- **Memoization**: React.memo prevents unnecessary re-renders
- **Callback Stability**: useCallback prevents function recreation
- **State Localization**: State lives close to where it's used

### 3. Type Safety
- **TypeScript First**: All components use strict typing
- **Centralized Types**: Shared types in `src/types/vanity.ts`
- **Service Layer**: Business logic in typed services
- **Hook Contracts**: Clear input/output types for hooks

## Directory Structure

```
src/features/vanity-designer/
├── components/
│   ├── Vanity3DPreview.tsx           # Main 3D canvas orchestrator
│   ├── VanityControls.tsx            # Configuration panel
│   ├── VanityPricingCard.tsx         # Pricing display (memoized)
│   ├── VanityActions.tsx             # Action buttons
│   ├── VanityPreviewSection.tsx      # Preview container
│   ├── FullscreenPreview.tsx         # Fullscreen mode
│   ├── TextureSwatch.tsx             # Texture selector (memoized)
│   ├── TemplateGallery.tsx           # Saved templates
│   ├── SharePreviewCard.tsx          # Share functionality
│   │
│   ├── 3d/
│   │   ├── MaterialUtils.tsx         # Material property helpers
│   │   ├── MeasurementTools.tsx      # Measurement overlays (memoized)
│   │   │
│   │   ├── cabinet/
│   │   │   ├── VanityCabinet.tsx     # Main cabinet mesh
│   │   │   └── CabinetHardware.tsx   # Handles/knobs
│   │   │
│   │   ├── fixtures/ (lazy-loaded)
│   │   │   ├── BathroomFixtures.tsx  # Toilet/shower
│   │   │   ├── VanitySink.tsx        # Sink meshes
│   │   │   ├── Countertop.tsx        # Countertop surface
│   │   │   ├── MirrorCabinet.tsx     # Mirror/medicine cabinet
│   │   │   ├── BathroomAccessories.tsx # Towels/decor
│   │   │   ├── VanityFaucet.tsx      # Faucet meshes
│   │   │   ├── VanityBacksplash.tsx  # Backsplash
│   │   │   └── VanityLighting.tsx    # Lighting fixtures
│   │   │
│   │   └── room/
│   │       └── BathroomRoom.tsx      # Floor/walls/window
│   │
│   └── quote/
│       └── VanityQuoteDialog.tsx     # Quote request form
│
├── hooks/
│   ├── useVanityConfig.ts            # Main configuration state
│   ├── useVanityDimensions.ts        # Dimension management
│   ├── useUserSelection.ts           # Brand/finish selection
│   ├── useInteractionState.ts        # Measurement/zoom state
│   └── useVanityTemplates.ts         # Template save/load
│
├── services/
│   ├── vanityPricingService.ts       # Pricing calculations
│   └── vanityConfigService.ts        # Configuration operations
│
└── types/
    └── index.ts                      # TypeScript interfaces
```

## Component Hierarchy

```
VanityDesignerApp (main orchestrator)
├── VanityControls (configuration panel)
│   ├── Brand/finish selectors
│   ├── Dimension inputs
│   ├── Hardware options
│   ├── Countertop settings
│   ├── Sink/faucet options
│   └── Room settings
│
├── VanityPreviewSection (3D preview container)
│   └── Vanity3DPreview (Canvas orchestrator)
│       ├── Camera/lighting setup
│       ├── MeasurementTools (memoized)
│       │   ├── MeasurementLine components
│       │   └── DimensionLabels
│       ├── VanityCabinet (main structure)
│       │   └── CabinetHardware
│       ├── Countertop
│       ├── VanitySink (lazy-loaded)
│       ├── VanityFaucet (lazy-loaded)
│       ├── VanityBacksplash (lazy-loaded)
│       ├── MirrorCabinet (lazy-loaded)
│       ├── VanityLighting (lazy-loaded)
│       ├── BathroomFixtures (lazy-loaded)
│       ├── BathroomAccessories (lazy-loaded)
│       └── BathroomRoom
│
├── VanityPricingCard (memoized)
│   ├── Base price
│   ├── Hardware costs
│   ├── Countertop costs
│   ├── Tax/shipping
│   └── Total calculation
│
├── VanityActions
│   ├── Quote button
│   ├── Save template
│   ├── Share button
│   ├── Screenshot
│   └── Print
│
├── TemplateGallery
│   └── TextureSwatch (memoized)
│
├── SharePreviewCard
│   ├── URL copy
│   ├── QR code download
│   └── Social sharing
│
├── FullscreenPreview (conditional)
│   └── Full-screen 3D view
│
└── VanityQuoteDialog (conditional)
    └── Quote request form
```

## State Management

### 1. Configuration State (`useVanityConfig`)
Primary state hook managing all vanity configuration:

```typescript
interface VanityConfig {
  // Dimensions
  width: number;
  height: number;
  depth: number;
  
  // Materials
  brand: string;
  finish: string;
  
  // Hardware
  hardwareStyle: string;
  hardwareFinish: string;
  includeHardware: boolean;
  
  // Countertop
  countertopMaterial: string;
  countertopEdge: string;
  countertopColor: string;
  
  // Sink/Faucet
  sinkType: string;
  faucetType: string;
  faucetFinish: string;
  
  // Backsplash
  includeBacksplash: boolean;
  backsplashMaterial: string;
  backsplashHeight: number;
  
  // Mirror
  includeMirrorCabinet: boolean;
  mirrorWidth: number;
  
  // Room
  includeRoom: boolean;
  roomLength: number;
}
```

**State Update Pattern:**
```typescript
const { config, updateConfig } = useVanityConfig();

// Single field update
updateConfig({ width: 48 });

// Multiple fields
updateConfig({ 
  width: 48, 
  height: 36,
  depth: 21 
});
```

### 2. Interaction State (`useInteractionState`)
Manages UI interaction state separately from configuration:

```typescript
interface InteractionState {
  measurementMode: boolean;
  activeMeasurement: 'width' | 'height' | 'depth' | null;
  zoom: number;
}

const {
  state,
  toggleMeasurementMode,
  setActiveMeasurement,
  zoomIn,
  zoomOut,
  resetZoom,
} = useInteractionState();
```

### 3. Template State (`useVanityTemplates`)
Manages saved templates using localStorage:

```typescript
const {
  templates,
  saveTemplate,
  loadTemplate,
  deleteTemplate,
} = useVanityTemplates();
```

## Performance Optimizations

### 1. Lazy Loading Pattern

**Problem**: Large 3D fixture components increase initial bundle size  
**Solution**: Load fixtures on-demand using React.lazy

```typescript
// Before: Direct imports (~150KB added to initial bundle)
import VanitySink from './fixtures/VanitySink';
import VanityFaucet from './fixtures/VanityFaucet';

// After: Lazy imports (loaded when first rendered)
const VanitySink = lazy(() => import('./fixtures/VanitySink'));
const VanityFaucet = lazy(() => import('./fixtures/VanityFaucet'));

// Usage with Suspense
<Suspense fallback={null}>
  {includeSink && <VanitySink {...props} />}
</Suspense>
```

**Impact**: ~150KB reduction in initial bundle, faster Time to Interactive

### 2. React.memo Optimization

**Problem**: Child components re-render when parent state changes, even if their props haven't changed  
**Solution**: Wrap pure components with React.memo

```typescript
// TextureSwatch: Only re-renders when texture props change
export const TextureSwatch = memo(({ texture, onClick, isSelected }) => {
  // Component logic
});

// MeasurementLine: Only re-renders when measurement values change
const MeasurementLine = memo(({ start, end, label, color }) => {
  // Component logic
});

// VanityPricingCard: Only re-renders when pricing inputs change
export const VanityPricingCard = memo(({ config }) => {
  // Pricing calculations
});
```

**Impact**: 4 components saved from unnecessary re-renders

### 3. useCallback Stability

**Problem**: Event handlers recreate on every render, triggering child re-renders  
**Solution**: Wrap handlers with useCallback and proper dependencies

```typescript
// SharePreviewCard
const handleCopyUrl = useCallback(() => {
  navigator.clipboard.writeText(shareUrl);
  toast.success("URL copied!");
}, [shareUrl]);

const handleDownloadQR = useCallback(() => {
  // QR code download logic
}, []);

// Vanity3DPreview
const handleMeasurementClick = useCallback((type: MeasurementType) => {
  setActiveMeasurement(type);
}, [setActiveMeasurement]);
```

**Impact**: 7 handlers optimized, preventing Canvas re-renders

### 4. useMemo for Expensive Calculations

**Problem**: Texture generation and material calculations run on every render  
**Solution**: Memoize expensive computations

```typescript
// VanityCabinet
const materialProps = useMemo(
  () => getMaterialProps(brand, finish),
  [brand, finish]
);

const woodTexture = useMemo(
  () => createWoodTexture(materialProps),
  [materialProps]
);

// Countertop
const materialTexture = useMemo(() => {
  if (material === 'marble') {
    return generateMarbleTexture();
  }
  // ... other materials
}, [material, color]);
```

**Impact**: Reduces redundant texture generation

## Service Layer

### Pricing Service (`vanityPricingService.ts`)

Centralizes all pricing calculations:

```typescript
export const vanityPricingService = {
  // Base pricing
  calculateBasePrice(width: number, height: number, depth: number): number,
  
  // Hardware pricing
  calculateHardwareCost(style: string, finish: string, count: number): number,
  
  // Countertop pricing
  calculateCountertopCost(material: string, width: number, depth: number): number,
  
  // Sink/Faucet pricing
  calculateSinkCost(type: string): number,
  calculateFaucetCost(type: string, finish: string): number,
  
  // Tax/Shipping
  calculateTax(subtotal: number, taxRate?: number): number,
  calculateShipping(total: number): number,
  
  // Total calculation
  calculateTotal(config: VanityConfig): PricingBreakdown,
};
```

### Configuration Service (`vanityConfigService.ts`)

Manages configuration operations:

```typescript
export const vanityConfigService = {
  // Validation
  validateDimensions(width: number, height: number, depth: number): boolean,
  
  // Default values
  getDefaultConfig(): VanityConfig,
  
  // URL encoding/decoding
  encodeConfig(config: VanityConfig): string,
  decodeConfig(encoded: string): VanityConfig,
  
  // Template operations
  saveTemplate(name: string, config: VanityConfig): void,
  loadTemplate(id: string): VanityConfig | null,
  deleteTemplate(id: string): void,
};
```

## Data Flow

### Configuration Update Flow

```
User Input (VanityControls)
  → updateConfig({ field: value })
  → useVanityConfig state update
  → VanityDesignerApp re-renders
  → VanityPreviewSection receives new config
  → Vanity3DPreview updates (memoized children skip render)
  → VanityPricingCard updates (memo checks if pricing inputs changed)
```

### Measurement Tool Flow

```
User clicks measurement button
  → handleMeasurementClick (useCallback)
  → toggleMeasurementMode()
  → useInteractionState updates
  → MeasurementTools receives new state
  → MeasurementLine components render (React.memo checks props)
  → Canvas updates
```

### Quote Request Flow

```
User clicks "Get Quote"
  → VanityQuoteDialog opens
  → User fills form
  → Form submission
  → vanityPricingService.calculateTotal()
  → send-quote-request edge function
  → Email sent to admin
  → Toast notification to user
```

## Testing Strategy

### 1. Component Tests (Vitest)

Test isolated component behavior:

```typescript
describe('VanityPricingCard', () => {
  it('calculates total price correctly', () => {
    const config = { width: 48, height: 36, depth: 21 };
    render(<VanityPricingCard config={config} />);
    expect(screen.getByText(/Total:/)).toContainText('$1,234.56');
  });
  
  it('does not re-render when unrelated props change', () => {
    const { rerender } = render(<VanityPricingCard config={config1} />);
    const renderCount = getRenderCount();
    rerender(<VanityPricingCard config={config1} unrelatedProp="changed" />);
    expect(getRenderCount()).toBe(renderCount); // React.memo prevented render
  });
});
```

### 2. Integration Tests (Vitest)

Test service layer integration:

```typescript
describe('vanityPricingService', () => {
  it('calculates full quote correctly', () => {
    const config = createTestConfig();
    const pricing = vanityPricingService.calculateTotal(config);
    
    expect(pricing.base).toBe(800);
    expect(pricing.hardware).toBe(150);
    expect(pricing.countertop).toBe(200);
    expect(pricing.total).toBe(1234.56);
  });
});
```

### 3. E2E Tests (Playwright)

Test complete user workflows:

```typescript
test('should configure vanity and request quote', async ({ page }) => {
  await page.goto('/designer');
  
  // Update dimensions
  await page.getByLabel(/Width/i).fill('48');
  await page.getByLabel(/Height/i).fill('36');
  
  // Select brand
  await page.getByLabel(/Brand/i).click();
  await page.getByText(/Blum/i).click();
  
  // Request quote
  await page.getByRole('button', { name: /Get Quote/i }).click();
  await page.getByLabel(/Email/i).fill('test@example.com');
  await page.getByRole('button', { name: /Send/i }).click();
  
  // Verify success
  await expect(page.getByText(/Quote sent/i)).toBeVisible();
});
```

## Performance Monitoring

### Instrumented Operations

VanityDesignerApp tracks the following operations:

```typescript
// Component lifecycle tracking
usePerformanceMonitor({
  name: 'VanityDesignerApp',
  trackMount: true,      // Tracks mount time
  trackRender: true,     // Warns on slow renders (>16ms)
  metadata: {
    brand: vanityConfig.selectedBrand,
    finish: vanityConfig.selectedFinish,
  },
});

// User operations tracked:
- 'texture-selection'    // Finish selection time
- 'pdf-generation'       // PDF quote generation time
- 'share-url-generation' // Share URL encoding time
- 'quote-email-send'     // Email sending time
```

### Viewing Performance Data

1. **Admin Dashboard**: Visit `/admin/performance` to view:
   - Real-time Web Vitals (LCP, CLS, TTFB, INP)
   - Slowest operations table
   - Performance budgets tracking
   - Metric filtering by time period

2. **Browser DevTools**:
   - Open Performance tab
   - Look for marks: `texture-selection`, `pdf-generation`, etc.
   - Check Console for performance warnings

3. **Database Queries**:
   ```sql
   SELECT metric_name, AVG(metric_value) as avg_duration
   FROM performance_metrics
   WHERE url LIKE '%designer%'
   AND created_at > NOW() - INTERVAL '7 days'
   GROUP BY metric_name
   ORDER BY avg_duration DESC;
   ```

## Best Practices

### 1. Component Design
- Keep components under 200 lines
- Extract repeated logic to hooks
- Use TypeScript for all props
- Document complex components
- Follow single responsibility principle

### 2. Performance
- Lazy load heavy components (>50KB)
- Memoize pure components
- Stabilize callbacks with useCallback
- Memoize expensive calculations
- Avoid inline object/array creation in JSX

### 3. State Management
- Keep state as local as possible
- Use context sparingly (performance cost)
- Separate UI state from configuration
- Validate state updates
- Use reducers for complex state logic

### 4. Type Safety
- Define interfaces for all props
- Use strict TypeScript mode
- Avoid `any` types
- Export types from centralized location
- Use type guards for runtime validation

### 5. Testing
- Test components in isolation
- Mock external dependencies
- Test user workflows end-to-end
- Verify performance optimizations
- Use snapshot tests sparingly

## Future Enhancements

### Phase 34 Candidates

Detailed implementation plan available at [ARCHITECTURE_PHASE34_PLAN.md](../ARCHITECTURE_PHASE34_PLAN.md):

1. **Virtual Scrolling**: react-window for texture galleries with 100+ items (~70% render time reduction)
2. **Web Workers**: Offload material calculations to background thread (~80% main thread blocking reduction)
3. **Progressive Loading**: Blur-up technique for texture images (~60% perceived load time improvement)
4. **Intersection Observer**: Lazy render 3D elements when viewport is near (~200ms initial load improvement)
5. **Request Deduplication**: Cache identical texture/material requests (~40% network reduction)

### Architecture Evolution

1. **Context Optimization**: Consider Zustand for global state
2. **Concurrent Features**: Explore React 18 concurrent rendering
3. **Streaming SSR**: Pre-render initial configuration on server
4. **Edge Caching**: Cache common configurations at CDN
5. **WebAssembly**: Port heavy calculations to WASM

## Troubleshooting

### Common Issues

**Issue**: 3D preview doesn't update after configuration change  
**Solution**: Check if props are properly passed and memoization isn't blocking updates

**Issue**: Lazy-loaded components flash on first load  
**Solution**: Add meaningful Suspense fallback, consider preloading critical components

**Issue**: Performance degradation after many interactions  
**Solution**: Check for memory leaks, verify event listeners are cleaned up, profile with React DevTools

**Issue**: Pricing calculation incorrect  
**Solution**: Review vanityPricingService logic, add integration tests for edge cases

## References

- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Phase 26 Decomposition Plan](../ARCHITECTURE_PHASE26_PLAN.md)
- [Phase 33 Performance Plan](../ARCHITECTURE_PHASE33_PLAN.md)
- [Performance Benchmarks](../performance-benchmarks.md)
