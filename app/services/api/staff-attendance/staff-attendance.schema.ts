import { z } from "zod";

// Staff Attendance List Item Schema
const StaffAttendanceListItemSchema = z.object({
  id: z.string(),
  staffId: z.string(),
  staffCode: z.string(),
  staffName: z.string(),
  shiftId: z.string(),
  shiftCode: z.string(),
  shiftName: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  workDate: z.string(),
  status: z.string(), // "present" | "absent" | "assigned"
  absentReason: z.string().nullable(),
});

// Staff Attendance List Response Schema
const StaffAttendanceListResponseSchema = z.array(
  StaffAttendanceListItemSchema
);

// Mark Absent Request Schema
const MarkAbsentRequestSchema = z.object({
  reason: z
    .string()
    .max(200, "Lý do không được vượt quá 200 ký tự")
    .default(""),
});

const MarkPresentRequestSchema = z.object({});

// Staff Attendance Mutation Response Schema
const StaffAttendanceMutationResponseSchema = z.object({
  success: z.boolean().optional(),
  statusCode: z.number().optional(),
  message: z.string().optional(),
  data: z.any().optional(),
  meta: z.any().optional(),
});

export const StaffAttendanceSchema = {
  StaffAttendanceListItemSchema,
  StaffAttendanceListResponseSchema,
  MarkAbsentRequestSchema,
  MarkPresentRequestSchema,
  StaffAttendanceMutationResponseSchema,
};
