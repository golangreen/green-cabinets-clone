/**
 * Shopify Configuration
 * Contains all Shopify API configuration and constants
 */

export const SHOPIFY_CONFIG = {
  API_VERSION: '2025-07',
  STORE_PERMANENT_DOMAIN: 'green-cabinets-clone-5eeb3.myshopify.com',
  STOREFRONT_TOKEN: import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || '585dda31c3bbc355eb6f937d3307f76b',
} as const;

export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_CONFIG.STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_CONFIG.API_VERSION}/graphql.json`;
