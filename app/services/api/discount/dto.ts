import type z from "zod";
import { DiscountSchema } from "./discount.schema";

const { DiscountApplyRequestSchema, DiscountOverrideRequestSchema } =
  DiscountSchema;

export type DiscountApplyRequest = z.infer<typeof DiscountApplyRequestSchema>;
export type DiscountOverrideRequest = z.infer<
  typeof DiscountOverrideRequestSchema
>;
