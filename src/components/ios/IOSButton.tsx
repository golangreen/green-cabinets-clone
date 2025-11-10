import { ReactNode } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { hapticImpact, isNativeApp } from "@/utils/capacitor";
import { ImpactStyle } from "@capacitor/haptics";

interface IOSButtonProps extends ButtonProps {
  children: ReactNode;
  hapticStyle?: ImpactStyle;
  className?: string;
}

export const IOSButton = ({ 
  children, 
  hapticStyle = ImpactStyle.Light,
  className,
  onClick,
  ...props 
}: IOSButtonProps) => {
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Trigger haptic feedback on native iOS
    if (isNativeApp()) {
      await hapticImpact(hapticStyle);
    }
    
    // Call original onClick
    onClick?.(e);
  };

  return (
    <Button
      onClick={handleClick}
      className={cn(
        "ios-button ios-haptic-light ios-no-select",
        isNativeApp() && "active:scale-95",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};

// iOS-style segmented control
interface IOSSegmentedControlProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const IOSSegmentedControl = ({
  options,
  value,
  onChange,
  className
}: IOSSegmentedControlProps) => {
  return (
    <div className={cn("ios-segmented-control flex", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          data-state={value === option.value ? "active" : "inactive"}
          onClick={async () => {
            if (isNativeApp()) {
              await hapticImpact(ImpactStyle.Light);
            }
            onChange(option.value);
          }}
          className="flex-1 ios-no-select"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

// iOS-style list item
interface IOSListItemProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  showChevron?: boolean;
}

export const IOSListItem = ({
  children,
  onClick,
  className,
  showChevron = false
}: IOSListItemProps) => {
  const handleClick = async () => {
    if (isNativeApp()) {
      await hapticImpact(ImpactStyle.Light);
    }
    onClick?.();
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "ios-list-item flex items-center justify-between",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex-1">{children}</div>
      {showChevron && (
        <svg
          className="w-5 h-5 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      )}
    </div>
  );
};
