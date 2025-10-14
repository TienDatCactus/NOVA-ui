import { format, intervalToDuration } from "date-fns";
import {
  CalendarIcon,
  CheckCheck,
  CirclePlus,
  HandPlatter,
} from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import ServiceModal from "~/features/service-modal";
import { useCreateBookingStore } from "~/store/create-booking.store";

function BookingConfirmation({ form }: { form: UseFormReturn<any> }) {
  const [open, setOpen] = useState(false);
  function toggle() {
    setOpen(!open);
  }
  const { formData } = useCreateBookingStore();

  return (
    <ScrollArea className="h-300 min-h-0">
      <div className="grid lg:grid-cols-8 grid-cols-1 gap-4">
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
              <h1 className="font-bold text-lg ">Thông tin khách hàng</h1>
              <ul className="grid grid-cols-3 space-y-10 my-4">
                {Object.entries(formData).map(([key, value]) => (
                  <li key={key} className="flex flex-col ">
                    <h3 className="text-muted-foreground font-medium text-sm uppercase">
                      {key}
                    </h3>
                    <p className="font-medium">
                      {typeof value === "string"
                        ? value
                        : JSON.stringify(value)}
                    </p>
                  </li>
                ))}
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
              <ServiceModal open={open} toggle={toggle} />
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
              <div className="bg-primary-foreground border rounded-md my-4"></div>
            </CardContent>
          </Card>
        </div>
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
                          className="w-full justify-start"
                        >
                          {format(
                            formData.customerInfo?.checkIn ?? new Date(),
                            "PPP"
                          )}
                          <CalendarIcon className="ml-2 h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          // selected={field.value}
                          // onSelect={field.onChange}
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
                          className="w-full justify-start"
                        >
                          {format(
                            formData.customerInfo?.checkOut ?? new Date(),
                            "PPP"
                          )}
                          <CalendarIcon className="ml-2 h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          // selected={field.value}
                          // onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <h3 className="text-muted-foreground text-sm uppercase mb-1">
                  Số ngày lưu trú
                </h3>
                <p className="font-medium">
                  {intervalToDuration({
                    start: formData.customerInfo?.checkIn as unknown as Date,
                    end: formData.customerInfo?.checkOut as unknown as Date,
                  }).days || 0}{" "}
                  ngày
                </p>
                <div>
                  <h3 className="text-muted-foreground text-sm uppercase mb-1">
                    {/* change if only 1 room */}
                    Các phòng đã chọn
                  </h3>
                  <ul className="list-decimal list-inside ">
                    <li className="font-medium">
                      Phòng Deluxe 1 giường đôi x 2 phòng
                    </li>
                  </ul>
                  <Button variant="link" className="p-0 text-primary">
                    Chỉnh sửa phòng đã chọn
                  </Button>
                </div>
              </div>
              <Separator className="my-2" />
              <h1 className="font-bold text-lg ">Tổng chi phí</h1>
              <ul className="*:text-sm space-y-2 my-4 mb-6">
                <li className="flex justify-between">
                  <span>Phòng :</span>
                  <span>2.000.000đ</span>
                </li>
                <li className="flex justify-between">
                  <span>Dịch vụ :</span>
                  <span>2.000.000đ</span>
                </li>
                <li className="flex justify-between">
                  <span>VAT :</span>
                  <span>2.000.000đ</span>
                </li>
              </ul>
              <div className="flex justify-between font-medium text-xl text-primary">
                <span>Tổng cộng</span>
                <span className="font-semibold">2.000.000đ</span>
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
