import type { z } from "zod";
import { StaffRoleSchema } from "./staff-role.schema";

const {
  StaffRoleItemSchema,
  StaffRoleListSchema,
  StaffRoleDetailSchema,
  CreateStaffRoleSchema,
  UpdateStaffRoleSchema,
} = StaffRoleSchema;

export type StaffRoleItem = z.infer<typeof StaffRoleItemSchema>;
export type StaffRoleListDto = z.infer<typeof StaffRoleListSchema>;
export type StaffRoleDetailDto = z.infer<typeof StaffRoleDetailSchema>;
export type CreateStaffRoleDto = z.infer<typeof CreateStaffRoleSchema>;
export type UpdateStaffRoleDto = z.infer<typeof UpdateStaffRoleSchema>;
