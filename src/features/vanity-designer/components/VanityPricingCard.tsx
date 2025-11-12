import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "../services";

interface VanityPricingCardProps {
  basePrice: number;
  wallPrice: number;
  floorPrice: number;
  totalPrice: number;
}

export const VanityPricingCard = ({
  basePrice,
  wallPrice,
  floorPrice,
  totalPrice,
}: VanityPricingCardProps) => {
  if (basePrice <= 0) return null;

  return (
    <Card className="p-6">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Price Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vanity:</span>
            <span className="font-medium">{formatPrice(basePrice)}</span>
          </div>
          {wallPrice > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Walls:</span>
              <span className="font-medium">{formatPrice(wallPrice)}</span>
            </div>
          )}
          {floorPrice > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Flooring:</span>
              <span className="font-medium">{formatPrice(floorPrice)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-primary">{formatPrice(totalPrice)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
