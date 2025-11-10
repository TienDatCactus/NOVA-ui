import { z } from "zod";

// Staff List Item Schema (from GET /api/Staffs - list response with fewer fields)
export const StaffListItemSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  fullName: z.string(),
  position: z.string(),
  department: z.string(),
  active: z.boolean(),
});

// Staff Detail Item Schema (from GET /api/Staffs/{id} - full details)
export const StaffDetailItemSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  fullName: z.string(),
  phoneNumber: z.string().optional().nullable().default(""),
  email: z.string().email().optional().nullable().default(""),
  position: z.string(),
  department: z.string(),
  active: z.boolean(),
  baseSalary: z.number().optional().nullable().default(0),
  hireDate: z.string().optional().nullable().default(""), // ISO date string
  userId: z.string().optional().nullable().default(""),
});

// Staff List Response Schema (API returns array directly, not wrapped)
export const StaffListResponseSchema = z.array(StaffListItemSchema);

// Create Staff Request Schema
export const CreateStaffRequestSchema = z.object({
  userId: z
    .string()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  code: z.string().min(1, "Mã nhân sự là bắt buộc"),
  fullName: z.string().min(1, "Họ tên là bắt buộc"),
  phoneNumber: z.string().min(1, "Số điện thoại là bắt buộc"),
  email: z.string().email("Email không hợp lệ"),
  position: z.string().min(1, "Chức vụ là bắt buộc"),
  department: z.string().min(1, "Phòng ban là bắt buộc"),
  baseSalary: z.number().min(0, "Lương cơ bản phải >= 0"),
});

// Update Staff Request Schema (only fields from API docs)
export const UpdateStaffRequestSchema = z.object({
  fullName: z.string().min(1, "Họ tên là bắt buộc"),
  phoneNumber: z.string().min(1, "Số điện thoại là bắt buộc"),
  email: z.string().email("Email không hợp lệ"),
  position: z.string().min(1, "Chức vụ là bắt buộc"),
  department: z.string().min(1, "Phòng ban là bắt buộc"),
  active: z.boolean(),
});

// Staff Detail Response Schema
export const StaffDetailResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: StaffDetailItemSchema,
  meta: z.any().optional(),
});

// Delete Staff Response Schema
export const DeleteStaffResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: z.string(),
  meta: z.any().optional(),
});

export const StaffSchema = {
  StaffListItemSchema,
  StaffDetailItemSchema,
  StaffListResponseSchema,
  CreateStaffRequestSchema,
  UpdateStaffRequestSchema,
  StaffDetailResponseSchema,
  DeleteStaffResponseSchema,
};
