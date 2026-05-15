import { Button } from "@/components/ui/button";
import { ShoppingCart, CreditCard, Mail } from "lucide-react";

interface VanityActionsProps {
  isProcessing: boolean;
  onAddToCart: () => void;
  onCheckout: () => void;
  onRequestQuote: () => void;
}

export const VanityActions = ({
  isProcessing,
  onAddToCart,
  onCheckout,
  onRequestQuote,
}: VanityActionsProps) => (
  <div className="space-y-2">
    <div className="flex gap-2">
      <Button
        onClick={onAddToCart}
        className="flex-1 bg-[#5C7650] hover:bg-[#5C7650]/80 touch-manipulation"
        size="lg"
      >
        <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
        <span className="text-sm sm:text-base">Add to Cart</span>
      </Button>
      <Button
        onClick={onCheckout}
        disabled={isProcessing}
        className="flex-1 bg-[#D4AF37] hover:bg-[#D4AF37]/80 touch-manipulation"
        size="lg"
      >
        <CreditCard className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
        <span className="text-sm sm:text-base">{isProcessing ? "Processing..." : "Checkout Now"}</span>
      </Button>
    </div>
    <Button
      onClick={onRequestQuote}
      variant="outline"
      className="w-full touch-manipulation border-[#5C7650] text-[#5C7650] hover:bg-[#5C7650]/10"
      size="lg"
    >
      <Mail className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
      <span className="text-sm sm:text-base">Request Quote via Email</span>
    </Button>
  </div>
);
