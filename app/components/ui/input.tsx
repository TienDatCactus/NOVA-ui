import * as React from "react";

import { cn, handleLimitInput } from "~/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "./input-group";

interface InputProps {
  className?: string;
  type?: string;
  /**
   * Icon or component displayed at the start of the input
   * @example <SearchIcon className="h-4 w-4" />
   */
  startAddon?: React.ReactNode;
  /**
   * Icon or component displayed at the end of the input
   * @example <CheckIcon className="h-4 w-4" />
   */
  endAddon?: React.ReactNode;
  /**
   * Text displayed as prefix (e.g., currency, protocol)
   * @example "VNĐ" | "https://" | "$"
   */
  startText?: string;
  /**
   * Text displayed as suffix (e.g., unit, counter)
   * @example "%" | "/100" | "km"
   */
  endText?: string;
}

function Input({
  className,
  type,
  startAddon,
  endAddon,
  startText,
  endText,
  ...props
}: InputProps & React.ComponentProps<"input">) {
  const hasAnyAddon = startAddon || endAddon || startText || endText;

  if (hasAnyAddon) {
    return (
      <InputGroup className={cn("bg-input shadow-sm", className)}>
        {(startAddon || startText) && (
          <InputGroupAddon align="inline-start">
            {startText && <InputGroupText>{startText}</InputGroupText>}
            {startAddon}
          </InputGroupAddon>
        )}

        <InputGroupInput type={type} {...props} onInput={handleLimitInput} />

        {(endAddon || endText) && (
          <InputGroupAddon align="inline-end">
            {endAddon}
            {endText && <InputGroupText>{endText}</InputGroupText>}
          </InputGroupAddon>
        )}
      </InputGroup>
    );
  }

  return (
    <input
      type={type}
      data-slot="input"
      onInput={handleLimitInput}
      className={cn(
        "file:text-foreground bg-input placeholder:text-muted-foreground placeholder:text-base selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-10 w-full min-w-0 rounded-md border px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Input };
