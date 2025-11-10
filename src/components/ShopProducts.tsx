import { useEffect, useState } from "react";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Package } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const ShopProducts = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);
  const navigate = useNavigate();

  useEffect(() => {
    // Only run in browser, not during SSR/build
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const loadProducts = async () => {
      try {
        const productsData = await fetchProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading products:', error);
        // Silently fail - don't show error toast, just show no products
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

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

  if (loading) {
    return (
      <div className="py-24 px-4">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  // Hide shop section if no products (including Shopify errors)
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 md:py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Products</h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Browse our collection of premium custom cabinetry
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {products.map((product) => (
            <Card 
              key={product.node.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer touch-manipulation active:scale-[0.98] transition-transform"
              onClick={() => navigate(`/product/${product.node.handle}`)}
            >
              {product.node.images.edges[0] && (
                <div className="aspect-square overflow-hidden bg-secondary/20">
                  <img
                    src={product.node.images.edges[0].node.url}
                    alt={product.node.images.edges[0].node.altText || product.node.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
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
                <Button 
                  className="w-full touch-manipulation"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
