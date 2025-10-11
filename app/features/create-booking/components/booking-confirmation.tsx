import { format, intervalToDuration } from "date-fns";
import { CalendarIcon, CheckCheck, HandPlatter } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DialogFooter } from "~/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";

function BookingConfirmation() {
  const guestDetails = {
    "Tên khách": "Nguyễn Văn A",
    "Địa chỉ email": "nguyenvana@example.com",
    "Số điện thoại": "0123456789",
    "Ngày Check-in": "2024-10-01",
    "Ngày Check-out": "2024-10-04",
    "Kênh đặt phòng": "Direct",
    "Mã đặt phòng": "#ABC123",
  };
  return (
    <>
      <ScrollArea className="h-300 min-h-0">
        <div className="grid lg:grid-cols-8 grid-cols-1 gap-4">
          <div className="lg:col-span-5 col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <Alert variant={"success"}>
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
                  {Object.entries(guestDetails).map(([key, value]) => (
                    <li key={key} className="flex flex-col ">
                      <h3 className="text-muted-foreground font-medium text-sm uppercase">
                        {key}
                      </h3>
                      <p className="font-medium">{value}</p>
                    </li>
                  ))}
                </ul>
                <Separator className="mb-4" />
                <h1 className="font-bold text-lg ">Dịch vụ và tiện nghi</h1>
                <div className="bg-accent border rounded-md my-4">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon" className="bg-white">
                        <HandPlatter />
                      </EmptyMedia>
                      <EmptyTitle>Chưa có dịch vụ nào</EmptyTitle>
                      <EmptyDescription>
                        Bạn chưa thêm dịch vụ nào vào hóa đơn.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <div className="flex gap-2">
                        <Button>Thêm dịch vụ</Button>
                      </div>
                    </EmptyContent>
                  </Empty>
                </div>
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
                            {format(guestDetails["Ngày Check-in"], "PPP")}
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
                            {format(guestDetails["Ngày Check-out"], "PPP")}
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
                      start: guestDetails["Ngày Check-in"] as unknown as Date,
                      end: guestDetails["Ngày Check-out"] as unknown as Date,
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
                    <Button variant="link" className="p-0 text-purple-800">
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
                <div className="flex justify-between font-medium text-xl text-green-600">
                  <span>Tổng cộng</span>
                  <span className="font-semibold">2.000.000đ</span>
                </div>
                <Button className="my-2 w-full " variant={"success"}>
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
      <DialogFooter>
        <div className="flex gap-2 items-center">
          <Button variant="outline">Quay lại</Button>
          <Button variant={"success"}>Hoàn tất</Button>
        </div>
      </DialogFooter>
    </>
  );
}

export default BookingConfirmation;
