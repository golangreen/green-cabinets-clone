import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { VanityConfigurator } from "@/components/vanity/VanityConfigurator";
import { shopifyService } from "@/services";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package } from "lucide-react";
import type { ShopifyProduct } from "@/types";

export default function VanityConfiguratorPage() {
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVanityProduct = async () => {
      try {
        const products = await shopifyService.getProducts(50);
        const vanityProduct = products.find((p) =>
          p.node.title.toLowerCase().includes("custom bathroom vanity")
        );
        if (vanityProduct) {
          setProduct(vanityProduct);
        } else {
          setError("Vanity configurator is not available at the moment.");
        }
      } catch (err) {
        console.error("Error loading vanity product:", err);
        setError("Unable to load the vanity configurator. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadVanityProduct();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Vanity Configurator | Green Cabinets NY</title>
        <meta
          name="description"
          content="Design your custom bathroom vanity online. Choose brand, finish, dimensions, and get an instant quote."
        />
        <link rel="canonical" href="https://greencabinetsny.com/vanity-configurator" />
        <meta property="og:title" content="Vanity Configurator | Green Cabinets NY" />
        <meta
          property="og:description"
          content="Design your custom bathroom vanity online. Choose brand, finish, dimensions, and get an instant quote."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://greencabinetsny.com/vanity-configurator" />
      </Helmet>
      <Header />
      <main className="flex-1 pt-[96px] sm:pt-[128px] md:pt-[160px] pb-6 sm:pb-8 md:pb-12">
        <div className="container mx-auto px-4">
          <Link to="/">
            <Button variant="ghost" className="mb-4 sm:mb-6 touch-manipulation">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          {loading && (
            <div className="flex items-center justify-center py-24">
              <p className="text-muted-foreground">Loading vanity configurator...</p>
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-24 max-w-xl mx-auto">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-4">Vanity Configurator Unavailable</h1>
              <p className="text-muted-foreground mb-8">{error}</p>
              <Link to="/shop">
                <Button>Visit Shop</Button>
              </Link>
            </div>
          )}

          {!loading && product && <VanityConfigurator product={product} />}
        </div>
      </main>
      <Footer />
    </div>
  );
}
