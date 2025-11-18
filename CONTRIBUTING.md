# Contributing Guide

## Development Setup

1. **Clone and Install**
```bash
git clone [repository-url]
cd green-cabinets
npm install
```

2. **Start Development Server**
```bash
npm run dev
```

3. **Run Tests**
```bash
npm run test:watch
```

## Architecture Guidelines

### Services Layer
All business logic goes in `src/services/`. Never put business logic directly in components.

```typescript
// ✅ Good
import { shopifyService } from '@/services';
const products = await shopifyService.getProducts();

// ❌ Bad - business logic in component
const response = await fetch(API_URL);
const data = await response.json();
```

### Type Definitions
Import types from centralized location:

```typescript
// ✅ Good
import type { ShopifyProduct, CartItem } from '@/types';

// ❌ Bad - defining types inline
interface Product {
  id: string;
  title: string;
}
```

### Custom Hooks
Extract reusable component logic:

```typescript
// ✅ Good - reusable hook
export function useProducts() {
  const [products, setProducts] = useState([]);
  // ... logic
  return { products, loading, error };
}

// ❌ Bad - logic duplicated in components
function ProductList() {
  const [products, setProducts] = useState([]);
  // ... same logic repeated
}
```

### Configuration
Use centralized config:

```typescript
// ✅ Good
import { SHOPIFY_CONFIG } from '@/config/app';

// ❌ Bad
const API_VERSION = '2025-07';
```

## Code Style

### TypeScript
- Use strict mode
- Always define return types for functions
- Prefer `type` over `interface` for simple types
- Use `interface` for objects that can be extended

### React
- Functional components only
- Use hooks for state and effects
- Extract complex logic to custom hooks
- Keep components under 200 lines

### Naming Conventions
- **Files**: camelCase for utilities, PascalCase for components
- **Functions**: camelCase, use verb prefixes (get, set, handle)
- **Components**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Types**: PascalCase with descriptive names

## Commit Messages

Follow conventional commits:

```
feat: add user authentication
fix: resolve cart total calculation
docs: update API documentation
refactor: extract pricing logic to service
test: add checkout service tests
chore: update dependencies
```

## Pull Request Process

1. **Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make Changes**
- Follow architecture guidelines
- Add tests for new features
- Update documentation

3. **Run Checks**
```bash
npm run lint
npm run test
npm run build
```

4. **Commit and Push**
```bash
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

5. **Create Pull Request**
- Describe changes clearly
- Reference related issues
- Wait for review

## Testing Requirements

### New Services
- Unit tests for all public methods
- Mock external dependencies
- Test edge cases and errors

### New Hooks
- Test initial state
- Test state updates
- Test cleanup

### New Components
- Test rendering
- Test user interactions
- Test error states

Example:
```typescript
describe('MyService', () => {
  it('should handle success case', async () => {
    const result = await service.method();
    expect(result).toBeDefined();
  });

  it('should handle error case', async () => {
    await expect(service.method()).rejects.toThrow();
  });
});
```

## Adding New Features

1. **Plan Architecture**
   - Identify required types → add to `src/types/`
   - Identify business logic → add to `src/services/`
   - Identify reusable logic → create custom hook

2. **Implement**
   - Create service with business logic
   - Create types for data structures
   - Create hook if needed
   - Implement UI components

3. **Test**
   - Write service tests
   - Write hook tests
   - Write component tests

4. **Document**
   - Add JSDoc comments
   - Update ARCHITECTURE.md if needed
   - Update README.md if needed

## Common Patterns

### Service Pattern
```typescript
export class MyService {
  async fetchData(): Promise<Data[]> {
    // Implementation
  }
}

export const myService = new MyService();
```

### Hook Pattern
```typescript
export function useMyFeature() {
  const [state, setState] = useState();
  // Logic
  return { state, actions };
}
```

### Component Pattern
```typescript
interface Props {
  data: Data;
  onAction: () => void;
}

export function MyComponent({ data, onAction }: Props) {
  return <div>{/* JSX */}</div>;
}
```

## Error Handling

### Services
```typescript
async fetchData(): Promise<Result> {
  try {
    const data = await api.get();
    return { success: true, data };
  } catch (error) {
    console.error('Failed to fetch:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

### Components
```typescript
function MyComponent() {
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    try {
      await service.doSomething();
    } catch (err) {
      setError(err.message);
      toast.error('Operation failed');
    }
  };
}
```

## Performance Guidelines

1. **Memoization**
   - Use `useMemo` for expensive calculations
   - Use `useCallback` for functions passed to children
   - Use `React.memo` for expensive components

2. **Code Splitting**
   - Lazy load routes
   - Lazy load heavy components
   - Use dynamic imports for large libraries

3. **Data Fetching**
   - Use React Query for server state
   - Implement proper caching
   - Avoid waterfalls

## Security Guidelines

1. **Input Validation**
   - Validate all user inputs
   - Sanitize before sending to API
   - Use Zod schemas

2. **Authentication**
   - Never store sensitive data in localStorage
   - Use secure session management
   - Implement proper role checks

3. **API Calls**
   - Use environment variables for secrets
   - Implement rate limiting
   - Validate responses

## Documentation

- Add JSDoc comments to all public APIs
- Update README.md for user-facing changes
- Update ARCHITECTURE.md for architectural changes
- Add inline comments for complex logic

## Questions?

- Check ARCHITECTURE.md for architectural decisions
- Check TESTING.md for testing guidelines
- Ask in pull request comments
- Contact: orders@greencabinetsny.com
