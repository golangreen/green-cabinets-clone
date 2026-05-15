import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TAX_RATES, customVanityService } from "@/services/customVanityService";

interface VanityPriceSummaryProps {
  width: string;
  widthFraction: string;
  basePrice: number;
  tax: number;
  shipping: number;
  totalPrice: number;
  state: string;
}

export const VanityPriceSummary = ({
  width,
  widthFraction,
  basePrice,
  tax,
  shipping,
  totalPrice,
  state,
}: VanityPriceSummaryProps) => {
  if (basePrice <= 0) return null;
  const widthInches = customVanityService.inchesFromParts(width, widthFraction);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Width:</span>
          <span className="font-medium">
            {widthInches.toFixed(2)}" ({(widthInches / 12).toFixed(2)} linear feet)
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Base Price (${customVanityService.pricePerLinearFoot}/linear foot):</span>
          <span className="font-medium">${basePrice.toFixed(2)}</span>
        </div>
        {tax > 0 && (
          <div className="flex justify-between text-sm">
            <span>Sales Tax ({state} - {(TAX_RATES[state] * 100).toFixed(3)}%):</span>
            <span className="font-medium">${tax.toFixed(2)}</span>
          </div>
        )}
        {shipping > 0 && (
          <div className="flex justify-between text-sm">
            <span>Shipping to {state}:</span>
            <span className="font-medium">${shipping.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>Total:</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-4">
          <p>* This is an estimate based on ${customVanityService.pricePerLinearFoot} per linear foot</p>
          <p>* Final pricing will be confirmed by our team before shipping</p>
        </div>
      </CardContent>
    </Card>
  );
};
