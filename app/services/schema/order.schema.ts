import z from "zod";
import { PaymentSchema } from "./payment.schema";

const ServiceOrderItemSchema = z.object({
  itemType: z.string(),
  itemId: z.string(),
  quantity: z.number().min(0),
  scheduledDate: z.string().min(10).max(10),
  note: z.string().max(500),
});
const ServiceOrderSchema = z.object({
  services: z.array(ServiceOrderItemSchema).optional().nullable(),
  payment: PaymentSchema.ServicePaymentSchema.optional().nullable(),
});

/* ----------------------------------- */

export const OrderSchema = {
  ServiceOrderSchema,
  ServiceOrderItemSchema,
};
