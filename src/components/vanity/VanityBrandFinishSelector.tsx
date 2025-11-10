import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BRAND_INFO } from "./types";
import { TextureSwatch } from "@/components/TextureSwatch";

interface VanityBrandFinishSelectorProps {
  selectedBrand: string;
  selectedFinish: string;
  finishes: { name: string; category?: string }[];
  categories: { name: string; finishes: string[] }[];
  onBrandChange: (brand: string) => void;
  onFinishClick: (finish: string) => void;
  onFinishRightClick: (finish: string, e: React.MouseEvent) => void;
}

export const VanityBrandFinishSelector = ({
  selectedBrand,
  selectedFinish,
  finishes,
  categories,
  onBrandChange,
  onFinishClick,
  onFinishRightClick,
}: VanityBrandFinishSelectorProps) => {
  return (
    <div className="space-y-6">
      {/* Brand Selection */}
      <div>
        <Label className="text-lg font-semibold mb-4 block">Select Brand</Label>
        <RadioGroup value={selectedBrand} onValueChange={onBrandChange}>
          {Object.entries(BRAND_INFO).map(([brand, info]) => (
            <div key={brand} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value={brand} id={brand} />
              <Label htmlFor={brand} className="flex-1 cursor-pointer">
                <div className="font-semibold">{brand}</div>
                <div className="text-sm text-muted-foreground">{info.description}</div>
                <div className="text-sm font-medium text-primary mt-1">
                  Base Price: ${info.price}
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Finish Selection */}
      <div>
        <Label className="text-lg font-semibold mb-4 block">
          Select Finish
          <span className="text-sm font-normal text-muted-foreground ml-2">
            (Right-click for preview)
          </span>
        </Label>
        
        {categories.map((category) => (
          <div key={category.name} className="mb-6">
            <h3 className="text-md font-medium mb-3 text-foreground/80">
              {category.name}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {category.finishes.map((finishName) => (
                <div
                  key={finishName}
                  onContextMenu={(e) => onFinishRightClick(finishName, e)}
                >
                  <TextureSwatch
                    finishName={finishName}
                    brand={selectedBrand}
                    selected={selectedFinish === finishName}
                    onClick={() => onFinishClick(finishName)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
