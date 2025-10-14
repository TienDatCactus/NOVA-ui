"use client";

import * as React from "react";
import { motion, type HTMLMotionProps, type Transition } from "motion/react";
import { cn } from "~/lib/utils";
import { type SlidingNumberProps, SlidingNumber } from "../sliding-number";
import { Button } from "../../button";

type CounterProps = HTMLMotionProps<"div"> & {
  number: string | number;
  setNumber?:
    | ((number: number) => void)
    | ((id: string, number: number) => void);
  itemId?: string;
  slidingNumberProps?: Omit<SlidingNumberProps, "number">;
  buttonProps?: Omit<React.ComponentProps<typeof Button>, "onClick">;
  transition?: Transition;
  min?: number;
  max?: number;
};

function Counter({
  number,
  setNumber,
  itemId,
  min = 0,
  max,
  className,
  slidingNumberProps,
  buttonProps,
  transition = { type: "spring", bounce: 0, stiffness: 300, damping: 30 },
  ...props
}: CounterProps) {
  const value = Math.max(
    min,
    Math.min(Number(number), max !== undefined ? max : Number.MAX_SAFE_INTEGER)
  );

  const handleIncrement = () => {
    if (!setNumber) return;
    if (value < (max ?? Number.MAX_SAFE_INTEGER)) {
      if (itemId !== undefined) {
        (setNumber as (id: string, num: number) => void)(itemId, value + 1);
      } else {
        (setNumber as (num: number) => void)(value + 1);
      }
    }
  };

  const handleDecrement = () => {
    if (!setNumber) return;
    if (value > min) {
      if (itemId !== undefined) {
        (setNumber as (id: string, num: number) => void)(itemId, value - 1);
      } else {
        (setNumber as (num: number) => void)(value - 1);
      }
    }
  };
  return (
    <motion.div
      data-slot="counter"
      layout
      transition={transition}
      className={cn(
        "flex items-center gap-x-2 p-1 rounded-xl  dark:bg-neutral-800",
        className
      )}
      {...props}
    >
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          size="icon"
          {...buttonProps}
          onClick={handleDecrement}
          className={cn(
            "bg-background shadow-sm dark:bg-neutral-950 hover:bg-white/70 dark:hover:bg-neutral-950/70 text-neutral-950 dark:text-white text-2xl font-light pb-[3px]",
            buttonProps?.className
          )}
        >
          -
        </Button>
      </motion.div>

      <SlidingNumber
        number={number}
        {...slidingNumberProps}
        className={cn("text-lg", slidingNumberProps?.className)}
      />

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          size="icon"
          {...buttonProps}
          onClick={handleIncrement}
          className={cn(
            "bg-background shadow-sm dark:bg-neutral-950 hover:bg-white/70 dark:hover:bg-neutral-950/70 text-neutral-950 dark:text-white text-2xl font-light pb-[3px]",
            buttonProps?.className
          )}
        >
          +
        </Button>
      </motion.div>
    </motion.div>
  );
}

export { Counter, type CounterProps };
