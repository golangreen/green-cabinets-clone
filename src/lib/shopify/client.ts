/**
 * Shopify Client
 * Client-side Storefront API functions for product fetching and checkout
 */

import { SHOPIFY_STOREFRONT_URL, SHOPIFY_CONFIG } from './config';
import { STOREFRONT_QUERY, CART_CREATE_MUTATION } from './queries';
import type { ShopifyProduct, CartItem, CartLine, ShopifyApiResponse } from './types';

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
    console.error('❌ SHOPIFY STOREFRONT TOKEN NOT CONFIGURED');
    console.error('Set VITE_SHOPIFY_STOREFRONT_TOKEN in your deployment environment variables');
    return { data: null };
  }
  
  console.log('🔑 Using Shopify token:', SHOPIFY_CONFIG.STOREFRONT_TOKEN.substring(0, 10) + '...');
  console.log('🌐 Shopify URL:', SHOPIFY_STOREFRONT_URL);
  
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

    console.log('📡 Shopify API Response Status:', response.status);

    if (response.status === 402) {
      console.error('❌ Shopify payment required - store needs to be on a paid plan');
      return { data: null };
    }

    if (response.status === 401) {
      console.error('❌ Unauthorized - Invalid Shopify Storefront Access Token');
      console.error('Token being used:', SHOPIFY_CONFIG.STOREFRONT_TOKEN.substring(0, 10) + '...');
      return { data: null };
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Shopify HTTP error! status: ${response.status}`, errorText);
      return { data: null };
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error(`❌ Shopify API errors:`, data.errors);
      return { data: null };
    }

    console.log('✅ Shopify API request successful');
    return data;
  } catch (error) {
    console.error('❌ Shopify API request failed:', error);
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
    console.warn('Failed to fetch products:', error);
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
    console.log('Creating checkout with items:', items);
    
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

    console.log('Cart lines with attributes:', lines);

    const cartData = await storefrontApiRequest(CART_CREATE_MUTATION, {
      input: {
        lines,
      },
    });

    if (!cartData || !cartData.data) {
      throw new Error('No response from Shopify API');
    }

    console.log('Cart data:', cartData);

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
    
    console.log('Final checkout URL:', finalUrl);
    return finalUrl;
  } catch (error) {
    console.error('Error creating storefront checkout:', error);
    throw error;
  }
}
