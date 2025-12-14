import { z } from "zod";

const StaffStatusEnum = z.enum(["Active", "Terminated"]);

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
  status: StaffStatusEnum,
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
  code: z
    .string()
    .min(1, "Mã nhân sự là bắt buộc")
    .regex(/^\S+$/, "Mã nhân sự không được chứa khoảng trắng"),
  fullName: z.string("Họ tên không hợp lệ").min(1, "Họ tên là bắt buộc"),
  phoneNumber: z
    .string("Số điện thoại không hợp lệ")
    .regex(/^\d{10}$/, "Số điện thoại phải chứa đúng 10 chữ số"),
  email: z.email("Email không hợp lệ").optional(),
  gender: z.string("Giới tính không hợp lệ").optional(),
  dateOfBirth: z.date().optional(),
  citizenId: z.string().optional(),
  startDate: z.date("Ngày bắt đầu không hợp lệ"),
  note: z.string().optional(),
  staffRoleId: z.string("Chức vụ không hợp lệ").min(1, "Chức vụ là bắt buộc"),
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
  staffRoleId: z.string().min(1, "Chức vụ là bắt buộc"),
});

const TerminateStaffSchema = z.object({
  terminationDate: z.string(),
  note: z.string().optional(),
});

export const StaffSchema = {
  StaffListItemSchema,
  StaffListSchema,
  StaffDetailSchema,
  CreateStaffSchema,
  UpdateStaffSchema,
  TerminateStaffSchema,
};
