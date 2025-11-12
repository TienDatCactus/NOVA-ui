import type { z } from "zod";
import { HolidaySchema } from "./holiday.schema";

const {
  HolidayListItemSchema,
  HolidayListResponseSchema,
  HolidayDetailResponseSchema,
  CreateHolidayRequestSchema,
  UpdateHolidayRequestSchema,
  HolidayMutationResponseSchema,
} = HolidaySchema;

// List DTOs
export type HolidayListItem = z.infer<typeof HolidayListItemSchema>;
export type HolidayListResponseDto = z.infer<typeof HolidayListResponseSchema>;

// Detail DTOs
export type HolidayDetailResponseDto = z.infer<
  typeof HolidayDetailResponseSchema
>;

// Request DTOs
export type CreateHolidayRequest = z.infer<typeof CreateHolidayRequestSchema>;
export type UpdateHolidayRequest = z.infer<typeof UpdateHolidayRequestSchema>;

// Mutation Response DTO (shared for Create/Update/Delete)
export type HolidayMutationResponseDto = z.infer<
  typeof HolidayMutationResponseSchema
>;
