# Test Organization Structure

## Overview

All test files follow a **consistent `__tests__` folder pattern** for easy discovery and organization.

## Directory Structure

```
src/
├── features/
│   └── [feature-name]/
│       ├── components/
│       │   ├── __tests__/              # Component tests
│       │   │   └── *.test.tsx
│       │   └── ComponentName.tsx
│       ├── hooks/
│       │   ├── __tests__/              # Hook unit tests
│       │   │   └── *.test.ts
│       │   └── useHookName.ts
│       ├── context/
│       │   ├── __tests__/              # Context tests
│       │   │   └── *.test.tsx
│       │   └── ContextName.tsx
│       └── __tests__/                  # Integration tests
│           └── FeatureIntegration.test.tsx
├── services/
│   ├── __tests__/                      # Service tests
│   │   └── *.test.ts
│   └── serviceName.ts
└── test/                               # Test utilities
    ├── setup.ts
    ├── utils.ts
    └── README.md
```

## Test Types by Location

### 1. Hook Unit Tests
**Location**: `src/features/[feature]/hooks/__tests__/`

Test individual hook behavior in isolation.

```typescript
// src/features/gallery/hooks/__tests__/useImageUpload.test.ts
describe('useImageUpload', () => {
  it('should upload images with compression', async () => {
    // Test hook logic
  });
});
```

### 2. Component Tests
**Location**: `src/features/[feature]/components/__tests__/`

Test component rendering and interactions.

```typescript
// src/features/admin-security/components/__tests__/SecurityEventsTable.test.tsx
describe('SecurityEventsTable', () => {
  it('renders loading state initially', () => {
    // Test component UI
  });
});
```

### 3. Context Tests
**Location**: `src/features/[feature]/context/__tests__/`

Test React context providers and consumers.

```typescript
// src/features/gallery/context/__tests__/GalleryContext.test.tsx
describe('GalleryContext', () => {
  it('should provide gallery context when used within provider', () => {
    // Test context behavior
  });
});
```

### 4. Integration Tests
**Location**: `src/features/[feature]/__tests__/`

Test complete workflows with multiple components/hooks working together.

```typescript
// src/features/gallery/__tests__/GalleryIntegration.test.tsx
describe('Gallery Integration Tests', () => {
  describe('File Upload Workflow', () => {
    it('should process uploaded files through the complete workflow', async () => {
      // Test end-to-end feature flow
    });
  });
});
```

### 5. Service Tests
**Location**: `src/services/__tests__/`

Test business logic and API interactions.

```typescript
// src/services/__tests__/securityService.test.ts
describe('securityService', () => {
  describe('fetchSecurityEvents', () => {
    it('fetches security events successfully', async () => {
      // Test service methods
    });
  });
});
```

## Naming Conventions

### Test Files
- **Pattern**: `[Name].test.ts` or `[Name].test.tsx`
- **Examples**:
  - `useImageUpload.test.ts` - Hook test
  - `SecurityEventsTable.test.tsx` - Component test
  - `GalleryIntegration.test.tsx` - Integration test

### Test Suites
```typescript
// Use descriptive names matching the file/feature
describe('useImageUpload', () => {           // Hook name
  describe('uploadAllImages', () => {        // Method name
    it('should upload images with compression', () => {
      // Specific behavior
    });
  });
});
```

## Current Test Coverage

### Features with Tests
- ✅ **gallery** - Integration, context, and hook tests
- ✅ **admin-security** - Component tests
- ✅ **product-catalog** - Component tests
- ✅ **vanity-designer** - Component tests

### Services with Tests
- ✅ **securityService** - Unit tests

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui

# Run specific test file
npm test src/features/gallery/__tests__/GalleryIntegration.test.tsx

# Run tests matching pattern
npm test -- --grep="upload"
```

## Test Utilities Location

Test utilities and setup files are in `src/test/`:

```
src/test/
├── setup.ts              # Global test setup
├── utils.ts              # Test helper functions
├── README.md             # Testing documentation
└── STRUCTURE.md          # This file
```

## Migration Status

### ✅ Completed
- All `.test.ts` files moved to `__tests__` folders
- Consistent folder structure across all features
- Test organization documented

### 🎯 Best Practices Followed
1. **Colocation**: Tests live near the code they test
2. **Discoverability**: `__tests__` folders make tests easy to find
3. **Separation**: Unit tests in module `__tests__/`, integration tests in feature root
4. **Consistency**: Same pattern used everywhere in the codebase

## Adding New Tests

When adding tests for new features:

1. **Create `__tests__` folder** in appropriate location:
   ```
   src/features/new-feature/hooks/__tests__/
   ```

2. **Name test file** matching source file:
   ```
   useNewHook.ts → useNewHook.test.ts
   ```

3. **Follow patterns** from existing tests in similar locations

4. **Run tests** to verify they work:
   ```bash
   npm test src/features/new-feature
   ```

## References

- [Main Testing Documentation](./README.md)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library React](https://testing-library.com/docs/react-testing-library/intro/)
