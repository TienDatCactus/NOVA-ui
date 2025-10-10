"use client";

import * as React from "react";
import { motion, type HTMLMotionProps, type Transition } from "motion/react";
import { cn } from "~/lib/utils";
import { type SlidingNumberProps, SlidingNumber } from "../sliding-number";
import { Button } from "../../button";

type CounterProps = HTMLMotionProps<"div"> & {
  number: string | number;
  setNumber: (number: number) => void;
  slidingNumberProps?: Omit<SlidingNumberProps, "number">;
  buttonProps?: Omit<React.ComponentProps<typeof Button>, "onClick">;
  transition?: Transition;
  max?: number;
};

function Counter({
  number,
  setNumber,
  max,
  className,
  slidingNumberProps,
  buttonProps,
  transition = { type: "spring", bounce: 0, stiffness: 300, damping: 30 },
  ...props
}: CounterProps) {
  number = Number(number) < 0 ? 0 : Number(number);
  if (max !== undefined && Number(number) > max) {
    number = max;
  }
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
          onClick={() => setNumber(number - 1)}
          className={cn(
            "bg-white shadow-s dark:bg-neutral-950 hover:bg-white/70 dark:hover:bg-neutral-950/70 text-neutral-950 dark:text-white text-2xl font-light pb-[3px]",
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
          onClick={() => setNumber(number + 1)}
          className={cn(
            "bg-white shadow-s dark:bg-neutral-950 hover:bg-white/70 dark:hover:bg-neutral-950/70 text-neutral-950 dark:text-white text-2xl font-light pb-[3px]",
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
