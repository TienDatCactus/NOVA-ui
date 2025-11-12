import type z from "zod";
import { UnitSchema } from "./unit.schema";

const {
  CreateUnitRequestSchema,
  CreateUnitResponseSchema,
  UnitItemDetailResponseSchema,
  UnitListResponseSchema,
  UpdateUnitRequestSchema,
  UpdateUnitResponseSchema,
} = UnitSchema;
export type UnitListResponseDto = z.infer<typeof UnitListResponseSchema>;
export type CreateUnitRequestDto = z.infer<typeof CreateUnitRequestSchema>;
export type CreateUnitResponseDto = z.infer<typeof CreateUnitResponseSchema>;
export type UnitItemDetailResponseDto = z.infer<
  typeof UnitItemDetailResponseSchema
>;
export type UpdateUnitRequestDto = z.infer<typeof UpdateUnitRequestSchema>;
export type UpdateUnitResponseDto = z.infer<typeof UpdateUnitResponseSchema>;
