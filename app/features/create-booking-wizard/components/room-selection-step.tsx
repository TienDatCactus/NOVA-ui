import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, CircleX, Loader, Users } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Card } from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useCalculateNights } from "~/lib/utils";
import { useAvailableRoomsInternal } from "~/routes/rooms/container/rooms/query.hooks";
import { useCreateBookingStore } from "~/store/create-booking.store";
import { AvailableRoomTypeCard } from "../fragments/available-room.card";

const RoomSelectionSchema = z.object({
  dateRange: z
    .object({
      from: z.date({ message: "Vui lòng chọn ngày nhận phòng" }),
      to: z.date({ message: "Vui lòng chọn ngày trả phòng" }),
    })
    .refine((data) => data.to > data.from, {
      message: "Ngày trả phòng phải sau ngày nhận phòng",
    }),
  roomIds: z
    .array(z.string())
    .min(1, "Vui lòng chọn ít nhất 1 phòng")
    .max(10, "Chỉ được chọn tối đa 10 phòng"),
});

type RoomSelectionFormData = z.infer<typeof RoomSelectionSchema>;

interface RoomSelectionStepProps {
  onNext: () => void;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

function onError(errors: any) {
  console.error("Form validation errors:", errors);
}

export function RoomSelectionStep({ onNext, formRef }: RoomSelectionStepProps) {
  const { data: bookingData, setData } = useCreateBookingStore();

  const form = useForm<RoomSelectionFormData>({
    resolver: zodResolver(RoomSelectionSchema),
    defaultValues: {
      dateRange: {
        from: bookingData.checkinDate
          ? new Date(bookingData.checkinDate)
          : undefined,
        to: bookingData.checkoutDate
          ? new Date(bookingData.checkoutDate)
          : undefined,
      },
      roomIds: bookingData.roomIds ?? [],
    },
  });

  const dateRange = form.watch("dateRange");
  const selectedRoomIds = form.watch("roomIds") || [];

  const nights = useCalculateNights({
    checkinDate: dateRange?.from,
    checkoutDate: dateRange?.to,
  });

  const { data: availableRooms, isPending } = useAvailableRoomsInternal({
    CheckInDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "",
    CheckOutDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "",
    Guests:
      Number(bookingData.adultsAmount || 1) +
      Number(bookingData.childrenAmount || 0),
  });

  // Calculate guest capacity validation
  const capacityValidation = useMemo(() => {
    const totalGuests =
      Number(bookingData.adultsAmount || 1) +
      Number(bookingData.childrenAmount || 0);

    if (!availableRooms || selectedRoomIds.length === 0) {
      return {
        totalGuests,
        totalCapacity: 0,
        isValid: true, // No validation if no rooms selected yet
        deficit: 0,
      };
    }

    // Calculate total capacity of selected rooms
    let totalCapacity = 0;
    availableRooms.forEach((roomType) => {
      const selectedRoomsInType = roomType.availableRooms.filter((room) =>
        selectedRoomIds.includes(room.roomId)
      );
      totalCapacity += selectedRoomsInType.length * roomType.maxOccupancy;
    });

    const isValid = totalGuests <= totalCapacity;
    const deficit = totalGuests - totalCapacity;

    return {
      totalGuests,
      totalCapacity,
      isValid,
      deficit,
    };
  }, [availableRooms, selectedRoomIds, bookingData]);

  // Sync form with store
  useEffect(() => {
    const currentFormData = form.getValues();
    const hasDateRange =
      currentFormData.dateRange?.from && currentFormData.dateRange?.to;

    // Only reset if form is empty (initial mount)
    if (!hasDateRange) {
      form.reset({
        dateRange: {
          from: bookingData.checkinDate
            ? new Date(bookingData.checkinDate)
            : undefined,
          to: bookingData.checkoutDate
            ? new Date(bookingData.checkoutDate)
            : undefined,
        },
        roomIds: bookingData.roomIds ?? [],
      });
    }
  }, []);

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

    // Update form state
    form.setValue("roomIds", updatedRoomIds, {
      shouldValidate: true,
      shouldDirty: true,
    });

    // Update store - preserve existing date range
    setData({
      roomIds: updatedRoomIds,
      checkinDate: form.getValues("dateRange.from"),
      checkoutDate: form.getValues("dateRange.to"),
    });
  };

  const onSubmit = (data: RoomSelectionFormData) => {
    // Validation 1: Check date range
    if (!data.dateRange?.from || !data.dateRange?.to) {
      toast.error("Vui lòng chọn ngày nhận và trả phòng");
      form.setError("dateRange", {
        message: "Vui lòng chọn ngày nhận và trả phòng",
      });
      return;
    }

    if (data.dateRange.to <= data.dateRange.from) {
      toast.error("Ngày trả phòng phải sau ngày nhận phòng");
      form.setError("dateRange", {
        message: "Ngày trả phòng phải sau ngày nhận phòng",
      });
      return;
    }

    // Validation 2: Check if dates are in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (data.dateRange.from < today) {
      toast.error("Không thể chọn ngày trong quá khứ");
      form.setError("dateRange", {
        message: "Không thể chọn ngày trong quá khứ",
      });
      return;
    }

    // Validation 3: Check rooms selected
    const validRoomIds = form.getValues("roomIds") || [];
    if (validRoomIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 phòng");
      form.setError("roomIds", {
        message: "Vui lòng chọn ít nhất 1 phòng",
      });
      return;
    }

    // Validation 4: Check room availability
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

    // Validation 5: Check guest capacity (CRITICAL)
    if (!capacityValidation.isValid) {
      toast.error(
        `Số lượng khách (${capacityValidation.totalGuests} người) vượt quá sức chứa của phòng đã chọn (${capacityValidation.totalCapacity} người)`
      );
      form.setError("roomIds", {
        message: `Cần thêm phòng để chứa ${capacityValidation.deficit} người`,
      });
      return;
    }

    // All validations passed
    setData({
      checkinDate: data.dateRange.from,
      checkoutDate: data.dateRange.to,
      roomIds: validRoomIds,
    });

    toast.success("Đã lưu thông tin phòng");
    onNext();
  };

  const totalAvailableRooms = useMemo(() => {
    if (!availableRooms) return 0;
    return availableRooms.reduce(
      (sum, roomType) => sum + roomType.availableCount,
      0
    );
  }, [availableRooms]);

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="space-y-6"
      >
        {/* Header Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {nights} đêm lưu trú • {totalAvailableRooms} phòng trống
            </p>
            {selectedRoomIds.length > 0 && (
              <Badge variant="default" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {capacityValidation.totalGuests} khách • Sức chứa:{" "}
                {capacityValidation.totalCapacity} người
              </Badge>
            )}
          </div>

          <div className="flex items-end gap-2">
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-xs text-muted-foreground">
                    Ngày nhận - trả phòng
                  </FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="relative"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value?.from && field.value?.to ? (
                            <>
                              {format(field.value.from, "dd/MM/yyyy")} -{" "}
                              {format(field.value.to, "dd/MM/yyyy")}
                            </>
                          ) : (
                            "Chọn ngày"
                          )}
                          <Badge
                            className="absolute -top-3 -right-3 rounded-full"
                            variant="destructive"
                          >
                            !
                          </Badge>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          selected={field.value}
                          onSelect={(range) => {
                            field.onChange(range);
                            // Auto-clear validation errors when date changes
                            if (range?.from && range?.to) {
                              form.clearErrors("dateRange");
                            }
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                          numberOfMonths={2}
                          className="rounded-md border bg-card shadow-sm p-4"
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Capacity Validation Alert - Real-time */}
        {!capacityValidation.isValid && selectedRoomIds.length > 0 && (
          <Alert variant="destructive">
            <CircleX className="h-4 w-4" />
            <AlertTitle>Không đủ sức chứa</AlertTitle>
            <AlertDescription>
              Số lượng khách ({capacityValidation.totalGuests} người) vượt quá
              sức chứa của {selectedRoomIds.length} phòng đã chọn (
              {capacityValidation.totalCapacity} người). Vui lòng chọn thêm{" "}
              phòng để chứa {capacityValidation.deficit} người.
            </AlertDescription>
          </Alert>
        )}

        {/* Form Error - Submit-time */}
        {form.formState.errors.roomIds && (
          <Alert variant="destructive">
            <CircleX className="h-4 w-4" />
            <AlertTitle>Lỗi chọn phòng</AlertTitle>
            <AlertDescription>
              {form.formState.errors.roomIds.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Available Rooms */}
        <div className="space-y-2">
          {isPending ? (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Đang tìm phòng trống...
                </p>
              </div>
            </Card>
          ) : !availableRooms || availableRooms.length === 0 ? (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <CircleX className="h-12 w-12 text-muted-foreground" />
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2">
                    Không có phòng trống
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Vui lòng thử chọn ngày khác
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-4 grid-cols-1 md:grid-cols-2 gap-4 grid">
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
      </form>
    </Form>
  );
}
