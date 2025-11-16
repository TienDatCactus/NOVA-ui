import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "~/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 shadow-sm transition-all outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Unchecked state - muted with clear border
        "data-[state=unchecked]:bg-muted data-[state=unchecked]:border-border",
        // Checked state - vibrant primary color
        "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full shadow-sm ring-0 transition-transform",
          // Unchecked: white thumb with subtle shadow
          "data-[state=unchecked]:translate-x-0 data-[state=unchecked]:bg-background",
          // Checked: white thumb, moved right
          "data-[state=checked]:translate-x-4 data-[state=checked]:bg-primary-foreground"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
