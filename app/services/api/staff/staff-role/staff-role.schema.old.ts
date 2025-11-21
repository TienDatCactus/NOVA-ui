import { z } from "zod";

// Staff Role Item Schema
export const StaffRoleItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  description: z.string().optional().nullable(),
});

// Staff Role List Response Schema
export const StaffRoleListResponseSchema = z.array(StaffRoleItemSchema);

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
export const StaffRoleDetailResponseSchema = StaffRoleItemSchema;

export const StaffRoleSchema = {
  StaffRoleItemSchema,
  StaffRoleListResponseSchema,
  CreateStaffRoleRequestSchema,
  UpdateStaffRoleRequestSchema,
  StaffRoleDetailResponseSchema,
};
