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
  code: z.string().min(1, "Mã nhân sự là bắt buộc"),

  fullName: z.string().min(1, "Họ tên là bắt buộc"),

  phoneNumber: z
    .string()
    .regex(/^\d{9,11}$/, "Số điện thoại phải gồm 9 đến 11 chữ số"),

  email: z.email("Email không hợp lệ").optional(),

  gender: z.string().optional(),

  dateOfBirth: z
    .date()
    .refine((date) => date <= new Date(), "Ngày sinh không được ở tương lai")
    .refine((date) => {
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 150);
      return date >= minDate;
    }, "Ngày sinh không hợp lệ")

    .refine((date) => {
      const minAgeDate = new Date();
      minAgeDate.setFullYear(minAgeDate.getFullYear() - 18);
      return date <= minAgeDate;
    }, "Ngày sinh phải đảm bảo nhân sự đủ 18 tuổi")
    .optional(),

  citizenId: z
    .string()
    .regex(/^(\d{9}|\d{12})$/, "CCCD phải gồm 9 hoặc 12 chữ số")
    .optional(),
  startDate: z.date("Ngày bắt đầu không hợp lệ").optional(),
  note: z.string().optional(),
  staffRoleId: z.string().min(1, "Chức vụ là bắt buộc"),
});

// Update Staff Schema (for API requests)
const UpdateStaffSchema = z.object({
  fullName: z.string().min(1, "Họ tên là bắt buộc"),

  phoneNumber: z
    .string()
    .regex(/^\d{9,11}$/, "Số điện thoại phải gồm 9 đến 11 chữ số"),

  email: z.email("Email không hợp lệ").optional(),

  gender: z.string().optional(),

  dateOfBirth: z
    .date()
    .refine((date) => date <= new Date(), "Ngày sinh không được ở tương lai")
    .optional(),

  citizenId: z
    .string()
    .regex(/^(\d{9}|\d{12})$/, "CCCD phải gồm 9 hoặc 12 chữ số")
    .optional(),

  startDate: z.date("Ngày bắt đầu không hợp lệ").optional(),

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
