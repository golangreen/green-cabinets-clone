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
      <Header />
      <PromoBanner />
      <main className="flex-1 pt-24 sm:pt-28 md:pt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Shop</h1>
            <Button 
              onClick={handleTestPayment}
              disabled={isProcessing}
              className="bg-[#5C7650] hover:bg-[#5C7650]/80"
            >
              {isProcessing ? "Processing..." : "$1 Test Payment"}
            </Button>
          </div>
          <ShopProducts />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
