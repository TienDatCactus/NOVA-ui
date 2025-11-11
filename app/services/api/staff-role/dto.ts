import type { z } from "zod";
import { StaffRoleSchema } from "./staff-role.schema";

const {
  StaffRoleItemSchema,
  StaffRoleListResponseSchema,
  CreateStaffRoleRequestSchema,
  UpdateStaffRoleRequestSchema,
  StaffRoleDetailResponseSchema,
  DeleteStaffRoleResponseSchema,
} = StaffRoleSchema;

export type StaffRoleItem = z.infer<typeof StaffRoleItemSchema>;
export type StaffRoleListResponse = z.infer<typeof StaffRoleListResponseSchema>;
export type CreateStaffRoleRequest = z.infer<
  typeof CreateStaffRoleRequestSchema
>;
export type UpdateStaffRoleRequest = z.infer<
  typeof UpdateStaffRoleRequestSchema
>;
export type StaffRoleDetailResponse = z.infer<
  typeof StaffRoleDetailResponseSchema
>;
export type DeleteStaffRoleResponse = z.infer<
  typeof DeleteStaffRoleResponseSchema
>;
