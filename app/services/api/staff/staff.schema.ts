import { z } from "zod";

// Staff List Item Schema (from GET /api/Staffs - list response)
export const StaffListItemSchema = z.object({
  id: z.string(),
  code: z.string(),
  fullName: z.string(),
  phoneNumber: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  citizenId: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

// Staff Detail Item Schema (from GET /api/Staffs/{id} - full details)
export const StaffDetailItemSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  fullName: z.string(),
  phoneNumber: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  citizenId: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  staffRoleId: z.string().optional().nullable(),
  staffRoleName: z.string().optional().nullable(),
});

// Staff List Response Schema (wrapped in standard response format)
export const StaffListResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: z.array(StaffListItemSchema),
  meta: z.any().optional(),
});

// Create Staff Request Schema (Form validation - accepts Date objects)
export const CreateStaffFormSchema = z.object({
  code: z.string().min(1, "Mã nhân sự là bắt buộc"),
  fullName: z.string().min(1, "Họ tên là bắt buộc"),
  phoneNumber: z.string().min(1, "Số điện thoại là bắt buộc"),
  email: z.string(),
  gender: z.string().optional(),
  dateOfBirth: z.date().optional(),
  citizenId: z.string().optional(),
  startDate: z.date().optional(),
  note: z.string().optional(),
  staffRoleId: z.string().min(1, "Vai trò là bắt buộc"),
});

// API Request Schema (for sending to backend - only strings)
export const CreateStaffRequestSchema = z.object({
  code: z.string(),
  fullName: z.string(),
  phoneNumber: z.string(),
  email: z.string(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  citizenId: z.string().optional(),
  startDate: z.string().optional(),
  note: z.string().optional(),
  staffRoleId: z.string(),
});

// Update Staff Request Schema (Form validation)
export const UpdateStaffFormSchema = z.object({
  fullName: z.string().min(1, "Họ tên là bắt buộc"),
  phoneNumber: z.string().min(1, "Số điện thoại là bắt buộc"),
  email: z.string(),
  gender: z.string().optional(),
  dateOfBirth: z.date().optional(),
  citizenId: z.string().optional(),
  startDate: z.date().optional(),
  note: z.string().optional(),
  staffRoleId: z.string().min(1, "Vai trò là bắt buộc"),
});

// API Request Schema (for sending to backend)
export const UpdateStaffRequestSchema = z.object({
  fullName: z.string(),
  phoneNumber: z.string(),
  email: z.string(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  citizenId: z.string().optional(),
  startDate: z.string().optional(),
  note: z.string().optional(),
  staffRoleId: z.string(),
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
  data: z.string().optional().nullable(),
  meta: z.any().optional(),
});

export const StaffSchema = {
  StaffListItemSchema,
  StaffDetailItemSchema,
  StaffListResponseSchema,
  CreateStaffFormSchema,
  CreateStaffRequestSchema,
  UpdateStaffFormSchema,
  UpdateStaffRequestSchema,
  StaffDetailResponseSchema,
  DeleteStaffResponseSchema,
};
