import { useEffect, useState } from "react";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { VanityConfigurator } from "@/components/VanityConfigurator";
import { Skeleton } from "@/components/ui/skeleton";

export const VanityConfiguratorHomepage = () => {
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const products = await fetchProducts(50);
        // Find the custom bathroom vanity product or use the first product
        const vanityProduct = products.find(
          (p: ShopifyProduct) => p.node.handle === "custom-bathroom-vanity"
        ) || products[0];
        setProduct(vanityProduct || null);
      } catch (error) {
        console.error("Error loading vanity product:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-[600px] mx-auto" />
          </div>
          <Skeleton className="h-[600px] w-full" />
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-foreground">
              Custom Vanity Designer
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Configure your perfect bathroom vanity with custom dimensions, premium finishes, and instant pricing
            </p>
            <p className="text-muted-foreground">
              Please add a product with handle "custom-bathroom-vanity" to enable the configurator
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4 text-foreground">
            Custom Vanity Designer
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Design your perfect bathroom vanity with custom dimensions, premium finishes, and instant pricing
          </p>
        </div>
        <VanityConfigurator product={product} />
      </div>
    </section>
  );
};
