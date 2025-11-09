import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { RoomSelectionFormData } from "~/services/types/forms.types";
import { useCreateBookingStore } from "~/store/create-booking.store";

import { CircleX } from "lucide-react";
import { Alert, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Form } from "~/components/ui/form";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { onError, useCalculateNights } from "~/lib/utils";
import { useAvailableRoomsInternal } from "~/routes/rooms/container/rooms/query.hooks";
import { FormSchema } from "~/services/schema/forms.schema";
import { AvailableRoomTypeCard } from "../fragments/available-room.card";
import RoomItemWrapper from "../fragments/room-item-wrapper";

interface RoomSelectionStepProps {
  onNext: () => void;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

export function RoomSelectionStep({ onNext, formRef }: RoomSelectionStepProps) {
  const { data: storeData, setData } = useCreateBookingStore();
  const { RoomSelectionFormSchema } = FormSchema;

  const form = useForm<RoomSelectionFormData>({
    resolver: zodResolver(RoomSelectionFormSchema),
    defaultValues: {
      roomIds: storeData.roomIds ?? [],
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
        </div>
        {form.formState.errors.roomIds && (
          <Alert variant={"destructive"}>
            <CircleX />
            <AlertTitle>
              {form.formState.errors.roomIds.message as string}
            </AlertTitle>
          </Alert>
        )}

        <div className=" space-y-2">
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
              <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
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
            </>
          )}
        </div>
        <Separator />

        {/* Selected Rooms */}
        {selectedRoomIds.length > 0 && (
          <Card className=" border shadow-sm gap-0">
            <CardHeader className="">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Phòng đã chọn</CardTitle>
                <Badge variant="secondary">
                  {selectedRoomIds.length} phòng
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex gap-2 snap-x w-full overflow-x-auto ">
              {selectedRoomIds.map((roomId) => (
                <RoomItemWrapper key={roomId} roomId={roomId} />
              ))}
            </CardContent>
          </Card>
        )}
      </form>
    </Form>
  );
}
