/**
 * Shopify Client
 * Client-side Storefront API functions for product fetching and checkout
 */

import { SHOPIFY_STOREFRONT_URL, SHOPIFY_CONFIG } from './config';
import { STOREFRONT_QUERY, CART_CREATE_MUTATION } from './queries';
import type { ShopifyProduct, CartItem, CartLine, ShopifyApiResponse } from './types';
import { logger } from '@/lib/logger';

/**
 * Make a request to the Shopify Storefront API
 * @param query - GraphQL query string
 * @param variables - Query variables
 * @returns API response data
 */
export async function storefrontApiRequest(
  query: string, 
  variables: Record<string, any> = {}
): Promise<ShopifyApiResponse> {
  // Skip during SSR/build time
  if (typeof window === 'undefined') {
    return { data: null };
  }
  
  // Check if token is configured
  if (!SHOPIFY_CONFIG.STOREFRONT_TOKEN) {
    logger.error('SHOPIFY STOREFRONT TOKEN NOT CONFIGURED - Set VITE_SHOPIFY_STOREFRONT_TOKEN in your deployment environment variables', undefined, { module: 'ShopifyClient' });
    return { data: null };
  }
  
  logger.debug('Using Shopify token', { module: 'ShopifyClient', tokenPrefix: SHOPIFY_CONFIG.STOREFRONT_TOKEN.substring(0, 10), url: SHOPIFY_STOREFRONT_URL });
  
  try {
    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_CONFIG.STOREFRONT_TOKEN
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    logger.debug('Shopify API Response', { module: 'ShopifyClient', status: response.status });

    if (response.status === 402) {
      logger.error('Shopify payment required - store needs to be on a paid plan', undefined, { module: 'ShopifyClient' });
      return { data: null };
    }

    if (response.status === 401) {
      logger.error('Unauthorized - Invalid Shopify Storefront Access Token', undefined, { module: 'ShopifyClient', tokenPrefix: SHOPIFY_CONFIG.STOREFRONT_TOKEN.substring(0, 10) });
      return { data: null };
    }

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Shopify HTTP error', undefined, { module: 'ShopifyClient', status: response.status, errorText });
      return { data: null };
    }

    const data = await response.json();
    
    if (data.errors) {
      logger.error('Shopify API errors', undefined, { module: 'ShopifyClient', errors: data.errors });
      return { data: null };
    }

    logger.debug('Shopify API request successful', { module: 'ShopifyClient' });
    return data;
  } catch (error) {
    logger.error('Shopify API request failed', error, { module: 'ShopifyClient' });
    return { data: null };
  }
}

/**
 * Fetch products from Shopify Storefront API
 * @param first - Number of products to fetch
 * @param query - Optional search query
 * @returns Array of products
 */
export async function fetchProducts(
  first: number = 50, 
  query?: string
): Promise<ShopifyProduct[]> {
  // Skip during SSR/build time
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const data = await storefrontApiRequest(STOREFRONT_QUERY, { first, query });
    return data?.data?.products?.edges || [];
  } catch (error) {
    logger.warn('Failed to fetch products', { module: 'ShopifyClient', error });
    return [];
  }
}

/**
 * Create a Shopify checkout from cart items
 * @param items - Cart items to checkout
 * @returns Checkout URL with channel parameter
 */
export async function createStorefrontCheckout(items: CartItem[]): Promise<string> {
  // Skip during SSR/build time
  if (typeof window === 'undefined') {
    throw new Error('Checkout creation not available during SSR');
  }
  
  try {
    logger.debug('Creating checkout with items', { module: 'ShopifyClient', itemCount: items.length });
    
    const lines: CartLine[] = items.map(item => {
      // Combine selectedOptions and customAttributes
      const attributes = [
        ...(item.selectedOptions?.map((opt) => ({
          key: opt.name,
          value: opt.value
        })) || []),
        ...(item.customAttributes?.map((attr) => ({
          key: attr.key,
          value: attr.value
        })) || [])
      ];
      
      return {
        quantity: item.quantity,
        merchandiseId: item.variantId,
        attributes
      };
    });

    logger.debug('Cart lines prepared', { module: 'ShopifyClient', lineCount: lines.length });

    const cartData = await storefrontApiRequest(CART_CREATE_MUTATION, {
      input: {
        lines,
      },
    });

    if (!cartData || !cartData.data) {
      throw new Error('No response from Shopify API');
    }

    logger.debug('Cart data received', { module: 'ShopifyClient' });

    if (cartData.data.cartCreate.userErrors.length > 0) {
      const errors = cartData.data.cartCreate.userErrors.map((e: any) => e.message).join(', ');
      throw new Error(`Cart creation failed: ${errors}`);
    }

    const cart = cartData.data.cartCreate.cart;
    
    if (!cart.checkoutUrl) {
      throw new Error('No checkout URL returned from Shopify');
    }

    const url = new URL(cart.checkoutUrl);
    url.searchParams.set('channel', 'online_store');
    const finalUrl = url.toString();
    
    logger.debug('Final checkout URL generated', { module: 'ShopifyClient' });
    return finalUrl;
  } catch (error) {
    logger.error('Error creating storefront checkout', error, { module: 'ShopifyClient' });
    throw error;
  }
}
