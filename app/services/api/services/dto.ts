import type z from "zod";
import useServiceSchema from "~/services/schema/service.schema";
const {
  ServiceListResponseSchema,
  ServiceListByTypeResponseSchema,
  CreateServiceItemRequestSchema,
  CreateServiceItemResponseSchema,
  UpdateServiceItemRequestSchema,
  UpdateServiceItemResponseSchema,
  ServiceItemDetailResponseSchema,
  ServiceItemListSchema,
} = useServiceSchema();
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
type ServiceItem = z.infer<typeof ServiceItemListSchema>;
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
