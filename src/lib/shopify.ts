const SHOPIFY_API_VERSION = '2025-07';
const SHOPIFY_STORE_PERMANENT_DOMAIN = 'green-cabinets-clone-5eeb3.myshopify.com';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || '585dda31c3bbc355eb6f937d3307f76b';

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    images: {
      edges: Array<{
        node: {
          url: string;
          altText: string | null;
        };
      }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: {
            amount: string;
            currencyCode: string;
          };
          availableForSale: boolean;
          selectedOptions: Array<{
            name: string;
            value: string;
          }>;
        };
      }>;
    };
    options: Array<{
      name: string;
      values: string[];
    }>;
  };
}

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

export async function storefrontApiRequest(query: string, variables: any = {}) {
  // Skip during SSR/build time
  if (typeof window === 'undefined') {
    return { data: null };
  }
  
  try {
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
      console.warn('Shopify payment required - store needs to be on a paid plan');
      return { data: null };
    }

    if (!response.ok) {
      console.warn(`Shopify HTTP error! status: ${response.status}`);
      return { data: null };
    }

    const data = await response.json();
    
    if (data.errors) {
      console.warn(`Shopify API errors:`, data.errors);
      return { data: null };
    }

    return data;
  } catch (error) {
    console.warn('Shopify API request failed:', error);
    return { data: null };
  }
}

export async function fetchProducts(first: number = 50, query?: string) {
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

export async function createStorefrontCheckout(items: any[]): Promise<string> {
  // Skip during SSR/build time
  if (typeof window === 'undefined') {
    throw new Error('Checkout creation not available during SSR');
  }
  
  try {
    console.log('Creating checkout with items:', items);
    
    const lines = items.map(item => {
      // Combine selectedOptions and customAttributes
      const attributes = [
        ...(item.selectedOptions?.map((opt: any) => ({
          key: opt.name,
          value: opt.value
        })) || []),
        ...(item.customAttributes?.map((attr: any) => ({
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
