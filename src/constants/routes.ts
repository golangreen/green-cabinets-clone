/**
 * Centralized route definitions
 * Import and use these constants instead of hardcoded strings
 */

export const ROUTES = {
  // Main pages
  HOME: '/',
  AUTH: '/auth',
  NOT_FOUND: '/404',
  PROFILE: '/profile',
  
  // Designer tools
  VANITY_DESIGNER: '/designer',
  ROOM_SCAN: '/room-scan',
  
  // Documentation
  DOCS_GETTING_STARTED: '/docs/getting-started',
  DOCS_AUTH: '/docs/auth',
  DOCS_API: '/docs/api',
  DOCS_TROUBLESHOOTING: '/docs/troubleshooting',
  
  // Admin
  ADMIN_SECURITY: '/admin-security',
  ADMIN_USERS: '/admin/users',
  
  // Commerce
  CHECKOUT: '/checkout',
  PAYMENT_SUCCESS: '/payment-success',
  PRODUCT_DETAIL: (productId: string) => `/product/${productId}`,
} as const;

/**
 * Check if a route requires authentication
 */
export function isProtectedRoute(path: string): boolean {
  const protectedPaths = [
    ROUTES.PROFILE,
    ROUTES.VANITY_DESIGNER,
    ROUTES.ADMIN_SECURITY,
  ];
  return protectedPaths.some(route => path.startsWith(route));
}

/**
 * Check if a route is admin-only
 */
export function isAdminRoute(path: string): boolean {
  const adminPaths = [
    ROUTES.ADMIN_SECURITY,
    ROUTES.ADMIN_USERS,
  ];
  return adminPaths.some(route => path.startsWith(route));
}

/**
 * Get documentation routes for sidebar navigation
 */
export function getDocsRoutes() {
  return [
    { path: ROUTES.DOCS_GETTING_STARTED, label: 'Getting Started' },
    { path: ROUTES.DOCS_AUTH, label: 'Authentication' },
    { path: ROUTES.DOCS_API, label: 'API Reference' },
    { path: ROUTES.DOCS_TROUBLESHOOTING, label: 'Troubleshooting' },
  ];
}
