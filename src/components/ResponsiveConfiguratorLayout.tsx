import { ReactNode } from "react";
import { useResponsiveDesigner } from "@/hooks/useResponsiveDesigner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ResponsiveConfiguratorLayoutProps {
  preview: ReactNode;
  controls: ReactNode;
  mobileControls?: ReactNode;
  tabletControls?: ReactNode;
}

export const ResponsiveConfiguratorLayout = ({
  preview,
  controls,
  mobileControls,
  tabletControls,
}: ResponsiveConfiguratorLayoutProps) => {
  const { isMobile, isTablet, isDesktop } = useResponsiveDesigner();

  // Mobile layout: Full-screen preview with bottom drawer
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen w-full">
        {/* Full-screen preview */}
        <div className="flex-1 overflow-hidden bg-muted/20">
          {preview}
        </div>
        
        {/* Mobile controls in drawer (handled by MobileDesignerControls) */}
        {mobileControls || controls}
      </div>
    );
  }

  // Tablet layout: Split view with collapsible sidebar
  if (isTablet) {
    return (
      <div className="flex h-screen w-full">
        {/* Collapsible sidebar */}
        <aside className="w-80 border-r bg-background/95 backdrop-blur-sm flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-4">
              {tabletControls || controls}
            </div>
          </ScrollArea>
        </aside>
        
        {/* Preview area */}
        <main className="flex-1 overflow-hidden">
          {preview}
        </main>
      </div>
    );
  }

  // Desktop layout: Full sidebar with preview
  return (
    <div className="flex h-screen w-full">
      {/* Full sidebar */}
      <aside className="w-96 border-r bg-background/95 backdrop-blur-sm flex flex-col shadow-sm">
        <ScrollArea className="flex-1">
          <div className="p-6">
            {controls}
          </div>
        </ScrollArea>
      </aside>
      
      {/* Preview area */}
      <main className="flex-1 overflow-hidden bg-muted/10">
        {preview}
      </main>
    </div>
  );
};
