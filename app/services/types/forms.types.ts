import type z from "zod";
import useFormSchema from "../schema/forms.schema";

const {
  CustomerInfoFormSchema,
  RoomSelectionFormSchema,
  ReviewPaymentFormSchema,
} = useFormSchema();

export type CustomerInfoFormData = z.infer<typeof CustomerInfoFormSchema>;
export type RoomSelectionFormData = z.infer<typeof RoomSelectionFormSchema>;
export type ReviewPaymentFormData = z.infer<typeof ReviewPaymentFormSchema>;
