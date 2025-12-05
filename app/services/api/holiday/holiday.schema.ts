import { z } from "zod";

const HolidayListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  isPublicHoliday: z.boolean(),
  bonusAmount: z.number(),
});

const HolidayListResponseSchema = z.array(HolidayListItemSchema);

const HolidayDetailResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: HolidayListItemSchema,
  meta: z.string().optional().nullable(),
});

const CreateHolidayRequestSchema = z.object({
  name: z
    .string("Tên ngày nghỉ không hợp lệ")
    .min(1, "Tên ngày nghỉ là bắt buộc"),
  startDate: z
    .string("Ngày bắt đầu không hợp lệ")
    .min(1, "Ngày bắt đầu là bắt buộc"),
  endDate: z
    .string("Ngày kết thúc không hợp lệ")
    .min(1, "Ngày kết thúc là bắt buộc"),
  isPublicHoliday: z.boolean(),
  bonusAmount: z
    .number("Số tiền thưởng không hợp lệ")
    .min(0, "Số tiền thưởng phải >= 0"),
});

const UpdateHolidayRequestSchema = z.object({
  name: z.string().min(1, "Tên ngày nghỉ là bắt buộc"),
  startDate: z.string().min(1, "Ngày bắt đầu là bắt buộc"),
  endDate: z.string().min(1, "Ngày kết thúc là bắt buộc"),
  isPublicHoliday: z.boolean(),
  bonusMultiplier: z.number().optional().nullable(),
  bonusAmount: z.number().min(0, "Số tiền thưởng phải >= 0"),
});

const HolidayMutationResponseSchema = z
  .object({
    success: z.boolean().optional(),
    statusCode: z.number().optional(),
    message: z.string().optional(),
    data: z.any().optional().nullable(),
    meta: z.any().optional().nullable(),
  })
  .optional();

export const HolidaySchema = {
  HolidayListItemSchema,
  HolidayListResponseSchema,
  HolidayDetailResponseSchema,
  CreateHolidayRequestSchema,
  UpdateHolidayRequestSchema,
  HolidayMutationResponseSchema,
};
