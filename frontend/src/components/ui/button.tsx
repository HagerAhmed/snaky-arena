import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-display uppercase tracking-wider",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_10px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_20px_hsl(var(--primary)/0.7)]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[0_0_10px_hsl(var(--destructive)/0.5)]",
        outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary/10 shadow-[0_0_10px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_15px_hsl(var(--primary)/0.5)]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-[0_0_10px_hsl(var(--secondary)/0.5)]",
        ghost: "text-foreground hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        arcade: "relative overflow-hidden transition-all duration-150 text-primary-foreground font-game text-xs py-3 bg-gradient-to-b from-primary to-primary/70 shadow-[0_4px_0_hsl(120_100%_25%),0_0_10px_hsl(var(--primary)/0.5)] hover:translate-y-0.5 hover:shadow-[0_2px_0_hsl(120_100%_25%),0_0_20px_hsl(var(--primary)/0.7)] active:translate-y-1 active:shadow-[0_0_0_hsl(120_100%_25%),0_0_30px_hsl(var(--primary))]",
        neon: "bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-[0_0_5px_hsl(var(--primary)),0_0_10px_hsl(var(--primary)),inset_0_0_5px_hsl(var(--primary)/0.3)] transition-all duration-300",
        "neon-pink": "bg-transparent border-2 border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-background shadow-[0_0_10px_hsl(var(--neon-pink)/0.5)] hover:shadow-[0_0_20px_hsl(var(--neon-pink)/0.7)]",
        "neon-blue": "bg-transparent border-2 border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-background shadow-[0_0_10px_hsl(var(--neon-blue)/0.5)] hover:shadow-[0_0_20px_hsl(var(--neon-blue)/0.7)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-md px-10 text-base",
        icon: "h-10 w-10",
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
