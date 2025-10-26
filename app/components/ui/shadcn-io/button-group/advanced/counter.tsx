"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import {
  Button,
  Group,
  Input,
  NumberField,
  type NumberFieldProps,
} from "react-aria-components";
import { cn } from "~/lib/utils";

interface CounterProps extends Omit<NumberFieldProps, "className"> {
  className?: string;
  showLabel?: boolean;
}

export function Counter({
  className,
  showLabel = false,
  minValue = 0,
  defaultValue = 1,
  ...props
}: CounterProps) {
  return (
    <NumberField
      minValue={minValue}
      defaultValue={defaultValue}
      className={cn("w-full space-y-2", className)}
      {...props}
    >
      <Group className="relative inline-flex h-9 w-full min-w-0 items-center overflow-hidden rounded-md border border-input bg-transparent text-base whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-within:border-ring data-focus-within:ring-[3px] data-focus-within:ring-ring/50 data-focus-within:has-[aria-invalid]:border-destructive data-focus-within:has-[aria-invalid]:ring-destructive/20 dark:bg-input/30 dark:data-focus-within:has-[aria-invalid]:ring-destructive/40 md:text-sm">
        <Button
          slot="decrement"
          className="-ms-px flex aspect-square h-[inherit] items-center justify-center rounded-l-md border border-input bg-background text-sm text-muted-foreground transition-[color,box-shadow] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MinusIcon className="size-4" />
          <span className="sr-only">Giảm</span>
        </Button>
        <Input className="selection:bg-primary selection:text-primary-foreground w-full grow px-3 py-2 text-center tabular-nums outline-none bg-background" />
        <Button
          slot="increment"
          className="-me-px flex aspect-square h-[inherit] items-center justify-center rounded-r-md border border-input bg-background text-sm text-muted-foreground transition-[color,box-shadow] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PlusIcon className="size-4" />
          <span className="sr-only">Tăng</span>
        </Button>
      </Group>
    </NumberField>
  );
}
