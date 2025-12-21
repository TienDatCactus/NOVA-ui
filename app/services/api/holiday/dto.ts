import type { z } from "zod";
import { HolidaySchema } from "./holiday.schema";

const {
  HolidayListItemSchema,
  HolidayListResponseSchema,
  CreateHolidayRequestSchema,
  UpdateHolidayRequestSchema,
} = HolidaySchema;

// List DTOs
export type HolidayListItem = z.infer<typeof HolidayListItemSchema>;
export type HolidayListResponseDto = z.infer<typeof HolidayListResponseSchema>;

// Request DTOs
export type CreateHolidayRequest = z.infer<typeof CreateHolidayRequestSchema>;
export type UpdateHolidayRequest = z.infer<typeof UpdateHolidayRequestSchema>;
