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

## Layout Components

The application provides three standardized layout components that eliminate repetitive page wrapper code and ensure consistent structure across all pages.

### Layout Types

#### 1. **PublicLayout** - For public-facing pages

Used for pages accessible to all visitors (authenticated or not).

```typescript
import { PublicLayout } from '@/components/layout';

export default function HomePage() {
  return (
    <PublicLayout>
      <Hero />
      <Features />
      <CTA />
    </PublicLayout>
  );
}
```

**Features:**
- Header and Footer
- Offline banner and sync status indicator
- No authentication required
- Optimized for marketing/public content

**Props:**
```typescript
interface PublicLayoutProps {
  children: ReactNode;
  /** Whether to show offline banner and sync status (default: true) */
  showOfflineIndicators?: boolean;
  /** Custom className for root div */
  className?: string;
}
```

**Example with custom styling:**
```typescript
<PublicLayout 
  className="min-h-screen bg-gradient-to-b from-background to-muted"
  showOfflineIndicators={false}
>
  <LandingPage />
</PublicLayout>
```

#### 2. **ProtectedLayout** - For authenticated user pages

Used for pages that require authentication but are accessible to all authenticated users (not admin-only).

```typescript
import { ProtectedLayout } from '@/components/layout';

export default function Profile() {
  return (
    <ProtectedLayout>
      <h1>My Profile</h1>
      <UserProfileCard />
      <AccountSettings />
    </ProtectedLayout>
  );
}
```

**Features:**
- Automatic authentication check and redirect
- Header and Footer
- Container wrapper for content
- Optional error boundary
- Loading state during auth check

**Props:**
```typescript
interface ProtectedLayoutProps {
  children: ReactNode;
  /** Optional feature error boundary configuration */
  errorBoundary?: {
    featureName: string;
    featureTag: string;
    fallbackRoute: string;
  };
  /** Custom className for main container */
  containerClassName?: string;
  /** Whether to include container wrapper (default: true) */
  withContainer?: boolean;
}
```

**Example with custom container:**
```typescript
<ProtectedLayout containerClassName="container mx-auto max-w-2xl py-12">
  <SettingsForm />
</ProtectedLayout>
```

**Example with error boundary:**
```typescript
<ProtectedLayout
  errorBoundary={{
    featureName: 'User Dashboard',
    featureTag: 'user-dashboard',
    fallbackRoute: '/',
  }}
>
  <Dashboard />
</ProtectedLayout>
```

**Example without container:**
```typescript
<ProtectedLayout withContainer={false}>
  <FullWidthDashboard />
</ProtectedLayout>
```

#### 3. **AdminLayout** - For admin-only pages

Used for pages that require admin privileges.

```typescript
import { AdminLayout } from '@/components/layout';

export default function AdminUsers() {
  return (
    <AdminLayout>
      <h1>User Management</h1>
      <UserTable />
    </AdminLayout>
  );
}
```

**Features:**
- Admin authentication check and redirect
- Header and Footer
- Container wrapper for content
- Optional error boundary
- Loading state during admin check

**Props:**
```typescript
interface AdminLayoutProps {
  children: ReactNode;
  /** Optional feature error boundary configuration */
  errorBoundary?: {
    featureName: string;
    featureTag: string;
    fallbackRoute: string;
  };
  /** Custom className for main container */
  containerClassName?: string;
  /** Whether to include container wrapper (default: true) */
  withContainer?: boolean;
}
```

**Example with full configuration:**
```typescript
<AdminLayout
  containerClassName="container mx-auto px-6 py-10"
  errorBoundary={{
    featureName: 'Admin Security Dashboard',
    featureTag: 'admin-security',
    fallbackRoute: '/admin',
  }}
>
  <SecurityDashboard />
</AdminLayout>
```

**Example without container (full-width):**
```typescript
<AdminLayout withContainer={false}>
  <FullWidthAnalyticsDashboard />
</AdminLayout>
```

### Layout Selection Guide

**Use PublicLayout when:**
- Page is accessible to everyone
- No authentication required
- Marketing or informational content
- Landing pages, about pages, contact pages

**Use ProtectedLayout when:**
- User must be authenticated
- Not restricted to admins
- User-specific content (profile, settings, orders)
- Any authenticated user feature

**Use AdminLayout when:**
- Admin privileges required
- Management dashboards
- System configuration pages
- User administration features

### Migration from Manual Layouts

**Before (manual layout):**
```typescript
import { Header, Footer } from '@/components/layout';
import { AdminRoute } from '@/components/auth';

export default function AdminDashboard() {
  return (
    <AdminRoute>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <DashboardContent />
          </div>
        </main>
        <Footer />
      </div>
    </AdminRoute>
  );
}
```

**After (using AdminLayout):**
```typescript
import { AdminLayout } from '@/components/layout';

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <DashboardContent />
    </AdminLayout>
  );
}
```

**Benefits:**
- 15 lines reduced to 5 lines
- Consistent structure across all pages
- Easier to maintain and update
- Built-in error boundaries
- Proper authentication handling

### Best Practices

1. **Always use layout components** - Never manually compose Header/Footer
2. **Choose the right layout** - Use the most specific layout for your needs
3. **Leverage error boundaries** - Add error boundaries for critical features
4. **Customize when needed** - Use props to adjust container styling
5. **Full-width layouts** - Use `withContainer={false}` for dashboards/wide content

### Common Patterns

**Dashboard with custom spacing:**
```typescript
<AdminLayout containerClassName="container mx-auto px-6 py-12">
  <Dashboard />
</AdminLayout>
```

**Feature with error recovery:**
```typescript
<ProtectedLayout
  errorBoundary={{
    featureName: 'Order History',
    featureTag: 'orders',
    fallbackRoute: '/profile',
  }}
>
  <OrderHistory />
</ProtectedLayout>
```

**Landing page without indicators:**
```typescript
<PublicLayout showOfflineIndicators={false}>
  <MinimalLanding />
</PublicLayout>
```

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
- Layout components extracted (AdminLayout, ProtectedLayout, PublicLayout)
- All pages migrated to use layout components

### 🚧 In Progress
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
- [Layout components](/src/components/layout)
