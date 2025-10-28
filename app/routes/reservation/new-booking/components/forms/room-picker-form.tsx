"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { useAvailableRoomsInternal } from "~/routes/rooms/container/useRoomQuery";
import { useCreateBookingStore } from "~/store/create-booking.store";
import useFormSchema from "~/services/schema/forms.schema";
import type { RoomSelectionFormData } from "~/services/types/forms.types";

import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { Skeleton } from "~/components/ui/skeleton";
import { AvailableRoomTypeCard } from "../../fragments/available-room.card";
import { BreakfastSelection } from "../../fragments/breakfast-selection";
import { SelectedRoomsSummary } from "../../fragments/selected-rooms";
import useCalculateNights from "../../container/useCalculateNights";

interface RoomPickerFormProps {
  onNext: () => void;
  onCancel?: () => void;
}

export function RoomPickerForm({ onNext, onCancel }: RoomPickerFormProps) {
  const {
    data: storeData,
    setData,
    setStep,
    setSelectedRooms,
  } = useCreateBookingStore();
  const { RoomSelectionFormSchema } = useFormSchema();

  const form = useForm<RoomSelectionFormData>({
    resolver: zodResolver(RoomSelectionFormSchema),
    defaultValues: {
      roomIds: storeData.roomIds || [],
      isBreakfastAll: storeData.isBreakfastAll ?? false,
      breakfastDates: storeData.breakfastDates || [],
    },
  });

  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>(
    storeData.roomIds || []
  );

  const nights = useCalculateNights({
    checkinDate: storeData.checkinDate,
    checkoutDate: storeData.checkoutDate,
  });

  const { data: availableRooms, isPending } = useAvailableRoomsInternal({
    CheckInDate: format(storeData.checkinDate!, "yyyy-MM-dd"),
    CheckOutDate: format(storeData.checkoutDate!, "yyyy-MM-dd"),
    Guests: Number(storeData.adultsAmount!) + Number(storeData.childrenAmount!),
  });

  const selectedRooms = useMemo(() => {
    if (!availableRooms) return [];

    return selectedRoomIds
      .map((roomId) => {
        for (const roomType of availableRooms) {
          const room = roomType.availableRooms.find((r) => r.roomId === roomId);
          if (room) {
            return {
              roomId: room.roomId,
              roomName: room.roomName,
              roomTypeName: roomType.roomTypeName,
              baseRatePerNight: roomType.baseRatePerNight,
            };
          }
        }
        return null;
      })
      .filter(Boolean) as Array<{
      roomId: string;
      roomName: string;
      roomTypeName: string;
      baseRatePerNight: number;
    }>;
  }, [selectedRoomIds, availableRooms]);

  const handleToggleRoom = (roomId: string) => {
    setSelectedRoomIds((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleRemoveRoom = (roomId: string) => {
    setSelectedRoomIds((prev) => prev.filter((id) => id !== roomId));
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setData({
        roomIds: selectedRoomIds,
        isBreakfastAll: form.watch("isBreakfastAll"),
        breakfastDates: form.watch("breakfastDates") || [],
      });
      // Also save full room data
      setSelectedRooms(selectedRooms);
    }, 500);

    return () => clearTimeout(timeout);
  }, [
    selectedRoomIds,
    selectedRooms,
    form.watch("isBreakfastAll"),
    form.watch("breakfastDates"),
    setData,
    setSelectedRooms,
  ]);

  const onSubmit = (data: RoomSelectionFormData) => {
    if (selectedRoomIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một phòng");
      return;
    }

    // Save both roomIds and full room data
    setData({
      roomIds: selectedRoomIds,
      isBreakfastAll: data.isBreakfastAll,
      breakfastDates: data.breakfastDates || [],
    });
    setSelectedRooms(selectedRooms);

    setStep(3);
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Lựa chọn phòng</h2>
          <p className="text-muted-foreground mt-1">
            Bước 2/3 - Chọn phòng phù hợp cho {nights} đêm lưu trú
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {isPending ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[200px] w-full" />
                ))}
              </div>
            ) : !availableRooms || availableRooms.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">
                  Không có phòng trống cho thời gian này
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableRooms.map((roomType) => (
                  <AvailableRoomTypeCard
                    key={roomType.roomTypeId}
                    roomType={roomType}
                    selectedRoomIds={selectedRoomIds}
                    onToggleRoom={handleToggleRoom}
                    nights={nights}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-4">
            <div className="lg:sticky lg:top-6 space-y-4">
              <SelectedRoomsSummary
                selectedRooms={selectedRooms}
                nights={nights}
                onRemoveRoom={handleRemoveRoom}
              />

              {selectedRoomIds.length > 0 &&
                storeData.checkinDate &&
                storeData.checkoutDate && (
                  <BreakfastSelection
                    isBreakfastAll={form.watch("isBreakfastAll") || false}
                    breakfastDates={form.watch("breakfastDates") || []}
                    onToggleAll={(value) =>
                      form.setValue("isBreakfastAll", value)
                    }
                    onSelectDates={(dates) =>
                      form.setValue("breakfastDates", dates)
                    }
                    checkinDate={storeData.checkinDate}
                    checkoutDate={storeData.checkoutDate}
                    nights={nights}
                  />
                )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Hủy
            </Button>
          )}
          <Button
            type="submit"
            disabled={selectedRoomIds.length === 0 || isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tiếp theo
          </Button>
        </div>
      </form>
    </Form>
  );
}
