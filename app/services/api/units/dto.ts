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
type UnitListResponseDto = z.infer<typeof UnitListResponseSchema>;
type CreateUnitRequestDto = z.infer<typeof CreateUnitRequestSchema>;
type CreateUnitResponseDto = z.infer<typeof CreateUnitResponseSchema>;
type UnitItemDetailResponseDto = z.infer<typeof UnitItemDetailResponseSchema>;
type UpdateUnitRequestDto = z.infer<typeof UpdateUnitRequestSchema>;
type UpdateUnitResponseDto = z.infer<typeof UpdateUnitResponseSchema>;

export type {
  UnitListResponseDto,
  CreateUnitRequestDto,
  CreateUnitResponseDto,
  UnitItemDetailResponseDto,
  UpdateUnitRequestDto,
  UpdateUnitResponseDto,
};
