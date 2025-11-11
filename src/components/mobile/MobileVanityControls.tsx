import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Settings, Ruler, Palette, Package, ShoppingCart } from "lucide-react";

interface MobileVanityControlsProps {
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  selectedFinish: string;
  setSelectedFinish: (finish: string) => void;
  width: string;
  setWidth: (width: string) => void;
  height: string;
  setHeight: (height: string) => void;
  depth: string;
  setDepth: (depth: string) => void;
  doorStyle: string;
  setDoorStyle: (style: string) => void;
  numDrawers: number;
  setNumDrawers: (num: number) => void;
  handleStyle: string;
  setHandleStyle: (style: string) => void;
  onAddToCart: () => void;
  totalPrice: number;
  finishes: string[];
}

export const MobileVanityControls = ({
  selectedBrand,
  setSelectedBrand,
  selectedFinish,
  setSelectedFinish,
  width,
  setWidth,
  height,
  setHeight,
  depth,
  setDepth,
  doorStyle,
  setDoorStyle,
  numDrawers,
  setNumDrawers,
  handleStyle,
  setHandleStyle,
  onAddToCart,
  totalPrice,
  finishes
}: MobileVanityControlsProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-bottom">
      {/* Price bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
        <div>
          <p className="text-xs text-muted-foreground">Estimated Total</p>
          <p className="text-lg font-bold">${totalPrice.toFixed(2)}</p>
        </div>
        <Button onClick={onAddToCart} size="lg" className="h-12">
          <ShoppingCart className="h-5 w-5 mr-2" />
          Add to Cart
        </Button>
      </div>
      
      {/* Control tabs */}
      <div className="flex items-center justify-around p-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="flex-col h-14 px-3">
              <Ruler className="h-5 w-5 mb-1" />
              <span className="text-xs">Size</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Dimensions</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 mt-6">
              <div>
                <Label htmlFor="mobile-width" className="text-base">Width (inches)</Label>
                <Input
                  id="mobile-width"
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="h-12 text-base mt-2"
                  placeholder="24-72"
                />
              </div>
              <div>
                <Label htmlFor="mobile-height" className="text-base">Height (inches)</Label>
                <Input
                  id="mobile-height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="h-12 text-base mt-2"
                  placeholder="30-42"
                />
              </div>
              <div>
                <Label htmlFor="mobile-depth" className="text-base">Depth (inches)</Label>
                <Input
                  id="mobile-depth"
                  type="number"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  className="h-12 text-base mt-2"
                  placeholder="18-24"
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="flex-col h-14 px-3">
              <Palette className="h-5 w-5 mb-1" />
              <span className="text-xs">Finish</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Material & Finish</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 mt-6">
              <div>
                <Label htmlFor="mobile-brand" className="text-base">Brand</Label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger className="h-12 text-base mt-2">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tafisa">Tafisa</SelectItem>
                    <SelectItem value="Egger">Egger</SelectItem>
                    <SelectItem value="Shinnoki">Shinnoki</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="mobile-finish" className="text-base">Finish</Label>
                <Select value={selectedFinish} onValueChange={setSelectedFinish}>
                  <SelectTrigger className="h-12 text-base mt-2">
                    <SelectValue placeholder="Select finish" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[50vh]">
                    {finishes.map((finish) => (
                      <SelectItem key={finish} value={finish}>
                        {finish}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="flex-col h-14 px-3">
              <Package className="h-5 w-5 mb-1" />
              <span className="text-xs">Style</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Cabinet Style</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 mt-6">
              <div>
                <Label htmlFor="mobile-door" className="text-base">Door Style</Label>
                <Select value={doorStyle} onValueChange={setDoorStyle}>
                  <SelectTrigger className="h-12 text-base mt-2">
                    <SelectValue placeholder="Select door style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Door</SelectItem>
                    <SelectItem value="double">Double Door</SelectItem>
                    <SelectItem value="sliding">Sliding Door</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="mobile-drawers" className="text-base">Number of Drawers</Label>
                <div className="mt-4 space-y-2">
                  <Slider
                    value={[numDrawers]}
                    onValueChange={(value) => setNumDrawers(value[0])}
                    min={0}
                    max={6}
                    step={1}
                    className="touch-manipulation"
                  />
                  <p className="text-center text-lg font-semibold">{numDrawers} drawers</p>
                </div>
              </div>
              <div>
                <Label htmlFor="mobile-handles" className="text-base">Handle Style</Label>
                <Select value={handleStyle} onValueChange={setHandleStyle}>
                  <SelectTrigger className="h-12 text-base mt-2">
                    <SelectValue placeholder="Select handle style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Handle</SelectItem>
                    <SelectItem value="knob">Knob</SelectItem>
                    <SelectItem value="recessed">Recessed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="flex-col h-14 px-3">
              <Settings className="h-5 w-5 mb-1" />
              <span className="text-xs">More</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Additional Options</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Shipping Information</h3>
                <p className="text-sm text-muted-foreground">Add ZIP code for accurate pricing</p>
              </Card>
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Installation</h3>
                <p className="text-sm text-muted-foreground">Professional installation available</p>
              </Card>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};
