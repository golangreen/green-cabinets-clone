import { useState } from "react";
import { ShopifyProduct } from "@/lib/shopify";
import { VanityConfigurator } from "@/components/VanityConfigurator";

// Create a mock product for the vanity configurator
const mockVanityProduct: ShopifyProduct = {
  node: {
    id: "gid://shopify/Product/mock-vanity",
    handle: "custom-bathroom-vanity",
    title: "Custom Bathroom Vanity",
    description: "Design your perfect custom bathroom vanity with premium materials and finishes",
    priceRange: {
      minVariantPrice: {
        amount: "2500.00",
        currencyCode: "USD"
      }
    },
    images: {
      edges: []
    },
    variants: {
      edges: [
        {
          node: {
            id: "gid://shopify/ProductVariant/mock-variant",
            title: "Custom Configuration",
            price: {
              amount: "2500.00",
              currencyCode: "USD"
            },
            availableForSale: true,
            selectedOptions: []
          }
        }
      ]
    },
    options: []
  }
};

export const VanityConfiguratorHomepage = () => {
  const [product] = useState<ShopifyProduct>(mockVanityProduct);

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
