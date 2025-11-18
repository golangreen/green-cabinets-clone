# Architecture Documentation

## Project Structure

```
src/
├── assets/          # Static assets (images, logos)
├── components/      # React components
│   ├── ui/         # Shadcn UI components
│   └── ...         # Feature components
├── config/          # Configuration files
│   └── app.ts      # App-wide constants
├── contexts/        # React contexts
├── hooks/           # Custom React hooks
│   ├── useAuth.ts
│   ├── useCart.ts
│   └── ...
├── integrations/    # External integrations
│   └── supabase/   # Supabase client
├── lib/            # Utility libraries
│   └── queryClient.ts
├── pages/          # Page components
├── services/       # Business logic services
│   ├── authService.ts
│   ├── shopifyService.ts
│   ├── checkoutService.ts
│   └── ...
├── stores/         # Zustand state stores
├── types/          # TypeScript type definitions
│   ├── admin.ts
│   ├── shop.ts
│   ├── security.ts
│   └── ...
└── main.tsx        # Application entry point

supabase/
├── config.toml     # Supabase configuration
└── functions/      # Edge functions
    ├── _shared/    # Shared utilities
    │   ├── cors.ts
    │   ├── errors.ts
    │   ├── logger.ts
    │   ├── validation.ts
    │   └── rateLimit.ts
    └── [function-name]/
        └── index.ts
```

## Architecture Principles

### 1. Services Layer
All business logic is extracted into service classes in `src/services/`. Components should never contain complex business logic - they delegate to services.

**Example:**
```typescript
// ✅ Good: Component uses service
import { shopifyService } from '@/services';

const products = await shopifyService.getProducts();

// ❌ Bad: Business logic in component
const response = await fetch(SHOPIFY_URL, {
  headers: { ... },
  body: JSON.stringify({ ... })
});
```

### 2. Type Definitions
All TypeScript types are centralized in `src/types/` and organized by domain:
- `admin.ts` - User management, roles, audit logs
- `shop.ts` - Shopify products, cart, checkout
- `security.ts` - Security events, monitoring
- `vanity.ts` - Vanity designer configurations
- `cabinet.ts` - Cabinet catalog

Import types from `@/types` rather than defining inline.

### 3. Custom Hooks
Reusable component logic is extracted into hooks in `src/hooks/`:
- `useAuth` - Authentication operations
- `useCart` - Cart state management
- `useProducts` - Product fetching
- `useDebounce` - Value debouncing

### 4. Configuration
Hardcoded values are centralized in `src/config/app.ts`:
- App metadata
- Shopify configuration
- Cache settings
- Pricing constants

### 5. Edge Function Utilities
Shared edge function code lives in `supabase/functions/_shared/`:
- `cors.ts` - CORS handling
- `errors.ts` - Error classes and responses
- `logger.ts` - Structured logging
- `validation.ts` - Input validation
- `rateLimit.ts` - Rate limiting

## Data Flow

### Frontend Data Flow
```
Component → Custom Hook → Service → External API/Supabase
                ↓
            React Query (caching)
                ↓
            Zustand Store (local state)
```

### Authentication Flow
```
User Action → useAuth hook → authService → Supabase Auth
                                              ↓
                                         Session stored
                                              ↓
                                         AuthContext updated
```

### Checkout Flow
```
Cart → useCart hook → cartStore → shopifyService.createCheckout()
                                        ↓
                                   Shopify API
                                        ↓
                                   Redirect to checkout
```

## State Management

### Server State (React Query)
- Product listings
- User data
- Security events
- Cached for 5 minutes by default

### Client State (Zustand)
- Shopping cart
- UI preferences
- Persisted to localStorage

### Context State
- Authentication (AuthContext)
- Global UI state

## Best Practices

### Component Organization
1. Keep components focused and single-purpose
2. Extract business logic to services
3. Use custom hooks for reusable logic
4. Props should be typed with interfaces from `@/types`

### Service Guidelines
1. Services are singleton classes
2. Methods should be focused and testable
3. Use dependency injection where needed
4. Document public methods with JSDoc

### Error Handling
1. Use try-catch in services
2. Return structured error objects
3. Log errors with context
4. Show user-friendly messages

### Performance
1. Use React.memo for expensive components
2. Implement code splitting for large features
3. Lazy load routes and components
4. Cache API responses with React Query

## Testing Strategy

### Unit Tests
- Service methods
- Utility functions
- Custom hooks

### Integration Tests
- Component interactions
- Service + API integration
- Edge function behavior

### E2E Tests
- Critical user journeys
- Checkout flow
- Authentication flow

## Security

### Frontend
- Input validation in components
- Sanitization before API calls
- No sensitive data in localStorage
- HTTPS only

### Edge Functions
- CORS configured properly
- Rate limiting on public endpoints
- Input validation with Zod
- Structured error responses
- Authentication checks

### Database
- Row Level Security (RLS) enabled
- Admin-only access to sensitive tables
- Service role key protected
- Audit logging for changes

## Deployment

### Build Process
1. TypeScript compilation
2. Vite bundling
3. Asset optimization
4. Edge function deployment

### Environment Variables
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SHOPIFY_STOREFRONT_TOKEN`

## Maintenance

### Adding New Features
1. Create types in `src/types/`
2. Create service in `src/services/`
3. Create custom hook if needed
4. Implement UI components
5. Add tests
6. Update documentation

### Refactoring Guidelines
1. Maintain backward compatibility
2. Update tests first
3. Refactor incrementally
4. Document breaking changes

## Resources

- [React Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [Supabase Docs](https://supabase.com/docs)
- [Shopify Storefront API](https://shopify.dev/api/storefront)
