# Testing Guide

## Overview

This project uses Vitest for unit and integration testing, along with React Testing Library for component tests.

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui
```

## Test Organization

```
src/
├── services/
│   └── __tests__/
│       ├── shopifyService.test.ts
│       └── checkoutService.test.ts
├── hooks/
│   └── __tests__/
│       └── useDebounce.test.ts
└── components/
    └── [feature]/
        └── __tests__/
            └── Component.test.tsx
```

## Writing Tests

### Service Tests

Test business logic in isolation:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { MyService } from '../myService';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    service = new MyService();
  });

  it('should perform operation correctly', () => {
    const result = service.doSomething();
    expect(result).toBe(expected);
  });
});
```

### Hook Tests

Test custom hooks with `renderHook`:

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useMyHook } from '../useMyHook';

it('should update value', async () => {
  const { result } = renderHook(() => useMyHook());
  
  act(() => {
    result.current.update('new value');
  });

  await waitFor(() => {
    expect(result.current.value).toBe('new value');
  });
});
```

### Component Tests

Test components with user interactions:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

it('should handle click', () => {
  const handleClick = vi.fn();
  render(<MyComponent onClick={handleClick} />);
  
  const button = screen.getByRole('button');
  fireEvent.click(button);
  
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

## Mocking

### Mocking Services

```typescript
vi.mock('@/services', () => ({
  shopifyService: {
    getProducts: vi.fn(() => Promise.resolve([])),
  },
}));
```

### Mocking Supabase

```typescript
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  },
}));
```

### Mocking React Router

```typescript
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: '123' }),
}));
```

## Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what the code does, not how it does it
   - Test from the user's perspective

2. **Keep Tests Independent**
   - Each test should be able to run in isolation
   - Use `beforeEach` for setup

3. **Use Descriptive Test Names**
   ```typescript
   // ✅ Good
   it('should display error message when email is invalid')
   
   // ❌ Bad
   it('test email validation')
   ```

4. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should calculate total correctly', () => {
     // Arrange
     const items = [{ price: 10, quantity: 2 }];
     
     // Act
     const total = calculateTotal(items);
     
     // Assert
     expect(total).toBe(20);
   });
   ```

5. **Test Edge Cases**
   - Empty states
   - Error conditions
   - Boundary values

6. **Avoid Testing External Libraries**
   - Don't test React, Zustand, or React Query
   - Test your integration with them

## Coverage Goals

- **Services**: 80%+ coverage
- **Hooks**: 70%+ coverage
- **Components**: 60%+ coverage (focus on critical paths)

## Continuous Integration

Tests run automatically on:
- Pull requests
- Main branch commits
- Before deployment

## Common Patterns

### Testing Async Operations

```typescript
it('should fetch data', async () => {
  const { result } = renderHook(() => useProducts());
  
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });
  
  expect(result.current.products).toHaveLength(10);
});
```

### Testing Form Submissions

```typescript
it('should submit form', async () => {
  const onSubmit = vi.fn();
  render(<QuoteForm onSubmit={onSubmit} />);
  
  await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
  await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(onSubmit).toHaveBeenCalledWith({
    name: 'John Doe',
    email: 'john@example.com',
  });
});
```

### Testing Error States

```typescript
it('should display error on failure', async () => {
  const error = new Error('Failed to load');
  vi.mocked(shopifyService.getProducts).mockRejectedValueOnce(error);
  
  render(<ProductList />);
  
  await waitFor(() => {
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });
});
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
