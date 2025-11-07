import type z from "zod";
import { ServiceSchema } from "~/services/api/services/service.schema";
const {
  ServiceListResponseSchema,
  ServiceListByTypeResponseSchema,
  CreateServiceItemRequestSchema,
  CreateServiceItemResponseSchema,
  UpdateServiceItemRequestSchema,
  UpdateServiceItemResponseSchema,
  ServiceItemDetailResponseSchema,
  ServiceListItemSchema,
} = ServiceSchema;
export type ServiceListResponseDto = z.infer<typeof ServiceListResponseSchema>;
export type ServiceListByTypeResponseDto = z.infer<
  typeof ServiceListByTypeResponseSchema
>;
export type CreateServiceRequestDto = z.infer<
  typeof CreateServiceItemRequestSchema
>;
export type CreateServiceResponseDto = z.infer<
  typeof CreateServiceItemResponseSchema
>;
export type UpdateServiceRequestDto = z.infer<
  typeof UpdateServiceItemRequestSchema
>;
export type UpdateServiceResponseDto = z.infer<
  typeof UpdateServiceItemResponseSchema
>;
export type ServiceItemDetailResponseDto = z.infer<
  typeof ServiceItemDetailResponseSchema
>;
export type ServiceItem = z.infer<typeof ServiceListItemSchema>;
export type ServiceTypeGroup = z.infer<
  typeof ServiceListResponseSchema
>[number];
