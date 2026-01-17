import type { z } from "zod";
import { StaffSchema } from "./staff.schema";

export type StaffListItemDto = z.infer<typeof StaffSchema.StaffListItemSchema>;

export type StaffListDto = z.infer<typeof StaffSchema.StaffListSchema>;

export type StaffDetailDto = z.infer<typeof StaffSchema.StaffDetailSchema>;

export type CreateStaffDto = z.infer<typeof StaffSchema.CreateStaffSchema>;

export type UpdateStaffDto = z.infer<typeof StaffSchema.UpdateStaffSchema>;

export type TerminateStaffDto = z.infer<
  typeof StaffSchema.TerminateStaffSchema
>;

export type RehireStaffDto = z.infer<typeof StaffSchema.RehireStaffSchema>;
