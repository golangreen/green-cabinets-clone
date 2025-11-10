import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface MobileToolbarProps {
  children: ReactNode;
  className?: string;
}

export const MobileToolbar = ({ children, className }: MobileToolbarProps) => {
  return (
    <div className={cn("lg:hidden border-b bg-background/95 backdrop-blur-sm", className)}>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 p-2 designer-mobile-toolbar">
          {children}
        </div>
        <ScrollBar orientation="horizontal" className="h-2" />
      </ScrollArea>
    </div>
  );
};

interface MobileToolbarButtonProps {
  icon: ReactNode;
  label?: string;
  onClick?: () => void;
  active?: boolean;
  variant?: "default" | "outline" | "ghost";
}

export const MobileToolbarButton = ({
  icon,
  label,
  onClick,
  active,
  variant = "ghost"
}: MobileToolbarButtonProps) => {
  return (
    <Button
      variant={active ? "default" : variant}
      size="lg"
      onClick={onClick}
      className={cn(
        "designer-touch-target flex-shrink-0 h-12 min-w-12",
        label && "px-4"
      )}
    >
      <span className="flex items-center gap-2">
        {icon}
        {label && <span className="text-sm font-medium hidden sm:inline">{label}</span>}
      </span>
    </Button>
  );
};
