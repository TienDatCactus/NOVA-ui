import type { z } from "zod";
import {
  StaffListItemSchema,
  StaffDetailItemSchema,
  StaffListResponseSchema,
  CreateStaffRequestSchema,
  UpdateStaffRequestSchema,
  StaffDetailResponseSchema,
  DeleteStaffResponseSchema,
} from "./staff.schema";

// Types
export type StaffListItem = z.infer<typeof StaffListItemSchema>; // List item (fewer fields)
export type StaffDetailItem = z.infer<typeof StaffDetailItemSchema>; // Detail item (all fields)
export type StaffListResponse = z.infer<typeof StaffListResponseSchema>; // Wrapped response
export type CreateStaffRequest = z.infer<typeof CreateStaffRequestSchema>;
export type UpdateStaffRequest = z.infer<typeof UpdateStaffRequestSchema>;
export type StaffDetailResponse = z.infer<typeof StaffDetailResponseSchema>;
export type DeleteStaffResponse = z.infer<typeof DeleteStaffResponseSchema>;
