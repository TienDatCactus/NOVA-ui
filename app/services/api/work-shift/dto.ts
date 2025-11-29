import type { z } from "zod";
import { WorkShiftSchema } from "./work-shift.schema";

const {
  WorkShiftListItemSchema,
  WorkShiftListResponseSchema,
  WorkShiftDetailResponseSchema,
  CreateWorkShiftRequestSchema,
  UpdateWorkShiftRequestSchema,
  WorkShiftMutationResponseSchema,
} = WorkShiftSchema;

// List DTOs
export type WorkShiftListItem = z.infer<typeof WorkShiftListItemSchema>;
export type WorkShiftListResponseDto = z.infer<
  typeof WorkShiftListResponseSchema
>; // This is now WorkShiftListItem[]

// Detail DTOs
export type WorkShiftDetailResponseDto = z.infer<
  typeof WorkShiftDetailResponseSchema
>;

// Request DTOs
export type CreateWorkShiftRequest = z.infer<
  typeof CreateWorkShiftRequestSchema
>;
export type UpdateWorkShiftRequest = z.infer<
  typeof UpdateWorkShiftRequestSchema
>;

// Mutation Response DTO (shared for Create/Update/Delete)
export type WorkShiftMutationResponseDto = z.infer<
  typeof WorkShiftMutationResponseSchema
>;
