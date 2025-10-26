import type z from "zod";
import useServiceTypeSchema from "~/services/schema/service-type.schema";

const { ServiceTypeItemSchema, ServiceTypesListResponseSchema } =
  useServiceTypeSchema();

export type ServiceTypeItem = z.infer<typeof ServiceTypeItemSchema>;
export type ServiceTypesListResponseDto = z.infer<
  typeof ServiceTypesListResponseSchema
>;
