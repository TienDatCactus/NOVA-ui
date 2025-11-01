import z from "zod";
import { BookingSchema } from "./booking.schema";
import { OrderSchema } from "./order.schema";
import { PaymentSchema } from "./payment.schema";

const CustomerInfoFormSchema = z
  .object({
    guestFullName: BookingSchema.StaffCreateBookingSchema.shape.guestFullName,
    guestPhone:
      BookingSchema.StaffCreateBookingSchema.shape.guestPhone.optional(),
    guestEmail:
      BookingSchema.StaffCreateBookingSchema.shape.guestEmail.optional(),
    checkinDate: BookingSchema.StaffCreateBookingSchema.shape.checkinDate,
    checkoutDate: BookingSchema.StaffCreateBookingSchema.shape.checkoutDate,
    adultsAmount: BookingSchema.StaffCreateBookingSchema.shape.adultsAmount,
    childrenAmount: BookingSchema.StaffCreateBookingSchema.shape.childrenAmount
      .optional()
      .or(z.literal(0)),
    source: BookingSchema.StaffCreateBookingSchema.shape.source,
    otaInformationId:
      BookingSchema.StaffCreateBookingSchema.shape.otaInformationId
        .optional()
        .or(z.literal("")),
    otaBookingCode: BookingSchema.StaffCreateBookingSchema.shape.otaBookingCode
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => new Date(data.checkoutDate) > new Date(data.checkinDate), {
    message: "Ngày trả phòng phải sau ngày nhận phòng",
    path: ["checkoutDate"],
  });

const RoomSelectionFormSchema = z.object({
  roomIds: z.array(z.string()).min(1, "Phải chọn ít nhất 1 phòng"),
  isBreakfastAll:
    BookingSchema.StaffCreateBookingSchema.shape.isBreakfastAll.optional(),
  breakfastDates:
    BookingSchema.StaffCreateBookingSchema.shape.breakfastDates.optional(),
});

const ReviewPaymentFormSchema = z.object({
  specialRequest: BookingSchema.StaffCreateBookingSchema.shape.specialRequest
    .optional()
    .or(z.literal("")),
  overridePrice: BookingSchema.StaffCreateBookingSchema.shape.overridePrice,
  roomPayment: PaymentSchema.RoomPaymentSchema.optional(),
  serviceOrder: OrderSchema.ServiceOrderSchema.optional(),
});

export const FormSchema = {
  CustomerInfoFormSchema,
  RoomSelectionFormSchema,
  ReviewPaymentFormSchema,
};
