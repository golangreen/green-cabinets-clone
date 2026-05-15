import type { ShopifyProduct } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomVanityConfig } from "@/hooks/useCustomVanityConfig";
import { VanityImageGallery } from "./vanity/VanityImageGallery";
import { VanityBrandFinishSelector } from "./vanity/VanityBrandFinishSelector";
import { VanityDimensionInput } from "./vanity/VanityDimensionInput";
import { VanityZipInput } from "./vanity/VanityZipInput";
import { VanityPriceSummary } from "./vanity/VanityPriceSummary";
import { VanityActions } from "./vanity/VanityActions";
import { VanityQuoteDialog } from "./vanity/VanityQuoteDialog";

interface VanityConfiguratorProps {
  product: ShopifyProduct;
}

export const VanityConfigurator = ({ product }: VanityConfiguratorProps) => {
  const c = useCustomVanityConfig({ product });

  return (
    <>
      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 md:gap-8">
        <VanityImageGallery product={product} />

        <div className="space-y-4 sm:space-y-6 lg:col-span-2 md:col-span-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{product.node.title}</h1>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              {product.node.description.replace(/NY TAX/gi, "tax").trim()}
            </p>
            <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <p><strong>Available Brands:</strong> Tafisa (60+ melamine colors), Egger (98+ TFL & HPL finishes), and Shinnoki (prefinished wood veneer)</p>
              <p><strong>Pricing:</strong> $350 per linear foot (based on vanity width)</p>
              <p><strong>Shipping:</strong> Approximately 14-21 business days</p>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Configure Your Vanity</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <VanityBrandFinishSelector
                  selectedBrand={c.selectedBrand}
                  selectedFinish={c.selectedFinish}
                  availableFinishes={c.availableFinishes}
                  brandError={c.errors.brand}
                  finishError={c.errors.finish}
                  onBrandChange={c.setSelectedBrand}
                  onFinishChange={c.setSelectedFinish}
                />

                <VanityDimensionInput
                  label="Width"
                  value={c.width}
                  fraction={c.widthFraction}
                  error={c.errors.width}
                  onValueChange={c.setWidth}
                  onFractionChange={c.setWidthFraction}
                />

                <VanityDimensionInput
                  label="Height"
                  value={c.height}
                  fraction={c.heightFraction}
                  error={c.errors.height}
                  onValueChange={c.setHeight}
                  onFractionChange={c.setHeightFraction}
                />

                <VanityDimensionInput
                  label="Depth"
                  value={c.depth}
                  fraction={c.depthFraction}
                  error={c.errors.depth}
                  onValueChange={c.setDepth}
                  onFractionChange={c.setDepthFraction}
                />

                <VanityZipInput
                  zipCode={c.zipCode}
                  state={c.state}
                  error={c.errors.zipCode}
                  onChange={c.setZipCode}
                />
              </CardContent>
            </Card>
          </div>

          <VanityPriceSummary
            width={c.width}
            widthFraction={c.widthFraction}
            basePrice={c.basePrice}
            tax={c.tax}
            shipping={c.shipping}
            totalPrice={c.totalPrice}
            state={c.state}
          />

          <VanityActions
            isProcessing={c.isProcessing}
            onAddToCart={c.handleAddToCart}
            onCheckout={c.handleCheckout}
            onRequestQuote={c.handleRequestQuote}
          />
        </div>
      </div>

      <VanityQuoteDialog
        open={c.showQuoteDialog}
        onOpenChange={c.setShowQuoteDialog}
        customerName={c.customerName}
        customerEmail={c.customerEmail}
        customerPhone={c.customerPhone}
        additionalNotes={c.additionalNotes}
        selectedBrand={c.selectedBrand}
        selectedFinish={c.selectedFinish}
        widthInches={c.widthInches}
        totalPrice={c.totalPrice}
        isRequestingQuote={c.isRequestingQuote}
        onCustomerNameChange={c.setCustomerName}
        onCustomerEmailChange={c.setCustomerEmail}
        onCustomerPhoneChange={c.setCustomerPhone}
        onAdditionalNotesChange={c.setAdditionalNotes}
        onSubmit={c.handleSubmitQuote}
      />
    </>
  );
};
