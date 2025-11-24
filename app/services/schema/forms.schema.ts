import z from "zod";
import { BookingSchema } from "../api/booking/booking.schema";
import { PaymentSchema } from "./payment.schema";
import { OrderSchema } from "../api/orders/order.schema";
import { StaffPayrollSchema } from "../api/staff/staff-payroll/staff-payroll.schema";

const RoomSelectionFormSchema = z.object({
  roomIds: z.array(z.string()).min(1, "Phải chọn ít nhất 1 phòng"),
});

const ServicesBreakfastFormSchema = z.object({
  isBreakfastAll:
    BookingSchema.StaffCreateBookingSchema.shape.isBreakfastAll.optional(),
  breakfastDates:
    BookingSchema.StaffCreateBookingSchema.shape.breakfastDates.optional(),
  checkinDate: z.union([z.date(), z.string()]).optional(),
  checkoutDate: z.union([z.date(), z.string()]).optional(),
});

const ReviewPaymentFormSchema = z.object({
  specialRequest: BookingSchema.StaffCreateBookingSchema.shape.specialRequest
    .optional()
    .or(z.literal("")),
  overridePrice: BookingSchema.StaffCreateBookingSchema.shape.overridePrice,
  serviceOrder: OrderSchema.ServiceOrderSchema.optional(),
  roomPayment: PaymentSchema.RoomPaymentSchema.optional().nullable(),
});

/**
 * Schema cho form tạo mới item
 */
export const CreateItemFormSchema = z.object({
  code: z
    .string()
    .min(1, "Mã hàng hóa là bắt buộc")
    .max(50, "Mã hàng hóa không được quá 50 ký tự"),
  name: z
    .string()
    .min(1, "Tên hàng hóa là bắt buộc")
    .max(200, "Tên hàng hóa không được quá 200 ký tự"),
  description: z.string().max(500, "Mô tả không được quá 500 ký tự").optional(),
  categoryId: z.uuid("Vui lòng chọn danh mục"),
  unitId: z.uuid("Vui lòng chọn đơn vị tính"),
  unitCost: z
    .number({ message: "Giá nhập phải là số" })
    .nonnegative("Giá nhập phải lớn hơn hoặc bằng 0"),
  unitPrice: z
    .number({ message: "Giá bán phải là số" })
    .nonnegative("Giá bán phải lớn hơn hoặc bằng 0"),
  minStock: z
    .number({ message: "Tồn kho tối thiểu phải là số" })
    .nonnegative("Tồn kho tối thiểu phải lớn hơn hoặc bằng 0"),
  maxStock: z
    .number({ message: "Tồn kho tối đa phải là số" })
    .nonnegative("Tồn kho tối đa phải lớn hơn hoặc bằng 0"),
});

/**
 * Schema cho form cập nhật item (không có code)
 */
export const UpdateItemFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "Tên hàng hóa là bắt buộc")
      .max(200, "Tên hàng hóa không được quá 200 ký tự"),
    description: z
      .string()
      .max(500, "Mô tả không được quá 500 ký tự")
      .optional(),
    categoryId: z.uuid("Vui lòng chọn danh mục"),
    unitId: z.uuid("Vui lòng chọn đơn vị tính"),
    unitCost: z
      .number({ message: "Giá nhập phải là số" })
      .nonnegative("Giá nhập phải lớn hơn hoặc bằng 0"),
    unitPrice: z
      .number({ message: "Giá bán phải là số" })
      .nonnegative("Giá bán phải lớn hơn hoặc bằng 0"),
    minStock: z
      .number({ message: "Tồn kho tối thiểu phải là số" })
      .nonnegative("Tồn kho tối thiểu phải lớn hơn hoặc bằng 0"),
    maxStock: z
      .number({ message: "Tồn kho tối đa phải là số" })
      .nonnegative("Tồn kho tối đa phải lớn hơn hoặc bằng 0"),
    isActive: z.boolean(),
  })
  .refine((data) => data.minStock <= data.maxStock, {
    message: "Tồn kho tối thiểu phải nhỏ hơn hoặc bằng tồn kho tối đa",
    path: ["minStock"],
  });

/**
 * Schema cho form tạo nhân sự
 */

/**
 * Schema cho form cập nhật nhân sự
 */

/**
 * Schema cho form tạo vai trò nhân sự
 */

/**
 * Schema cho form áp dụng nghỉ phép chưa sử dụng
 */
export const ApplyUnusedLeaveFormSchema = z.object({
  mode: StaffPayrollSchema.UnusedLeaveModeEnum,
});

/**
 * Schema cho form cập nhật bảng lương
 */
export const UpdatePayrollFormSchema = z.object({
  baseSalaryFullMonth: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .refine((val) => val === undefined || !isNaN(val), {
      message: "Lương cơ bản phải là số hợp lệ",
    }),
  paidAmount: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .refine((val) => val === undefined || !isNaN(val), {
      message: "Số tiền đã trả phải là số hợp lệ",
    }),
});

/**
 * Schema cho form thêm/sửa component bảng lương
 */
export const AddPayrollComponentFormSchema = z.object({
  type: StaffPayrollSchema.PayrollComponentTypeEnum,
  title: z.string().min(1, "Vui lòng nhập tiêu đề"),
  amount: z.number().min(1, "Vui lòng nhập số tiền"),
  note: z.string().optional(),
  effectiveDate: z.string().optional(),
});

export const FormSchema = {
  RoomSelectionFormSchema,
  ServicesBreakfastFormSchema,
  ReviewPaymentFormSchema,
  CreateItemFormSchema,
  UpdateItemFormSchema,
  ApplyUnusedLeaveFormSchema,
  UpdatePayrollFormSchema,
  AddPayrollComponentFormSchema,
};
