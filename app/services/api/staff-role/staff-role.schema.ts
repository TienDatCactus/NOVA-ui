import { z } from "zod";

// Staff Role Item Schema
export const StaffRoleItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  description: z.string().optional().nullable(),
});

// Staff Role List Response Schema
export const StaffRoleListResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: z.array(StaffRoleItemSchema),
  meta: z.any().optional(),
});

export const StaffRoleSchema = {
  StaffRoleItemSchema,
  StaffRoleListResponseSchema,
};
