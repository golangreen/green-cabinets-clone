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
    const loadProducts = async () => {
      try {
        const productsData = await fetchProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('Failed to load products');
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

  if (products.length === 0) {
    return (
      <div className="py-24 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">No Products Yet</h2>
          <p className="text-muted-foreground mb-8">
            Start building your product catalog by telling me what products you'd like to add!
          </p>
          <p className="text-sm text-muted-foreground">
            Example: "Add a custom kitchen cabinet priced at $2,500"
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Our Products</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Browse our collection of premium custom cabinetry
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card 
              key={product.node.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
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
              <CardHeader>
                <CardTitle>{product.node.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {product.node.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {product.node.priceRange.minVariantPrice.currencyCode}{' '}
                  {parseFloat(product.node.priceRange.minVariantPrice.amount).toFixed(2)}
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
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
