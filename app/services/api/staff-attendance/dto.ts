import type { z } from "zod";
import { StaffAttendanceSchema } from "./staff-attendance.schema";

const {
  StaffAttendanceListItemSchema,
  StaffAttendanceListResponseSchema,
  MarkAbsentRequestSchema,
  MarkPresentRequestSchema,
  StaffAttendanceMutationResponseSchema,
} = StaffAttendanceSchema;

// Type exports (z.infer only)
export type StaffAttendanceListItem = z.infer<
  typeof StaffAttendanceListItemSchema
>;
export type StaffAttendanceListResponse = z.infer<
  typeof StaffAttendanceListResponseSchema
>;
export type MarkAbsentRequest = z.infer<typeof MarkAbsentRequestSchema>;
export type MarkPresentRequest = z.infer<typeof MarkPresentRequestSchema>;
export type StaffAttendanceMutationResponse = z.infer<
  typeof StaffAttendanceMutationResponseSchema
>;
