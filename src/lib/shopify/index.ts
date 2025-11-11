/**
 * Shopify Module
 * Centralized export point for all Shopify functionality
 */

// Configuration
export { SHOPIFY_CONFIG, SHOPIFY_STOREFRONT_URL } from './config';

// Types
export type {
  ShopifyProduct,
  CartItem,
  CartLine,
  ShopifyCart,
  ShopifyApiResponse,
} from './types';

// Queries
export { STOREFRONT_QUERY, CART_CREATE_MUTATION } from './queries';

// Client API functions
export {
  storefrontApiRequest,
  fetchProducts,
  createStorefrontCheckout,
} from './client';
