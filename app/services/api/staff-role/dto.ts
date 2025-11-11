import type { z } from "zod";
import { StaffRoleSchema } from "./staff-role.schema";

const { StaffRoleItemSchema, StaffRoleListResponseSchema } = StaffRoleSchema;

export type StaffRoleItem = z.infer<typeof StaffRoleItemSchema>;
export type StaffRoleListResponse = z.infer<typeof StaffRoleListResponseSchema>;
