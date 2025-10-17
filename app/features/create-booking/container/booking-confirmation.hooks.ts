import { differenceInDays, intervalToDuration } from "date-fns";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type z from "zod";
import type useBookingSchema from "~/services/schema/booking.schema";
import { useCreateBookingStore } from "~/store/create-booking.store";
function useCalculateCost(formData: any) {
  const rooms = formData.roomSelection?.rooms || [];
  const checkIn = formData.customerInfo?.checkIn;
  const checkOut = formData.customerInfo?.checkOut;
  const services = formData.services || [];
  let roomCost = 0;
  let serviceCost = 0;

  if (checkIn && checkOut && rooms.length > 0) {
    const days = differenceInDays(new Date(checkOut), new Date(checkIn)) || 1;

    roomCost = rooms.reduce((total: number, room: any) => {
      return total + room.price * room.quantity * days;
    }, 0);

    serviceCost = services.reduce((total: number, service: any) => {
      return total + service.price * service.quantity;
    }, 0);
  }

  const vatCost = (roomCost + serviceCost) * 0.1;
  const totalCost = roomCost + serviceCost + vatCost;

  return {
    roomCost,
    serviceCost,
    vatCost,
    totalCost,
  };
}

function useBookingConfirmation({
  form,
}: {
  form: UseFormReturn<
    z.infer<ReturnType<typeof useBookingSchema>["BookingSchema"]>
  >;
}) {
  const [note, setNote] = useState(false);
  const [open, setOpen] = useState(false);
  const { formData, updateFormData, prevStep } = useCreateBookingStore();
  const costs = useCalculateCost(formData);
  function toggle() {
    setOpen(!open);
  }
  const handleRemoveRoom = (roomId: string) => {
    const updatedRooms =
      formData.roomSelection?.rooms?.filter(
        (room: any) => room.roomId !== roomId
      ) || [];
    form.setValue("roomSelection.rooms", updatedRooms);
    updateFormData({
      ...formData,
      roomSelection: {
        ...formData.roomSelection,
        rooms: updatedRooms,
      },
    });
  };
  const handleRemoveService = (serviceId: string) => {
    const updatedServices =
      formData.services?.filter((service) => service.id !== serviceId) || [];
    form.setValue("services", updatedServices);
    updateFormData({
      ...formData,
      services: updatedServices,
    });
  };

  const handleCheckInChange = (date: Date) => {
    form.setValue("customerInfo.checkIn", date);
    const checkOut = form.getValues("customerInfo.checkOut");
    if (date > checkOut) {
      form.setValue(
        "customerInfo.checkOut",
        new Date(date.getTime() + 24 * 60 * 60 * 1000)
      );
    }
    form.trigger("customerInfo.checkIn");

    updateFormData(form.getValues());
  };

  const handleCheckOutChange = (date: Date) => {
    if (date < form.getValues("customerInfo.checkIn")) {
      form.setValue("customerInfo.checkIn", date);
    }
    form.setValue("customerInfo.checkOut", date);
    form.trigger("customerInfo.checkOut");
    updateFormData(form.getValues());
  };
  const handleEditRooms = () => {
    prevStep();
  };
  const handleServiceFinish = (selectedServices: any[]) => {
    console.log(selectedServices);
    form.setValue(
      "services",
      selectedServices.map((s) => s.id)
    );
    updateFormData({
      ...formData,
      services: selectedServices,
    });
    toggle();
  };
  const numberOfNights =
    intervalToDuration({
      start: formData.customerInfo?.checkIn as unknown as Date,
      end: formData.customerInfo?.checkOut as unknown as Date,
    }).days || 0;

  const numberOfBreakfastDays = formData.roomSelection.selectedBreakfastDates
    ? formData.roomSelection.selectedBreakfastDates.length
    : 0;
  return {
    note,
    setNote,
    open,
    toggle,
    costs,
    handleRemoveRoom,
    handleRemoveService,
    handleCheckInChange,
    handleCheckOutChange,
    handleEditRooms,
    handleServiceFinish,
    numberOfNights,
    numberOfBreakfastDays,
  };
}

export default useBookingConfirmation;
