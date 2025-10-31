import z from "zod";
import useRoomSchema from "./room.schema";

const { RoomPaymentSchema } = useRoomSchema();
// ----------------------

// general CRUD ops
const ServiceListItemSchema = z.object({
  serviceItemId: z.string(),
  code: z.string().min(2),
  name: z.string().min(2),
  description: z.string(),
  unitName: z.string().max(100),
  basePrice: z.number().min(0),
  active: z.boolean().default(true),
});

const ServiceItemSchema = z.object({
  id: z.string(),
  serviceTypeId: z.string(),
  serviceTypeName: z.string(),
  unitId: z.string(),
  unitName: z.string(),
  code: z.string().min(2),
  name: z.string().min(2),
  description: z.string().max(500),
  basePrice: z.number().min(0),
  active: z.boolean().default(true),
  createdAt: z.string().min(10).max(10),
  updatedAt: null,
});

const ServiceListByTypeResponseSchema = z.array(ServiceItemSchema);
const ServiceListResponseSchema = z.array(ServiceListItemSchema);
const ServiceItemDetailResponseSchema = ServiceItemSchema;

const EditServiceItemRequestSchema = z.object({
  serviceTypeId: z.string(),
  unitId: z.string(),
  code: z.string().min(2),
  name: z.string().min(2),
  description: z.string().max(500),
  basePrice: z.number().min(0),
  active: z.boolean().default(true),
});
const CreateServiceItemRequestSchema = EditServiceItemRequestSchema;
const UpdateServiceItemRequestSchema = EditServiceItemRequestSchema;
const CreateServiceItemResponseSchema = ServiceItemSchema;
const UpdateServiceItemResponseSchema = ServiceItemSchema;

// for create booking
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
    ServiceOrderItemSchema,
    ServiceOrderSchema,
    CreateServiceItemResponseSchema,
    UpdateServiceItemRequestSchema,
    CreateServiceItemRequestSchema,
    ServiceListItemSchema,
  };
};
export default useServiceSchema;
