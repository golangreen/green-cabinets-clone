import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { FinishPreview } from "./FinishPreview";

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
        <CardTitle className="text-lg">Compare Finishes</CardTitle>
        <p className="text-sm text-muted-foreground">
          Select up to 4 finishes to compare side-by-side
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Finish selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
          {availableFinishes.slice(0, 30).map((finish) => (
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
          ))}
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
