import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 shadow-sm hover:shadow-md focus-visible:ring-destructive/30 dark:bg-destructive/80 dark:hover:bg-destructive/70",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20 dark:bg-background/50 dark:border-input dark:hover:bg-accent/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",

        success:
          "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md focus-visible:ring-emerald-500/40 dark:bg-emerald-500 dark:hover:bg-emerald-600",
        "success-outline":
          "border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-950/50",
        "success-ghost":
          "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/50",

        // Enhanced Warning variants
        warning:
          "bg-amber-500 text-white hover:bg-amber-600 shadow-sm hover:shadow-md focus-visible:ring-amber-500/40 dark:bg-amber-600 dark:hover:bg-amber-700",
        "warning-outline":
          "border-2 border-amber-500 text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:border-amber-500 dark:text-amber-400 dark:hover:bg-amber-950/50",
        "warning-ghost":
          "text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/50",

        // Enhanced Info variants
        info: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md focus-visible:ring-blue-500/40 dark:bg-blue-500 dark:hover:bg-blue-600",
        "info-outline":
          "border-2 border-blue-600 text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-950/50",
        "info-ghost":
          "text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/50",

        // New Purple/Violet variants
        purple:
          "bg-purple-600 text-white hover:bg-purple-700 shadow-sm hover:shadow-md focus-visible:ring-purple-500/40 dark:bg-purple-500 dark:hover:bg-purple-600",
        "purple-outline":
          "border-2 border-purple-600 text-purple-700 hover:bg-purple-50 hover:text-purple-800 dark:border-purple-500 dark:text-purple-400 dark:hover:bg-purple-950/50",
        "purple-ghost":
          "text-purple-700 hover:bg-purple-50 hover:text-purple-800 dark:text-purple-400 dark:hover:bg-purple-950/50",

        // New Pink/Rose variants
        pink: "bg-pink-600 text-white hover:bg-pink-700 shadow-sm hover:shadow-md focus-visible:ring-pink-500/40 dark:bg-pink-500 dark:hover:bg-pink-600",
        "pink-outline":
          "border-2 border-pink-600 text-pink-700 hover:bg-pink-50 hover:text-pink-800 dark:border-pink-500 dark:text-pink-400 dark:hover:bg-pink-950/50",
        "pink-ghost":
          "text-pink-700 hover:bg-pink-50 hover:text-pink-800 dark:text-pink-400 dark:hover:bg-pink-950/50",

        // New Indigo variants
        indigo:
          "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md focus-visible:ring-indigo-500/40 dark:bg-indigo-500 dark:hover:bg-indigo-600",
        "indigo-outline":
          "border-2 border-indigo-600 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 dark:border-indigo-500 dark:text-indigo-400 dark:hover:bg-indigo-950/50",
        "indigo-ghost":
          "text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/50",

        // New Teal variants
        teal: "bg-teal-600 text-white hover:bg-teal-700 shadow-sm hover:shadow-md focus-visible:ring-teal-500/40 dark:bg-teal-500 dark:hover:bg-teal-600",
        "teal-outline":
          "border-2 border-teal-600 text-teal-700 hover:bg-teal-50 hover:text-teal-800 dark:border-teal-500 dark:text-teal-400 dark:hover:bg-teal-950/50",
        "teal-ghost":
          "text-teal-700 hover:bg-teal-50 hover:text-teal-800 dark:text-teal-400 dark:hover:bg-teal-950/50",

        // New Orange variants
        orange:
          "bg-orange-600 text-white hover:bg-orange-700 shadow-sm hover:shadow-md focus-visible:ring-orange-500/40 dark:bg-orange-500 dark:hover:bg-orange-600",
        "orange-outline":
          "border-2 border-orange-600 text-orange-700 hover:bg-orange-50 hover:text-orange-800 dark:border-orange-500 dark:text-orange-400 dark:hover:bg-orange-950/50",
        "orange-ghost":
          "text-orange-700 hover:bg-orange-50 hover:text-orange-800 dark:text-orange-400 dark:hover:bg-orange-950/50",

        // Enhanced Gradient variants
        gradient:
          "bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-300",
        "gradient-success":
          "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-md hover:shadow-lg",
        "gradient-sunset":
          "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 shadow-md hover:shadow-lg",
        "gradient-ocean":
          "bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 shadow-md hover:shadow-lg",

        // Special variants
        transparent: "bg-transparent hover:bg-accent/50",
        shimmer:
          "relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md hover:shadow-lg before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      type={props.type ?? "button"}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
