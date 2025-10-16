import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type z from "zod";
import type useBookingSchema from "~/services/schema/booking.schema";
import { useCreateBookingStore } from "~/store/create-booking.store";

function useCustomerInfoForm({
  form,
}: {
  form: UseFormReturn<
    z.infer<ReturnType<typeof useBookingSchema>["BookingSchema"]>
  >;
}) {
  const { formData } = useCreateBookingStore();
  const [contact, setContact] = useState<"email" | "phoneNumber" | "none">(
    () => {
      const email = formData.customerInfo?.email;
      const phone = formData.customerInfo?.phoneNumber;
      if (email) return "email";
      else if (phone) return "phoneNumber";
      return "none";
    }
  );
  const email = form.watch("customerInfo.email");
  const phone = form.watch("customerInfo.phoneNumber");
  const bookingChannel = form.watch("customerInfo.bookingChannel");
  const hasContactInfo = !!email || !!phone || contact !== "none";

  useEffect(() => {
    if (contact === "email") {
      form.setValue("customerInfo.phoneNumber", "");
    } else if (contact === "phoneNumber") {
      form.setValue("customerInfo.email", "");
    }
  }, [contact]);
  return { contact, setContact, hasContactInfo, bookingChannel };
}

export default useCustomerInfoForm;
