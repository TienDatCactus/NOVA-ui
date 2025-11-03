import { format, parseISO } from "date-fns";
import { Minus, Plus, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { SelectGroup } from "@radix-ui/react-select";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { DatePicker } from "~/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import { cn, handleLimitInput, toYMD } from "~/lib/utils";
import { useAvailableRoomsInternal } from "~/routes/rooms/container/rooms/query.hooks";
import type {
  BookingDetailResponseDto,
  StaffUpdateBookingRequestDto,
} from "~/services/api/booking/dto";
import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
} from "~/services/types/payment.types";
import { useOTAInfo } from "../../new-booking/container/create-booking-query.hooks";
import { useUpdateBooking } from "../container/booking-mutation.hooks";

interface UpdateBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingDetail: BookingDetailResponseDto;
}

export default function UpdateBookingDialog({
  open,
  onOpenChange,
  bookingDetail,
}: UpdateBookingDialogProps) {
  const bookingId = bookingDetail?.id || "";
  const { mutate: updateBooking, isPending } = useUpdateBooking(bookingId);
  const { data: availableRoomTypes } = useAvailableRoomsInternal({
    CheckInDate: format(bookingDetail.checkinDate!, "yyyy-MM-dd"),
    CheckOutDate: format(bookingDetail.checkoutDate!, "yyyy-MM-dd"),
    Guests: bookingDetail.adults + (bookingDetail.children || 0),
  });
  const form = useForm<StaffUpdateBookingRequestDto>({
    defaultValues: {
      checkinDate: new Date(),
      checkoutDate: new Date(),
      adultsAmount: 1,
      childrenAmount: 0,
      note: "",
      otaBookingCode: "",
      otaInformationId: "",
      totalAmount: 0,
      paidAmount: 0,
      rooms: [],
    },
  });

  const { fields, append } = useFieldArray({
    control: form.control,
    name: "rooms",
  });

  useEffect(() => {
    if (bookingDetail && open) {
      form.reset({
        checkinDate: parseISO(bookingDetail.checkinDate),
        checkoutDate: parseISO(bookingDetail.checkoutDate),
        adultsAmount: bookingDetail.adults,
        childrenAmount: bookingDetail.children || 0,
        note: bookingDetail.note || "",
        otaBookingCode: "",
        otaInformationId: "",
        customerId: bookingDetail.customer.id,
        paymentMethod: bookingDetail.paymentMethod ?? undefined,
        paymentStatus: bookingDetail.paymentStatus ?? undefined,
        totalAmount: bookingDetail.totalAmount,
        paidAmount: bookingDetail.paidAmount || 0,
        rooms: bookingDetail.rooms.map((r) => ({
          bookingRoomId: bookingDetail.id,
          roomId: r.roomId,
          fromDate: r.fromDate,
          toDate: r.toDate,
          remove: false,
        })),
      });
    }
  }, [bookingDetail, open, form]);
  const { data: OTAList } = useOTAInfo({
    selection: true,
  });
  const handleSubmit = (data: StaffUpdateBookingRequestDto) => {
    const payload = {
      ...data,
      checkinDate:
        data.checkinDate instanceof Date
          ? toYMD(data.checkinDate)
          : data.checkinDate,
      checkoutDate:
        data.checkoutDate instanceof Date
          ? toYMD(data.checkoutDate)
          : data.checkoutDate,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus,
    };

    updateBooking(payload as any, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const remainingBalance = useMemo(() => {
    const total = form.watch("totalAmount") || 0;
    const paid = form.watch("paidAmount") || 0;
    return total - paid;
  }, [form.watch("totalAmount"), form.watch("paidAmount")]);

  if (!bookingDetail) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cập nhật đặt phòng</DialogTitle>
          <DialogDescription>
            Mã đặt phòng: {bookingDetail.bookingCode}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
                <TabsTrigger value="rooms">Phòng</TabsTrigger>
                <TabsTrigger value="payment">Thanh toán</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="checkinDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Ngày nhận phòng</FormLabel>
                        <FormControl>
                          <DatePicker {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="checkoutDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Ngày trả phòng</FormLabel>
                        <FormControl>
                          <DatePicker {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="adultsAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số người lớn</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                field.onChange(Math.max(1, field.value - 1))
                              }
                              disabled={field.value <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              onInput={handleLimitInput}
                              {...field}
                              className="text-center"
                              min={1}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => field.onChange(field.value + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="childrenAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số trẻ em</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                field.onChange(
                                  Math.max(0, (field.value || 0) - 1)
                                )
                              }
                              disabled={(field.value || 0) <= 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              onInput={handleLimitInput}
                              {...field}
                              className="text-center"
                              min={0}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                field.onChange((field.value || 0) + 1)
                              }
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ghi chú</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Ghi chú về đặt phòng..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 items-start gap-4">
                  <FormField
                    control={form.control}
                    name="otaBookingCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã đặt phòng OTA</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nhập mã OTA..." />
                        </FormControl>
                        <FormDescription>
                          Nếu đặt qua OTA (Booking.com, Agoda, v.v.)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="otaInformationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kênh đặt phòng OTA</FormLabel>
                        <FormControl>
                          <Select {...field}>
                            <SelectTrigger className="w-full " size="lg">
                              <SelectValue placeholder="Chọn kênh OTA" />
                            </SelectTrigger>
                            <SelectContent>
                              {!!OTAList &&
                                OTAList.length > 0 &&
                                OTAList.map((ota) => (
                                  <SelectItem key={ota.id} value={ota.id}>
                                    {ota.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="rooms" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Danh sách phòng ({fields.length})
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      availableRoomTypes && availableRoomTypes.length > 0
                        ? append({
                            roomId: "",
                            fromDate: format(new Date(), "yyyy-MM-dd"),
                            toDate: format(new Date(), "yyyy-MM-dd"),
                            remove: false,
                          })
                        : toast.error("Không có phòng trống để thêm")
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm phòng
                  </Button>
                </div>
                {fields.length === 0 ? (
                  <Card className="p-6 text-center text-muted-foreground">
                    Chưa có phòng nào. Nhấn "Thêm phòng" để bắt đầu.
                  </Card>
                ) : (
                  <div className="space-y-3">
                    <Label>Phòng hiện tại</Label>
                    {!!bookingDetail.rooms &&
                      bookingDetail.rooms.length > 0 &&
                      bookingDetail.rooms.map((room, index) => (
                        <>
                          <Card key={index} className="p-2 shadow-s">
                            <div className="flex items-start gap-4">
                              <div
                                className="flex-1 grid grid-cols-3 items-end
                          gap-3"
                              >
                                <div>
                                  <Label>Phòng</Label>
                                  <Input value={room.roomName} disabled />
                                </div>

                                <div>
                                  <Label>Từ ngày</Label>
                                  <DatePicker disabled value={room.fromDate} />
                                </div>

                                <div>
                                  <Label>Đến ngày</Label>
                                  <DatePicker disabled value={room.toDate} />
                                </div>
                              </div>
                            </div>
                          </Card>
                        </>
                      ))}
                    <Separator />
                    <Label>Phòng mới</Label>
                    {fields.map((field, index) => (
                      <>
                        <Card key={field.id} className="p-2 shadow-s">
                          <div className="flex items-start gap-4">
                            <div
                              className="flex-1 grid grid-cols-7 items-end
                             gap-3"
                            >
                              <FormField
                                control={form.control}
                                name={`rooms.${index}.roomId`}
                                render={({ field }) => (
                                  <FormItem className="col-span-2">
                                    <FormLabel>Phòng</FormLabel>
                                    <FormControl>
                                      <Select
                                        {...field}
                                        onValueChange={field.onChange}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Chọn phòng" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {!!availableRoomTypes &&
                                            availableRoomTypes.length > 0 &&
                                            availableRoomTypes?.map((r) => (
                                              <SelectGroup key={r.roomTypeId}>
                                                {r.availableRooms.map(
                                                  (room) => (
                                                    <SelectItem
                                                      key={room.roomId}
                                                      value={room.roomId}
                                                    >
                                                      {room.roomName}
                                                    </SelectItem>
                                                  )
                                                )}
                                              </SelectGroup>
                                            ))}
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`rooms.${index}.fromDate`}
                                render={({ field }) => (
                                  <FormItem className="col-span-2">
                                    <FormLabel>Từ ngày</FormLabel>
                                    <FormControl>
                                      <DatePicker {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`rooms.${index}.toDate`}
                                render={({ field }) => (
                                  <FormItem className="col-span-2">
                                    <FormLabel>Đến ngày</FormLabel>
                                    <FormControl>
                                      <DatePicker {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <div className="flex justify-center">
                                <FormField
                                  control={form.control}
                                  name={`rooms.${index}.remove`}
                                  render={({ field }) => (
                                    <FormItem className="flex flex-col items-center">
                                      <FormLabel className="text-xs">
                                        Xóa
                                      </FormLabel>
                                      <FormControl>
                                        <Button
                                          type="button"
                                          variant={
                                            field.value
                                              ? "destructive"
                                              : "outline"
                                          }
                                          size="icon"
                                          onClick={() => {
                                            if (field.value) {
                                              field.onChange(false);
                                            } else {
                                              field.onChange(true);
                                            }
                                          }}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        </Card>
                        {form.watch(`rooms.${index}.remove`) && (
                          <div className="mt-2 text-sm text-destructive">
                            Phòng này sẽ bị xóa khỏi đặt phòng
                          </div>
                        )}
                      </>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Payment Tab */}
              <TabsContent value="payment" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phương thức thanh toán</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value?.toString() || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn phương thức" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PAYMENT_METHODS.map((method) => (
                              <SelectItem
                                key={method.value}
                                value={method.value}
                              >
                                {method.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trạng thái thanh toán</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value?.toString() || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PAYMENT_STATUSES.map((status) => (
                              <SelectItem key={status.value} value={status.key}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="totalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tổng tiền</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            onInput={handleLimitInput}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                            min={0}
                            step={1000}
                          />
                        </FormControl>
                        <FormDescription>
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(field.value || 0)}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paidAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Đã thanh toán</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            onInput={handleLimitInput}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                            min={0}
                            step={1000}
                          />
                        </FormControl>
                        <FormDescription>
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(field.value || 0)}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Card className="p-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Còn lại:</span>
                    <span
                      className={cn(
                        "text-lg font-bold",
                        remainingBalance > 0 && "text-destructive",
                        remainingBalance < 0 && "text-green-600",
                        remainingBalance === 0 && "text-muted-foreground"
                      )}
                    >
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(remainingBalance)}
                    </span>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang lưu..." : "Cập nhật"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
