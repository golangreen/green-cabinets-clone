import { useEffect, useState } from "react";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, X } from "lucide-react";
import { useCartStore } from "@/features/shopping-cart";
import { useProductCacheStore } from "@/features/product-catalog/stores/productCacheStore";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { logger } from '@/lib/logger';
import { trackOperation } from '@/lib/performance';
export const ShopProducts = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadedProductImages, setLoadedProductImages] = useState<Set<string>>(new Set());
  const addItem = useCartStore(state => state.addItem);
  const navigate = useNavigate();
  const {
    productsList,
    isCacheValid,
    setProducts
  } = useProductCacheStore();

  // Debounce search term to avoid excessive filtering
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  useEffect(() => {
    // Only run in browser, not during SSR/build
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }
    const loadProducts = async () => {
      try {
        // Check if cache is valid
        const cachedProducts = productsList;
        if (isCacheValid()) {
          logger.debug('Using cached products', { 
            count: cachedProducts.length,
            component: 'ShopProducts'
          });
          setLoading(false);
          return;
        } 
        
        logger.info('Fetching fresh products from Shopify', { component: 'ShopProducts' });
        
        // Track product catalog loading performance
        await trackOperation(
          'product-catalog-fetch',
          async () => {
            const products = await fetchProducts();
            setProducts(products);
          },
          {
            component: 'ShopProducts',
            cacheHit: false,
            productCount: productsList.length
          }
        );
      } catch (error) {
        logger.apiError('/shop', error, { 
          component: 'ShopProducts',
          action: 'fetchProducts'
        });
        // Silently fail - don't show error toast, just show no products
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [isCacheValid, setProducts, productsList]);
  const handleAddToCart = (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) {
      toast.error('Product variant not available');
      return;
    }
    const cartItem = {
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || []
    };
    addItem(cartItem);
    toast.success('Added to cart', {
      description: product.node.title,
      position: 'top-center'
    });
  };

  // Filter products based on debounced search term
  const filteredProducts = productsList.filter(product => {
    if (!debouncedSearchTerm) return true;
    const searchLower = debouncedSearchTerm.toLowerCase();
    const title = product.node.title.toLowerCase();
    const description = product.node.description.toLowerCase();
    return title.includes(searchLower) || description.includes(searchLower);
  });
  if (loading) {
    return <div className="py-24 px-4">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>;
  }

  // Hide shop section if no products (including Shopify errors)
  if (productsList.length === 0) {
    return null;
  }
  return <section className="py-12 sm:py-16 md:py-24 px-4 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">Our Products</h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Browse our collection of premium custom cabinetry
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="text" placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-10" />
            {searchTerm && <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7" onClick={() => setSearchTerm("")}>
                <X className="h-4 w-4" />
              </Button>}
          </div>
          {debouncedSearchTerm && <p className="text-sm text-muted-foreground mt-2">
              Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>}
        </div>
        
        {/* Custom Product Cards */}
        <div className="mb-12">
          
        </div>


        {filteredProducts.length === 0 ? <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? 'No products found matching your search.' : 'No products available.'}
            </p>
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map(product => {
              const productId = product.node.id;
              const hasImage = product.node.images.edges[0];
              const isImageLoaded = loadedProductImages.has(productId);
              
              return (
                <Card 
                  key={productId} 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer touch-manipulation active:scale-[0.98] transition-transform" 
                  onClick={() => navigate(`/product/${product.node.handle}`)}
                >
                  {hasImage && (
                    <div className="aspect-square overflow-hidden bg-secondary/20 relative">
                      {/* Loading skeleton with brand colors - visible until image loads */}
                      {!isImageLoaded && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-[#2dd4bf]/10 to-gray-200 animate-pulse z-10" />
                          <div 
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2dd4bf]/20 to-transparent z-20"
                            style={{
                              backgroundSize: '200% 100%',
                              animation: 'shimmer 2s infinite linear'
                            }}
                          />
                        </>
                      )}
                      
                      <img 
                        src={product.node.images.edges[0].node.url} 
                        alt={product.node.images.edges[0].node.altText || product.node.title} 
                        className={`w-full h-full object-cover hover:scale-105 transition-all duration-300 ${
                          isImageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => {
                          setLoadedProductImages(prev => new Set(prev).add(productId));
                        }}
                      />
                    </div>
                  )}
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">{product.node.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-sm">
                  {product.node.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-xl sm:text-2xl font-bold">
                  {product.node.priceRange.minVariantPrice.currencyCode}{' '}
                  {parseFloat(product.node.priceRange.minVariantPrice.amount).toFixed(2)}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="hero" className="w-full touch-manipulation" onClick={e => {
              e.stopPropagation();
              handleAddToCart(product);
            }}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
              );
            })}
          </div>}
      </div>
    </section>;
};