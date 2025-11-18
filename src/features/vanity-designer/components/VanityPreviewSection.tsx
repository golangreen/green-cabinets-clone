import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Vanity3DPreview } from "./Vanity3DPreview";
import { Maximize2 } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import type { UseVanityConfigReturn } from "../hooks/useVanityConfig";

interface VanityPreviewSectionProps {
  vanityConfig: UseVanityConfigReturn;
  onFullscreenClick: () => void;
}

export const VanityPreviewSection = forwardRef<HTMLDivElement, VanityPreviewSectionProps>(
  ({ vanityConfig, onFullscreenClick }, ref) => {
    // Lazy render 3D preview only when near viewport
    const { targetRef, hasIntersected } = useIntersectionObserver({
      threshold: 0.1,
      rootMargin: '200px',
      triggerOnce: true
    });

    return (
      <Card className="p-6" ref={targetRef}>
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
          {hasIntersected ? (
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
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Loading preview...
            </div>
          )}
        </div>
      </Card>
    );
  }
);

VanityPreviewSection.displayName = "VanityPreviewSection";
