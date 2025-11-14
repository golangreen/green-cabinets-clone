# Layout Component Tests

This directory contains comprehensive tests for the three main layout components used throughout the application.

## Test Files

- **AdminLayout.test.tsx** - Tests for admin-only pages
- **ProtectedLayout.test.tsx** - Tests for authenticated user pages
- **PublicLayout.test.tsx** - Tests for public pages

## Test Coverage

Each layout component test file includes:

### 1. Snapshot Tests
Captures the rendered HTML structure to detect unintended changes:

```typescript
it('should match snapshot with default props', () => {
  const { container } = render(
    <LayoutComponent>
      <div>Content</div>
    </LayoutComponent>
  );
  expect(container.firstChild).toMatchSnapshot();
});
```

**Variations tested:**
- Default props
- Custom container className
- With/without container wrapper
- With error boundary configuration
- Complex nested content

### 2. Structure Tests
Verifies that all required layout elements are present:

```typescript
it('should render all layout components', () => {
  const { getByTestId } = render(<LayoutComponent>Content</LayoutComponent>);
  
  expect(getByTestId('header')).toBeInTheDocument();
  expect(getByTestId('footer')).toBeInTheDocument();
});
```

**Elements verified:**
- Header component
- Footer component
- Main content area
- Container wrapper (when enabled)
- Error boundary (when configured)
- Auth wrappers (AdminRoute/ProtectedRoute)

### 3. Props Validation Tests
Ensures props are correctly applied:

```typescript
it('should apply custom container className', () => {
  const { container } = render(
    <LayoutComponent containerClassName="custom-class">
      Content
    </LayoutComponent>
  );
  
  expect(container.querySelector('.custom-class')).toBeInTheDocument();
});
```

## Running Layout Tests

```bash
# Run all layout tests
npm test src/components/layout/__tests__

# Run specific layout test
npm test AdminLayout.test.tsx

# Run with coverage
npm test -- --coverage src/components/layout

# Update snapshots (after intentional changes)
npm test -- -u src/components/layout/__tests__
```

## Snapshot Management

### When Snapshots Fail

1. **Review the diff carefully** - Understand what changed
2. **Check if change is intentional**:
   - ✅ If yes: Update snapshot with `npm test -- -u`
   - ❌ If no: Fix the code to match expected behavior

### Best Practices

- ✅ Review snapshot diffs in pull requests
- ✅ Keep snapshots small and focused
- ✅ Update snapshots only when changes are intentional
- ❌ Don't blindly update all snapshots with `-u`
- ❌ Don't commit snapshot changes without reviewing

## Mock Strategy

Layout tests mock child components to keep tests focused:

```typescript
vi.mock('../Header', () => ({
  default: () => <div data-testid="header">Header</div>,
}));

vi.mock('../Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));
```

**Benefits:**
- Tests run faster
- Isolated from child component changes
- Focus on layout structure
- Predictable test behavior

## Test Patterns

### Testing Container Wrapper

```typescript
// With container (default)
it('should wrap content in container by default', () => {
  const { container } = render(
    <LayoutComponent>
      <div data-testid="content">Content</div>
    </LayoutComponent>
  );
  
  const main = container.querySelector('main');
  expect(main?.querySelector('[data-testid="content"]')).toBeInTheDocument();
});

// Without container
it('should not wrap when disabled', () => {
  const { container } = render(
    <LayoutComponent withContainer={false}>
      <div data-testid="content">Content</div>
    </LayoutComponent>
  );
  
  const main = container.querySelector('main');
  expect(main).toHaveClass('flex-1');
});
```

### Testing Error Boundaries

```typescript
// Without error boundary
it('should not render error boundary by default', () => {
  const { queryByTestId } = render(
    <LayoutComponent>Content</LayoutComponent>
  );
  
  expect(queryByTestId('error-boundary')).not.toBeInTheDocument();
});

// With error boundary
it('should wrap in error boundary when configured', () => {
  const { getByTestId } = render(
    <LayoutComponent
      errorBoundary={{
        featureName: 'Test',
        featureTag: 'test',
        fallbackRoute: '/',
      }}
    >
      Content
    </LayoutComponent>
  );
  
  expect(getByTestId('error-boundary')).toBeInTheDocument();
});
```

## Adding New Layout Tests

When creating a new layout component:

1. **Create test file** in `__tests__/` folder
2. **Mock child components** (Header, Footer, etc.)
3. **Add snapshot tests** for different prop combinations
4. **Add structure tests** to verify element presence
5. **Add props tests** to validate prop handling
6. **Run tests** and generate snapshots

## References

- [Main Testing Documentation](/src/test/README.md)
- [Test Structure Guide](/src/test/STRUCTURE.md)
- [Layout Architecture](/ARCHITECTURE.md#layout-components)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library React](https://testing-library.com/docs/react-testing-library/intro/)
