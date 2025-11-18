import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface ResponsiveDesignerLayoutProps {
  title: string;
  subtitle?: string;
  sidebar?: ReactNode;
  canvas: ReactNode;
  toolbar?: ReactNode;
  bottomControls?: ReactNode;
}

export const ResponsiveDesignerLayout = ({
  title,
  subtitle,
  sidebar,
  canvas,
  toolbar,
  bottomControls,
}: ResponsiveDesignerLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - Fully responsive */}
      <header className="bg-background/95 backdrop-blur-sm border-b px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <div>
            <h1 className="text-sm sm:text-lg font-semibold">{title}</h1>
            {subtitle && (
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Mobile menu for sidebar */}
        {sidebar && (
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-80 p-0 overflow-y-auto">
                {sidebar}
              </SheetContent>
            </Sheet>
          </div>
        )}

        {/* Toolbar - desktop only, some controls shown on mobile */}
        {toolbar && (
          <div className="hidden sm:flex items-center gap-2">{toolbar}</div>
        )}
      </header>

      {/* Main content - Responsive flex layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar - Hidden on mobile (shown in Sheet), visible on desktop */}
        {sidebar && (
          <aside className="hidden lg:block lg:w-80 xl:w-96 border-r bg-background/50 backdrop-blur-sm overflow-y-auto shadow-sm">
            {sidebar}
          </aside>
        )}

        {/* Canvas area - Full width on mobile, flex on desktop */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-auto">
            {canvas}
          </div>

          {/* Bottom controls - Fixed on mobile, optional on desktop */}
          {bottomControls && (
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-2 z-40 max-h-[40vh] overflow-y-auto">
              {bottomControls}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
