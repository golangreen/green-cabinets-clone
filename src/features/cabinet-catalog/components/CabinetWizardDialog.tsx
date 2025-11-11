import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  searchCabinets, 
  calculateCabinetPrice, 
  HARDWARE_OPTIONS,
  type CabinetSpec,
  type CabinetSearchFilters 
} from "@/features/cabinet-catalog";

interface CabinetWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (
    template: CabinetSpec, 
    config: {
      finishId: string;
      doorStyleId: string;
      handleType: keyof typeof HARDWARE_OPTIONS.handles;
      numHandles: number;
    }
  ) => void;
}

export const CabinetWizardDialog = ({ open, onOpenChange, onComplete }: CabinetWizardDialogProps) => {
  const [category, setCategory] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [width, setWidth] = useState<string>("");
  const [finishId, setFinishId] = useState<string>("egger-white-oak");
  const [doorStyleId, setDoorStyleId] = useState<string>("shaker");
  const [handleType, setHandleType] = useState<keyof typeof HARDWARE_OPTIONS.handles>("bar");
  const [results, setResults] = useState<CabinetSpec[]>([]);

  const handleSearch = () => {
    const filters: CabinetSearchFilters = {
      category: category || undefined,
      type: type || undefined,
      minWidth: width ? parseInt(width) : undefined,
      maxWidth: width ? parseInt(width) : undefined,
    };

    const cabinets = searchCabinets(filters);
    setResults(cabinets);
    
    if (cabinets.length === 0) {
      toast.info("No cabinets found", {
        description: "Try adjusting your search criteria"
      });
    }
  };

  const handleSelect = (cabinet: CabinetSpec) => {
    const numHandles = 2; // Default
    onComplete(cabinet, {
      finishId,
      doorStyleId,
      handleType,
      numHandles
    });
    onOpenChange(false);
    // Reset for next use
    setResults([]);
    setCategory("");
    setType("");
    setWidth("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Cabinet from Catalog</DialogTitle>
          <DialogDescription>
            Search our catalog and select a cabinet to add to your design
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="bathroom">Bathroom</SelectItem>
                  <SelectItem value="closet">Closet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="base">Base</SelectItem>
                  <SelectItem value="wall">Wall</SelectItem>
                  <SelectItem value="tall">Tall</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Width (inches)</Label>
              <Input
                type="number"
                placeholder="e.g., 36"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Door Style</Label>
              <Select value={doorStyleId} onValueChange={setDoorStyleId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shaker">Shaker</SelectItem>
                  <SelectItem value="flat-panel">Flat Panel</SelectItem>
                  <SelectItem value="raised-panel">Raised Panel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Finish</Label>
              <Select value={finishId} onValueChange={setFinishId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="egger-white-oak">EGGER White Oak</SelectItem>
                  <SelectItem value="egger-walnut">EGGER Walnut</SelectItem>
                  <SelectItem value="tafisa-white">Tafisa White</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Handle Type</Label>
              <Select value={handleType} onValueChange={(value) => setHandleType(value as keyof typeof HARDWARE_OPTIONS.handles)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="knob">Knob</SelectItem>
                  <SelectItem value="fingerPull">Finger Pull</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSearch} className="w-full">
            Search Cabinets
          </Button>

          {results.length > 0 && (
            <div className="space-y-2">
              <Label>Select a Cabinet ({results.length} found)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {results.map((cabinet) => {
                  const price = calculateCabinetPrice(cabinet, finishId, doorStyleId, handleType, 2);
                  return (
                    <Button
                      key={cabinet.code}
                      variant="outline"
                      className="h-auto py-3 justify-start text-left"
                      onClick={() => handleSelect(cabinet)}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="font-medium">{cabinet.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {cabinet.width}"W x {cabinet.height}"H x {cabinet.depth}"D
                        </div>
                        <div className="text-sm font-semibold text-primary">
                          ${price.toFixed(2)}
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
