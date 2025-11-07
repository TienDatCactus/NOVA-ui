import type z from "zod";
import { ServiceTypesSchema } from "~/services/api/service-types/service-types.schema";

const {
  CreateServiceTypeResponseSchema,
  ServiceTypeItemDetailSchema,
  UpdateServiceTypeResponseSchema,
  CreateServiceTypeRequestSchema,
  UpdateServiceTypeRequestSchema,
  ServiceTypeListResponseSchema,
} = ServiceTypesSchema;
export type ServiceTypeItemDetailDto = z.infer<
  typeof ServiceTypeItemDetailSchema
>;
export type CreateServiceTypeResponseDto = z.infer<
  typeof CreateServiceTypeResponseSchema
>;
export type UpdateServiceTypeResponseDto = z.infer<
  typeof UpdateServiceTypeResponseSchema
>;
export type CreateServiceTypeRequestDto = z.infer<
  typeof CreateServiceTypeRequestSchema
>;
export type UpdateServiceTypeRequestDto = z.infer<
  typeof UpdateServiceTypeRequestSchema
>;
export type ServiceTypeListResponseDto = z.infer<
  typeof ServiceTypeListResponseSchema
>;
export type ServiceTypeItem = z.infer<typeof ServiceTypeItemDetailSchema>;
