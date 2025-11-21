import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X, Filter } from "lucide-react";
import { FinishPreview } from "./FinishPreview";
import { TAFISA_COLORS, getTafisaCategories } from "@/lib/tafisaColors";
import { EGGER_COLORS, getEggerCategories } from "@/lib/eggerColors";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FinishComparisonProps {
  brand: string;
  availableFinishes: string[];
  selectedFinish: string;
  onFinishSelect: (finish: string) => void;
}

export const FinishComparison = ({ 
  brand, 
  availableFinishes,
  selectedFinish,
  onFinishSelect 
}: FinishComparisonProps) => {
  const [comparisonFinishes, setComparisonFinishes] = useState<string[]>([selectedFinish]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Get categories based on brand
  const categories = useMemo(() => {
    if (brand === "Tafisa") {
      return ["All", ...getTafisaCategories()];
    } else if (brand === "Egger") {
      return ["All", ...getEggerCategories()];
    } else if (brand === "Shinnoki") {
      return ["All", "Light Oak", "Natural Oak", "Dark Oak", "Walnut", "Other Woods"];
    }
    return ["All"];
  }, [brand]);

  // Filter finishes by category
  const filteredFinishes = useMemo(() => {
    if (selectedCategory === "All") return availableFinishes;

    if (brand === "Tafisa") {
      const categoryFinishes = TAFISA_COLORS
        .filter(color => color.category === selectedCategory)
        .map(color => color.name);
      return availableFinishes.filter(finish => categoryFinishes.includes(finish));
    } else if (brand === "Egger") {
      const categoryFinishes = EGGER_COLORS
        .filter(color => color.category === selectedCategory)
        .map(color => color.name);
      return availableFinishes.filter(finish => categoryFinishes.includes(finish));
    } else if (brand === "Shinnoki") {
      // Manual categorization for Shinnoki
      return availableFinishes.filter(finish => {
        if (selectedCategory === "Light Oak") {
          return ['Bondi Oak', 'Milk Oak', 'Ivory Oak', 'Ivory Infinite Oak'].includes(finish);
        } else if (selectedCategory === "Natural Oak") {
          return ['Natural Oak', 'Manhattan Oak', 'Desert Oak', 'Sahara Oak', 'Burley Oak'].includes(finish);
        } else if (selectedCategory === "Dark Oak") {
          return ['Raven Oak'].includes(finish);
        } else if (selectedCategory === "Walnut") {
          return ['Frozen Walnut', 'Smoked Walnut', 'Pure Walnut', 'Stardust Walnut'].includes(finish);
        } else if (selectedCategory === "Other Woods") {
          return ['Pebble Triba', 'Terra Sapele', 'Cinnamon Triba', 'Shadow Eucalyptus'].includes(finish);
        }
        return false;
      });
    }

    return availableFinishes;
  }, [brand, availableFinishes, selectedCategory]);

  const toggleFinish = (finish: string) => {
    if (comparisonFinishes.includes(finish)) {
      if (comparisonFinishes.length > 1) {
        setComparisonFinishes(comparisonFinishes.filter(f => f !== finish));
      }
    } else {
      if (comparisonFinishes.length < 4) {
        setComparisonFinishes([...comparisonFinishes, finish]);
      }
    }
  };

  const handleSelectFinish = (finish: string) => {
    onFinishSelect(finish);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Compare Finishes
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select up to 4 finishes to compare side-by-side
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Filter */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50">
            {categories.map((category) => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="text-xs px-3 py-1.5 data-[state=active]:bg-[#2dd4bf] data-[state=active]:text-white"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Finish selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
          {filteredFinishes.length === 0 ? (
            <p className="col-span-full text-center text-sm text-muted-foreground py-4">
              No finishes in this category
            </p>
          ) : (
            filteredFinishes.slice(0, 50).map((finish) => (
              <div key={finish} className="flex items-center space-x-2">
                <Checkbox
                  id={`compare-${finish}`}
                  checked={comparisonFinishes.includes(finish)}
                  onCheckedChange={() => toggleFinish(finish)}
                  disabled={!comparisonFinishes.includes(finish) && comparisonFinishes.length >= 4}
                />
                <Label
                  htmlFor={`compare-${finish}`}
                  className="text-xs cursor-pointer leading-tight"
                >
                  {finish}
                </Label>
              </div>
            ))
          )}
        </div>

        {/* Comparison grid */}
        <div className={`grid gap-4 ${
          comparisonFinishes.length === 1 ? 'grid-cols-1' :
          comparisonFinishes.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        }`}>
          {comparisonFinishes.map((finish) => (
            <div key={finish} className="relative">
              <div className="absolute top-2 right-2 z-10 flex gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSelectFinish(finish)}
                  className="h-7 px-2 text-xs bg-[#2dd4bf] hover:bg-[#2dd4bf]/80 text-white"
                >
                  Select
                </Button>
                {comparisonFinishes.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFinish(finish)}
                    className="h-7 w-7 p-0 bg-destructive/80 hover:bg-destructive text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="border-2 rounded-lg overflow-hidden" 
                   style={{ 
                     borderColor: finish === selectedFinish ? 'hsl(var(--primary))' : 'transparent' 
                   }}>
                <FinishPreview 
                  brand={brand}
                  finish={finish}
                />
                <div className="p-2 bg-background border-t">
                  <p className="text-xs font-medium text-center truncate">{finish}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {comparisonFinishes.length >= 4 && (
          <p className="text-xs text-muted-foreground text-center">
            Maximum 4 finishes can be compared at once
          </p>
        )}
      </CardContent>
    </Card>
  );
};
