import type { z } from "zod";
import { StaffShiftSchema } from "./staff-shift.schema";

const {
  StaffShiftListItemSchema,
  StaffShiftDetailItemSchema,
  StaffShiftListResponseSchema,
  StaffShiftDetailResponseSchema,
  CreateShiftScheduleRequestSchema,
  UpdateShiftScheduleRequestSchema,
  TransferStaffShiftRequestSchema,
} = StaffShiftSchema;

// Export types
export type StaffShiftListItem = z.infer<typeof StaffShiftListItemSchema>;
export type StaffShiftDetailItem = z.infer<typeof StaffShiftDetailItemSchema>;
export type StaffShiftListResponseDto = z.infer<
  typeof StaffShiftListResponseSchema
>;
export type StaffShiftDetailResponseDto = z.infer<
  typeof StaffShiftDetailResponseSchema
>;
export type CreateShiftScheduleRequest = z.infer<
  typeof CreateShiftScheduleRequestSchema
>;
export type UpdateShiftScheduleRequest = z.infer<
  typeof UpdateShiftScheduleRequestSchema
>;

export type TransferStaffShiftRequest = z.infer<
  typeof TransferStaffShiftRequestSchema
>;
