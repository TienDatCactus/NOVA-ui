import type z from "zod";
import { FormSchema } from "../schema/forms.schema";

const {
  RoomSelectionFormSchema,
  ServicesBreakfastFormSchema,
  ReviewPaymentFormSchema,
} = FormSchema;

export type RoomSelectionFormData = z.infer<typeof RoomSelectionFormSchema>;
export type ServicesBreakfastFormData = z.infer<
  typeof ServicesBreakfastFormSchema
>;
export type ReviewPaymentFormData = z.infer<typeof ReviewPaymentFormSchema>;
