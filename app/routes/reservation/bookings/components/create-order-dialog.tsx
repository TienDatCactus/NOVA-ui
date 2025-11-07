import { Building2, Receipt } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";

/**
 * CreateOrderDialog - Dialog for choosing POS order type
 *
 * Two order types:
 * 1. Order by Booking - One shared bill for the entire booking
 *    - bookingId is set, bookingRoomId is null
 *    - Use case: Family books 2 rooms, wants one combined bill
 *
 * 2. Order by Room - Individual bills per room
 *    - Both bookingId and bookingRoomId are set
 *    - Use case: Group books 3 rooms, each guest wants separate bills
 *    - Only available when booking has multiple rooms
 */

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateBookingOrder: () => void;
  onCreateRoomOrder: () => void;
  isCreating: boolean;
  hasMultipleRooms: boolean;
}

export default function CreateOrderDialog({
  open,
  onOpenChange,
  onCreateBookingOrder,
  onCreateRoomOrder,
  isCreating,
  hasMultipleRooms,
}: CreateOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Tạo đơn hàng POS</DialogTitle>
          <DialogDescription>
            Chọn loại đơn hàng phù hợp với nhu cầu của khách hàng
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {/* Booking Order Option */}
          <Card
            className={cn(
              "cursor-pointer transition-all hover:border-primary hover:shadow-md",
              isCreating && "opacity-50 pointer-events-none"
            )}
            onClick={() => {
              onCreateBookingOrder();
              onOpenChange(false);
            }}
          >
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Receipt className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Đơn theo Booking</h3>
                <p className="text-sm text-muted-foreground">
                  Một hóa đơn chung cho toàn bộ đặt phòng
                </p>
              </div>
              <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md w-full">
                <strong>Ví dụ:</strong> Gia đình đặt 2 phòng, tất cả món ăn,
                dịch vụ được gộp vào một hóa đơn chung
              </div>
              <Button className="w-full" disabled={isCreating}>
                {isCreating ? "Đang tạo..." : "Chọn"}
              </Button>
            </CardContent>
          </Card>

          {/* Room Order Option */}
          <Card
            className={cn(
              "cursor-pointer transition-all hover:border-primary hover:shadow-md",
              isCreating && "opacity-50 pointer-events-none"
            )}
            onClick={() => {
              onCreateRoomOrder();
              onOpenChange(false);
            }}
          >
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-secondary-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Đơn theo Phòng</h3>
                <p className="text-sm text-muted-foreground">
                  Hóa đơn riêng cho từng phòng trong booking
                </p>
              </div>
              <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md w-full">
                <strong>Ví dụ:</strong> Nhóm đặt 3 phòng, mỗi khách muốn thanh
                toán riêng hóa đơn của phòng mình
              </div>
              <Button
                className="w-full"
                variant={hasMultipleRooms ? "default" : "secondary"}
                disabled={isCreating || !hasMultipleRooms}
              >
                {isCreating
                  ? "Đang tạo..."
                  : hasMultipleRooms
                    ? "Chọn"
                    : "Chỉ 1 phòng"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {!hasMultipleRooms && (
          <div className="text-sm text-muted-foreground bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md border border-amber-200 dark:border-amber-900">
            <strong>Lưu ý:</strong> Đặt phòng này chỉ có 1 phòng. Chức năng "Đơn
            theo Phòng" chỉ hữu ích khi có nhiều phòng trong cùng một đặt phòng.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
