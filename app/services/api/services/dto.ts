import type z from "zod";
import useServiceSchema from "~/services/schema/service.schema";

const {
  ServiceListResponseSchema,
  CreateServiceRequestSchema,
  CreateServiceResponseSchema,
  ServiceByTypeResponseSchema,
} = useServiceSchema();

export type ServiceListResponseDto = z.infer<typeof ServiceListResponseSchema>;
export type CreateServiceRequestDto = z.infer<
  typeof CreateServiceRequestSchema
>;
export type CreateServiceResponseDto = z.infer<
  typeof CreateServiceResponseSchema
>;
export type ServiceByTypeResponseDto = z.infer<
  typeof ServiceByTypeResponseSchema
>;
