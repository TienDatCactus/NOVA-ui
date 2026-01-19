import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftRight, BedDouble, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { TranslationDisplay } from "~/components/translation-display";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel } from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { cn, formatMoney } from "~/lib/utils";
import { useChangeRoomType } from "~/routes/reservation/bookings/container/booking-mutation.hooks";
import { useRoomTypes } from "~/routes/rooms/container/room-types/query.hooks";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import type {
  BookingDetailResponseDto,
  ChangeRoomTypeRequestDto,
} from "~/services/api/booking/dto";

interface ChangeRoomTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingDetail: BookingDetailResponseDto;
}

export function ChangeRoomTypeDialog({
  open,
  onOpenChange,
  bookingDetail,
}: ChangeRoomTypeDialogProps) {
  const { data: roomTypes = [] } = useRoomTypes();
  const { mutate: changeRoomType, isPending } = useChangeRoomType(
    bookingDetail?.id || "",
  );

  const form = useForm<ChangeRoomTypeRequestDto>({
    resolver: zodResolver(BookingSchema.ChangeRoomTypeRequestSchema),
    defaultValues: {
      bookingRoomId: "",
      newRoomTypeId: "",
    },
  });

  const handleSubmit = (data: ChangeRoomTypeRequestDto) => {
    if (!data.bookingRoomId || !data.newRoomTypeId) {
      toast.error("Vui lòng chọn phòng và loại phòng mới");
      return;
    }

    changeRoomType(data, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      },
    });
  };

  const selectedBookingRoomId = form.watch("bookingRoomId");
  const selectedNewRoomTypeId = form.watch("newRoomTypeId");

  // Get current room info
  const getSelectedRoom = () => {
    if (!selectedBookingRoomId) return null;

    if (bookingDetail.roomsByType && bookingDetail.roomsByType.length > 0) {
      for (const typeGroup of bookingDetail.roomsByType) {
        const room = typeGroup.rooms?.find(
          (r) => r.bookingRoomId === selectedBookingRoomId,
        );
        if (room) return { ...room, currentRoomTypeId: typeGroup.roomTypeId };
      }
    }

    const room = bookingDetail.rooms?.find(
      (r) => r.bookingRoomId === selectedBookingRoomId,
    );
    return room ? { ...room, currentRoomTypeId: room.roomTypeId } : null;
  };

  const selectedRoom = getSelectedRoom();

  if (!bookingDetail) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-background">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b bg-muted/10">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl text-primary">
                <div className="p-2 rounded-lg bg-primary/10">
                  <RefreshCw className="h-5 w-5" />
                </div>
                Đổi loại phòng
              </DialogTitle>
              <DialogDescription className="mt-1.5 ml-1">
                Booking:{" "}
                <span className="font-mono font-medium text-foreground">
                  {bookingDetail.bookingCode}
                </span>
              </DialogDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              Giá không thay đổi
            </Badge>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Info Banner */}
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 text-sm text-blue-900">
                <div className="flex gap-2">
                  <div className="shrink-0 mt-0.5">
                    <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">i</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold">Lưu ý quan trọng:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-xs">
                      <li>
                        Giá booking sẽ KHÔNG thay đổi sau khi đổi loại phòng
                      </li>
                      <li>Hệ thống tự động chọn phòng trống của loại mới</li>
                      <li>Ngày checkin/checkout giữ nguyên</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Room Selection */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <FormLabel className="text-sm font-bold text-foreground flex items-center gap-2">
                    <BedDouble className="h-4 w-4 text-primary" />
                    Chọn phòng cần đổi loại
                  </FormLabel>
                  <FormField
                    control={form.control}
                    name="bookingRoomId"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            className={cn(
                              "h-12 transition-colors",
                              !field.value
                                ? "text-muted-foreground border-dashed"
                                : "border-primary/50 bg-primary/5",
                            )}
                          >
                            <SelectValue placeholder="-- Chọn phòng --">
                              {field.value && selectedRoom && (
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                    <BedDouble className="h-4 w-4" />
                                  </div>
                                  <div className="flex flex-col items-start">
                                    <span className="font-medium">
                                      {selectedRoom.roomName}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      <TranslationDisplay
                                        translations={
                                          roomTypes.find(
                                            (rt) =>
                                              rt.id ===
                                              selectedRoom.currentRoomTypeId,
                                          )?.translations
                                        }
                                      />
                                    </span>
                                  </div>
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {bookingDetail.roomsByType &&
                            bookingDetail.roomsByType.length > 0
                              ? bookingDetail.roomsByType.map((typeGroup) => (
                                  <div key={typeGroup.roomTypeId}>
                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                      {typeGroup.roomTypeName}
                                    </div>
                                    {typeGroup.rooms?.map((room) => (
                                      <SelectItem
                                        key={room.bookingRoomId}
                                        value={room.bookingRoomId!}
                                        className="cursor-pointer pl-6"
                                      >
                                        <div className="flex items-center justify-between w-full min-w-[250px]">
                                          <span className="font-medium">
                                            {room.roomName || "Chưa gán phòng"}
                                          </span>
                                          {room.baseRate && (
                                            <Badge
                                              variant="secondary"
                                              className="text-[10px] px-1.5 h-5"
                                            >
                                              {
                                                formatMoney(room.baseRate)
                                                  .vndFormatted
                                              }
                                            </Badge>
                                          )}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </div>
                                ))
                              : bookingDetail.rooms?.map((room) => (
                                  <SelectItem
                                    key={room.bookingRoomId}
                                    value={room.bookingRoomId}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex items-center justify-between w-full min-w-[250px]">
                                      <div>
                                        <div className="font-medium">
                                          {room.roomName}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          <TranslationDisplay
                                            translations={
                                              roomTypes.find(
                                                (rt) =>
                                                  rt.id === room.roomTypeId,
                                              )?.translations
                                            }
                                          />
                                        </div>
                                      </div>
                                      {room.baseRate && (
                                        <Badge
                                          variant="secondary"
                                          className="text-[10px] px-1.5 h-5"
                                        >
                                          {
                                            formatMoney(room.baseRate)
                                              .vndFormatted
                                          }
                                        </Badge>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <FormLabel className="text-sm font-bold text-foreground flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-primary" />
                    Chọn loại phòng mới
                  </FormLabel>
                  <FormField
                    control={form.control}
                    name="newRoomTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!selectedBookingRoomId}
                        >
                          <SelectTrigger
                            className={cn(
                              "h-12 transition-colors",
                              !field.value
                                ? "text-muted-foreground border-dashed"
                                : "border-primary/50 bg-primary/5",
                            )}
                          >
                            <SelectValue placeholder="-- Chọn loại phòng mới --">
                              {field.value && (
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                    <BedDouble className="h-4 w-4" />
                                  </div>
                                  <div className="flex flex-col items-start">
                                    <span className="font-medium">
                                      <TranslationDisplay
                                        translations={
                                          roomTypes.find(
                                            (rt) => rt.id === field.value,
                                          )?.translations
                                        }
                                      />
                                    </span>
                                    {roomTypes.find(
                                      (rt) => rt.id === field.value,
                                    )?.baseRate && (
                                      <span className="text-xs text-muted-foreground">
                                        {
                                          formatMoney(
                                            roomTypes.find(
                                              (rt) => rt.id === field.value,
                                            )!.baseRate,
                                          ).vndFormatted
                                        }{" "}
                                        / đêm
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {roomTypes.length === 0 ? (
                              <div className="p-4 text-sm text-center text-muted-foreground">
                                Không có loại phòng khả dụng
                              </div>
                            ) : (
                              roomTypes
                                .filter(
                                  (rt) =>
                                    rt.id !== selectedRoom?.currentRoomTypeId,
                                )
                                .map((roomType) => (
                                  <SelectItem
                                    key={roomType.id}
                                    value={roomType.id}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex items-center justify-between w-full min-w-[250px]">
                                      <div>
                                        <TranslationDisplay
                                          translations={roomType.translations}
                                        />
                                      </div>
                                      {roomType.baseRate && (
                                        <Badge
                                          variant="outline"
                                          className="text-[10px] px-1.5 h-5"
                                        >
                                          {
                                            formatMoney(roomType.baseRate)
                                              .vndFormatted
                                          }
                                        </Badge>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))
                            )}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Preview if both selected */}
                {selectedBookingRoomId && selectedNewRoomTypeId && (
                  <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <ArrowLeftRight className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-semibold text-green-900">
                          Sẵn sàng đổi loại phòng
                        </p>
                        <p className="text-xs text-green-700">
                          <strong>{selectedRoom?.roomName}</strong> sẽ được đổi
                          sang loại{" "}
                          <strong>
                            <TranslationDisplay
                              translations={
                                roomTypes.find(
                                  (rt) => rt.id === selectedNewRoomTypeId,
                                )?.translations
                              }
                            />
                          </strong>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/10">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}
                disabled={isPending}
                className="text-muted-foreground hover:text-foreground"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={
                  isPending || !selectedBookingRoomId || !selectedNewRoomTypeId
                }
                className="min-w-[160px] shadow-lg shadow-primary/20"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Xác nhận đổi loại
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
