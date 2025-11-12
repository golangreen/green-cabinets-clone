import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Vanity3DPreview } from "./Vanity3DPreview";
import { Maximize2 } from "lucide-react";
import type { UseVanityConfigReturn } from "../hooks/useVanityConfig";

interface VanityPreviewSectionProps {
  vanityConfig: UseVanityConfigReturn;
  onFullscreenClick: () => void;
}

export const VanityPreviewSection = forwardRef<HTMLDivElement, VanityPreviewSectionProps>(
  ({ vanityConfig, onFullscreenClick }, ref) => {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">3D Preview</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onFullscreenClick}
            className="gap-2 hover:bg-brand-teal/20 hover:text-brand-teal hover:border-brand-teal/60 transition-all duration-300"
          >
            <Maximize2 className="h-4 w-4" />
            Fullscreen
          </Button>
        </div>
        <div ref={ref} className="aspect-video bg-secondary/20 rounded-lg overflow-hidden">
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
            fullscreen={false}
            includeRoom={vanityConfig.includeRoom}
            roomLength={parseFloat(vanityConfig.roomLength) * 12 || 0}
            roomWidth={parseFloat(vanityConfig.roomWidth) * 12 || 0}
            roomHeight={96}
            floorType={vanityConfig.floorType}
            tileColor={vanityConfig.tileColor}
            woodFloorFinish={vanityConfig.woodFloorFinish}
          />
        </div>
      </Card>
    );
  }
);

VanityPreviewSection.displayName = "VanityPreviewSection";
