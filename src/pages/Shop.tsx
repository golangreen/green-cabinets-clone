import { Helmet } from "react-helmet-async";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ShopProducts } from "@/components/ShopProducts";
import { PromoBanner } from "@/components/shop/PromoBanner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const Shop = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTestPayment = async () => {
    setIsProcessing(true);
    try {
      console.log('Invoking payment function...');
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {}
      });
      
      console.log('Payment response:', { data, error });
      
      if (error) {
        console.error('Payment error:', error);
        toast.error(`Payment error: ${error.message}`);
        throw error;
      }
      
      if (data?.url) {
        console.log('Redirecting to checkout URL:', data.url);
        toast.success('Redirecting to payment...');
        window.location.href = data.url;
      } else {
        console.error('No URL in response:', data);
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
