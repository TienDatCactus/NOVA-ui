import z from "zod";
import useBookingSchema from "./booking.schema";
const { StaffCreateBookingSchema } = useBookingSchema();
const CustomerInfoFormSchema = z.object({
  guestFullName: StaffCreateBookingSchema.shape.guestFullName,
  guestPhone: StaffCreateBookingSchema.shape.guestPhone
    .optional()
    .or(z.literal("")),
  guestEmail: StaffCreateBookingSchema.shape.guestEmail
    .optional()
    .or(z.literal("")),
  checkinDate: StaffCreateBookingSchema.shape.checkinDate,
  checkoutDate: StaffCreateBookingSchema.shape.checkoutDate,
  adultsAmount: StaffCreateBookingSchema.shape.adultsAmount,
  childrenAmount: StaffCreateBookingSchema.shape.childrenAmount
    .optional()
    .or(z.literal(0)),
  source: StaffCreateBookingSchema.shape.source,
  otaInformationId: StaffCreateBookingSchema.shape.otaInformationId
    .optional()
    .or(z.literal("")),
});

function useFormSchema() {
  return { CustomerInfoFormSchema };
}
export default useFormSchema;
