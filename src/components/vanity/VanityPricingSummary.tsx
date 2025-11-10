import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PricingInfo } from "./types";

interface VanityPricingSummaryProps {
  pricing: PricingInfo;
}

export const VanityPricingSummary = ({ pricing }: VanityPricingSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span>Base Price:</span>
          <span className="font-semibold">${pricing.basePrice.toFixed(2)}</span>
        </div>
        {pricing.wallPrice > 0 && (
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>+ Wall Configuration:</span>
            <span>${pricing.wallPrice.toFixed(2)}</span>
          </div>
        )}
        {pricing.floorPrice > 0 && (
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>+ Floor Configuration:</span>
            <span>${pricing.floorPrice.toFixed(2)}</span>
          </div>
        )}
        {pricing.tax > 0 && (
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Tax ({pricing.state}):</span>
            <span>${pricing.tax.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Shipping ({pricing.state}):</span>
          <span>${pricing.shipping.toFixed(2)}</span>
        </div>
        <div className="border-t pt-2 flex justify-between text-lg font-bold">
          <span>Total:</span>
          <span className="text-primary">${pricing.totalPrice.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
};
