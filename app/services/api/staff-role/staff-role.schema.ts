import { z } from "zod";

// Staff Role Item Schema
export const StaffRoleItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  description: z.string().optional().nullable(),
});

// Staff Role List Response Schema
export const StaffRoleListResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: z.array(StaffRoleItemSchema),
  meta: z.any().optional(),
});

// Create Staff Role Request Schema
export const CreateStaffRoleRequestSchema = z.object({
  name: z.string().min(1, "Tên vai trò là bắt buộc"),
  code: z.string().min(1, "Mã vai trò là bắt buộc"),
  description: z.string().optional(),
});

// Update Staff Role Request Schema
export const UpdateStaffRoleRequestSchema = z.object({
  name: z.string().min(1, "Tên vai trò là bắt buộc"),
  code: z.string().min(1, "Mã vai trò là bắt buộc"),
  description: z.string().optional(),
});

// Staff Role Detail Response Schema
export const StaffRoleDetailResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: StaffRoleItemSchema,
  meta: z.any().optional(),
});

// Delete Staff Role Response Schema
export const DeleteStaffRoleResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: z.string().optional().nullable(),
  meta: z.any().optional(),
});

export const StaffRoleSchema = {
  StaffRoleItemSchema,
  StaffRoleListResponseSchema,
  CreateStaffRoleRequestSchema,
  UpdateStaffRoleRequestSchema,
  StaffRoleDetailResponseSchema,
  DeleteStaffRoleResponseSchema,
};
