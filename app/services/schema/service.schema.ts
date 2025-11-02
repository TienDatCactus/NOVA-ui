import z from "zod";
import { PaymentSchema } from "./payment.schema";
import { RoomSchema } from "./room.schema";

// general CRUD ops
const ServiceListItemSchema = z.object({
  serviceItemId: z.string(),
  code: z.string().min(2),
  name: z.string().min(2),
  description: z.string(),
  unitName: z.string().max(100),
  basePrice: z.number().min(0),
  active: z.boolean().default(true),
  imageUrls: z.array(z.url()).optional(),
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
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
  images: z
    .array(
      z.object({
        mediaId: z.string(),
        url: z.url(),
        caption: z.string().optional().nullable(),
        contentType: z.string().optional().nullable(),
        displayOrder: z.number().optional().nullable(),
      })
    )
    .optional(),
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

export const ServiceSchema = {
  ServiceItemSchema,
  ServiceListResponseSchema,
  ServiceListByTypeResponseSchema,
  ServiceItemDetailResponseSchema,
  UpdateServiceItemResponseSchema,
  CreateServiceItemResponseSchema,
  UpdateServiceItemRequestSchema,
  CreateServiceItemRequestSchema,
  ServiceListItemSchema,
};
