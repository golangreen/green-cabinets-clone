import { Button } from "@/components/ui/button";
import { Vanity3DPreview } from "./Vanity3DPreview";
import { X } from "lucide-react";
import type { UseVanityConfigReturn } from "../hooks/useVanityConfig";

interface FullscreenPreviewProps {
  vanityConfig: UseVanityConfigReturn;
  onClose: () => void;
}

export const FullscreenPreview = ({ vanityConfig, onClose }: FullscreenPreviewProps) => {
  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="absolute top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-lg font-bold">Vanity Designer - 3D Preview</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="h-full pt-16">
        <Vanity3DPreview
          width={vanityConfig.dimensionsInInches.width}
          height={vanityConfig.dimensionsInInches.height}
          depth={vanityConfig.dimensionsInInches.depth}
          brand={vanityConfig.selectedBrand}
          finish={vanityConfig.selectedFinish}
          doorStyle={vanityConfig.doorStyle}
          numDrawers={vanityConfig.numDrawers}
          handleStyle={vanityConfig.handleStyle}
          cabinetPosition={vanityConfig.cabinetPosition}
          fullscreen={true}
          includeRoom={vanityConfig.includeRoom}
          roomLength={parseFloat(vanityConfig.roomLength) * 12 || 0}
          roomWidth={parseFloat(vanityConfig.roomWidth) * 12 || 0}
          roomHeight={96}
          floorType={vanityConfig.floorType}
          tileColor={vanityConfig.tileColor}
          woodFloorFinish={vanityConfig.woodFloorFinish}
        />
      </div>
    </div>
  );
};
