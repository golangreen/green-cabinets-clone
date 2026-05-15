import { Helmet } from "react-helmet-async";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ShopProducts } from "@/components/shop/ShopProducts";
import { PromoBanner } from "@/components/shop/PromoBanner";
import { Button } from "@/components/ui/button";
import { paymentService } from "@/services/paymentService";
import { toast } from "sonner";
import { useState } from "react";

const Shop = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTestPayment = async () => {
    setIsProcessing(true);
    try {
      console.log('Invoking payment function...');
      const { url, error } = await paymentService.createTestPayment();

      console.log('Payment response:', { url, error });

      if (error) {
        toast.error(`Payment error: ${error.message}`);
        throw error;
      }

      if (url) {
        console.log('Redirecting to checkout URL:', url);
        toast.success('Redirecting to payment...');
        window.location.href = url;
      } else {
        toast.error('No payment URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to create payment session');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Shop | Green Cabinets - Cabinet Hardware & Accessories</title>
        <meta name="description" content="Shop premium cabinet hardware, handles, and accessories from Green Cabinets. Quality products for your custom kitchen and bathroom projects." />
        <link rel="canonical" href="https://greencabinetsny.com/shop" />
        <meta property="og:title" content="Shop Cabinet Hardware & Accessories | Green Cabinets NY" />
        <meta property="og:description" content="Premium cabinet handles, hardware, and accessories shipped from our Brooklyn shop. Built to match Green Cabinets custom builds." />
        <meta property="og:url" content="https://greencabinetsny.com/shop" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Shop — Cabinet Hardware & Accessories",
          description: "Premium cabinet handles, hardware, and accessories shipped from our Brooklyn shop.",
          url: "https://greencabinetsny.com/shop",
          isPartOf: { "@type": "WebSite", name: "Green Cabinets NY", url: "https://greencabinetsny.com" },
        })}</script>
      </Helmet>
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Shop", url: "/shop" }]} />
      <Header />
      <PromoBanner />
      <main className="flex-1 pt-[96px] sm:pt-[128px] md:pt-[160px]">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Shop</h1>
          <ShopProducts />
          
          {/* Test Payment Button - Developer Tool */}
          <div className="mt-12 pt-8 border-t border-border/50 flex justify-center">
            <Button 
              onClick={handleTestPayment}
              disabled={isProcessing}
              variant="outline"
              size="sm"
              className="text-muted-foreground"
            >
              {isProcessing ? "Processing..." : "$1 Test Payment"}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
