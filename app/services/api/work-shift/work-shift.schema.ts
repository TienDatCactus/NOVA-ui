import { z } from "zod";

// WorkShift List Item Schema (from GET /api/WorkShifts - list response)
const WorkShiftListItemSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  startTime: z.string(), // Time format: "HH:mm:ss"
  endTime: z.string(), // Time format: "HH:mm:ss"
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
const CreateWorkShiftRequestSchema = z.object({
  code: z.string().min(1, "Mã ca làm việc là bắt buộc"),
  name: z.string().min(1, "Tên ca làm việc là bắt buộc"),
  startTime: z.string().min(1, "Giờ bắt đầu là bắt buộc"), // Format: "HH:mm:ss"
  endTime: z.string().min(1, "Giờ kết thúc là bắt buộc"), // Format: "HH:mm:ss"
});

// PUT /api/WorkShifts/{id} - Update request body
const UpdateWorkShiftRequestSchema = z.object({
  code: z.string().min(1, "Mã ca làm việc là bắt buộc"),
  name: z.string().min(1, "Tên ca làm việc là bắt buộc"),
  startTime: z.string().min(1, "Giờ bắt đầu là bắt buộc"),
  endTime: z.string().min(1, "Giờ kết thúc là bắt buộc"),
  active: z.boolean(),
});

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
