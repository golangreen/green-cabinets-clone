/**
 * Centralized route definitions
 * Import and use these constants instead of hardcoded strings
 */
import { ADMIN_SECURITY_ROUTES } from '@/features/admin-security/constants/routes';
import { ADMIN_USERS_ROUTES } from '@/features/admin-users/constants/routes';
import { ADMIN_AUDIT_ROUTES } from '@/features/admin-audit/constants/routes';
import { ADMIN_CACHE_ROUTES } from '@/features/admin-cache/constants/routes';
import { ADMIN_EMAIL_SETTINGS_ROUTES } from '@/features/admin-email-settings/constants/routes';
import { VANITY_DESIGNER_ROUTES } from '@/features/vanity-designer/constants/routes';
import { ROOM_SCANNER_ROUTES } from '@/features/room-scanner/constants/routes';
import { PRODUCT_CATALOG_ROUTES } from '@/features/product-catalog/constants/routes';

/**
 * Core application routes
 */
export const CORE_ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  NOT_FOUND: '/404',
  PROFILE: '/profile',
} as const;

/**
 * Documentation routes
 */
export const DOCS_ROUTES = {
  GETTING_STARTED: '/docs/getting-started',
  AUTH: '/docs/auth',
  API: '/docs/api',
  TROUBLESHOOTING: '/docs/troubleshooting',
} as const;

/**
 * All routes (backward compatibility)
 */
export const ROUTES = {
  // Core routes
  ...CORE_ROUTES,
  
  // Documentation
  DOCS_GETTING_STARTED: DOCS_ROUTES.GETTING_STARTED,
  DOCS_AUTH: DOCS_ROUTES.AUTH,
  DOCS_API: DOCS_ROUTES.API,
  DOCS_TROUBLESHOOTING: DOCS_ROUTES.TROUBLESHOOTING,
  
  // Feature routes
  VANITY_DESIGNER: VANITY_DESIGNER_ROUTES.DESIGNER,
  ROOM_SCAN: ROOM_SCANNER_ROUTES.SCAN,
  ADMIN_SECURITY: ADMIN_SECURITY_ROUTES.DASHBOARD,
  ADMIN_USERS: ADMIN_USERS_ROUTES.DASHBOARD,
  ADMIN_AUDIT_LOG: ADMIN_AUDIT_ROUTES.DASHBOARD,
  ADMIN_CACHE: ADMIN_CACHE_ROUTES.CACHE,
  ADMIN_CONFIG: '/admin/config',
  ADMIN_GALLERY: '/admin/gallery',
  ADMIN_EMAIL_SETTINGS: ADMIN_EMAIL_SETTINGS_ROUTES.DASHBOARD,
  CHECKOUT: PRODUCT_CATALOG_ROUTES.CHECKOUT,
  PAYMENT_SUCCESS: PRODUCT_CATALOG_ROUTES.PAYMENT_SUCCESS,
  PRODUCT_DETAIL: PRODUCT_CATALOG_ROUTES.PRODUCT_DETAIL,
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
    ROUTES.ADMIN_AUDIT_LOG,
    ROUTES.ADMIN_CACHE,
    ROUTES.ADMIN_CONFIG,
    ROUTES.ADMIN_GALLERY,
    ROUTES.ADMIN_EMAIL_SETTINGS,
  ];
  return adminPaths.some(route => path.startsWith(route));
}

/**
 * Get documentation routes for sidebar navigation
 */
export function getDocsRoutes() {
  return [
    { path: DOCS_ROUTES.GETTING_STARTED, label: 'Getting Started' },
    { path: DOCS_ROUTES.AUTH, label: 'Authentication' },
    { path: DOCS_ROUTES.API, label: 'API Reference' },
    { path: DOCS_ROUTES.TROUBLESHOOTING, label: 'Troubleshooting' },
  ];
}

// Re-export feature-specific routes for direct access
export { 
  ADMIN_SECURITY_ROUTES,
  ADMIN_USERS_ROUTES,
  ADMIN_AUDIT_ROUTES,
  ADMIN_CACHE_ROUTES,
  ADMIN_EMAIL_SETTINGS_ROUTES,
  VANITY_DESIGNER_ROUTES,
  ROOM_SCANNER_ROUTES,
  PRODUCT_CATALOG_ROUTES,
};
