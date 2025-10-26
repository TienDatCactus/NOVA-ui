import type z from "zod";
import useUnitSchema from "~/services/schema/unit.schema";

const { UnitItemSchema, UnitsListResponseSchema } = useUnitSchema();

export type UnitItem = z.infer<typeof UnitItemSchema>;
export type UnitsListResponseDto = z.infer<typeof UnitItemSchema>[];
export type UnitsListResponse = z.infer<typeof UnitsListResponseSchema>;
