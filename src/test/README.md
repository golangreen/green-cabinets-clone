# Testing Guide

This project uses Vitest for component/unit testing and Playwright for E2E testing.

## Running Tests

### Component Tests (Vitest)
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### E2E Tests (Playwright)
```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed
```

## Test Structure

All tests use the `__tests__` folder pattern for consistency and easy discovery.

### Unit Tests
Located in `src/features/[feature]/hooks/__tests__/` or `src/features/[feature]/services/__tests__/`.

Example:
```
src/features/gallery/hooks/
  useImageUpload.ts
  __tests__/
    useImageUpload.test.ts
```

### Component Tests
Located in `src/features/[feature]/components/__tests__/` alongside the components they test.

Example:
```
src/features/admin-security/components/
  SecurityEventsTable.tsx
  __tests__/
    SecurityEventsTable.test.tsx
```

### Integration Tests
Located in `src/features/[feature]/__tests__/` for testing complete feature workflows.

Example:
```
src/features/gallery/
  __tests__/
    GalleryIntegration.test.tsx
```

### Service Tests
Located in `src/services/__tests__/` for testing service layer logic.

Example:
```
src/services/
  __tests__/
    securityService.test.ts
```

### Layout Component Tests
Located in `src/components/layout/__tests__/` for testing layout wrapper components.

Example:
```
src/components/layout/
  AdminLayout.tsx
  ProtectedLayout.tsx
  PublicLayout.tsx
  __tests__/
    AdminLayout.test.tsx
    ProtectedLayout.test.tsx
    PublicLayout.test.tsx
```

**Snapshot Testing**: Layout tests use snapshots to ensure consistent structure and catch regressions.

### E2E Tests
Located in `e2e/` directory for end-to-end user journey tests.

**For detailed test organization guidelines, see [STRUCTURE.md](./STRUCTURE.md)**

## Writing Tests

### Component Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Snapshot Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AdminLayout } from '../AdminLayout';

describe('AdminLayout', () => {
  it('should match snapshot with default props', () => {
    const { container } = render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
  
  it('should match snapshot with custom container', () => {
    const { container } = render(
      <AdminLayout containerClassName="custom-class">
        <div>Content</div>
      </AdminLayout>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
```

**Updating Snapshots**: When intentional changes are made, update snapshots with:
```bash
npm test -- -u
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/auth');
  await page.fill('input[type="email"]', 'user@example.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/');
});
```

## Test Coverage Goals

- Critical features: 80%+ coverage
- Services layer: 90%+ coverage
- Components: 70%+ coverage
- E2E: All key user journeys covered

## Mocking

### Mocking Supabase
The Supabase client is automatically mocked in test setup. See `src/test/setup.ts`.

### Mocking API Calls
Use MSW (Mock Service Worker) handlers defined in `src/test/mocks/handlers.ts`.

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Main branch commits
- Before deployments

## Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Test behavior, not implementation**: Focus on user interactions
3. **Use semantic queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
4. **Keep tests isolated**: Each test should be independent
5. **Mock external dependencies**: Don't make real API calls in tests
6. **Test accessibility**: Use ARIA queries and check for proper semantics
7. **Snapshot tests for layouts**: Use snapshots to prevent structural regressions
8. **Review snapshot changes**: Always review diffs before updating snapshots
