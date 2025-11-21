import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ShopProducts } from "@/components/ShopProducts";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const Shop = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTestPayment = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment');
      
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
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
      <main className="flex-1 pt-24 sm:pt-28 md:pt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Shop</h1>
            <Button 
              onClick={handleTestPayment}
              disabled={isProcessing}
              className="bg-[#2dd4bf] hover:bg-[#2dd4bf]/80"
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
