import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header, Footer, FeatureErrorBoundary, OfflineBanner } from "@/components/layout";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { VanityDesignerApp } from "@/features/vanity-designer";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useProductCacheStore } from "@/features/product-catalog";
import { trackOperation } from "@/lib/performance";
import { logger } from '@/lib/logger';

// Mock product for fallback
const mockVanityProduct: ShopifyProduct = {
  node: {
    id: "gid://shopify/Product/mock",
    handle: "custom-bathroom-vanity",
    title: "Custom Bathroom Vanity",
    description: "Premium custom bathroom vanities available in Tafisa ($250/ft), Egger ($300/ft), and Shinnoki ($350/ft) finishes. Choose your brand, style, and color from our extensive selection - over 60 Tafisa colors, 98+ Egger woodgrains and solids, and 18+ Shinnoki wood veneers.",
    priceRange: {
      minVariantPrice: {
        amount: "250.0",
        currencyCode: "USD"
      }
    },
    images: {
      edges: []
    },
    variants: {
      edges: [{
        node: {
          id: "gid://shopify/ProductVariant/mock",
          title: "Default",
          price: {
            amount: "250.0",
            currencyCode: "USD"
          },
          availableForSale: true,
          selectedOptions: []
        }
      }]
    },
    options: []
  }
};

export default function ProductDetail() {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const { productsList, isCacheValid, getProduct, setProducts } = useProductCacheStore();

  useEffect(() => {
    // Only run in browser, not during SSR/build
    if (typeof window === 'undefined') {
      setProduct(mockVanityProduct);
      setLoading(false);
      return;
    }

    const loadProduct = async () => {
      try {
        // Check cache first
        if (isCacheValid() && productsList.length > 0) {
          logger.debug('Using cached product data', { component: 'ProductDetail' });
          const cachedProduct = productsList.find(
            (p: ShopifyProduct) => p.node.handle === handle
          );
          setProduct(cachedProduct || mockVanityProduct);
          setLoading(false);
          return;
        }

        // Fetch fresh data if cache is invalid
        logger.debug('Fetching fresh product data from Shopify', { component: 'ProductDetail' });
        
        // Track product detail loading performance
        await trackOperation(
          'product-detail-fetch',
          async () => {
            const products = await fetchProducts(50);
            setProducts(products);
            
            const foundProduct = products.find(
              (p: ShopifyProduct) => p.node.handle === handle
            );
            // Use mock product as fallback if not found
            setProduct(foundProduct || mockVanityProduct);
          },
          {
            component: 'ProductDetail',
            handle,
            cacheHit: false
          }
        );
      } catch (error) {
        logger.error("Error loading product", error, { component: 'ProductDetail', handle });
        // Use mock product on error
        setProduct(mockVanityProduct);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [handle, isCacheValid, productsList, setProducts]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading product...</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Product will always be available (either from Shopify or mock)

  return (
    <FeatureErrorBoundary
      featureName="Product Detail"
      featureTag="product-detail"
      fallbackRoute={ROUTES.HOME}
    >
      <div className="min-h-screen flex flex-col">
        <OfflineBanner />
        <Header />
        <main className="flex-1 py-6 sm:py-8 md:py-12 bg-brand-gray">
          <div className="container mx-auto px-4">
            <Link to={ROUTES.HOME}>
              <Button variant="ghost" className="mb-4 sm:mb-6 touch-manipulation">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Shop
              </Button>
            </Link>
            <VanityDesignerApp />
          </div>
        </main>
        <Footer />
      </div>
    </FeatureErrorBoundary>
  );
}
