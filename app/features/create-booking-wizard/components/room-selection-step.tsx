import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  AlertCircle,
  Armchair,
  CalendarIcon,
  CircleX,
  Icon,
  Info,
  Loader,
  Search,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { cn, useCalculateNights } from "~/lib/utils";
import { useAvailableRoomsInternal } from "~/routes/rooms/container/rooms/query.hooks";
import { useCreateBookingStore } from "~/store/create-booking.store";
import { AvailableRoomTypeCard } from "../fragments/available-room.card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "~/components/ui/empty";

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
  const [shouldFetch, setShouldFetch] = useState(false);
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
  const {
    data: availableRooms,
    isPending,
    refetch,
  } = useAvailableRoomsInternal(
    {
      CheckInDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "",
      CheckOutDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "",
      Guests:
        Number(bookingData.adultsAmount || 1) +
        Number(bookingData.childrenAmount || 0),
    },
    shouldFetch
  );

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

  // Initialize form from store once on mount
  useEffect(() => {
    const currentFormData = form.getValues();
    const hasDateRange =
      currentFormData.dateRange?.from && currentFormData.dateRange?.to;

    // Only reset if form is empty (initial mount)
    if (
      !hasDateRange &&
      (bookingData.checkinDate || bookingData.checkoutDate)
    ) {
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
      const removedCount = currentRoomIds.length - validRoomIds.length;

      // Use setTimeout to break the render cycle
      setTimeout(() => {
        form.setValue("roomIds", validRoomIds, {
          shouldValidate: false,
          shouldDirty: true,
        });
        toast.warning(
          `${removedCount} phòng đã chọn không còn khả dụng và đã bị xóa`
        );
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableRooms]);

  const handleToggleRoom = (roomId: string) => {
    const current = form.getValues("roomIds") || [];
    const set = new Set(current as string[]);
    if (set.has(roomId)) set.delete(roomId);
    else set.add(roomId);
    const updatedRoomIds = Array.from(set);

    // Only update form state - store will be updated on submit
    form.setValue("roomIds", updatedRoomIds, {
      shouldValidate: true,
      shouldDirty: true,
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
        className="flex flex-col gap-6"
      >
        {/* --- 1. HEADER & CONTROLS --- */}
        <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
          {/* Top Row: Title & Date Picker */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Chọn phòng nghỉ
              </h2>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Badge variant="secondary" className="font-normal">
                  {nights} đêm lưu trú
                </Badge>
                <span>•</span>
                <span>Tổng {totalAvailableRooms} phòng trống</span>
              </div>
            </div>

            {/* Date Picker Input */}
            <div className="w-full md:w-auto">
              <FormField
                control={form.control}
                name="dateRange"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full md:w-[260px] justify-start text-left font-normal border-2 h-10",
                            !field.value && "text-muted-foreground",
                            // Nếu có lỗi thì viền đỏ
                            form.formState.errors.dateRange &&
                              "border-destructive/50 text-destructive bg-destructive/5"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value?.from ? (
                            field.value.to ? (
                              <>
                                {format(field.value.from, "dd/MM/yyyy")} -{" "}
                                {format(field.value.to, "dd/MM/yyyy")}
                              </>
                            ) : (
                              format(field.value.from, "dd/MM/yyyy")
                            )
                          ) : (
                            <span>Chọn ngày nhận - trả phòng</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="range"
                          selected={field.value}
                          onSelect={(range) => {
                            field.onChange(range);
                            if (range?.from && range?.to) {
                              form.clearErrors("dateRange");
                            }
                          }}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          numberOfMonths={2}
                        />
                        <div className="p-3 border-t bg-gray-50 flex justify-end">
                          <Button
                            size="sm"
                            onClick={() => {
                              setShouldFetch(true);
                              refetch();
                            }}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Search className="mr-2 h-3.5 w-3.5" /> Tìm phòng
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Bottom Row: Validation Summary (Nếu có phòng chọn) */}
          {selectedRoomIds.length > 0 && (
            <div
              className={cn(
                "flex items-center gap-2 rounded-md border p-3 text-sm transition-colors",
                capacityValidation.isValid
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-orange-200 bg-orange-50 text-orange-800"
              )}
            >
              {capacityValidation.isValid ? (
                <Info className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}

              <div className="flex-1 flex flex-wrap items-center gap-x-1">
                <span>
                  Đã chọn cho{" "}
                  <strong>{capacityValidation.totalGuests} khách</strong>.
                </span>
                <span>
                  Sức chứa hiện tại:{" "}
                  <strong>{capacityValidation.totalCapacity}</strong>.
                </span>

                {!capacityValidation.isValid && (
                  <span className="font-semibold underline">
                    Thiếu chỗ cho {capacityValidation.deficit} người nữa.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* --- 2. ERROR STATE (Submit Time) --- */}
        {form.formState.errors.roomIds && (
          <Alert
            variant="destructive"
            className="animate-in fade-in slide-in-from-top-2"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Chưa chọn phòng</AlertTitle>
            <AlertDescription>
              {form.formState.errors.roomIds.message}
            </AlertDescription>
          </Alert>
        )}

        {/* --- 3. ROOM LIST GRID --- */}
        <div className="min-h-[300px]">
          {!availableRooms || availableRooms.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Armchair className="h-12 w-12 " />
                </EmptyMedia>
                <EmptyTitle>Không tìm thấy phòng trống</EmptyTitle>
                <EmptyDescription>
                  Vui lòng thử thay đổi ngày tìm kiếm hoặc kiểm tra lại bộ lọc.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
              {availableRooms.map((roomType: any) => (
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
