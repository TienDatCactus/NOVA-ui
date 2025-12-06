import { z } from "zod";

// WorkShift List Item Schema (from GET /api/WorkShifts - list response)
const WorkShiftListItemSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  active: z.boolean(),
});

// GET /api/WorkShifts - List response (API trả về array trực tiếp)
const WorkShiftListResponseSchema = z.array(WorkShiftListItemSchema);

// GET /api/WorkShifts/{id} - Detail response
const WorkShiftDetailResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: WorkShiftListItemSchema,
  meta: z.string().optional().nullable(),
});

// POST /api/WorkShifts - Create request body
const CreateWorkShiftRequestSchema = z
  .object({
    name: z
      .string()
      .min(1, "Tên ca làm việc là bắt buộc")
      .max(100, "Tên ca làm việc không được quá 100 ký tự"),
    startTime: z
      .string()
      .min(1, "Giờ bắt đầu là bắt buộc")
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Giờ bắt đầu không hợp lệ (định dạng HH:mm)"
      ),
    endTime: z
      .string()
      .min(1, "Giờ kết thúc là bắt buộc")
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Giờ kết thúc không hợp lệ (định dạng HH:mm)"
      ),
  })
  .refine(
    (data) => {
      // Convert time strings to minutes for comparison
      const [startHour, startMin] = data.startTime.split(":").map(Number);
      const [endHour, endMin] = data.endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      // End time must be after start time
      return endMinutes > startMinutes;
    },
    {
      message: "Giờ kết thúc phải sau giờ bắt đầu",
      path: ["endTime"],
    }
  );

// PUT /api/WorkShifts/{id} - Update request body
const UpdateWorkShiftRequestSchema = z
  .object({
    name: z
      .string()
      .min(1, "Tên ca làm việc là bắt buộc")
      .max(100, "Tên ca làm việc không được quá 100 ký tự"),
    startTime: z
      .string()
      .min(1, "Giờ bắt đầu là bắt buộc")
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Giờ bắt đầu không hợp lệ (định dạng HH:mm)"
      ),
    endTime: z
      .string()
      .min(1, "Giờ kết thúc là bắt buộc")
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Giờ kết thúc không hợp lệ (định dạng HH:mm)"
      ),
    active: z.boolean(),
  })
  .refine(
    (data) => {
      const [startHour, startMin] = data.startTime.split(":").map(Number);
      const [endHour, endMin] = data.endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      return endMinutes > startMinutes;
    },
    {
      message: "Giờ kết thúc phải sau giờ bắt đầu",
      path: ["endTime"],
    }
  );

// Generic Mutation Response Schema (for Create/Update/Delete)
// API có thể trả về object hoặc undefined, dùng passthrough để accept tất cả
const WorkShiftMutationResponseSchema = z
  .object({
    success: z.boolean().optional(),
    statusCode: z.number().optional(),
    message: z.string().optional(),
    data: z.any().optional().nullable(),
    meta: z.any().optional().nullable(),
  })
  .optional();

export const WorkShiftSchema = {
  WorkShiftListItemSchema,
  WorkShiftListResponseSchema,
  WorkShiftDetailResponseSchema,
  CreateWorkShiftRequestSchema,
  UpdateWorkShiftRequestSchema,
  WorkShiftMutationResponseSchema,
};
