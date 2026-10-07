import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Matches the homepage's .lux-btn / .lux-btn-ghost: pill shape, Outfit,
// brass primary, hairline outline, 160ms press scale (hover only on real
// pointers via Tailwind's hoverOnlyWhenSupported).
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-display text-[0.95rem] font-medium tracking-[0.01em] select-none transition-[transform,background-color,color,border-color] duration-200 [transition-timing-function:var(--ease-out)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-brass text-ink hover:bg-[#D4B272]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-white/25 bg-transparent text-ivory hover:border-white/60 hover:bg-white/[0.06]",
        secondary: "bg-ink-3 text-ivory hover:bg-white/10",
        ghost: "text-ivory hover:bg-white/[0.06]",
        link: "rounded-none text-ivory underline decoration-brass/60 underline-offset-4 hover:decoration-brass active:scale-100",
        hero: "bg-brass text-ink hover:bg-[#D4B272]",
      },
      size: {
        default: "min-h-11 px-6 py-2",
        sm: "min-h-9 px-4 text-sm",
        lg: "min-h-12 px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
