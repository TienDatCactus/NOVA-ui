import { z } from "zod";

// StaffShift List Item Schema
const StaffShiftListItemSchema = z.object({
  id: z.string(),
  staffId: z.string(),
  staffName: z.string().optional(),
  shiftId: z.string(),
  shiftName: z.string().optional(),
  workDate: z.string(), // "yyyy-MM-dd"
  status: z.string().optional(),
});

// GET /api/StaffShifts - List response with query params (staffId, from, to)
const StaffShiftListResponseSchema = z.array(StaffShiftListItemSchema);

// GET /api/StaffShifts/{id} - Detail response
const StaffShiftDetailResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: StaffShiftListItemSchema,
  meta: z.string().optional().nullable(),
});

// POST /api/StaffShifts/schedule - Create schedule request
const CreateShiftScheduleRequestSchema = z.object({
  primaryStaffId: z.string().min(1, "Nhân viên chính là bắt buộc"),
  additionalStaffIds: z.array(z.string()).optional(),
  workShiftIds: z.array(z.string()).min(1, "Chọn ít nhất 1 ca làm việc"),
  startDate: z.string().min(1, "Ngày bắt đầu là bắt buộc"), // "yyyy-MM-dd"
  endDate: z.string().optional().nullable(),
  repeatWeekly: z.boolean(),
  weekDays: z.array(z.number()), // 1=Monday, 7=Sunday
  repeatIntervalWeeks: z.number().int().min(1),
  excludeHolidays: z.boolean(),
});

// PUT /api/StaffShifts/{id}/schedule - Update schedule request
const UpdateShiftScheduleRequestSchema = z.object({
  workShiftIds: z.array(z.string()).min(1, "Chọn ít nhất 1 ca làm việc"),
  repeatWeekly: z.boolean(),
  weekDays: z.array(z.number()).optional().nullable(), // 1=Monday, 7=Sunday
  endDate: z.string().optional().nullable(), // "yyyy-MM-dd", null = mặc định +1 tháng
  excludeHolidays: z.boolean(),
  applyScope: z.enum(["ThisOnly", "Forward", "All"]), // Required, no default
});

// Generic Mutation Response Schema
const StaffShiftMutationResponseSchema = z
  .object({
    success: z.boolean().optional(),
    statusCode: z.number().optional(),
    message: z.string().optional(),
    data: z.any().optional().nullable(),
    meta: z.any().optional().nullable(),
  })
  .optional();

export const StaffShiftSchema = {
  StaffShiftListItemSchema,
  StaffShiftListResponseSchema,
  StaffShiftDetailResponseSchema,
  CreateShiftScheduleRequestSchema,
  UpdateShiftScheduleRequestSchema,
  StaffShiftMutationResponseSchema,
};
