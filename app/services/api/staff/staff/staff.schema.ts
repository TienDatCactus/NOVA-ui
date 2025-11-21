import { z } from "zod";

const StaffListItemSchema = z.object({
  id: z.uuid(),
  code: z.string(),
  fullName: z.string(),
  phoneNumber: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  citizenId: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  staffRoleId: z.string().optional().nullable(),
  staffRoleName: z.string().optional().nullable(),
});

// Staff List Schema - Direct array (no wrapper)
const StaffListSchema = z.array(StaffListItemSchema);

// Staff Detail Schema (from GET /api/Staffs/{id} - full details)
const StaffDetailSchema = z.object({
  id: z.uuid(),
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

//?---------------------------------- REQUEST SCHEMAS (API Input)

// Create Staff Schema (for API requests)
const CreateStaffSchema = z.object({
  code: z.string(),
  fullName: z.string(),
  phoneNumber: z.string(),
  email: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(), // yyyy-MM-dd format
  citizenId: z.string().optional(),
  startDate: z.string().optional(), // yyyy-MM-dd format
  note: z.string().optional(),
  staffRoleId: z.string(),
});

// Update Staff Schema (for API requests)
const UpdateStaffSchema = z.object({
  fullName: z.string().min(1, "Họ tên là bắt buộc"),
  phoneNumber: z.string().min(1, "Số điện thoại là bắt buộc"),
  email: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.date().optional(),
  citizenId: z.string().optional(),
  startDate: z.date().optional(),
  note: z.string().optional(),
  staffRoleId: z.string().min(1, "Vai trò là bắt buộc"),
});

export const StaffSchema = {
  StaffListItemSchema,
  StaffListSchema,
  StaffDetailSchema,
  CreateStaffSchema,
  UpdateStaffSchema,
};
