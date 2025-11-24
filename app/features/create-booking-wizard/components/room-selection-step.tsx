import { useMemo, useState, useEffect } from "react";
import { type UseFormReturn } from "react-hook-form";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  Calendar as CalendarIcon,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { FormControl, FormField, FormItem } from "~/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Progress } from "~/components/ui/progress";
import { Skeleton } from "~/components/ui/skeleton"; // Cần import Skeleton

import { cn, useCalculateNights } from "~/lib/utils";
import { useAvailableRoomsInternal } from "~/routes/rooms/container/rooms/query.hooks";
import { AvailableRoomRow } from "../fragments/available-room.card";

interface RoomSelectionSectionProps {
  form: UseFormReturn<any>;
}

export function RoomSelectionSection({ form }: RoomSelectionSectionProps) {
  // --- 1. DATA WATCHERS ---
  const dateRange = form.watch("dateRange");
  const selectedRoomIds = form.watch("roomIds") || [];
  const adultsAmount = form.watch("adultsAmount") || 1;
  const childrenAmount = form.watch("childrenAmount") || 0;

  const [shouldFetch, setShouldFetch] = useState(false);

  // --- 2. COMPUTED VALUES ---
  const nights = useCalculateNights({
    checkinDate: dateRange?.from,
    checkoutDate: dateRange?.to,
  });

  const totalGuestsTarget = Number(adultsAmount) + Number(childrenAmount);

  // --- 3. API FETCHING ---
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

  // Initial Fetch
  useEffect(() => {
    if (dateRange?.from && dateRange?.to && !shouldFetch) {
      setShouldFetch(true);
    }
  }, []);

  // --- 4. LOGIC: Capacity & Auto-Remove ---
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

    const validRoomIds = currentRoomIds.filter((id: string) =>
      availableRoomIds.has(id)
    );

    if (validRoomIds.length !== currentRoomIds.length) {
      const removedCount = currentRoomIds.length - validRoomIds.length;
      form.setValue("roomIds", validRoomIds, {
        shouldValidate: true,
        shouldDirty: true,
      });
      toast.warning(`Đã gỡ ${removedCount} phòng do không khả dụng.`);
    }
  }, [availableRooms, isPending, form]);

  const handleToggleRoom = (roomId: string) => {
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
    // Outer Container: Clean, no internal background, fits neatly into drawer/modal
    <div className="flex flex-col h-full relative overflow-hidden bg-background">
      {/* === HEADER: COMPACT & FUNCTIONAL === */}
      <div className="shrink-0 border-b p-3 bg-background/50 backdrop-blur-sm z-10 space-y-3">
        <div className="flex items-center gap-2">
          {/* Date Picker: Compact Style */}
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
                          "w-full justify-between h-auto py-2 px-3 text-left font-normal bg-background hover:bg-accent/50",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <div className="flex flex-col gap-0.5 overflow-hidden">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                            Thời gian lưu trú {nights > 0 && `(${nights} đêm)`}
                          </span>

                          <div className="flex items-center gap-1.5 text-sm font-semibold truncate">
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
                              <span>Chọn ngày</span>
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
                        if (!range?.from || !range?.to) setShouldFetch(false);
                      }}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      numberOfMonths={1} // Show 1 month only for small screens
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
                        Áp dụng
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
            className="h-10 w-10 shrink-0"
            onClick={() => refetch()}
            disabled={isPending}
          >
            <RotateCcw className={cn("h-4 w-4", isPending && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* === BODY: SCROLLABLE LIST === */}
      <div className="flex-1 min-h-0 relative">
        <ScrollArea className="h-full w-full">
          {isPending && !availableRooms ? (
            // Skeleton Loading State
            <div className="divide-y">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <Skeleton className="h-8 w-full rounded-md" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col w-full pb-20">
              {" "}
              {/* pb-20 prevents content hidden behind footer */}
              {/* Optional Table Header */}
              {availableRooms && availableRooms.length > 0 && (
                <div className="px-4 py-2 bg-muted/30 border-b flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Danh sách phòng
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {availableRooms.length} loại phòng
                  </span>
                </div>
              )}
              {availableRooms?.map((roomType) => (
                <AvailableRoomRow
                  key={roomType.roomTypeId}
                  roomType={roomType}
                  selectedRoomIds={selectedRoomIds}
                  onToggleRoom={handleToggleRoom}
                  nights={nights}
                />
              ))}
              {availableRooms?.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-2 mt-8">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 opacity-50" />
                  </div>
                  <p className="text-sm">Không tìm thấy phòng trống.</p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* === FOOTER: COMPACT STATUS BAR === */}
      {selectedRoomIds.length > 0 && (
        <div className="shrink-0 border-t bg-background p-3 shadow-lg z-20 animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="text-xs font-medium text-foreground">
              Đã chọn{" "}
              <span className="text-primary font-bold">
                {selectionStatus.roomCount}
              </span>{" "}
              phòng
            </div>

            <div
              className={cn(
                "text-xs font-semibold flex items-center gap-1.5",
                selectionStatus.isSufficient
                  ? "text-green-600"
                  : "text-orange-600"
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
              "h-1.5 w-full bg-muted",
              selectionStatus.isSufficient ? "bg-green-500" : "bg-orange-500"
            )}
          />
        </div>
      )}
    </div>
  );
}
