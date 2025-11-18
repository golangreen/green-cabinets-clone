import { toast } from "sonner";
import type { ShopifyProduct } from "@/types";

const SHOPIFY_API_VERSION = '2025-07';
const SHOPIFY_STORE_PERMANENT_DOMAIN = 'green-cabinets-clone-5eeb3.myshopify.com';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || '585dda31c3bbc355eb6f937d3307f76b';

const STOREFRONT_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          description
          handle
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          options {
            name
            values
          }
        }
      }
    }
  }
`;

const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Service for interacting with Shopify Storefront API.
 * Handles all product fetching and cart operations.
 */
export class ShopifyService {
  /**
   * Makes a request to the Shopify Storefront API
   */
  private async storefrontApiRequest(query: string, variables: any = {}): Promise<any> {
    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (response.status === 402) {
      toast.error("Shopify: Payment required", {
        description: "Shopify API access requires an active Shopify billing plan. Visit https://admin.shopify.com to upgrade.",
      });
      throw new Error('Shopify payment required');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(`Error calling Shopify: ${data.errors.map((e: any) => e.message).join(', ')}`);
    }

    return data;
  }

  /**
   * Fetches products from Shopify
   * @param first - Number of products to fetch (default: 50)
   * @param query - Optional search query
   * @returns Array of Shopify products
   */
  async getProducts(first: number = 50, query?: string): Promise<ShopifyProduct[]> {
    try {
      const data = await this.storefrontApiRequest(STOREFRONT_QUERY, {
        first,
        query,
      });

      return data.data.products.edges || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Fetches a single product by handle
   * @param handle - The product handle (URL-friendly identifier)
   * @returns The product or null if not found
   */
  /**
   * Get a single product by its handle
   * 
   * @param handle - Product handle (URL-friendly identifier)
   * @returns Promise resolving to product or null if not found
   * 
   * @example
   * ```typescript
   * const product = await shopifyService.getProductByHandle('oak-cabinet-door');
   * if (product) {
   *   console.log(product.node.title);
   * }
   * ```
   */
  async getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
    try {
      const products = await this.getProducts(50);
      const foundProduct = products.find(
        (p: ShopifyProduct) => p.node.handle === handle
      );
      return foundProduct || null;
    } catch (error) {
      console.error('Error fetching product by handle:', error);
      throw error;
    }
  }

  /**
   * Creates a Shopify checkout session from cart items
   * @param items - Array of cart items with merchandise IDs and quantities
   * @returns The checkout URL
   */
  async createCheckout(items: { variantId: string; quantity: number; customAttributes?: { key: string; value: string }[] }[]): Promise<string> {
    try {
      // Format cart lines for Shopify
      const lines = items.map(item => ({
        quantity: item.quantity,
        merchandiseId: item.variantId,
        attributes: item.customAttributes || [],
      }));

      // Create cart with initial items
      const cartData = await this.storefrontApiRequest(CART_CREATE_MUTATION, {
        input: {
          lines,
        },
      });

      if (cartData.data.cartCreate.userErrors.length > 0) {
        throw new Error(`Cart creation failed: ${cartData.data.cartCreate.userErrors.map((e: any) => e.message).join(', ')}`);
      }

      const cart = cartData.data.cartCreate.cart;
      
      if (!cart.checkoutUrl) {
        throw new Error('No checkout URL returned from Shopify');
      }

      const url = new URL(cart.checkoutUrl);
      url.searchParams.set('channel', 'online_store');
      const checkoutUrl = url.toString();
      
      return checkoutUrl;
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const shopifyService = new ShopifyService();
