import { z } from "zod";

// Staff Role Item Schema
const StaffRoleItemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  code: z.string(),
  description: z.string().optional().nullable(),
});

// Staff Role List Schema - Direct array (no wrapper)
const StaffRoleListSchema = z.array(StaffRoleItemSchema);

// Staff Role Detail Schema
const StaffRoleDetailSchema = StaffRoleItemSchema;

// Create Staff Role Schema (for API requests)
const CreateStaffRoleSchema = z.object({
  name: z.string().min(1, "Tên Chức vụ là bắt buộc"),
  code: z.string().min(1, "Mã Chức vụ là bắt buộc"),
  description: z.string().optional(),
});

// Update Staff Role Schema (for API requests)
const UpdateStaffRoleSchema = z.object({
  name: z.string().min(1, "Tên Chức vụ là bắt buộc"),
  code: z.string().min(1, "Mã Chức vụ là bắt buộc"),
  description: z.string().optional(),
});

export const StaffRoleSchema = {
  StaffRoleItemSchema,
  StaffRoleListSchema,
  StaffRoleDetailSchema,
  CreateStaffRoleSchema,
  UpdateStaffRoleSchema,
};
