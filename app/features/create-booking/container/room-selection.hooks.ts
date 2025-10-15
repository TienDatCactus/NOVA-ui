import { eachDayOfInterval } from "date-fns";
import { useEffect, useState } from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import type z from "zod";
import useBookingSchema from "~/services/schema/booking.schema";
import type { Room } from "~/services/types/booking.types";
import { useCreateBookingStore } from "~/store/create-booking.store";

const { RoomSchema } = useBookingSchema();
const AVAILABLE_ROOMS: Room[] = [
  {
    roomId: "R001",
    roomName: "Chalet Garden View",
    price: 2200000,
    roomType: "Chalet",
    quantity: 0, // người dùng chưa chọn
    description:
      "Phòng Chalet hướng vườn, thiết kế hiện đại với ban công riêng, phù hợp cho 2 người lớn.",
    images: [
      "https://example.com/images/chalet-garden-1.jpg",
      "https://example.com/images/chalet-garden-2.jpg",
    ],
    status: "Còn phòng",
  },
  {
    roomId: "R002",
    roomName: "Villa Sea Breeze",
    price: 4800000,
    roomType: "Villa",
    quantity: 0,
    description:
      "Biệt thự hướng biển với hồ bơi riêng, diện tích rộng 120m2, bao gồm phòng khách và bếp nhỏ.",
    images: [
      "https://example.com/images/villa-sea-1.jpg",
      "https://example.com/images/villa-sea-2.jpg",
    ],
    status: "Còn phòng",
  },
  {
    roomId: "R003",
    roomName: "Suite Mountain View",
    price: 3500000,
    roomType: "Suite",
    quantity: 0,
    description:
      "Phòng Suite cao cấp với tầm nhìn núi, giường king-size, bao gồm bữa sáng buffet.",
    images: [
      "https://example.com/images/suite-mountain-1.jpg",
      "https://example.com/images/suite-mountain-2.jpg",
    ],
    status: "Còn phòng",
  },
  {
    roomId: "R004",
    roomName: "Bungalow Family",
    price: 2900000,
    roomType: "Bungalow",
    quantity: 0,
    description:
      "Phòng Bungalow dành cho gia đình 4 người, có sân nhỏ và lối đi riêng ra khu vườn trung tâm.",
    images: [
      "https://example.com/images/bungalow-family-1.jpg",
      "https://example.com/images/bungalow-family-2.jpg",
    ],
    status: "Còn phòng",
  },
];

const SUGGESTED_ROOMS: Room[] = [
  {
    roomId: "R001",
    roomName: "Chalet Garden View",
    price: 2200000,
    roomType: "Chalet",
    quantity: 1, // mặc định gợi ý 1 phòng
    description:
      "Phòng gợi ý cho 1–2 khách, hướng vườn thoáng mát, bao gồm bữa sáng.",
    images: [
      "https://example.com/images/chalet-garden-1.jpg",
      "https://example.com/images/chalet-garden-2.jpg",
    ],
    status: "Còn phòng",
  },
  {
    roomId: "R003",
    roomName: "Suite Mountain View",
    price: 3500000,
    roomType: "Suite",
    quantity: 1,
    description:
      "Gợi ý cho cặp đôi, view núi, thiết kế sang trọng và yên tĩnh.",
    images: [
      "https://example.com/images/suite-mountain-1.jpg",
      "https://example.com/images/suite-mountain-2.jpg",
    ],
    status: "Còn phòng",
  },
];

function useRoomSelection({
  form,
}: {
  form: UseFormReturn<
    z.infer<ReturnType<typeof useBookingSchema>["BookingSchema"]>
  >;
}) {
  const { formData, updateFormData } = useCreateBookingStore();
  const [breakfast, setBreakfast] = useState(() => {
    return formData.roomSelection?.selectedBreakfastDates?.length! > 0;
  });
  const [open, setOpen] = useState(false);
  const { SelectedRoomSchema } = useBookingSchema();
  const dateRange =
    formData.customerInfo?.checkIn && formData.customerInfo?.checkOut
      ? eachDayOfInterval({
          start: formData.customerInfo.checkIn,
          end: formData.customerInfo.checkOut,
        })
      : [];

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "roomSelection.rooms",
  });

  const handleRoomSelect = (
    room: z.infer<typeof SelectedRoomSchema>,
    quantity = 1
  ) => {
    const index = fields.findIndex((f) => f.roomId === room.roomId);

    if (index === -1 && quantity > 0) {
      append({
        roomId: room.roomId,
        roomName: room.roomName,
        price: room.price,
        roomType: room.roomType,
        quantity: quantity,
      });

      const updatedFormData = form.getValues();
      updateFormData(updatedFormData);
      return;
    }

    if (index !== -1 && quantity > 0) {
      update(index, {
        roomId: room.roomId,
        roomName: room.roomName,
        price: room.price,
        roomType: room.roomType,
        quantity: quantity,
      });

      const updatedFormData = form.getValues();
      updateFormData(updatedFormData);
      return;
    }

    if (index !== -1 && quantity === 0) {
      remove(index);

      const updatedFormData = form.getValues();
      updateFormData(updatedFormData);
    }

    form.trigger("roomSelection.rooms");
  };

  useEffect(() => {
    const currentRooms = form.getValues("roomSelection.rooms");
    if (!currentRooms) {
      form.setValue("roomSelection.rooms", []);
    }
  }, [form]);
  return {
    breakfast,
    setBreakfast,
    open,
    setOpen,
    fields,
    dateRange,
    handleRoomSelect,
  };
}

export { AVAILABLE_ROOMS, SUGGESTED_ROOMS, useRoomSelection };
