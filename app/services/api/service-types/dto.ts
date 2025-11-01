import type z from "zod";
import { ServiceTypesSchema } from "~/services/schema/service-types.schema";

const {
  CreateServiceTypeResponseSchema,
  ServiceTypeItemDetailSchema,
  UpdateServiceTypeResponseSchema,
  CreateServiceTypeRequestSchema,
  UpdateServiceTypeRequestSchema,
  ServiceTypeListResponseSchema,
} = ServiceTypesSchema;
type ServiceTypeItemDetailDto = z.infer<typeof ServiceTypeItemDetailSchema>;
type CreateServiceTypeResponseDto = z.infer<
  typeof CreateServiceTypeResponseSchema
>;
type UpdateServiceTypeResponseDto = z.infer<
  typeof UpdateServiceTypeResponseSchema
>;
type CreateServiceTypeRequestDto = z.infer<
  typeof CreateServiceTypeRequestSchema
>;
type UpdateServiceTypeRequestDto = z.infer<
  typeof UpdateServiceTypeRequestSchema
>;
type ServiceTypeListResponseDto = z.infer<typeof ServiceTypeListResponseSchema>;
type ServiceTypeItem = z.infer<typeof ServiceTypeItemDetailSchema>;

export type {
  ServiceTypeItemDetailDto,
  CreateServiceTypeResponseDto,
  UpdateServiceTypeResponseDto,
  CreateServiceTypeRequestDto,
  UpdateServiceTypeRequestDto,
  ServiceTypeListResponseDto,
  ServiceTypeItem,
};
