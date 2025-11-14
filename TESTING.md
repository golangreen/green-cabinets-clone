# Testing Guide

This project uses Vitest for testing with comprehensive coverage tracking.

## Quick Start

### Run All Tests
```bash
npm run test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests in UI Mode
```bash
npm run test:ui
```

## Test Structure

```
src/
├── features/
│   └── gallery/
│       ├── hooks/
│       │   ├── useGalleryState.ts
│       │   ├── useGalleryState.test.ts      # Unit tests
│       │   ├── useGalleryActions.ts
│       │   └── useGalleryActions.test.ts
│       ├── __tests__/
│       │   └── GalleryIntegration.test.tsx  # Integration tests
│       └── context/
│           ├── GalleryContext.tsx
│           └── GalleryContext.test.tsx
└── test/
    ├── setup.ts                              # Global test setup
    └── mocks/
        └── handlers.ts                       # MSW mock handlers
```

## Test Types

### 1. Unit Tests
Test individual functions, hooks, and utilities in isolation.

**Location:** Next to the source file with `.test.ts` or `.test.tsx` suffix

**Example:**
```typescript
// useGalleryState.test.ts
import { renderHook, act } from '@testing-library/react';
import { useGalleryState } from './useGalleryState';

describe('useGalleryState', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useGalleryState());
    expect(result.current.images).toEqual([]);
  });
});
```

### 2. Integration Tests
Test how multiple components/hooks work together.

**Location:** `__tests__` directory within feature folders

**Example:**
```typescript
// __tests__/GalleryIntegration.test.tsx
describe('Gallery Integration', () => {
  it('should complete upload workflow', async () => {
    // Test complete user workflow
  });
});
```

### 3. Component Tests
Test React components with user interactions.

**Example:**
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('should handle button click', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);
  await user.click(screen.getByRole('button'));
  expect(mockFn).toHaveBeenCalled();
});
```

## Coverage Reports

### Current Thresholds
- **Lines:** 70%
- **Functions:** 70%
- **Branches:** 65%
- **Statements:** 70%

Tests will fail if coverage drops below these thresholds.

### Viewing Coverage

1. **Terminal Output**
   ```bash
   npm run test:coverage
   ```
   View summary in terminal after tests complete.

2. **HTML Report**
   ```bash
   npm run test:coverage
   open coverage/index.html  # macOS
   start coverage/index.html # Windows
   ```
   Interactive browser-based coverage report with line-by-line highlighting.

3. **Coverage Directory Structure**
   ```
   coverage/
   ├── index.html              # Main coverage report
   ├── lcov.info              # LCOV format for CI/CD
   ├── coverage-final.json    # JSON format
   └── lcov-report/           # Detailed HTML reports
   ```

### Coverage Exclusions

The following are automatically excluded from coverage:
- Test files (`**/*.test.{ts,tsx}`)
- Test directories (`**/__tests__/**`)
- Barrel exports (`**/index.ts`)
- Auto-generated code (Supabase types)
- Configuration files
- Shadcn UI components
- Type definitions

## Writing Tests

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react';

describe('useCustomHook', () => {
  it('should update state', () => {
    const { result } = renderHook(() => useCustomHook());
    
    act(() => {
      result.current.updateValue('new value');
    });
    
    expect(result.current.value).toBe('new value');
  });
});
```

### Testing Components

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
  
  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### Testing with Context

```typescript
import { ReactNode } from 'react';

const wrapper = ({ children }: { children: ReactNode }) => (
  <MyProvider>{children}</MyProvider>
);

const { result } = renderHook(() => useMyContext(), { wrapper });
```

### Testing Async Operations

```typescript
it('should fetch data', async () => {
  const { result } = renderHook(() => useDataFetch());
  
  await act(async () => {
    await result.current.fetchData();
  });
  
  expect(result.current.data).toBeDefined();
});
```

## Mocking

### Mock Functions
```typescript
const mockFn = vi.fn();
mockFn.mockReturnValue('value');
mockFn.mockResolvedValue('async value');
```

### Mock Modules
```typescript
vi.mock('@/services/api', () => ({
  fetchData: vi.fn(async () => ({ data: 'mocked' })),
}));
```

### Mock Supabase
```typescript
// Configured in src/test/setup.ts
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
    })),
  },
}));
```

## Best Practices

### ✅ DO
- Write tests for business logic
- Test error handling
- Test edge cases
- Use descriptive test names
- Keep tests focused and isolated
- Mock external dependencies
- Test user interactions
- Aim for high coverage of critical paths

### ❌ DON'T
- Test implementation details
- Write tests that depend on each other
- Mock too much (test real behavior when possible)
- Ignore failing tests
- Write tests without assertions
- Test third-party libraries
- Duplicate coverage across test types

## Debugging Tests

### Run Specific Test File
```bash
npx vitest run src/path/to/test.test.ts
```

### Run Tests Matching Pattern
```bash
npx vitest run -t "should handle upload"
```

### Debug in VS Code
Add breakpoint and run "Debug Test" from the test file.

### View Test UI
```bash
npm run test:ui
```
Opens interactive UI to explore and debug tests.

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Install dependencies
  run: npm ci

- name: Run tests with coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## Coverage Goals

| Module | Current | Target |
|--------|---------|--------|
| Hooks | 75% | 80% |
| Context | 80% | 85% |
| Utils | 70% | 85% |
| Overall | 70% | 75% |

## Troubleshooting

### Tests Failing Locally
1. Clear node_modules and reinstall
2. Check Node version (18+ required)
3. Ensure all dependencies are installed
4. Run `npm run test -- --clearCache`

### Coverage Not Generating
1. Verify `@vitest/coverage-v8` is installed
2. Check vitest.config.ts configuration
3. Ensure tests are passing

### Slow Tests
1. Use `vi.fn()` instead of real implementations
2. Mock expensive operations
3. Consider parallel test execution
4. Profile with `--reporter=verbose`

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Coverage Guide](./src/test/coverage-report.md)

## Need Help?

- Check existing tests for examples
- Review testing patterns in `src/features/gallery`
- Consult team documentation
- Ask in team chat
