import z from "zod";
import useBookingSchema from "./booking.schema";
import useRoomSchema from "./room.schema";
import useServiceSchema from "./service.schema";

const { StaffCreateBookingSchema } = useBookingSchema();
const { RoomPaymentSchema } = useRoomSchema();
const { ServiceOrderSchema } = useServiceSchema();

const CustomerInfoFormSchema = z
  .object({
    guestFullName: StaffCreateBookingSchema.shape.guestFullName,
    guestPhone: StaffCreateBookingSchema.shape.guestPhone.optional(),
    guestEmail: StaffCreateBookingSchema.shape.guestEmail.optional(),
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
    otaBookingCode: StaffCreateBookingSchema.shape.otaBookingCode
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => new Date(data.checkoutDate) > new Date(data.checkinDate), {
    message: "Ngày trả phòng phải sau ngày nhận phòng",
    path: ["checkoutDate"],
  });

const RoomSelectionFormSchema = z.object({
  roomIds: z.array(z.string()).min(1, "Phải chọn ít nhất 1 phòng"),
  isBreakfastAll: StaffCreateBookingSchema.shape.isBreakfastAll.optional(),
  breakfastDates: StaffCreateBookingSchema.shape.breakfastDates.optional(),
});

const ReviewPaymentFormSchema = z.object({
  specialRequest: StaffCreateBookingSchema.shape.specialRequest
    .optional()
    .or(z.literal("")),
  overridePrice: StaffCreateBookingSchema.shape.overridePrice
    .optional()
    .or(z.literal("")),
  roomPayment: RoomPaymentSchema.optional(),
  serviceOrder: ServiceOrderSchema.optional(),
});

function useFormSchema() {
  return {
    CustomerInfoFormSchema,
    RoomSelectionFormSchema,
    ReviewPaymentFormSchema,
  };
}

export default useFormSchema;
