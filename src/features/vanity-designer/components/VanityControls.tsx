import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { TextureSwatch } from "./TextureSwatch";
import { Scan } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import type { UseVanityConfigReturn } from "../hooks/useVanityConfig";

interface VanityControlsProps {
  vanityConfig: UseVanityConfigReturn;
  availableFinishes: string[];
  brands: string[];
  brandInfo: Record<string, { price: number; description: string }>;
  onTextureClick: (finishName: string) => void;
}

export const VanityControls = ({
  vanityConfig,
  availableFinishes,
  brands,
  brandInfo,
  onTextureClick,
}: VanityControlsProps) => {
  const navigate = useNavigate();

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-4">Brand & Finish</h3>
          <div className="space-y-3">
            <Select value={vanityConfig.selectedBrand} onValueChange={vanityConfig.setSelectedBrand}>
              <SelectTrigger>
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand} - ${brandInfo[brand]?.price}/lf
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {vanityConfig.selectedBrand && (
              <>
                <Select value={vanityConfig.selectedFinish} onValueChange={vanityConfig.setSelectedFinish}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select finish" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {availableFinishes.map((finish) => (
                      <SelectItem key={finish} value={finish}>
                        {finish}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex flex-wrap gap-2 p-3 bg-secondary/10 rounded-lg max-h-40 overflow-y-auto">
                  {availableFinishes.slice(0, 12).map((finish) => (
                    <TextureSwatch
                      key={finish}
                      finishName={finish}
                      brand={vanityConfig.selectedBrand}
                      selected={vanityConfig.selectedFinish === finish}
                      onClick={() => onTextureClick(finish)}
                      size="sm"
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Dimensions</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(ROUTES.ROOM_SCAN)}
              className="gap-2 hover:bg-brand-teal/20 hover:text-brand-teal hover:border-brand-teal/60 transition-all duration-300"
            >
              <Scan className="h-4 w-4" />
              3D Scan
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Width (in)</Label>
              <Input
                type="number"
                value={vanityConfig.width}
                onChange={(e) => vanityConfig.setWidth(e.target.value)}
              />
            </div>
            <div>
              <Label>Height (in)</Label>
              <Input
                type="number"
                value={vanityConfig.height}
                onChange={(e) => vanityConfig.setHeight(e.target.value)}
              />
            </div>
            <div>
              <Label>Depth (in)</Label>
              <Input
                type="number"
                value={vanityConfig.depth}
                onChange={(e) => vanityConfig.setDepth(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Cabinet Style</h3>
          <div className="space-y-3">
            <Select value={vanityConfig.doorStyle} onValueChange={vanityConfig.setDoorStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Door</SelectItem>
                <SelectItem value="double">Double Doors</SelectItem>
                <SelectItem value="drawers">All Drawers</SelectItem>
                <SelectItem value="mixed">Drawers + Doors</SelectItem>
                <SelectItem value="door-drawer-split">Door + Drawer</SelectItem>
              </SelectContent>
            </Select>

            {(vanityConfig.doorStyle === 'drawers' || 
              vanityConfig.doorStyle === 'mixed' || 
              vanityConfig.doorStyle === 'door-drawer-split') && (
              <Select 
                value={vanityConfig.numDrawers.toString()} 
                onValueChange={(val) => vanityConfig.setNumDrawers(parseInt(val))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} Drawer{num > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={vanityConfig.handleStyle} onValueChange={vanityConfig.setHandleStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Handles</SelectItem>
                <SelectItem value="knob">Knobs</SelectItem>
                <SelectItem value="recessed">Push-to-Open</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Room Layout</h3>
            <Checkbox
              checked={vanityConfig.includeRoom}
              onCheckedChange={(checked) => vanityConfig.setIncludeRoom(checked as boolean)}
            />
          </div>
          {vanityConfig.includeRoom && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Length (ft)</Label>
                  <Input
                    type="number"
                    value={vanityConfig.roomLength}
                    onChange={(e) => vanityConfig.setRoomLength(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Width (ft)</Label>
                  <Input
                    type="number"
                    value={vanityConfig.roomWidth}
                    onChange={(e) => vanityConfig.setRoomWidth(e.target.value)}
                  />
                </div>
              </div>

              <Select value={vanityConfig.floorType} onValueChange={vanityConfig.setFloorType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tile">Tile ($15/sqft)</SelectItem>
                  <SelectItem value="wood">Wood ($12/sqft)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
