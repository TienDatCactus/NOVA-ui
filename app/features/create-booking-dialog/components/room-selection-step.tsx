import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { RoomSelectionFormData } from "~/services/types/forms.types";
import { useCreateBookingStore } from "~/store/create-booking.store";

import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { Skeleton } from "~/components/ui/skeleton";
import { onError, useCalculateNights } from "~/lib/utils";
import {
  useAvailableRoomsInternal,
  useRoomsDetailsByIds,
} from "~/routes/rooms/container/rooms/query.hooks";
import { FormSchema } from "~/services/schema/forms.schema";
import { AvailableRoomTypeCard } from "~/routes/reservation/new-booking/fragments/available-room.card";
import { BreakfastSelection } from "~/routes/reservation/new-booking/fragments/breakfast-selection";
import { SelectedRoomsSummary } from "~/routes/reservation/new-booking/fragments/selected-rooms";
import AddServiceDialog from "~/features/order-dialog";

interface RoomSelectionStepProps {
  onNext: () => void;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

export function RoomSelectionStep({ onNext, formRef }: RoomSelectionStepProps) {
  const { data: storeData, setData } = useCreateBookingStore();
  const { RoomSelectionFormSchema } = FormSchema;
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);

  const form = useForm<RoomSelectionFormData>({
    resolver: zodResolver(RoomSelectionFormSchema),
    defaultValues: {
      roomIds: storeData.roomIds ?? [],
      isBreakfastAll: storeData.isBreakfastAll ?? false,
      breakfastDates: storeData.breakfastDates
        ? storeData.breakfastDates.map((d) =>
            d instanceof Date ? d : new Date(d)
          )
        : [],
    },
  });

  const selectedRoomIds = form.watch("roomIds") || [];

  const nights = useCalculateNights({
    checkinDate: storeData.checkinDate,
    checkoutDate: storeData.checkoutDate,
  });

  const { data: availableRooms, isPending } = useAvailableRoomsInternal({
    CheckInDate: format(storeData.checkinDate!, "yyyy-MM-dd"),
    CheckOutDate: format(storeData.checkoutDate!, "yyyy-MM-dd"),
    Guests: Number(storeData.adultsAmount!) + Number(storeData.childrenAmount!),
  });

  // Sync form with store
  useEffect(() => {
    form.reset({
      roomIds: storeData.roomIds ?? [],
      isBreakfastAll: storeData.isBreakfastAll ?? false,
      breakfastDates: storeData.breakfastDates
        ? storeData.breakfastDates.map((d) =>
            d instanceof Date ? d : new Date(d)
          )
        : [],
    });
  }, [storeData, form]);

  // Validate selected rooms are still available
  useEffect(() => {
    if (!availableRooms || isPending) return;

    const currentRoomIds = form.getValues("roomIds") || [];
    if (currentRoomIds.length === 0) return;

    const availableRoomIds = new Set<string>();
    availableRooms.forEach((roomType) => {
      roomType.availableRooms.forEach((room) => {
        availableRoomIds.add(room.roomId);
      });
    });

    const validRoomIds = currentRoomIds.filter((id) =>
      availableRoomIds.has(id)
    );

    if (validRoomIds.length !== currentRoomIds.length) {
      form.setValue("roomIds", validRoomIds, {
        shouldValidate: true,
        shouldDirty: true,
      });

      const removedCount = currentRoomIds.length - validRoomIds.length;
      toast.warning(
        `${removedCount} phòng đã chọn không còn khả dụng và đã bị xóa`
      );
    }
  }, [availableRooms, isPending, form]);

  const { data: selectedRoomDetails } = useRoomsDetailsByIds(selectedRoomIds);

  const selectedRooms = useMemo(() => {
    if (selectedRoomDetails && selectedRoomDetails.length > 0) {
      return selectedRoomDetails.map((d) => ({
        roomId: d.roomId,
        roomName: d.roomName,
        roomTypeName: d.roomTypeName,
        baseRatePerNight: d.dailyPrice,
      }));
    }
    if (!availableRooms) return [];
    return selectedRoomIds
      .map((roomId) => {
        for (const roomType of availableRooms) {
          const matchingRoom = roomType.availableRooms.find(
            (r) => r.roomId === roomId
          );
          if (matchingRoom) {
            return {
              roomId: matchingRoom.roomId,
              roomName: matchingRoom.roomName,
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
  }, [selectedRoomIds, selectedRoomDetails, availableRooms]);

  const handleToggleRoom = (roomId: string) => {
    const current = form.getValues("roomIds") || [];
    const set = new Set(current as string[]);
    if (set.has(roomId)) set.delete(roomId);
    else set.add(roomId);
    const updatedRoomIds = Array.from(set);
    form.setValue("roomIds", updatedRoomIds, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setData({ roomIds: updatedRoomIds });
  };

  const handleRemoveRoom = (roomId: string) => {
    const current = form.getValues("roomIds") || [];
    const updatedRoomIds = (current as string[]).filter((id) => id !== roomId);
    form.setValue("roomIds", updatedRoomIds, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setData({ roomIds: updatedRoomIds });
  };

  const onSubmit = (data: RoomSelectionFormData) => {
    const validRoomIds = form.getValues("roomIds") || [];

    if (availableRooms) {
      const availableRoomIds = new Set<string>();
      availableRooms.forEach((roomType) => {
        roomType.availableRooms.forEach((room) => {
          availableRoomIds.add(room.roomId);
        });
      });

      const finalValidRoomIds = validRoomIds.filter((id) =>
        availableRoomIds.has(id)
      );

      if (finalValidRoomIds.length !== validRoomIds.length) {
        toast.error("Một số phòng không còn khả dụng. Vui lòng chọn lại.");
        form.setValue("roomIds", finalValidRoomIds);
        return;
      }
    }

    setData({
      roomIds: validRoomIds,
      isBreakfastAll: data.isBreakfastAll,
      breakfastDates: data.breakfastDates?.map((i) => new Date(i)) || [],
    });

    toast.success("Đã lưu thông tin phòng");
    onNext();
  };

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="space-y-6"
      >
        {/* Header Info */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {nights} đêm lưu trú •{" "}
            {availableRooms?.reduce(
              (total, curr) => total + curr.availableCount,
              0
            ) || 0}{" "}
            phòng trống
          </p>
          {selectedRoomIds.length > 0 && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setServiceDialogOpen(true)}
              >
                Thêm dịch vụ
              </Button>
              <AddServiceDialog
                open={serviceDialogOpen}
                onOpenChange={setServiceDialogOpen}
                customerName={storeData.guestFullName}
              />
            </>
          )}
        </div>

        {/* Room Selection Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Available Rooms List */}
          <div className="lg:col-span-2 space-y-2">
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
              <>
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
                {form.formState.errors.roomIds && (
                  <p className="text-sm text-destructive mt-2">
                    {form.formState.errors.roomIds.message as string}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Selected Rooms Summary & Breakfast */}
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
      </form>
    </Form>
  );
}
