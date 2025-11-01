import type z from "zod";
import { FormSchema } from "../schema/forms.schema";

const {
  CustomerInfoFormSchema,
  RoomSelectionFormSchema,
  ReviewPaymentFormSchema,
} = FormSchema;

export type CustomerInfoFormData = z.infer<typeof CustomerInfoFormSchema>;
export type RoomSelectionFormData = z.infer<typeof RoomSelectionFormSchema>;
export type ReviewPaymentFormData = z.infer<typeof ReviewPaymentFormSchema>;
