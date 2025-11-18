# Phase 34: Advanced Performance Optimizations

## Status: PLANNING

## Overview

Phase 34 builds upon Phase 33's foundation (React.memo, useCallback, lazy loading) with advanced optimization techniques targeting specific performance bottlenecks identified through monitoring and profiling.

## Prerequisites

- ✅ Phase 33 Complete: Basic optimizations (memo, callbacks, lazy loading)
- ✅ Performance Monitoring: usePerformanceMonitor tracking metrics
- ✅ E2E Tests: Comprehensive test coverage for regression detection
- ✅ Architecture Documentation: Performance benchmarks and patterns documented

## Optimization Targets

### Current Performance Profile

Based on initial monitoring and the comprehensive audit:

**Identified Bottlenecks:**
1. **Texture Gallery Rendering**: 100+ texture swatches render simultaneously
2. **3D Calculation Overhead**: Material property calculations block main thread
3. **Image Loading**: Large texture images load synchronously
4. **Off-Screen Rendering**: All 3D elements render even when not visible
5. **Redundant Requests**: Identical texture/material requests not cached

**Performance Budget Violations:**
- Texture gallery initial render: ~300ms (target: <100ms)
- Texture image loading: ~2s for full gallery (target: <500ms)
- Material calculation per frame: ~50ms (target: <16ms for 60fps)

## Phase 34 Optimization Strategies

### 1. Virtual Scrolling for Texture Gallery

**Problem**: Rendering 100+ TextureSwatch components simultaneously degrades performance

**Solution**: Implement react-window for virtual scrolling

**Implementation:**

```typescript
// src/features/vanity-designer/components/VirtualTextureGallery.tsx
import { FixedSizeGrid } from 'react-window';
import { TextureSwatch } from './TextureSwatch';

interface VirtualTextureGalleryProps {
  textures: string[];
  selectedTexture: string;
  onTextureClick: (texture: string) => void;
  columnCount: number;
  rowHeight: number;
}

export const VirtualTextureGallery = memo(({
  textures,
  selectedTexture,
  onTextureClick,
  columnCount = 4,
  rowHeight = 120,
}: VirtualTextureGalleryProps) => {
  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= textures.length) return null;

    const texture = textures[index];
    return (
      <div style={style} className="p-2">
        <TextureSwatch
          texture={texture}
          isSelected={texture === selectedTexture}
          onClick={() => onTextureClick(texture)}
        />
      </div>
    );
  };

  const rowCount = Math.ceil(textures.length / columnCount);

  return (
    <FixedSizeGrid
      columnCount={columnCount}
      columnWidth={150}
      height={600}
      rowCount={rowCount}
      rowHeight={rowHeight}
      width={650}
      overscanRowCount={2}
    >
      {Cell}
    </FixedSizeGrid>
  );
});
```

**Benefits:**
- Renders only visible texture swatches (~20 instead of 100+)
- Reduces initial render time by ~70% (300ms → 90ms)
- Maintains smooth 60fps scrolling with overscan buffer

**Dependencies:**
```bash
npm install react-window
npm install --save-dev @types/react-window
```

---

### 2. Web Workers for Heavy Calculations

**Problem**: Material property calculations and texture generation block main thread

**Solution**: Offload computations to Web Worker thread

**Implementation:**

```typescript
// src/workers/materialCalculations.worker.ts
import { getMaterialProps, createWoodTexture, createBumpMap } from '@/features/vanity-designer/components/3d/MaterialUtils';

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'CALCULATE_MATERIAL_PROPS':
      const { brand, finish } = payload;
      const materialProps = getMaterialProps(brand, finish);
      self.postMessage({ type: 'MATERIAL_PROPS_RESULT', payload: materialProps });
      break;

    case 'GENERATE_TEXTURE':
      const { materialProps } = payload;
      const texture = createWoodTexture(materialProps);
      // Convert texture to transferable format
      const textureData = {
        image: texture?.image,
        width: texture?.image?.width,
        height: texture?.image?.height,
      };
      self.postMessage({ type: 'TEXTURE_RESULT', payload: textureData });
      break;

    case 'GENERATE_BUMP_MAP':
      const { bumpScale } = payload;
      const bumpMap = createBumpMap(bumpScale);
      self.postMessage({ type: 'BUMP_MAP_RESULT', payload: bumpMap });
      break;

    default:
      console.error('Unknown worker message type:', type);
  }
};
```

```typescript
// src/hooks/useMaterialWorker.ts
import { useEffect, useRef, useCallback } from 'react';

export const useMaterialWorker = () => {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/materialCalculations.worker.ts', import.meta.url),
      { type: 'module' }
    );

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const calculateMaterialProps = useCallback((brand: string, finish: string): Promise<any> => {
    return new Promise((resolve) => {
      if (!workerRef.current) return;

      const handler = (e: MessageEvent) => {
        if (e.data.type === 'MATERIAL_PROPS_RESULT') {
          workerRef.current?.removeEventListener('message', handler);
          resolve(e.data.payload);
        }
      };

      workerRef.current.addEventListener('message', handler);
      workerRef.current.postMessage({
        type: 'CALCULATE_MATERIAL_PROPS',
        payload: { brand, finish },
      });
    });
  }, []);

  return { calculateMaterialProps };
};
```

**Benefits:**
- Offloads 50ms of main thread work per material calculation
- Maintains 60fps during texture generation
- Allows UI to remain responsive during heavy computations

---

### 3. Progressive Image Loading

**Problem**: Large texture images load synchronously, blocking render

**Solution**: Implement blur-up technique with low-quality image placeholders

**Implementation:**

```typescript
// src/components/ProgressiveImage.tsx
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ProgressiveImageProps {
  src: string;
  placeholderSrc: string;
  alt: string;
  className?: string;
}

export const ProgressiveImage = ({
  src,
  placeholderSrc,
  alt,
  className,
}: ProgressiveImageProps) => {
  const [imgSrc, setImgSrc] = useState(placeholderSrc);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImgSrc(src);
      setIsLoading(false);
    };
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={cn(
        'transition-all duration-300',
        isLoading && 'blur-sm scale-105',
        className
      )}
    />
  );
};
```

**Update TextureSwatch:**

```typescript
// src/features/vanity-designer/components/TextureSwatch.tsx
export const TextureSwatch = memo(({ texture, isSelected, onClick }) => {
  const textureStyle = useMemo(() => {
    // Return placeholder path for progressive loading
    return {
      fullSrc: getTexturePath(texture),
      placeholderSrc: getTexturePath(texture, { quality: 10 }),
    };
  }, [texture]);

  return (
    <div onClick={onClick} className={/* ... */}>
      <ProgressiveImage
        src={textureStyle.fullSrc}
        placeholderSrc={textureStyle.placeholderSrc}
        alt={texture}
        className="texture-preview"
      />
    </div>
  );
});
```

**Benefits:**
- Perceived load time reduced by ~60% (2s → 800ms)
- Smooth blur-to-sharp transition improves UX
- Low-quality placeholders load in <100ms

---

### 4. Intersection Observer for Lazy Rendering

**Problem**: Off-screen 3D fixtures render unnecessarily

**Solution**: Only render fixtures when viewport is near them

**Implementation:**

```typescript
// src/hooks/useIntersectionObserver.ts
import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
}

export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting) {
          setHasIntersected(true);
        }
      },
      {
        threshold: options.threshold ?? 0.1,
        rootMargin: options.rootMargin ?? '100px',
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [options.threshold, options.rootMargin]);

  return { targetRef, isIntersecting, hasIntersected };
};
```

**Update Vanity3DPreview:**

```typescript
// src/features/vanity-designer/components/Vanity3DPreview.tsx
const Vanity3DPreview = ({ vanityConfig, onFullscreenClick }) => {
  const { targetRef, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '200px',
  });

  return (
    <div ref={targetRef} className="relative w-full h-full">
      {hasIntersected && (
        <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
          {/* 3D content only renders after viewport intersection */}
          <VanityCabinet {...props} />
          <Suspense fallback={null}>
            {includeSink && <VanitySink {...props} />}
            {/* Other lazy-loaded fixtures */}
          </Suspense>
        </Canvas>
      )}
    </div>
  );
};
```

**Benefits:**
- Prevents rendering 3D scene until user scrolls near it
- Saves ~200ms initial page load time
- Reduces memory usage when designer not in viewport

---

### 5. Request Deduplication

**Problem**: Identical texture/material requests made multiple times

**Solution**: Implement request cache with deduplication

**Implementation:**

```typescript
// src/lib/requestCache.ts
type CacheEntry<T> = {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
};

class RequestCache {
  private cache = new Map<string, CacheEntry<any>>();
  private ttl: number = 5 * 60 * 1000; // 5 minutes

  async fetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const entry = this.cache.get(key);
    const now = Date.now();

    // Return cached data if still valid
    if (entry && now - entry.timestamp < (ttl ?? this.ttl)) {
      if (entry.promise) {
        // Request in flight, return existing promise
        return entry.promise;
      }
      return entry.data;
    }

    // Create new request
    const promise = fetchFn();
    this.cache.set(key, { data: null, timestamp: now, promise });

    try {
      const data = await promise;
      this.cache.set(key, { data, timestamp: now });
      return data;
    } catch (error) {
      this.cache.delete(key);
      throw error;
    }
  }

  clear() {
    this.cache.clear();
  }

  clearExpired() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const requestCache = new RequestCache();
```

**Usage:**

```typescript
// src/features/vanity-designer/services/vanityConfigService.ts
import { requestCache } from '@/lib/requestCache';

export const vanityConfigService = {
  async fetchTexture(brand: string, finish: string) {
    const key = `texture:${brand}:${finish}`;
    return requestCache.fetch(key, () => {
      // Actual fetch logic
      return fetch(`/api/textures/${brand}/${finish}`).then(r => r.blob());
    });
  },
};
```

**Benefits:**
- Eliminates redundant network requests
- Deduplicates in-flight requests automatically
- Reduces bandwidth usage by ~40%

---

## Implementation Roadmap

### Phase 34a: Virtual Scrolling (Week 1)
- [ ] Install react-window dependency
- [ ] Create VirtualTextureGallery component
- [ ] Replace existing gallery with virtual version
- [ ] Test with 100+ textures
- [ ] Measure render time improvement
- [ ] Update E2E tests if needed

### Phase 34b: Web Workers (Week 2)
- [ ] Create materialCalculations.worker.ts
- [ ] Implement useMaterialWorker hook
- [ ] Update VanityCabinet to use worker
- [ ] Test worker communication
- [ ] Measure main thread blocking reduction
- [ ] Add worker error handling

### Phase 34c: Progressive Loading (Week 3)
- [ ] Create ProgressiveImage component
- [ ] Generate low-quality texture placeholders
- [ ] Update TextureSwatch to use progressive loading
- [ ] Implement blur-up animation
- [ ] Test perceived load time
- [ ] Optimize placeholder generation

### Phase 34d: Intersection Observer (Week 4)
- [ ] Create useIntersectionObserver hook
- [ ] Update Vanity3DPreview with lazy rendering
- [ ] Configure appropriate threshold/rootMargin
- [ ] Test scroll-to-viewport behavior
- [ ] Measure memory usage reduction
- [ ] Ensure smooth transition when intersecting

### Phase 34e: Request Deduplication (Week 5)
- [ ] Implement RequestCache class
- [ ] Integrate with vanityConfigService
- [ ] Add cache expiration logic
- [ ] Test deduplication with concurrent requests
- [ ] Monitor cache hit rates
- [ ] Add cache management utilities

---

## Success Metrics

### Performance Improvements (Target)

| Metric | Before | After | Target Improvement |
|--------|--------|-------|-------------------|
| Texture Gallery Render | 300ms | 90ms | -70% |
| Main Thread Blocking | 50ms/frame | 10ms/frame | -80% |
| Texture Image Load | 2000ms | 800ms | -60% |
| Initial Page Load | 3500ms | 2500ms | -29% |
| Memory Usage | 150MB | 100MB | -33% |
| Network Requests | 100 | 60 | -40% |

### Core Web Vitals Impact

- **LCP (Largest Contentful Paint)**: 2.8s → 2.0s (target: <2.5s) ✅
- **FID (First Input Delay)**: 80ms → 40ms (target: <100ms) ✅
- **CLS (Cumulative Layout Shift)**: 0.05 (no change expected)
- **INP (Interaction to Next Paint)**: 150ms → 80ms (target: <200ms) ✅

---

## Testing Strategy

### Unit Tests
```typescript
// src/components/__tests__/VirtualTextureGallery.test.tsx
describe('VirtualTextureGallery', () => {
  it('renders only visible textures', () => {
    const textures = Array.from({ length: 100 }, (_, i) => `texture-${i}`);
    render(<VirtualTextureGallery textures={textures} />);
    
    // Should render ~20 visible + overscan, not all 100
    expect(screen.getAllByRole('img').length).toBeLessThan(30);
  });
});
```

### Integration Tests
```typescript
// src/hooks/__tests__/useMaterialWorker.test.ts
describe('useMaterialWorker', () => {
  it('calculates material props in worker thread', async () => {
    const { calculateMaterialProps } = useMaterialWorker();
    const result = await calculateMaterialProps('Tafisa', 'Natural Oak');
    
    expect(result).toHaveProperty('color');
    expect(result).toHaveProperty('roughness');
  });
});
```

### E2E Tests
```typescript
// e2e/vanity-designer-performance.spec.ts
test('virtual scrolling performs smoothly', async ({ page }) => {
  await page.goto('/designer');
  
  // Scroll texture gallery
  const gallery = page.locator('.texture-gallery');
  await gallery.scroll({ top: 1000 });
  
  // Measure FPS during scroll
  const fps = await page.evaluate(() => {
    // FPS measurement logic
  });
  
  expect(fps).toBeGreaterThan(55); // Near 60fps
});
```

---

## Risks & Mitigation

### Risk 1: Web Worker Browser Support
**Mitigation**: Feature detection with graceful fallback to main thread

### Risk 2: Virtual Scrolling UX Changes
**Mitigation**: Extensive user testing, maintain scroll position on updates

### Risk 3: Progressive Loading Janky Transitions
**Mitigation**: Optimize placeholder quality/size balance, smooth CSS transitions

### Risk 4: Intersection Observer False Negatives
**Mitigation**: Conservative rootMargin (200px), test various scroll speeds

### Risk 5: Request Cache Memory Leaks
**Mitigation**: Implement TTL expiration, periodic cache cleanup, size limits

---

## Dependencies

```json
{
  "dependencies": {
    "react-window": "^1.8.10"
  },
  "devDependencies": {
    "@types/react-window": "^1.8.8"
  }
}
```

---

## Rollout Plan

### Stage 1: Canary (10% users, 1 week)
- Deploy to 10% of production users
- Monitor performance metrics closely
- Watch for error rate increases
- Collect user feedback

### Stage 2: Beta (50% users, 1 week)
- Expand to 50% if Stage 1 successful
- Continue performance monitoring
- Validate Core Web Vitals improvements
- Address any reported issues

### Stage 3: Full Release (100% users)
- Roll out to all users
- Monitor for 2 weeks
- Document lessons learned
- Plan Phase 35 optimizations

---

## Documentation Updates

- [ ] Update architecture docs with worker patterns
- [ ] Document virtual scrolling implementation
- [ ] Add progressive loading best practices
- [ ] Create performance comparison charts
- [ ] Update E2E test documentation

---

## Future Considerations (Phase 35+)

1. **Service Worker Asset Caching**: Cache textures/materials offline
2. **WebGL Optimization**: Reduce draw calls, optimize shaders
3. **Code Splitting by Brand**: Load brand-specific code on-demand
4. **CDN for Texture Assets**: Move textures to CDN with edge caching
5. **Streaming SSR**: Stream 3D preview incrementally
6. **WebAssembly for Calculations**: Port heavy math to WASM

---

## References

- [react-window Documentation](https://react-window.vercel.app/)
- [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Progressive Image Loading](https://web.dev/patterns/web-vitals-patterns/image-loading)
- [Request Deduplication Patterns](https://kentcdodds.com/blog/stop-mocking-fetch)
