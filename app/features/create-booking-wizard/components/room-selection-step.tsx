import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AlertCircle,
  ArrowRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  RotateCcw,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { FormControl, FormField, FormItem } from "~/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Progress } from "~/components/ui/progress";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";

import { cn, useCalculateNights } from "~/lib/utils";
import { useAvailableRoomsInternal } from "~/routes/rooms/container/rooms/query.hooks";
import { AvailableRoomRow } from "../fragments/available-room";

interface RoomSelectionSectionProps {
  form: UseFormReturn<any>;
}

export function RoomSelectionSection({ form }: RoomSelectionSectionProps) {
  // --- 1. DATA WATCHERS ---
  const dateRange = form.watch("dateRange");
  const selectedRoomIds = form.watch("roomIds") || [];
  const adultsAmount = form.watch("adultsAmount") || 1;
  const childrenAmount = form.watch("childrenAmount") || 0;

  // Control when to fetch to prevent spamming API on mount if dates empty
  const [shouldFetch, setShouldFetch] = useState(false);

  // --- 2. COMPUTED VALUES ---
  const nights = useCalculateNights({
    checkinDate: dateRange?.from,
    checkoutDate: dateRange?.to,
  });

  const totalGuestsTarget = Number(adultsAmount) + Number(childrenAmount);

  const {
    data: availableRooms,
    isPending,
    refetch,
  } = useAvailableRoomsInternal(
    {
      CheckInDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "",
      CheckOutDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "",
      Guests: totalGuestsTarget,
    },
    shouldFetch
  );

  const selectionStatus = useMemo(() => {
    if (!availableRooms || selectedRoomIds.length === 0) {
      return {
        currentCapacity: 0,
        isSufficient: false,
        missing: totalGuestsTarget,
        roomCount: 0,
        progress: 0,
      };
    }

    let currentCapacity = 0;
    availableRooms.forEach((roomType) => {
      const selectedRoomsInType = roomType.availableRooms.filter((room) =>
        selectedRoomIds.includes(room.roomId)
      );
      currentCapacity += selectedRoomsInType.length * roomType.maxOccupancy;
    });

    const isSufficient = currentCapacity >= totalGuestsTarget;
    const progress = Math.min((currentCapacity / totalGuestsTarget) * 100, 100);

    return {
      currentCapacity,
      isSufficient,
      missing: Math.max(0, totalGuestsTarget - currentCapacity),
      roomCount: selectedRoomIds.length,
      progress,
    };
  }, [availableRooms, selectedRoomIds, totalGuestsTarget]);

  // --- HANDLERS ---
  const handleToggleRoom = (roomId: string) => {
    const room = availableRooms
      ?.flatMap((rt) => rt.availableRooms)
      .find((r) => r.roomId === roomId);

    if (!room) return;

    if (room.status !== "Ready") {
      toast.error(`Phòng ${room.roomName} không sẵn sàng (${room.status})`);
      return;
    }

    const current = form.getValues("roomIds") || [];
    const set = new Set(current as string[]);
    if (set.has(roomId)) set.delete(roomId);
    else set.add(roomId);

    form.setValue("roomIds", Array.from(set), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    // Outer Container: Full height, flex column for sticky header/footer
    <div className="flex flex-col justify-between rounded-md bg-background flex-1">
      {/* === 1. HEADER (Sticky) === */}
      <div>
        <div className="border-b p-4 bg-background  space-y-4">
          <div className="flex items-center gap-2">
            {/* Date Picker Button */}
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-0">
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-between h-auto py-2 px-3 text-left font-normal bg-background hover:bg-accent/50 transition-colors",
                            !field.value &&
                              "text-muted-foreground border-dashed"
                          )}
                        >
                          <div className="flex flex-col gap-0.5 overflow-hidden">
                            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                              Thời gian lưu trú{" "}
                              {nights > 0 && (
                                <span className="text-primary">
                                  • {nights} đêm
                                </span>
                              )}
                            </span>

                            <div className="flex items-center gap-1.5 text-xs font-semibold truncate">
                              <CalendarIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                              {field.value?.from ? (
                                <div className="flex items-center gap-1">
                                  <span>
                                    {format(field.value.from, "dd/MM", {
                                      locale: vi,
                                    })}
                                  </span>
                                  <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
                                  <span>
                                    {field.value.to
                                      ? format(field.value.to, "dd/MM", {
                                          locale: vi,
                                        })
                                      : "..."}
                                  </span>
                                </div>
                              ) : (
                                <span>Chọn ngày để kiểm tra khả dụng</span>
                              )}
                            </div>
                          </div>
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={field.value}
                        onSelect={(range) => {
                          field.onChange(range);
                        }}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        numberOfMonths={1}
                      />
                      <div className="p-2 border-t flex justify-end">
                        <Button
                          size="sm"
                          className="w-full"
                          disabled={!field.value?.from || !field.value?.to}
                          onClick={() => {
                            setShouldFetch(true);
                            refetch();
                          }}
                        >
                          Kiểm tra phòng trống
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />

            {/* Refresh Button */}
            <Button
              size="icon"
              variant="outline"
              className="h-11 w-11 shrink-0"
              onClick={() => refetch()}
              disabled={isPending || !shouldFetch}
              title="Refresh availability"
            >
              <RotateCcw
                className={cn("h-4 w-4", isPending && "animate-spin")}
              />
            </Button>
          </div>
        </div>

        <div className=" ">
          <ScrollArea className="h-full w-full">
            <div className="flex flex-col w-full pb-20">
              {" "}
              {/* pb-20 for footer space */}
              {/* Loading State */}
              {isPending && !availableRooms && (
                <div className="divide-y p-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 space-y-3">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                  ))}
                </div>
              )}
              {/* Empty State */}
              {!isPending && availableRooms?.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-3 px-6">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 opacity-50" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">
                      No rooms found
                    </p>
                    <p className="text-xs">
                      Try changing your dates or guest count.
                    </p>
                  </div>
                </div>
              )}
              {/* List State */}
              {!isPending && availableRooms && availableRooms.length > 0 && (
                <>
                  {/* Sticky Subheader inside scroll area */}
                  <div className="px-4 py-2 bg-muted/30 border-b flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Loại phòng khả dụng
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {availableRooms.length} types
                    </span>
                  </div>

                  {availableRooms.map((roomType) => (
                    <AvailableRoomRow
                      key={roomType.roomTypeId}
                      roomType={roomType}
                      selectedRoomIds={selectedRoomIds}
                      onToggleRoom={handleToggleRoom}
                      nights={nights}
                    />
                  ))}
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {selectedRoomIds.length > 0 && (
        <div className="shrink-0 border-t sticky bottom-0 bg-background p-3 shadow-md z-20 ">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="text-xs font-medium text-foreground">
              Đã chọn:{" "}
              <span className="text-primary font-bold">
                {selectionStatus.roomCount}
              </span>{" "}
              phòng
            </div>

            <div
              className={cn(
                "text-xs font-semibold flex items-center gap-1.5 transition-colors duration-300",
                selectionStatus.isSufficient
                  ? "text-green-600 dark:text-green-500"
                  : "text-orange-600 dark:text-orange-500"
              )}
            >
              {selectionStatus.isSufficient ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>
                    Đủ chỗ ({selectionStatus.currentCapacity}/
                    {totalGuestsTarget})
                  </span>
                </>
              ) : (
                <>
                  <Users className="h-3.5 w-3.5" />
                  <span>Thiếu {selectionStatus.missing} chỗ</span>
                </>
              )}
            </div>
          </div>

          <Progress
            value={selectionStatus.progress}
            className={cn(
              "transition-all duration-500 h-1.5 w-full bg-muted",
              selectionStatus.isSufficient ? "bg-green-500" : "bg-orange-500"
            )}
          />

          {/* Warning Message */}
          {!selectionStatus.isSufficient && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1.5 font-medium animate-pulse">
              Vui chọn thêm phòng để đủ chỗ cho {totalGuestsTarget} khách.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
