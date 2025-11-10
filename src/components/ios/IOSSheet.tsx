import { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { isIOS } from "@/utils/capacitor";

interface IOSSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export const IOSSheet = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className
}: IOSSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          "ios-sheet",
          isIOS() && "ios-safe-bottom",
          className
        )}
      >
        {/* iOS handle indicator */}
        <div className="ios-sheet-handle" />
        
        {(title || description) && (
          <SheetHeader className="px-4 pb-4">
            {title && (
              <SheetTitle className="text-lg font-semibold">
                {title}
              </SheetTitle>
            )}
            {description && (
              <SheetDescription className="text-sm text-muted-foreground">
                {description}
              </SheetDescription>
            )}
          </SheetHeader>
        )}
        
        <div className="ios-scroll max-h-[70vh] overflow-y-auto px-4 pb-4">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};
