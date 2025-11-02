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
type ServiceListResponseDto = z.infer<typeof ServiceListResponseSchema>;
type ServiceListByTypeResponseDto = z.infer<
  typeof ServiceListByTypeResponseSchema
>;
type CreateServiceRequestDto = z.infer<typeof CreateServiceItemRequestSchema>;
type CreateServiceResponseDto = z.infer<typeof CreateServiceItemResponseSchema>;
type UpdateServiceRequestDto = z.infer<typeof UpdateServiceItemRequestSchema>;
type UpdateServiceResponseDto = z.infer<typeof UpdateServiceItemResponseSchema>;
type ServiceItemDetailResponseDto = z.infer<
  typeof ServiceItemDetailResponseSchema
>;
type ServiceItem = z.infer<typeof ServiceListItemSchema>;
type ServiceTypeGroup = z.infer<typeof ServiceListResponseSchema>[number];

export type {
  ServiceListResponseDto,
  ServiceListByTypeResponseDto,
  CreateServiceRequestDto,
  CreateServiceResponseDto,
  UpdateServiceRequestDto,
  UpdateServiceResponseDto,
  ServiceItemDetailResponseDto,
  ServiceItem,
  ServiceTypeGroup,
};
