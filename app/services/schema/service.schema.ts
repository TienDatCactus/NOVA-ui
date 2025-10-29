import z from "zod";
import useRoomSchema from "./room.schema";

const { RoomPaymentSchema } = useRoomSchema();
// ----------------------

const ServiceItemSchema = z.object({
  serviceItemId: z.string(),
  code: z.string().min(2).max(100),
  name: z.string().min(2).max(100),
  description: z.string().max(500),
  unitName: z.string().max(100),
  basePrice: z.number().min(0),
  active: z.boolean().default(true),
});
const ServiceItemListSchema = z.object({
  serviceTypeId: z.string(),
  typeCode: z.string(),
  typeName: z.string(),
  imageUrls: z.array(z.string()),
  active: z.boolean().default(true),
  items: z.array(ServiceItemSchema),
});
const ServiceListResponseSchema = z.array(ServiceItemListSchema);

const ServiceListByTypeResponseSchema = z.array(ServiceItemSchema);

const ServiceItemDetailResponseSchema = ServiceItemSchema;

const EditServiceItemRequestSchema = z.object({
  serviceTypeId: z.string(),
  unitId: z.string(),
  code: z.string().min(2).max(100),
  name: z.string().min(2).max(100),
  description: z.string().max(500),
  basePrice: z.number().min(0),
  active: z.boolean().default(true),
});
const CreateServiceItemRequestSchema = EditServiceItemRequestSchema;
const UpdateServiceItemRequestSchema = EditServiceItemRequestSchema;
const CreateServiceItemResponseSchema = ServiceItemSchema;
const UpdateServiceItemResponseSchema = ServiceItemSchema;
const ServicePaymentSchema = RoomPaymentSchema;
const ServiceOrderItemSchema = z.object({
  itemType: z.string(),
  itemId: z.string(),
  quantity: z.number().min(0),
  scheduledDate: z.string().min(10).max(10),
  note: z.string().max(500),
});
const ServiceOrderSchema = z.object({
  services: z.array(ServiceOrderItemSchema).optional().nullable(),
  payment: ServicePaymentSchema.optional().nullable(),
});
const useServiceSchema = () => {
  return {
    ServiceItemSchema,
    ServiceListResponseSchema,
    ServiceListByTypeResponseSchema,
    ServiceItemDetailResponseSchema,
    UpdateServiceItemResponseSchema,
    RoomPaymentSchema,
    ServiceOrderSchema,
    CreateServiceItemResponseSchema,
    UpdateServiceItemRequestSchema,
    CreateServiceItemRequestSchema,
    ServiceItemListSchema,
  };
};
export default useServiceSchema;
