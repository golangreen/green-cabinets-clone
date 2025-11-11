import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TextureSwatch } from "./TextureSwatch";
import { Badge } from "@/components/ui/badge";

interface TexturePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finishName: string;
  brand: string;
  onSelect?: () => void;
}

export const TexturePreviewModal = ({
  open,
  onOpenChange,
  finishName,
  brand,
  onSelect,
}: TexturePreviewModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Material Texture Preview</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-start gap-6">
            {/* Large texture swatch */}
            <div className="flex-shrink-0">
              <TextureSwatch
                finishName={finishName}
                brand={brand}
                size="lg"
              />
            </div>
            
            {/* Details */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{finishName}</h3>
                <Badge variant="secondary" className="mt-1">
                  {brand}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Material Type:</span>{" "}
                  <span className="text-muted-foreground">
                    {brand === "Tafisa" && "Melamine"}
                    {brand === "Egger" && "TFL / HPL"}
                    {brand === "Shinnoki" && "Wood Veneer"}
                  </span>
                </div>
                
                <div>
                  <span className="font-medium">Finish:</span>{" "}
                  <span className="text-muted-foreground">{finishName}</span>
                </div>
                
                <div>
                  <span className="font-medium">Texture:</span>{" "}
                  <span className="text-muted-foreground">
                    {finishName.toLowerCase().includes('gloss') ? 'High Gloss' :
                     finishName.toLowerCase().includes('matte') ? 'Matte' :
                     'Natural Grain'}
                  </span>
                </div>
              </div>
              
              <div className="pt-4">
                <p className="text-xs text-muted-foreground">
                  This is a simulated texture preview. Actual material appearance may vary.
                  Contact us for physical samples.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
