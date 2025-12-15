import { z } from "zod";

const HolidayListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  isPublicHoliday: z.boolean(),
});

const HolidayListResponseSchema = z.array(HolidayListItemSchema);

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
});

const UpdateHolidayRequestSchema = z.object({
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
});

export const HolidaySchema = {
  HolidayListItemSchema,
  HolidayListResponseSchema,
  CreateHolidayRequestSchema,
  UpdateHolidayRequestSchema,
};
