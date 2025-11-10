import z from "zod";
import { BookingSchema } from "../api/booking/booking.schema";
import { PaymentSchema } from "./payment.schema";
import { OrderSchema } from "../api/orders/order.schema";

const RoomSelectionFormSchema = z.object({
  roomIds: z.array(z.string()).min(1, "Phải chọn ít nhất 1 phòng"),
});

const ServicesBreakfastFormSchema = z.object({
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
  serviceOrder: OrderSchema.ServiceOrderSchema.optional(),
});

export const FormSchema = {
  RoomSelectionFormSchema,
  ServicesBreakfastFormSchema,
  ReviewPaymentFormSchema,
};
