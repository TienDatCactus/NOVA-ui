import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CalendarIcon,
  CheckCheck,
  CirclePlus,
  HandPlatter,
  Pen,
  Trash,
  X,
} from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type z from "zod";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormField, FormItem, FormMessage } from "~/components/ui/form";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import ServiceModal from "~/features/service-modal";
import { formatMoney } from "~/lib/utils";
import useBookingSchema from "~/services/schema/booking.schema";
import { useCreateBookingStore } from "~/store/create-booking.store";
import useBookingConfirmation from "../container/booking-confirmation.hooks";

function BookingConfirmation({
  form,
}: {
  form: UseFormReturn<
    z.infer<ReturnType<typeof useBookingSchema>["BookingSchema"]>
  >;
}) {
  const { formData } = useCreateBookingStore();
  const {
    note,
    setNote,
    open,
    toggle,
    costs,
    handleRemoveRoom,
    handleRemoveService,
    handleCheckInChange,
    handleCheckOutChange,
    handleEditRooms,
    handleServiceFinish,
    numberOfNights,
    numberOfBreakfastDays,
  } = useBookingConfirmation({ form });
  return (
    <ScrollArea className="h-300 min-h-0">
      <div className="grid lg:grid-cols-8 grid-cols-1 gap-4">
        <Form {...form}>
          <div className="lg:col-span-5 col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <Alert variant={"info"}>
                  <CheckCheck />
                  <AlertTitle>Đơn đặt phòng đã được lưu lại!</AlertTitle>
                  <AlertDescription>
                    Vui lòng kiểm tra lại thông tin trước khi hoàn tất.
                  </AlertDescription>
                </Alert>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <h1 className="font-bold text-lg ">Thông tin khách hàng</h1>
                  <Button onClick={() => setNote(!note)} variant={"outline"}>
                    <Pen />
                    Ghi chú
                  </Button>
                </div>
                {note && (
                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <Textarea
                          {...field}
                          placeholder="Ghi chú"
                          onBlur={() => {
                            form.setValue("note", field.value);
                          }}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <ul className="grid grid-cols-3 gap-6 my-4">
                  {Object.entries(formData.customerInfo).map(([key, value]) =>
                    value && value.toString().length > 0 ? (
                      <li key={key} className="flex flex-col">
                        <h3 className="text-muted-foreground font-medium text-sm uppercase">
                          {key}
                        </h3>
                        <p className="font-medium">
                          {key === "checkIn" || key === "checkOut"
                            ? format(new Date(value), "PPP", { locale: vi })
                            : typeof value === "object"
                              ? JSON.stringify(value)
                              : value}
                        </p>
                      </li>
                    ) : null
                  )}
                </ul>

                <Separator className="mb-4" />
                <div className="flex items-center justify-between">
                  <h1 className="font-bold text-lg ">Menu & Dịch vụ</h1>
                  <div>
                    <Button onClick={toggle} variant={"gradient"}>
                      <CirclePlus />
                      Thêm
                    </Button>
                  </div>
                </div>
                <ServiceModal
                  open={open}
                  toggle={toggle}
                  onFinish={handleServiceFinish}
                  initialServices={formData.services}
                />
                {formData.services!.length > 0 ? (
                  <div className="grid gap-2 mt-4">
                    {formData.services!.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-2 border rounded-md group relative"
                      >
                        <div>
                          <h3 className="font-medium">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {service.category} - {service.quantity} x{" "}
                            {formatMoney(service.price).vndFormatted}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ">
                          <div className="font-semibold">
                            {
                              formatMoney(service.price * service.quantity)
                                .vndFormatted
                            }
                          </div>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleRemoveService(service.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid place-items-center bg-background/50 border border-dashed rounded-md h-40 my-4">
                    <div>
                      <HandPlatter className="mx-auto mb-2" />
                      <h3 className="font-medium text-lg text-center">
                        Chưa có mục nào
                      </h3>
                      <p className="text-sm text-muted-foreground text-center">
                        Nhấn nút Thêm để tham khảo Menu & Dịch vụ
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </Form>
        <div className="md:col-span-3 col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="font-bold">Thông tin đặt phòng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border p-2 rounded-md space-y-6">
                <div className="grid lg:grid-cols-2 lg:space-y-0 space-y-2 space-x-2 grid-cols-1 max-w-full overflow-auto">
                  <div>
                    <h3 className="text-muted-foreground text-sm uppercase mb-1">
                      Check-in
                    </h3>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-full justify-between"
                        >
                          {format(
                            formData.customerInfo?.checkIn!,
                            "dd MMM, yyyy"
                          )}
                          <CalendarIcon className="ml-2 h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          required
                          mode="single"
                          selected={formData.customerInfo?.checkIn!}
                          onSelect={handleCheckInChange}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <h3 className="text-muted-foreground text-sm uppercase mb-1">
                      Check-out
                    </h3>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-full justify-between"
                        >
                          {format(
                            formData.customerInfo?.checkOut!,
                            "dd MMM, yyyy"
                          )}
                          <CalendarIcon className="ml-2 h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          required
                          mode="single"
                          selected={formData.customerInfo?.checkOut!}
                          onSelect={handleCheckOutChange}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-muted-foreground text-sm uppercase mb-1">
                      Số ngày lưu trú
                    </h3>
                    <p className="font-medium">{numberOfNights} ngày</p>
                  </div>
                  <div>
                    <h3 className="text-muted-foreground text-sm uppercase mb-1">
                      Bữa sáng
                    </h3>
                    <p className="font-medium">
                      {numberOfNights === 0
                        ? "0 ngày"
                        : `${numberOfBreakfastDays / numberOfNights} ngày`}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-muted-foreground text-sm uppercase mb-1">
                    Các phòng đã chọn
                  </h3>
                  <ul className="list-decimal list-inside ">
                    {formData.roomSelection?.rooms?.map((room: any) => (
                      <div className="flex items-center justify-between">
                        <li key={room.roomId} className="font-medium">
                          {room.roomName} x {room.quantity}
                        </li>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveRoom(room.roomId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </ul>
                  <Button
                    variant="link"
                    className="p-0 text-primary"
                    onClick={handleEditRooms}
                  >
                    Chỉnh sửa phòng đã chọn
                  </Button>
                </div>
              </div>
              <Separator className="my-2" />
              <h1 className="font-bold text-lg ">Tổng chi phí</h1>
              <ul className="*:text-sm space-y-2 my-4 mb-6">
                <li className="flex justify-between">
                  <span>Phòng :</span>
                  <span>{formatMoney(costs.roomCost).vndFormatted}</span>
                </li>
                <li className="flex justify-between">
                  <span>Dịch vụ :</span>
                  <span>{formatMoney(costs.serviceCost).vndFormatted}</span>
                </li>
                <li className="flex justify-between">
                  <span>VAT :</span>
                  <span>{formatMoney(costs.vatCost).vndFormatted}</span>
                </li>
              </ul>
              <div className="flex justify-between font-medium text-xl text-primary">
                <span>Tổng cộng</span>
                <span className="font-semibold">
                  {formatMoney(costs.totalCost).vndFormatted}
                </span>
              </div>
              <Button className="my-2 w-full " variant={"gradient"}>
                In hóa đơn tạm tính
              </Button>
              <p className="text-sm text-muted-foreground italic text-center">
                by Tien Dat.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}

export default BookingConfirmation;
