import { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MobileDesignerControlsProps {
  children: ReactNode;
  title?: string;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const MobileDesignerControls = ({
  children,
  title = "Controls",
  trigger,
  open,
  onOpenChange,
}: MobileDesignerControlsProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {trigger || (
          <Button
            size="lg"
            className="designer-fab fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg lg:hidden z-50"
            variant="default"
          >
            <Settings className="h-6 w-6" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent 
        side="bottom" 
        className="h-[85vh] rounded-t-2xl p-0"
      >
        <SheetHeader className="p-4 border-b sticky top-0 bg-background z-10">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(85vh-4rem)]">
          <div className="p-4 designer-form">
            {children}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
