import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FinishPreview } from "@/components/vanity/FinishPreview";
import { FinishComparison } from "@/components/vanity/FinishComparison";
import {
  getTafisaCategories,
  getTafisaColorsByCategory,
} from "@/lib/tafisaColors";
import {
  getEggerCategories,
  getEggerColorsByCategory,
} from "@/lib/eggerColors";
import { BRANDS, BRAND_INFO } from "@/services/customVanityService";

interface VanityBrandFinishSelectorProps {
  selectedBrand: string;
  selectedFinish: string;
  availableFinishes: string[];
  brandError: string | null;
  finishError: string | null;
  onBrandChange: (brand: string) => void;
  onFinishChange: (finish: string) => void;
}

const TAFISA_CATEGORIES = getTafisaCategories();
const EGGER_CATEGORIES = getEggerCategories();

export const VanityBrandFinishSelector = ({
  selectedBrand,
  selectedFinish,
  availableFinishes,
  brandError,
  finishError,
  onBrandChange,
  onFinishChange,
}: VanityBrandFinishSelectorProps) => (
  <>
    {/* Brand */}
    <div className="space-y-2">
      <Label htmlFor="brand" className={brandError ? "text-destructive" : ""}>
        Brand {brandError && <span className="text-destructive">*</span>}
      </Label>
      <Select value={selectedBrand} onValueChange={onBrandChange}>
        <SelectTrigger
          id="brand"
          aria-invalid={!!brandError}
          aria-describedby={brandError ? "brand-error" : undefined}
          className={brandError ? "bg-background border-destructive focus:ring-destructive" : "bg-background"}
        >
          <SelectValue placeholder="Select brand" />
        </SelectTrigger>
        <SelectContent className="bg-background z-50">
          {BRANDS.map((brand) => (
            <SelectItem key={brand} value={brand} className="cursor-pointer">
              {brand}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {brandError ? (
        <p id="brand-error" role="alert" className="text-xs font-medium text-destructive">
          {brandError}
        </p>
      ) : (
        selectedBrand && (
          <p className="text-xs text-muted-foreground">
            {BRAND_INFO[selectedBrand as keyof typeof BRAND_INFO]?.description}
          </p>
        )
      )}
    </div>

    {/* Finish */}
    <div className="space-y-2">
      <Label htmlFor="finish" className={finishError ? "text-destructive" : ""}>
        Finish / Color {selectedBrand && `- ${selectedBrand} Collection`}
        {finishError && <span className="text-destructive"> *</span>}
      </Label>
      <Select value={selectedFinish} onValueChange={onFinishChange} disabled={!selectedBrand}>
        <SelectTrigger
          id="finish"
          aria-invalid={!!finishError}
          aria-describedby={finishError ? "finish-error" : undefined}
          className={finishError ? "bg-background border-destructive focus:ring-destructive" : "bg-background"}
        >
          <SelectValue placeholder={selectedBrand ? "Select finish" : "Select brand first"} />
        </SelectTrigger>
        <SelectContent className="bg-background z-50 max-h-80">
          {selectedBrand === "Tafisa" ? (
            TAFISA_CATEGORIES.map((category) => (
              <div key={category}>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-secondary/50">
                  {category}
                </div>
                {getTafisaColorsByCategory(category).map((color) => (
                  <SelectItem key={color.name} value={color.name} className="cursor-pointer pl-4">
                    {color.name} <span className="text-xs text-muted-foreground">({color.code})</span>
                  </SelectItem>
                ))}
              </div>
            ))
          ) : selectedBrand === "Egger" ? (
            EGGER_CATEGORIES.map((category) => (
              <div key={category}>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-secondary/50">
                  {category}
                </div>
                {getEggerColorsByCategory(category).map((color) => (
                  <SelectItem key={color.name} value={color.name} className="cursor-pointer pl-4">
                    {color.name} <span className="text-xs text-muted-foreground">({color.code})</span>
                  </SelectItem>
                ))}
              </div>
            ))
          ) : (
            availableFinishes.map((finish) => (
              <SelectItem key={finish} value={finish} className="cursor-pointer">
                {finish}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {finishError ? (
        <p id="finish-error" role="alert" className="text-xs font-medium text-destructive">
          {finishError}
        </p>
      ) : (
        selectedBrand && (
          <p className="text-xs text-muted-foreground">
            {availableFinishes.length} finishes available for {selectedBrand}
            {selectedBrand === "Tafisa" && ` across ${TAFISA_CATEGORIES.length} categories`}
            {selectedBrand === "Egger" && ` across ${EGGER_CATEGORIES.length} categories`}
          </p>
        )
      )}
    </div>

    {selectedFinish && selectedBrand && (
      <FinishPreview brand={selectedBrand} finish={selectedFinish} />
    )}

    {selectedBrand && availableFinishes.length > 1 && (
      <FinishComparison
        brand={selectedBrand}
        availableFinishes={availableFinishes}
        selectedFinish={selectedFinish}
        onFinishSelect={onFinishChange}
      />
    )}
  </>
);
