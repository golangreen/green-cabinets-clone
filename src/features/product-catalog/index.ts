/**
 * Product Catalog Feature
 * Handles Shopify product display, search, and caching
 */

export { ShopProducts } from './components/ShopProducts';
export { PreloadManager } from './components/PreloadManager';
export { useProductCacheStore } from './stores/productCacheStore';
export { useProductPreloader } from './hooks/useProductPreloader';
export { PRELOAD_CONFIG } from './config/preloadConfig';
export { PRODUCT_CATALOG_ROUTES } from './constants/routes';
