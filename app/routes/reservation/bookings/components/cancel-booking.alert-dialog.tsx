import { AlertCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertTitle } from "~/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Badge } from "~/components/ui/badge";
import { buttonVariants } from "~/components/ui/button";
import { useCancelBooking } from "../container/booking-mutation.hooks";
import { useBookingDetail } from "../container/booking-query.hooks";

interface CancelBookingAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingCode?: string;
}

export default function CancelBookingAlertDialog({
  open,
  onOpenChange,
  bookingCode,
}: CancelBookingAlertDialogProps) {
  const { data: bookingDetail } = useBookingDetail({
    bookingCode,
    enabled: open,
  });
  const id = bookingDetail?.id;

  const { mutate: cancelBooking, isPending } = useCancelBooking(id);

  const handleConfirm = () => {
    if (!id) {
      return;
    }

    cancelBooking(id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle>Xác nhận hủy đặt phòng</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3 py-2">
            <p>
              Bạn có chắc chắn muốn hủy đặt phòng này không? Hành động này không
              thể hoàn tác.
            </p>
            {bookingCode && (
              <div className="rounded-md border bg-muted/50 p-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Mã đặt phòng:
                  </span>
                  <Badge variant="outline" className="font-mono">
                    {bookingCode}
                  </Badge>
                </div>
                {bookingDetail?.customer && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Khách hàng:
                    </span>
                    <span className="text-sm font-medium">
                      {bookingDetail.customer.fullName}
                    </span>
                  </div>
                )}
                {bookingDetail && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Thời gian:
                    </span>
                    <span className="text-sm">
                      {bookingDetail.checkinDate} → {bookingDetail.checkoutDate}
                    </span>
                  </div>
                )}
              </div>
            )}
            <Alert variant={"destructive"}>
              <AlertCircle />
              <AlertTitle className="line-clamp-2">
                Đặt phòng sẽ chuyển sang trạng thái "Đã hủy" và không thể khôi
                phục.
              </AlertTitle>
            </Alert>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Quay lại</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isPending || !id}
            className={buttonVariants({
              variant: "destructive",
            })}
          >
            {isPending ? "Đang hủy..." : "Xác nhận hủy"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
