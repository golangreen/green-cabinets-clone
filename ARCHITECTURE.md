# Architecture Documentation

## Overview

This project follows a **feature-first architecture** with clear separation of concerns and consistent patterns across all modules.

## Directory Structure

```
src/
├── features/              # Feature modules (self-contained)
│   ├── gallery/
│   │   ├── components/   # Feature-specific components
│   │   ├── hooks/        # Feature-specific hooks
│   │   ├── services/     # Feature-specific business logic
│   │   ├── constants/    # Feature-specific constants (routes, etc)
│   │   ├── context/      # Feature-specific React context
│   │   ├── types/        # Feature-specific TypeScript types
│   │   └── index.ts      # Public API exports
│   └── [other-features]/ # Same structure for all features
├── components/           # Shared UI components
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Layout components (Header, Footer, etc)
│   └── auth/            # Auth-related components
├── hooks/               # Shared hooks
├── services/            # Shared services
├── types/               # Shared types
├── constants/           # Shared constants
├── config/              # Application configuration
├── lib/                 # Utility libraries
└── pages/               # Route pages (thin wrappers)
```

## Key Principles

### 1. Feature-First Organization

Each feature is **self-contained** with its own:
- Components
- Hooks  
- Services
- Types
- Constants

**Public API Pattern:**
```typescript
// features/gallery/index.ts
export { useGalleryManager, useGalleryQueries } from './hooks';
export { GalleryGrid, LazyImage } from './components';
export type { GalleryImage, GalleryCategory } from './types';
```

**Usage:**
```typescript
// ✅ CORRECT - Import from feature root
import { useGalleryManager, LazyImage } from '@/features/gallery';

// ❌ WRONG - Don't import from internal folders
import { useGalleryManager } from '@/features/gallery/hooks/useGalleryManager';
```

### 2. Service Layer Pattern

All services follow an **object-based export pattern**:

```typescript
// ✅ CORRECT - Object-based service
export const performanceService = {
  async recordMetric(metric: Metric): Promise<void> { ... },
  async getMetrics(params: Params): Promise<Metric[]> { ... },
} as const;

// ❌ WRONG - Class-based service
class PerformanceService {
  async recordMetric() { ... }
}
export const performanceService = new PerformanceService();
```

**Benefits:**
- Simpler code (no classes, no `this`)
- Easier to test (just functions)
- Tree-shakeable
- Consistent with modern JavaScript patterns

### 3. Route Constants

Routes are defined in feature-specific constant files:

```typescript
// features/gallery/constants/routes.ts
export const GALLERY_ROUTES = {
  ADMIN: '/admin/gallery',
  STORAGE_ANALYZER: '/admin/storage-analyzer',
} as const;

// constants/routes.ts (central)
import { GALLERY_ROUTES } from '@/features/gallery/constants/routes';

export const ROUTES = {
  ...CORE_ROUTES,
  ADMIN_GALLERY: GALLERY_ROUTES.ADMIN,
} as const;
```

### 4. Test Organization

Tests are organized in `__tests__` folders:

```
features/gallery/
├── hooks/
│   ├── __tests__/
│   │   ├── useGalleryManager.test.ts
│   │   └── useImageUpload.test.ts
│   ├── useGalleryManager.ts
│   └── useImageUpload.ts
└── __tests__/
    └── GalleryIntegration.test.tsx
```

**Types of tests:**
- **Unit tests**: In `hooks/__tests__/` or `services/__tests__/`
- **Integration tests**: In feature root `__tests__/` folder
- **Component tests**: Alongside components or in `components/__tests__/`

### 5. Type Organization

**Internal types** (used only within feature):
```typescript
// features/gallery/types/internal.ts
export interface ImageProcessingState { ... }
```

**Public types** (exposed in feature API):
```typescript
// features/gallery/types/index.ts
export interface GalleryImage { ... }
export type GalleryCategory = 'kitchens' | 'vanities';

// features/gallery/index.ts
export type { GalleryImage, GalleryCategory } from './types';
```

**Global types** (shared across features):
```typescript
// types/gallery.ts
export type GalleryCategory = 'kitchens' | 'vanities' | 'closets';
```

## Feature Boundaries

Features should **NOT** import directly from other features' internals:

```typescript
// ❌ WRONG - Cross-feature internal import
import { useImageProcessing } from '@/features/gallery/hooks/useImageProcessing';

// ✅ CORRECT - Import from feature's public API
import { useGalleryManager } from '@/features/gallery';

// ✅ CORRECT - Or use shared services
import { imageService } from '@/services';
```

If multiple features need the same functionality:
1. Move it to shared `services/` or `hooks/`
2. Or have features export it in their public API

## Page Components

Pages should be **thin wrappers**:

```typescript
// pages/AdminGallery.tsx
export default function AdminGallery() {
  return (
    <AdminLayout title="Gallery Management">
      <GalleryProvider>
        <GalleryErrorBoundary>
          <GalleryFileSelector />
          <GalleryImageProcessor />
        </GalleryErrorBoundary>
      </GalleryProvider>
    </AdminLayout>
  );
}
```

**Responsibilities:**
- Route definition
- Layout selection
- Feature composition
- Authentication/authorization wrappers

**NOT responsible for:**
- Business logic (in services)
- State management (in hooks/context)
- Complex rendering (in components)

## Configuration

Configuration follows a hierarchy:

1. **Global config** (`src/config/`):
   - API endpoints
   - Feature flags
   - Environment variables

2. **Feature config** (`src/features/*/config/`):
   - Feature-specific defaults
   - Feature presets
   - Feature constants

Example:
```typescript
// config/index.ts
export const APP_CONFIG = {
  APP_NAME: 'Green Cabinets Designer',
  FEATURES: {
    ENABLE_PRODUCT_PRELOAD: true,
  },
} as const;

// features/gallery/config/index.ts
export const GALLERY_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png'],
} as const;
```

## Import Order Convention

```typescript
// 1. External dependencies
import { useState } from 'react';
import { supabase } from '@supabase/supabase-js';

// 2. Internal features (public APIs only)
import { useGalleryManager } from '@/features/gallery';

// 3. Shared modules
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { imageService } from '@/services';

// 4. Types
import type { GalleryCategory } from '@/types/gallery';

// 5. Relative imports (same feature only)
import { ImageCard } from './ImageCard';
import type { LocalState } from './types';
```

## Migration Status

### ✅ Completed
- Gallery feature consolidated (removed duplicates)
- Service layer standardized (object-based exports)
- Route constants created for all features
- Test organization standardized (__tests__ folders)
- Temporary code removed (TempGalleryTest)

### 🚧 In Progress
- Extracting page layouts (AdminLayout, etc)
- Moving remaining utils to proper structure
- Adding JSDoc comments for patterns

### 📋 Todo
- Feature-by-feature boundary enforcement
- Comprehensive architecture documentation per feature
- Migration guide for existing code

## Best Practices

1. **Feature isolation**: Features should be self-contained and independently testable
2. **Public APIs**: Always export through feature's `index.ts`
3. **Consistent patterns**: Services, hooks, and components follow the same patterns
4. **Type safety**: Use TypeScript strictly, avoid `any`
5. **Documentation**: JSDoc comments for public APIs
6. **Testing**: Unit tests for logic, integration tests for workflows

## References

- [Feature folder structure](/src/features/gallery)
- [Service patterns](/src/services)
- [Route constants](/src/constants/routes.ts)
- [Test examples](/src/features/gallery/__tests__)
